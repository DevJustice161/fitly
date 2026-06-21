const Flutterwave = require("flutterwave-node-v3");
const axios = require("axios");
const db = require("../config/db");
const createNotification = require("../utils/createNotification");

exports.initializeFlutterwave = async (req, res) => {
  try {
    const { tx_ref, email, amount, name, phone } = req.body.payload;
    const {
      user_id,
      status,
      subtotal,
      delivery_fee,
      total,
      payment_method,
      payment_reference,
      order_items,
    } = req.body.order;

    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      {
        tx_ref: tx_ref,

        amount,

        currency: "NGN",

        redirect_url:
          "http://localhost:8080/payment-success?provider=flutterwave",

        customer: {
          email,
          phonenumber: phone,
          name,
        },

        customizations: {
          title: "Fitly",
          description: "Fashion Store Payment",
        },
      },

      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const [orderQuery] = await db.query(
      `
          INSERT INTO orders(
            user_id,
            order_id,
            status,
            subtotal,
            delivery_fee,
            total,
            payment_method,
            payment_reference
          )
          VALUES(?, ?, ?, ?, ?, ? , ? ,? )
          `,
      [
        user_id,
        tx_ref,
        status,
        subtotal,
        delivery_fee,
        total,
        payment_method,
        payment_reference,
      ],
    );
    const insertOrderItemsDetails = order_items.map((item) => [
      orderQuery.insertId,
      item.product_id,
      item.vendor_id,
      item.quantity,
      item.size,
      item.color,
      item.price,
    ]);
    const sql = `
            INSERT INTO order_items
            (order_id, product_id, vendor_id, quantity, size, color, price)
            VALUES ?
            `;

    await db.query(sql, [insertOrderItemsDetails]);
    const vendorId = order_items.find((item) => item.vendor_id)?.vendor_id;
    await createNotification({
      userId: user_id,
      type: "order",
      title: "Order Confirmed",
      message: "Your order has been placed successfully.",
      referenceId: orderQuery.insertId,
    });
    await createNotification({
      userId: vendorId,
      type: "order",
      title: "New Order",
      message: `${name} placed a new order, check it out.`,
      referenceId: orderQuery.insertId,
    });
    res.json(response.data.data);
  } catch (error) {
    console.error(error.response?.data || error.message);

    res.status(500).json({
      message: "Flutterwave initialization failed",
    });
  }
};

exports.verifyFlutterwave = async (req, res) => {
  try {
    const { transaction_id, tx_ref } = req.query;

    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        },
      },
    );

    await db.query(
      `
        UPDATE orders
        SET status = ?
        WHERE order_id = ?
        `,
      ["paid", tx_ref],
    );

    if (response.data.data.status === "successful") {
      return res.json({
        success: true,
        data: response.data.data,
      });
    }

    res.status(400).json({
      success: false,
      message: "Payment not verified",
    });
  } catch (error) {
    console.error(error.response?.data || error.message);

    res.status(500).json({
      message: "Verification failed",
    });
  }
};

exports.initializePaystack = async (req, res) => {
  try {
    const { tx_ref, email, amount } = req.body.payload;
    const {
      user_id,
      status,
      subtotal,
      delivery_fee,
      total,
      payment_method,
      payment_reference,
      order_items,
    } = req.body.order;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100,
        reference: tx_ref,
        callback_url: "http://localhost:8080/payment-success?provider=paystack",
      },

      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const [orderQuery] = await db.query(
      `
          INSERT INTO orders(
            user_id,
            order_id,
            status,
            subtotal,
            delivery_fee,
            total,
            payment_method,
            payment_reference
          )
          VALUES(?, ?, ?, ?, ?, ? , ? ,? )
          `,
      [
        user_id,
        tx_ref,
        status,
        subtotal,
        delivery_fee,
        total,
        payment_method,
        payment_reference,
      ],
    );
    const insertOrderItemsDetails = order_items.map((item) => [
      orderQuery.insertId,
      item.product_id,
      item.vendor_id,
      item.quantity,
      item.size,
      item.color,
      item.price,
    ]);
    const sql = `
            INSERT INTO order_items
            (order_id, product_id, vendor_id, quantity, size, color, price)
            VALUES ?
            `;

    await db.query(sql, [insertOrderItemsDetails]);
    const vendorId = order_items.find((item) => item.vendor_id)?.vendor_id;
    await createNotification({
      userId: user_id,
      type: "order",
      title: "Order Confirmed",
      message: "Your order has been placed successfully.",
      referenceId: orderQuery.insertId,
    });
    await createNotification({
      userId: vendorId,
      type: "order",
      title: "New Order",
      message: `${name} placed a new order, check it out.`,
      referenceId: orderQuery.insertId,
    });

    res.json(response.data.data);
  } catch (error) {
    console.error(error.response?.data || error);

    res.status(500).json({
      message: "Paystack initialization failed",
    });
  }
};

exports.verifyPaystack = async (req, res) => {
  try {
    const { reference } = req.query;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    await db.query(
      `
        UPDATE orders
        SET status = ?
        WHERE order_id = ?
        `,
      ["paid", reference],
    );

    if (response.data.data.status === "success") {
      return res.json({
        success: true,
        data: response.data.data,
      });
    }

    res.status(400).json({
      success: false,
      message: "Payment not verified",
    });
  } catch (error) {
    console.error(error.response?.data || error);

    res.status(500).json({
      message: "Verification failed",
    });
  }
};

exports.initializeTransfer = async (req, res) => {
  try {
    const { tx_ref, email, amount, name, phone } = req.body.payload;
    const {
      user_id,
      status,
      subtotal,
      delivery_fee,
      total,
      payment_method,
      payment_reference,
      order_items,
    } = req.body.order;

    const [orderQuery] = await db.query(
      `
          INSERT INTO orders(
            user_id,
            order_id,
            status,
            subtotal,
            delivery_fee,
            total,
            payment_method,
            payment_reference
          )
          VALUES(?, ?, ?, ?, ?, ? , ? ,? )
          `,
      [
        user_id,
        tx_ref,
        status,
        subtotal,
        delivery_fee,
        total,
        payment_method,
        payment_reference,
      ],
    );
    const insertOrderItemsDetails = order_items.map((item) => [
      orderQuery.insertId,
      item.product_id,
      item.vendor_id,
      item.quantity,
      item.size,
      item.color,
      item.price,
    ]);
    const sql = `
            INSERT INTO order_items
            (order_id, product_id, vendor_id, quantity, size, color, price)
            VALUES ?
            `;

    await db.query(sql, [insertOrderItemsDetails]);
    const vendorId = order_items.find((item) => item.vendor_id)?.vendor_id;
    await createNotification({
      userId: user_id,
      type: "order",
      title: "Order Confirmed",
      message: "Your order has been placed successfully.",
      referenceId: orderQuery.insertId,
    });
    await createNotification({
      userId: vendorId,
      type: "order",
      title: "New Order",
      message: `${name} placed a new order, check it out.`,
      referenceId: orderQuery.insertId,
    });

    res.status(201).json({
      success: true,
      message: "Order Created",
    });
  } catch (error) {
    console.error("Add to cart error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
