const Flutterwave = require("flutterwave-node-v3");
const axios = require("axios");
const db = require("../config/db");
const createNotification = require("../utils/createNotification");
const {
  buildSubscriptionPayload,
  buildPremiumPaymentCallbackUrl,
} = require("../utils/premiumUtils");
require("dotenv").config();

const FRONTEND_URL = process.env.FRONTEND_URL;

const getPrimaryVendorId = (orderItems = []) =>
  orderItems.find((item) => item.vendor_id)?.vendor_id ?? null;

const recordVoucherUsage = async (orderId, userId, orderItems = []) => {
  const voucherIds = [
    ...new Set(
      orderItems
        .map((item) => item.voucher_id || item.applied_vendor_coupon)
        .filter(Boolean),
    ),
  ];

  for (const voucherIdentifier of voucherIds) {
    const voucherId = Number(voucherIdentifier);

    if (!voucherId || Number.isNaN(voucherId)) {
      continue;
    }

    await db.query(
      `
        INSERT INTO voucher_usage (voucher_id, user_id, order_id)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE order_id = VALUES(order_id)
      `,
      [voucherId, userId, orderId],
    );

    await db.query(
      `
        UPDATE vouchers
        SET used_count = used_count + 1,
            is_active = CASE
              WHEN usage_limit > 0 AND (used_count + 1) >= usage_limit THEN 0
              ELSE is_active
            END
        WHERE id = ?
      `,
      [voucherId],
    );
  }
};

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
      courier_id,
    } = req.body.order;

    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      {
        tx_ref: tx_ref,

        amount,

        currency: "NGN",

        redirect_url: `${FRONTEND_URL}/payment-success?provider=flutterwave`,

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

    const vendorId = getPrimaryVendorId(order_items);

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: "Order items must include a valid vendor reference.",
      });
    }

    const [orderQuery] = await db.query(
      `
          INSERT INTO orders(
            user_id,
            vendor_id,
            order_id,
            status,
            subtotal,
            delivery_fee,
            courier_id,
            total,
            payment_method,
            payment_reference
          )
          VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
      [
        user_id,
        vendorId,
        tx_ref,
        status,
        subtotal,
        delivery_fee,
        courier_id,
        total,
        payment_method,
        payment_reference,
      ],
    );
    const insertOrderItemsDetails = order_items.map((item) => [
      orderQuery.insertId,
      item.product_id,
      item.vendor_id,
      user_id,
      item.default_courier,
      item.quantity,
      item.size,
      item.color,
      item.price,
    ]);
    const sql = `
            INSERT INTO order_items
            (order_id, product_id, vendor_id, user_id, default_courier, quantity, size, color, price)
            VALUES ?
            `;

    await db.query(sql, [insertOrderItemsDetails]);
    await recordVoucherUsage(orderQuery.insertId, user_id, order_items);

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
      courier_id,
    } = req.body.order;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100,
        reference: tx_ref,
        callback_url: `${FRONTEND_URL}/payment-success?provider=paystack`,
      },

      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const vendorId = getPrimaryVendorId(order_items);

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: "Order items must include a valid vendor reference.",
      });
    }

    const [orderQuery] = await db.query(
      `
          INSERT INTO orders(
            user_id,
            vendor_id,
            order_id,
            status,
            subtotal,
            delivery_fee,
            courier_id,
            total,
            payment_method,
            payment_reference
          )
          VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
      [
        user_id,
        vendorId,
        tx_ref,
        status,
        subtotal,
        delivery_fee,
        courier_id,
        total,
        payment_method,
        payment_reference,
      ],
    );
    const insertOrderItemsDetails = order_items.map((item) => [
      orderQuery.insertId,
      item.product_id,
      item.vendor_id,
      user_id,
      item.default_courier,
      item.quantity,
      item.size,
      item.color,
      item.price,
    ]);
    const sql = `
            INSERT INTO order_items
            (order_id, product_id, vendor_id, user_id, default_courier, quantity, size, color, price)
            VALUES ?
            `;

    await db.query(sql, [insertOrderItemsDetails]);
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
      courier_id,
    } = req.body.order;

    const vendorId = getPrimaryVendorId(order_items);

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: "Order items must include a valid vendor reference.",
      });
    }

    const [orderQuery] = await db.query(
      `
          INSERT INTO orders(
            user_id,
            vendor_id,
            order_id,
            status,
            subtotal,
            delivery_fee,
            courier_id,
            total,
            payment_method,
            payment_reference
          )
          VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
      [
        user_id,
        vendorId,
        tx_ref,
        status,
        subtotal,
        delivery_fee,
        courier_id,
        total,
        payment_method,
        payment_reference,
      ],
    );
    const insertOrderItemsDetails = order_items.map((item) => [
      orderQuery.insertId,
      item.product_id,
      item.vendor_id,
      user_id,
      item.default_courier,
      item.quantity,
      item.size,
      item.color,
      item.price,
    ]);
    const sql = `
            INSERT INTO order_items
            (order_id, product_id, vendor_id, user_id, default_courier, quantity, size, color, price)
            VALUES ?
            `;

    await db.query(sql, [insertOrderItemsDetails]);
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
    console.error("Add to order error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.verifyPremiumFlutterwave = async (req, res) => {
  try {
    const {
      transaction_id,
      tx_ref,
      vendorId,
      planId,
      billingCycle,
      status = "active",
      autoRenew,
      amount,
      method,
      startedAt,
      nextBillingAt,
      paymentReference,
    } = req.query;

    const paymentMethod =
      method === "card"
        ? {
            type: "card",
            // last4: digits.slice(-4),
            // brand: digits.startsWith("4") ? "Visa" : "Mastercard",
          }
        : { type: method };

    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        },
      },
    );

    const [vendorSubRow] = await db.query(
      `SELECT * FROM vendor_subscriptions WHERE vendor_id = ?`,
      [vendorId],
    );

    if (vendorSubRow.length > 0) {
      const now = new Date();
      const vendorSub = vendorSubRow[0];
      const history = JSON.parse(vendorSub.history);
      const latestHistory = {
        id: `INV-${Date.now()}`,
        date: now.toISOString().slice(0, 19).replace("T", " "),
        amount,
        plan: "Premium Vendor",
        status: "Paid",
        method: method,
      };
      history.unshift(latestHistory);

      await db.query("UPDATE vendors SET is_premium = ? WHERE user_id = ?", [
        1,
        vendorId,
      ]);

      const payload = buildSubscriptionPayload({
        vendorId,
        planId,
        billingCycle,
        status,
        autoRenew,
        amount,
        paymentMethod,
        history,
        startedAt,
        nextBillingAt,
        paymentReference,
      });

      await db.query(
        `
      INSERT INTO vendor_subscriptions (
        vendor_id,
        plan_id,
        billing_cycle,
        status,
        auto_renew,
        amount,
        payment_method,
        history,
        started_at,
        next_billing_at,
        last_payment_reference
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        plan_id = VALUES(plan_id),
        billing_cycle = VALUES(billing_cycle),
        status = VALUES(status),
        auto_renew = VALUES(auto_renew),
        amount = VALUES(amount),
        payment_method = VALUES(payment_method),
        history = VALUES(history),
        started_at = VALUES(started_at),
        next_billing_at = VALUES(next_billing_at),
        last_payment_reference = VALUES(last_payment_reference)
      `,
        [
          payload.vendor_id,
          payload.plan_id,
          payload.billing_cycle,
          payload.status,
          payload.auto_renew,
          payload.amount,
          payload.payment_method,
          payload.history,
          payload.started_at,
          payload.next_billing_at,
          payload.last_payment_reference,
        ],
      );
    } else {
      await db.query("UPDATE vendors SET is_premium = ? WHERE user_id = ?", [
        1,
        vendorId,
      ]);

      const payload = buildSubscriptionPayload({
        vendorId,
        planId,
        billingCycle,
        status,
        autoRenew,
        amount,
        paymentMethod,
        history,
        startedAt,
        nextBillingAt,
        paymentReference,
      });

      await db.query(
        `
      INSERT INTO vendor_subscriptions (
        vendor_id,
        plan_id,
        billing_cycle,
        status,
        auto_renew,
        amount,
        payment_method,
        history,
        started_at,
        next_billing_at,
        last_payment_reference
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        plan_id = VALUES(plan_id),
        billing_cycle = VALUES(billing_cycle),
        status = VALUES(status),
        auto_renew = VALUES(auto_renew),
        amount = VALUES(amount),
        payment_method = VALUES(payment_method),
        history = VALUES(history),
        started_at = VALUES(started_at),
        next_billing_at = VALUES(next_billing_at),
        last_payment_reference = VALUES(last_payment_reference)
      `,
        [
          payload.vendor_id,
          payload.plan_id,
          payload.billing_cycle,
          payload.status,
          payload.auto_renew,
          payload.amount,
          payload.payment_method,
          payload.history,
          payload.started_at,
          payload.next_billing_at,
          payload.last_payment_reference,
        ],
      );
    }

    if (response.data.data.status === "successful") {
      return res.json({
        success: true,
        data: response.data.data,
        redirect_url: true,
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

exports.verifyPremiumPaystack = async (req, res) => {
  try {
    const {
      reference,
      vendorId,
      planId,
      billingCycle,
      status = "active",
      autoRenew,
      amount,
      method,
      startedAt,
      nextBillingAt,
      paymentReference,
    } = req.query;
    const paymentMethod =
      method === "card"
        ? {
            type: "card",
            // last4: digits.slice(-4),
            // brand: digits.startsWith("4") ? "Visa" : "Mastercard",
          }
        : { type: method };

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const [vendorSubRow] = await db.query(
      `SELECT * FROM vendor_subscriptions WHERE vendor_id = ?`,
      [vendorId],
    );

    if (vendorSubRow.length > 0) {
      const now = new Date();
      const vendorSub = vendorSubRow[0];
      const history = JSON.parse(vendorSub.history);
      const latestHistory = {
        id: `INV-${Date.now()}`,
        date: now.toISOString().slice(0, 19).replace("T", " "),
        amount,
        plan: "Premium Vendor",
        status: "Paid",
        method: method,
      };
      history.unshift(latestHistory);

      await db.query("UPDATE vendors SET is_premium = ? WHERE user_id = ?", [
        1,
        vendorId,
      ]);

      const payload = buildSubscriptionPayload({
        vendorId,
        planId,
        billingCycle,
        status,
        autoRenew,
        amount,
        paymentMethod,
        history,
        startedAt,
        nextBillingAt,
        paymentReference,
      });

      await db.query(
        `
      INSERT INTO vendor_subscriptions (
        vendor_id,
        plan_id,
        billing_cycle,
        status,
        auto_renew,
        amount,
        payment_method,
        history,
        started_at,
        next_billing_at,
        last_payment_reference
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        plan_id = VALUES(plan_id),
        billing_cycle = VALUES(billing_cycle),
        status = VALUES(status),
        auto_renew = VALUES(auto_renew),
        amount = VALUES(amount),
        payment_method = VALUES(payment_method),
        history = VALUES(history),
        started_at = VALUES(started_at),
        next_billing_at = VALUES(next_billing_at),
        last_payment_reference = VALUES(last_payment_reference)
      `,
        [
          payload.vendor_id,
          payload.plan_id,
          payload.billing_cycle,
          payload.status,
          payload.auto_renew,
          payload.amount,
          payload.payment_method,
          payload.history,
          payload.started_at,
          payload.next_billing_at,
          payload.last_payment_reference,
        ],
      );
    } else {
      await db.query("UPDATE vendors SET is_premium = ? WHERE user_id = ?", [
        1,
        vendorId,
      ]);

      const payload = buildSubscriptionPayload({
        vendorId,
        planId,
        billingCycle,
        status,
        autoRenew,
        amount,
        paymentMethod,
        history,
        startedAt,
        nextBillingAt,
        paymentReference,
      });

      await db.query(
        `
      INSERT INTO vendor_subscriptions (
        vendor_id,
        plan_id,
        billing_cycle,
        status,
        auto_renew,
        amount,
        payment_method,
        history,
        started_at,
        next_billing_at,
        last_payment_reference
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        plan_id = VALUES(plan_id),
        billing_cycle = VALUES(billing_cycle),
        status = VALUES(status),
        auto_renew = VALUES(auto_renew),
        amount = VALUES(amount),
        payment_method = VALUES(payment_method),
        history = VALUES(history),
        started_at = VALUES(started_at),
        next_billing_at = VALUES(next_billing_at),
        last_payment_reference = VALUES(last_payment_reference)
      `,
        [
          payload.vendor_id,
          payload.plan_id,
          payload.billing_cycle,
          payload.status,
          payload.auto_renew,
          payload.amount,
          payload.payment_method,
          payload.history,
          payload.started_at,
          payload.next_billing_at,
          payload.last_payment_reference,
        ],
      );
    }

    if (response.data.data.status === "success") {
      return res.json({
        success: true,
        data: response.data.data,
        redirect_url: true,
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

exports.getPaymentMethods = async (req, res) => {
  const { userId } = req.params;
  try {
    const [methods] = await db.query(
      `SELECT * from payment_methods WHERE user_id=?`,
      [userId],
    );

    res.json(methods);
  } catch {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch methods",
    });
  }
};

exports.addPaymentMethod = async (req, res) => {
  const {
    user_id,
    type,
    label,
    bank_name,
    account_number,
    provider,
    details,
    is_default,
  } = req.body;
  try {
    const [existing] = await db.query(
      "SELECT * FROM payment_methods WHERE label = ? AND user_id = ?",
      [label, user_id],
    );

    if (existing.length > 0) {
      await db.query(
        `UPDATE payment_methods
        SET 
          type = ?,
          bank_name=?,
          account_number=?,
          provider=?,
          details=?
        WHERE user_id = ? AND label =?`,
        [type, bank_name, account_number, provider, details, user_id, label],
      );
      return res.json({ message: "Payment Method updated" });
    }
    const [method] = await db.query(
      "INSERT INTO payment_methods (user_id, type, label, bank_name, account_number, provider, details, is_default) VALUES (?,?, ?, ?, ?, ?, ?, ?)",
      [
        user_id,
        type,
        label,
        bank_name,
        account_number,
        provider,
        details,
        is_default,
      ],
    );
    res.status(201).json({
      message: "Method created successfully",
    });
  } catch (error) {
    console.error("Error creating payment method:", error);
    res.status(500).json({ message: "Error creating payment method" });
  }
};

exports.setDefaultMethod = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    const [alreadyDefault] = await db.query(
      "SELECT * FROM payment_methods WHERE user_id = ? AND is_default=1",
      [userId],
    );

    const [method] = await db.query(
      "UPDATE payment_methods set is_default=? WHERE id=?",
      [1, id],
    );
    await db.query("UPDATE payment_methods set is_default=? WHERE id=?", [
      0,
      alreadyDefault[0].id,
    ]);
    res.status(201).json({
      message: "Method updated successfully",
    });
  } catch (error) {
    console.error("Error updating payment method:", error);
    res.status(500).json({ message: "Error updating payment method" });
  }
};

exports.deletePaymentMethod = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM payment_methods WHERE id = ?", [id]);

    res.json({ message: "Payment method deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    res.status(500).json({ message: "Error deleting payment method" });
  }
};
