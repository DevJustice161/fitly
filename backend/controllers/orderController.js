const db = require("../config/db");
const createNotification = require("../utils/createNotification");

exports.createOrder = async (req, res) => {
  const { user_id, total } = req.body;

  try {
    const [order] = await db.query(
      "INSERT INTO orders (user_id, total) VALUES (?, ?)",
      [user_id, total],
    );
    res
      .status(201)
      .json({ message: "Order created successfully", orderId: order.insertId });
    await createNotification({
      userId: user_id,
      type: "order",
      title: "Order Confirmed",
      message: "Your order has been placed successfully.",
      referenceId: order.insertId,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating order" });
  }
};

exports.getSingleOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const [orders] = await db.query(
      `
      SELECT o.*,

        u.name AS customer_name,
        u.email AS customer_email,
        u.phone AS customer_phone,
        u.address AS customer_address,
        u.city AS customer_city,
        u.state AS customer_state,
        u.country AS customer_country

      FROM orders o

      JOIN users u ON o.user_id = u.id

      WHERE o.order_id = ?
      `,
      [orderId],
    );

    if (!orders.length) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const order = orders[0];

    const [items] = await db.query(
      `
      SELECT
        oi.*,

        p.name AS product_name,
        p.thumbnail       

      FROM order_items oi

      JOIN products p
      ON oi.product_id = p.id      

      WHERE oi.order_id = ?
      `,
      [order.id],
    );

    const shipping = {
      name: order.customer_name,
      email: order.customer_email,
      phone: order.customer_phone,
      address: order.customer_address,
      city: order.customer_city,
      state: order.customer_state,
      country: order.customer_country,
    };

    res.json({
      ...order,
      shipping,
      items,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch order",
    });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const [orders] = await db.query(
      `
      SELECT
    o.id,
    o.order_id,
    o.user_id,
    o.status,
    o.payment_method,
    o.total,
    o.delivery_fee,
    o.created_at,

    oi.id AS order_item_id,
    oi.product_id,
    oi.quantity,
    oi.size,
    oi.color,
    oi.price,

    p.name AS product_name,
    p.thumbnail,
    p.price AS product_price,
    p.discount_price,
    p.vendor_id,

    v.store_name,
    v.user_id AS vendor_id

FROM orders o

INNER JOIN order_items oi
    ON o.id = oi.order_id

INNER JOIN products p
    ON oi.product_id = p.id

LEFT JOIN vendors v
    ON p.vendor_id = v.user_id

WHERE o.user_id = ?

ORDER BY o.created_at DESC;
      `,
      [userId],
    );

    res.json(orders);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const [orders] = await db.query(`SELECT
    o.id,
    o.order_id,
    o.user_id,
    o.status,
    o.payment_method,
    o.total,
    o.delivery_fee,
    o.created_at,

    oi.id AS order_item_id,
    oi.product_id,
    oi.quantity,
    oi.size,
    oi.color,
    oi.price,

    p.name AS product_name,
    p.thumbnail,
    p.price AS product_price,
    p.discount_price,
    p.vendor_id,

    v.store_name,
    v.id AS vendor_id

FROM orders o

INNER JOIN order_items oi
    ON o.id = oi.order_id

INNER JOIN products p
    ON oi.product_id = p.id

LEFT JOIN vendors v
    ON p.vendor_id = v.user_id`);

    res.json(orders);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
};
