const db = require("../config/db");

exports.addToCart = async (req, res) => {
  try {
    const { user_id, product_id, quantity, size, color } = req.body;

    const [existing] = await db.query(
      `
      SELECT * FROM carts
      WHERE user_id = ?
      AND product_id = ?
      AND size <=> ?
      AND color <=> ?
      `,
      [user_id, product_id, size || null, color || null],
    );

    if (existing.length > 0) {
      await db.query(
        `
        UPDATE carts
        SET quantity = quantity + ?
        WHERE id = ?
        `,
        [quantity || 1, existing[0].id],
      );

      return res.status(200).json({
        success: true,
        message: "Cart updated",
      });
    }

    await db.query(
      `
      INSERT INTO carts(
        user_id,
        product_id,
        quantity,
        size,
        color
      )
      VALUES(?, ?, ?, ?, ?)
      `,
      [user_id, product_id, quantity || 1, size || "", color || ""],
    );

    res.status(201).json({
      success: true,
      message: "Added to cart",
    });
  } catch (error) {
    console.error("Add to cart error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const [items] = await db.query(
      `
      SELECT
  c.id AS cart_id,
  c.quantity,
  c.size,
  c.color,

  p.id AS product_id,
  p.name,
  p.price,
  p.discount_price,
  p.thumbnail,
  p.stock_quantity,

  v.id AS vendor_id,
  v.store_name AS vendor_name,
  v.is_premium,
  v.store_logo,
  v.store_description,

  AVG(r.rating) AS average_rating,
  COUNT(r.id) AS review_count,

  GROUP_CONCAT(DISTINCT pv.size) AS sizes,
  GROUP_CONCAT(DISTINCT pv.color) AS colors

FROM carts c

JOIN products p
  ON p.id = c.product_id

JOIN vendors v
  ON v.user_id = p.vendor_id

LEFT JOIN reviews r
  ON r.product_id = p.id

LEFT JOIN product_variants pv
  ON pv.product_id = p.id

WHERE c.user_id = ?

GROUP BY
  c.id,
  c.quantity,
  c.size,
  c.color,
  p.id,
  p.name,
  p.price,
  p.discount_price,
  p.thumbnail,
  p.stock_quantity,
  v.id,
  v.store_name,
  v.is_premium,
  v.store_logo,
  v.store_description;
      `,
      [userId],
    );

    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

exports.updateCartItem = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  await db.query(
    `
    UPDATE carts
    SET quantity = ?
    WHERE id = ?
    `,
    [quantity, id],
  );

  res.json({
    success: true,
  });
};

exports.removeCartItem = async (req, res) => {
  await db.query(
    `
    DELETE FROM carts
    WHERE id = ?
    `,
    [req.params.id],
  );

  res.json({
    success: true,
  });
};

exports.clearCart = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      `
      DELETE FROM carts
      WHERE user_id = ?
      `,
      [id],
    );

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Clear cart error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
    });
  }
};
exports.updateCartVariant = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { size, color } = req.body;
    const [result] = await db.query(
      `
      UPDATE carts
      SET size = ?, color = ?
      WHERE id = ?
      `,
      [size, color, cartId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    res.json({ message: "Cart variant updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update variant" });
  }
};
