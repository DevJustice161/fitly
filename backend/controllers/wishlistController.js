const db = require("../config/db");
const createNotification = require("../utils/createNotification");

exports.addToWishLists = async (req, res) => {
  try {
    const { user_id, product_id } = req.body;

    const [existing] = await db.query(
      `
          SELECT * FROM wishlists
          WHERE user_id = ?
          AND product_id = ?
          `,
      [user_id, product_id],
    );

    if (existing.length > 0) {
      return res.status(500).json({
        success: false,
        message: "Already added to wishlists",
      });
    }

    await db.query(
      `
          INSERT INTO wishlists(
            user_id,
            product_id
          )
          VALUES(?, ?)
          `,
      [user_id, product_id],
    );

    res.status(201).json({
      success: true,
      message: "Added to wishlists",
    });
  } catch (error) {
    console.error("Add to wishlists error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getWishlists = async (req, res) => {
  try {
    const { userId } = req.params;

    const [items] = await db.query(
      `
      SELECT
  wl.id AS wishlist_id,
  wl.user_id,
  wl.product_id AS id,
  wl.created_at,

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

FROM wishlists wl

JOIN products p
  ON p.id = wl.product_id

JOIN vendors v
  ON v.user_id = p.vendor_id

LEFT JOIN reviews r
  ON r.product_id = p.id

LEFT JOIN product_variants pv
  ON pv.product_id = p.id

WHERE wl.user_id = ?

GROUP BY
  wl.id,
  wl.user_id,
  wl.product_id,
  wl.created_at,
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
    res.status(500).json({ message: "Failed to fetch wishlists" });
  }
};

exports.removeWishlistsItem = async (req, res) => {
  await db.query(
    `
    DELETE FROM wishlists
    WHERE id = ?
    `,
    [req.params.id],
  );

  res.json({
    success: true,
  });
};

exports.clearWishlists = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      `
      DELETE FROM wishlists
      WHERE user_id = ?
      `,
      [id],
    );

    res.status(200).json({
      success: true,
      message: "Wishlists cleared successfully",
    });
  } catch (error) {
    console.error("Clear wishlist error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to clear wishlists",
    });
  }
};
