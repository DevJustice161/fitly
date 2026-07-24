const db = require("../config/db");

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
      `SELECT id, name, image, slug FROM categories ORDER BY id ASC`,
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
              `INSERT INTO sub_categories (category_id, name, slug) VALUES (?, ?, ?)`,
              [category.id, subCategory.name, subCategory.slug],
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
