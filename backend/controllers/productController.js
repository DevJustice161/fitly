const db = require("../config/db");
const fs = require("fs");
const path = require("path");

exports.createProduct = async (req, res) => {
  try {
    const {
      vendor_id,
      name,
      description,
      category,
      price,
      discount_price,
      stock_quantity,
    } = req.body;

    const thumbnail = req.files?.thumbnail?.[0]?.filename || null;

    const gallery = req.files?.gallery || [];
    const sizes = JSON.parse(req.body.sizes || "[]");
    const colors = JSON.parse(req.body.colors || "[]");

    const slug = name.toLowerCase().replace(/\s+/g, "-");

    const [productResult] = await db.query(
      `
      INSERT INTO products (
        vendor_id,
        name,
        slug,
        description,
        category,
        price,
        discount_price,
        stock_quantity,
        thumbnail,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        vendor_id,
        name,
        slug,
        description,
        category,
        price,
        discount_price || null,
        stock_quantity,
        thumbnail,
        "Active",
      ],
    );

    const productId = productResult.insertId;

    for (const image of gallery) {
      await db.query(
        `
        INSERT INTO product_images (
          product_id,
          image_url
        )
        VALUES (?, ?)
        `,
        [productId, image.filename],
      );
    }

    const variantInserts = [];

    if (sizes.length > 0 && colors.length > 0) {
      for (const size of sizes) {
        for (const color of colors) {
          variantInserts.push([productId, size, color]);
        }
      }
    } else if (sizes.length > 0) {
      for (const size of sizes) {
        variantInserts.push([productId, size, null]);
      }
    } else if (colors.length > 0) {
      for (const color of colors) {
        variantInserts.push([productId, null, color]);
      }
    }

    if (variantInserts.length > 0) {
      await db.query(
        `INSERT INTO product_variants (product_id, size, color) VALUES ?`,
        [variantInserts],
      );
    }

    res.status(201).json({
      success: true,
      message: "Product created successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const [products] = await db.query("SELECT * FROM products");

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
};

exports.getProductsCard = async (req, res) => {
  try {
    const [productCards] = await db.query(
      `
      SELECT p.*, v.store_name AS vendor_name, v.is_premium,
      (SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = p.id) AS average_rating,
      (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id) AS reviews_count, 
       (
        SELECT GROUP_CONCAT(DISTINCT pv.size)
        FROM product_variants pv
        WHERE pv.product_id = p.id
    ) AS sizes,

    (
        SELECT GROUP_CONCAT(DISTINCT pv.color)
        FROM product_variants pv
        WHERE pv.product_id = p.id
    ) AS colors
            FROM products p
            JOIN vendors v ON p.vendor_id = v.user_id
    `,
    );

    res.json(productCards);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
};

exports.getProductsByVendor = async (req, res) => {
  const { id } = req.params;
  try {
    const [products] = await db.query(
      "SELECT * FROM products WHERE vendor_id = ?",
      [id],
    );

    const productImages = {};
    const productVariants = {};

    for (const product of products) {
      if (!productImages[product.id]) {
        productImages[product.id] = [];
      }
    }

    for (const product of products) {
      if (!productVariants[product.id]) {
        productVariants[product.id] = [];
      }
    }

    const [variants] = await db.query(
      "SELECT * FROM product_variants WHERE product_id IN (?)",
      [products.map((p) => p.id)],
    );

    variants.forEach((variant) => {
      if (!productVariants[variant.product_id]) {
        productVariants[variant.product_id] = [];
      }
      productVariants[variant.product_id].push(variant);
    });

    const [images] = await db.query(
      "SELECT * FROM product_images WHERE product_id IN (?)",
      [products.map((p) => p.id)],
    );

    images.forEach((image) => {
      productImages[image.product_id].push(image);
    });

    const productsWithImages = products.map((product) => ({
      ...product,
      images: productImages[product.id] || [],
      variants: productVariants[product.id] || [],
    }));

    res.json(productsWithImages);
  } catch (error) {
    console.error("Error fetching products by vendor:", error);
    res.status(500).json({ message: "Error fetching products by vendor" });
  }
};

exports.getSingleProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const [product] = await db.query("SELECT * FROM products WHERE id = ?", [
      id,
    ]);
    if (product.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product[0]);
  } catch (error) {
    console.error("Error fetching single product:", error);
    res.status(500).json({ message: "Error fetching single product" });
  }
};

exports.getProductDetails = async (req, res) => {
  const { slug } = req.params;
  try {
    const [productRows] = await db.query(
      `
      SELECT p.*, v.store_name AS vendor_name, v.is_premium, 

      (SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = p.id) AS average_rating,
      (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id) AS reviews_count, 
       (
        SELECT GROUP_CONCAT(DISTINCT pv.size)
        FROM product_variants pv
        WHERE pv.product_id = p.id
    ) AS sizes,

    (
        SELECT GROUP_CONCAT(DISTINCT pv.color)
        FROM product_variants pv
        WHERE pv.product_id = p.id
    ) AS colors
            FROM products p
            JOIN vendors v ON p.vendor_id = v.user_id
            WHERE p.slug = ?
    `,
      [slug],
    );

    const [imagesRow] = await db.query(
      `SELECT image_url FROM product_images WHERE product_id = ?`,
      [productRows[0].id],
    );

    const images = imagesRow.map((img) => img.image_url);

    const sizes = productRows[0].sizes ? productRows[0].sizes.split(",") : [];
    const colors = productRows[0].colors
      ? productRows[0].colors.split(",")
      : [];

    res.json({
      product: productRows[0],
      sizes: sizes,
      colors: colors,
      product_images: images,
    });
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({ message: "Error fetching product details" });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const {
      name,
      description,
      category,
      price,
      discount_price,
      stock_quantity,
      status,
      existingImages,
    } = req.body;

    const sizes = JSON.parse(req.body.sizes || "[]");
    const colors = JSON.parse(req.body.colors || "[]");

    const variantInserts = [];

    if (sizes.length > 0 && colors.length > 0) {
      for (const size of sizes) {
        for (const color of colors) {
          variantInserts.push([id, size, color]);
        }
      }
    } else if (sizes.length > 0) {
      for (const size of sizes) {
        variantInserts.push([id, size, null]);
      }
    } else if (colors.length > 0) {
      for (const color of colors) {
        variantInserts.push([id, null, color]);
      }
    }

    const [productRows] = await db.query(
      "SELECT * FROM products WHERE id = ?",
      [id],
    );
    if (productRows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = productRows[0];

    let thumbnailName = product.thumbnail;

    if (req.files?.thumbnail?.[0]) {
      thumbnailName = req.files.thumbnail[0].filename;

      if (product.thumbnail) {
        const oldThumbnailPath = path.join(
          __dirname,
          "../uploads/products",
          product.thumbnail,
        );
        if (fs.existsSync(oldThumbnailPath)) {
          fs.unlinkSync(oldThumbnailPath);
        }
      }
    }

    await db.query(
      `
    UPDATE products
    SET
      name = ?,
      description = ?,
      category = ?,
      price = ?,
      discount_price = ?,
      stock_quantity = ?,
      status = ?,
      thumbnail = ?
    WHERE id = ?
    `,
      [
        name,
        description,
        category,
        price,
        discount_price,
        stock_quantity,
        status,
        thumbnailName,
        id,
      ],
    );

    await db.query("DELETE FROM product_variants WHERE product_id = ?", [id]);

    if (variantInserts.length > 0) {
      await db.query(
        "INSERT INTO product_variants (product_id, size, color) VALUES ?",
        [variantInserts],
      );
    }

    const remainingImages = existingImages ? JSON.parse(existingImages) : [];

    const [currentImages] = await db.query(
      "SELECT * FROM product_images WHERE product_id = ?",
      [id],
    );

    const imagesToDelete = currentImages.filter(
      (img) => !remainingImages.includes(img.image_url),
    );

    for (const img of imagesToDelete) {
      const imgPath = path.join(
        __dirname,
        "../uploads/products",
        img.image_url,
      );
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }

      await db.query("DELETE FROM product_images WHERE id = ?", [img.id]);
    }

    if (req.files?.gallery) {
      for (const image of req.files.gallery) {
        await db.query(
          "INSERT INTO product_images (product_id, image_url) VALUES (?, ?)",
          [id, image.filename],
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Error updating product" });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const [product] = await db.query("SELECT * FROM products WHERE id = ?", [
      id,
    ]);
    const [images] = await db.query(
      "SELECT * FROM product_images WHERE product_id = ?",
      [id],
    );
    const [variants] = await db.query(
      "SELECT * FROM product_variants WHERE product_id = ?",
      [id],
    );
    if (product.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    const productData = product[0];

    if (productData.thumbnail) {
      const oldThumbnailPath = path.join(
        __dirname,
        "../uploads/products",
        productData.thumbnail,
      );
      if (fs.existsSync(oldThumbnailPath)) {
        fs.unlinkSync(oldThumbnailPath);
      }
    }
    images.forEach((img) => {
      const imgPath = path.join(
        __dirname,
        "../uploads/products",
        img.image_url,
      );
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    });
    await db.query("DELETE FROM product_images WHERE product_id = ?", [id]);
    await db.query("DELETE FROM product_variants WHERE product_id = ?", [id]);
    await db.query("DELETE FROM products WHERE id = ?", [id]);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Error deleting product" });
  }
};

exports.getProductVariants = async (req, res) => {
  try {
    const { productId } = req.params;

    const [variants] = await db.query(
      `
      SELECT
        id,
        size,
        color
      FROM product_variants
      WHERE product_id = ?
      ORDER BY size ASC, color ASC
      `,
      [productId],
    );

    const sizes = [
      ...new Set(variants.map((variant) => variant.size).filter(Boolean)),
    ];

    const colors = [
      ...new Set(variants.map((variant) => variant.color).filter(Boolean)),
    ];

    res.status(200).json({
      variants,
      sizes,
      colors,
    });
  } catch (error) {
    console.error("Get product variants error:", error);

    res.status(500).json({
      message: "Failed to fetch product variants",
    });
  }
};
