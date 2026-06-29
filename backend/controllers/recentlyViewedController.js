const db = require("../config/db");

exports.addRecentlyViewed = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const [existing] = await db.query(
      `
      SELECT id
      FROM recently_viewed
      WHERE user_id = ?
      AND product_id = ?
      `,
      [userId, productId],
    );

    if (existing.length > 0) {
      await db.query(
        `
        UPDATE recently_viewed
        SET viewed_at = NOW()
        WHERE user_id = ?
        AND product_id = ?
        `,
        [userId, productId],
      );

      return res.json({
        success: true,
        message: "View updated",
      });
    }

    await db.query(
      `
      INSERT INTO recently_viewed
      (user_id, product_id)
      VALUES (?, ?)
      `,
      [userId, productId],
    );

    res.json({
      success: true,
      message: "Added to recently viewed",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to add recently viewed item",
    });
  }
};

exports.getRecentlyViewed = async (req, res) => {
  try {
    const { userId } = req.params;

    const [products] = await db.query(
      `
      SELECT
        rv.id as rId,
        rv.viewed_at,

        p.id AS id,
        p.vendor_id,
        p.name,
        p.slug,
        p.price,
        p.thumbnail as image,

        v.store_name as vendor

      FROM recently_viewed rv

      JOIN products p
        ON p.id = rv.product_id
      
      JOIN vendors v
        ON v.user_id = p.vendor_id

      WHERE rv.user_id = ?

      ORDER BY rv.viewed_at DESC

      LIMIT 20
      `,
      [userId],
    );

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch recently viewed products",
    });
  }
};

exports.deleteRecentlyViewed = async (req, res) => {
  try {
    await db.query(
      `
      DELETE FROM recently_viewed
      WHERE id = ?
      `,
      [req.params.id],
    );

    res.json({
      success: true,
      message: "Removed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to remove item",
    });
  }
};

exports.clearRecentlyViewed = async (req, res) => {
  try {
    await db.query(
      `
      DELETE FROM recently_viewed
      WHERE user_id = ?
      `,
      [req.params.userId],
    );

    res.json({
      success: true,
      message: "Recently viewed cleared",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to clear recently viewed",
    });
  }
};
