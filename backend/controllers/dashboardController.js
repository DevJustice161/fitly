const db = require("../config/db");

exports.getDashboardData = async (req, res) => {
  try {
    const { userId } = req.params;

    // Total Orders
    const [totalOrders] = await db.query(
      `SELECT COUNT(*) AS total FROM orders
       WHERE user_id = ?`,
      [userId],
    );

    // Pending Orders
    const [pendingOrders] = await db.query(
      `SELECT COUNT(*) AS total FROM orders
       WHERE user_id = ?
       AND status IN ('pending','processing','pending_payment')`,
      [userId],
    );

    // Wishlist
    const [wishlistItems] = await db.query(
      `SELECT COUNT(*) AS total
       FROM wishlists
       WHERE user_id = ?`,
      [userId],
    );

    // Recent Orders
    const [recentOrders] = await db.query(
      `
      SELECT
        o.order_id,
        o.total,
        o.status,
        o.created_at,

        oi.id AS order_item_id,

        p.name AS product_name,
        p.thumbnail

      FROM orders o

      JOIN order_items oi
      ON oi.order_id = o.id

      JOIN products p
      ON p.id = oi.product_id

      WHERE o.user_id = ?

      ORDER BY o.created_at DESC

      LIMIT 3
    `,
      [userId],
    );

    // Recently Viewed
    // const [recentlyViewed] = await db.query(
    //   `
    //   SELECT
    //     p.id,
    //     p.name,
    //     p.price,
    //     p.thumbnail,

    //     v.business_name AS vendor

    //   FROM recently_viewed rv

    //   JOIN products p
    //   ON p.id = rv.product_id

    //   LEFT JOIN vendors v
    //   ON v.id = p.vendor_id

    //   WHERE rv.user_id = ?

    //   ORDER BY rv.created_at DESC

    //   LIMIT 4
    // `,
    //   [userId],
    // );

    res.json({
      stats: {
        totalOrders: totalOrders[0].total,
        pendingOrders: pendingOrders[0].total,
        wishlistItems: wishlistItems[0].total,
      },

      recentOrders,

      // recentlyViewed,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load dashboard",
    });
  }
};
