const db = require("../config/db");
const fs = require("fs");
const path = require("path");

const DEFAULT_CATEGORIES = [
  { name: "Women's fashion", slug: "womens-fashion" },
  { name: "Men's fashion", slug: "mens-fashion" },
  { name: "Shoes", slug: "shoes" },
  { name: "Bags", slug: "bags" },
  { name: "Accessories", slug: "accessories" },
  { name: "Beauty products", slug: "beauty-products" },
];

const DEFAULT_SUB_CATEGORIES = {
  "Women's fashion": [
    { name: "Dresses", slug: "dresses" },
    { name: "Tops", slug: "tops" },
    { name: "Skirts", slug: "skirts" },
  ],
  "Men's fashion": [
    { name: "Shirts", slug: "shirts" },
    { name: "Trousers", slug: "trousers" },
    { name: "Jackets", slug: "jackets" },
  ],
  Shoes: [
    { name: "Sneakers", slug: "sneakers" },
    { name: "Boots", slug: "boots" },
    { name: "Heels", slug: "heels" },
  ],
  Bags: [
    { name: "Handbags", slug: "handbags" },
    { name: "Backpacks", slug: "backpacks" },
    { name: "Clutches", slug: "clutches" },
  ],
  Accessories: [
    { name: "Jewelry", slug: "jewelry" },
    { name: "Belts", slug: "belts" },
    { name: "Scarves", slug: "scarves" },
  ],
  "Beauty products": [
    { name: "Skincare", slug: "skincare" },
    { name: "Makeup", slug: "makeup" },
    { name: "Fragrance", slug: "fragrance" },
  ],
};

const createSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const ensureCategoryTables = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      slug VARCHAR(100) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS sub_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
      UNIQUE KEY unique_sub_category (category_id, name)
    )
  `);
};

exports.getCategories = async (req, res) => {
  try {
    await ensureCategoryTables();

    const [existingCategories] = await db.query(
      `SELECT name FROM categories ORDER BY id ASC`,
    );

    if (existingCategories.length === 0) {
      for (const category of DEFAULT_CATEGORIES) {
        await db.query(`INSERT INTO categories (name, slug) VALUES (?, ?)`, [
          category.name,
          category.slug,
        ]);
      }
    }

    const [categories] = await db.query(
      `SELECT c.id, c.name, c.image, c.slug, (SELECT COUNT(*) FROM products WHERE category = c.name) AS products, c.active
      FROM categories c
      JOIN products p ON c.name = p.category
      ORDER BY id ASC`,
    );

    const categoriesWithSubCategories = await Promise.all(
      categories.map(async (category) => {
        const [subCategories] = await db.query(
          `SELECT * FROM sub_categories WHERE category_id = ? ORDER BY id ASC`,
          [category.id],
        );

        const [subCategoriesNames] = await db.query(
          `SELECT name FROM sub_categories WHERE category_id = ? ORDER BY id ASC`,
          [category.id],
        );

        if (subCategories.length === 0) {
          const defaultSubCategories =
            DEFAULT_SUB_CATEGORIES[category.name] || [];

          for (const subCategory of defaultSubCategories) {
            await db.query(
              `INSERT INTO sub_categories (category_id, name) VALUES (?, ?)`,
              [category.id, subCategory.name],
            );
          }

          const [seededSubCategories] = await db.query(
            `SELECT * FROM sub_categories WHERE category_id = ? ORDER BY id ASC`,
            [category.id],
          );

          const [seededSubCategoriesNames] = await db.query(
            `SELECT name FROM sub_categories WHERE category_id = ? ORDER BY id ASC`,
            [category.id],
          );

          return {
            ...category,
            sub_categories: seededSubCategories,
            subcatname: seededSubCategoriesNames.map((item) => item.name),
          };
        }

        return {
          ...category,
          sub_categories: subCategories,
          subcatname: subCategoriesNames.map((item) => item.name),
        };
      }),
    );

    res.json(categoriesWithSubCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const trimmedName = name.trim();
    const slug = createSlug(trimmedName);

    await ensureCategoryTables();

    const [existingCategory] = await db.query(
      `SELECT id FROM categories WHERE name = ? OR slug = ?`,
      [trimmedName, slug],
    );

    if (existingCategory.length > 0) {
      return res.status(409).json({ message: "Category already exists" });
    }

    const [result] = await db.query(
      `INSERT INTO categories (name, slug) VALUES (?, ?)`,
      [trimmedName, slug],
    );

    res.status(201).json({
      id: result.insertId,
      name: trimmedName,
      slug,
      sub_categories: [],
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Failed to create category" });
  }
};

exports.updateCategory = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { name, slug, sub_categories = [] } = req.body;

    const [category] = await connection.query(
      "SELECT * FROM categories WHERE id = ?",
      [id],
    );

    if (category.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    const oldCategoryName = category[0].name;

    await connection.query(
      `
      UPDATE categories
      SET
        name = ?,
        slug = ?
      WHERE id = ?
      `,
      [name, slug, id],
    );

    await connection.query(
      ` UPDATE products SET category = ? WHERE category = ?`,
      [name, oldCategoryName],
    );

    await connection.query(
      ` UPDATE vendor_applications SET category = ? WHERE category = ?`,
      [name, oldCategoryName],
    );

    const [existingSubs] = await connection.query(
      `
      SELECT id, name
      FROM sub_categories
      WHERE category_id = ?
      `,
      [id],
    );

    const existingNames = existingSubs.map((s) => s.name);

    for (const sub of sub_categories) {
      if (!existingNames.includes(sub)) {
        await connection.query(
          `
          INSERT INTO sub_categories
          (category_id, name)
          VALUES (?, ?)
          `,
          [id, sub],
        );
      }
    }

    for (const sub of existingSubs) {
      if (!sub_categories.includes(sub.name)) {
        await connection.query(
          `
          DELETE FROM sub_categories
          WHERE id = ?
          `,
          [sub.id],
        );
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: "Category updated successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  } finally {
    connection.release();
  }
};

exports.updateCategoryImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image.",
      });
    }

    const [category] = await db.query(
      "SELECT image FROM categories WHERE id = ?",
      [id],
    );

    if (category.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (category[0].image) {
      const oldImage = path.join(
        __dirname,
        "../uploads/categories",
        category[0].image,
      );

      if (fs.existsSync(oldImage)) {
        fs.unlinkSync(oldImage);
      }
    }

    await db.query(
      `
      UPDATE categories
      SET image = ?
      WHERE id = ?
      `,
      [req.file.filename, id],
    );

    res.json({
      success: true,
      message: "Category image updated successfully.",
      image: req.file.filename,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update category image.",
    });
  }
};

exports.updateCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const [category] = await db.query(
      "SELECT id FROM categories WHERE id = ?",
      [id],
    );

    if (category.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await db.query(
      `
      UPDATE categories
      SET active = ?
      WHERE id = ?
      `,
      [active ? 1 : 0, id],
    );

    res.json({
      success: true,
      message: `Category ${active ? "activated" : "deactivated"} successfully.`,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update category status.",
    });
  }
};

exports.deleteCategory = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;

    const [categories] = await connection.query(
      "SELECT * FROM categories WHERE id = ?",
      [id],
    );

    if (categories.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const category = categories[0];

    if (category.image) {
      const imagePath = path.join(
        __dirname,
        "..",
        "uploads",
        "categories",
        category.image,
      );

      fs.unlink(imagePath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("Failed to delete category image:", err);
        }
      });
    }

    await connection.query(
      `
      UPDATE products SET category = 'Uncategorized' WHERE category = ?;
      `,
      [category.name],
    );

    await connection.query(
      `
      DELETE FROM sub_categories
      WHERE category_id = ?
      `,
      [id],
    );

    await connection.query(
      `
      DELETE FROM categories
      WHERE id = ?
      `,
      [id],
    );

    await connection.commit();

    res.json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete category.",
    });
  } finally {
    connection.release();
  }
};
