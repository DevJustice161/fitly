const fs = require("fs");
const path = require("path");
const axios = require("axios");
const db = require("../config/db");
const createNotification = require("../utils/createNotification");
const { calculateCommission } = require("../services/commissionService");
const { conversionRateCalculation } = require("../services/conversionRate");
const {
  buildSubscriptionPayload,
  buildPremiumPaymentCallbackUrl,
} = require("../utils/premiumUtils");

const ensurePremiumTables = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS vendor_subscriptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      vendor_id INT NOT NULL UNIQUE,
      plan_id VARCHAR(50) DEFAULT 'basic',
      billing_cycle VARCHAR(20) DEFAULT 'monthly',
      status VARCHAR(30) DEFAULT 'inactive',
      auto_renew TINYINT(1) DEFAULT 0,
      amount INT DEFAULT 0,
      payment_method TEXT,
      history TEXT,
      started_at DATETIME NULL,
      next_billing_at DATETIME NULL,
      last_payment_reference VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS premium_invoices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      vendor_id INT NOT NULL,
      invoice_id VARCHAR(100) NOT NULL,
      plan_id VARCHAR(50) DEFAULT 'basic',
      amount INT DEFAULT 0,
      currency VARCHAR(10) DEFAULT 'NGN',
      status VARCHAR(30) DEFAULT 'paid',
      payment_method VARCHAR(50) NULL,
      payment_reference VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

exports.applyVendor = async (req, res) => {
  try {
    const {
      user_id,
      full_name,
      email,
      phone,
      store_name,
      store_description,
      city,
      state,
      country,
      business_address,
      cac,
      bank_name,
      account_name,
      account_number,
    } = req.body;

    const storeLogo = req.files["store_logo"]
      ? req.files["store_logo"][0].filename
      : null;

    const governmentId = req.files["government_id"]
      ? req.files["government_id"][0].filename
      : null;

    const [existing] = await db.query(
      `
      SELECT * FROM vendor_applications
      WHERE user_id = ?
      `,
      [user_id],
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Application already submitted",
      });
    }

    await db.query(
      `
      INSERT INTO vendor_applications
      (
        user_id,
        full_name,
        email,
        phone,
        store_name,
        store_description,
        city,
        state,
        country,
        business_address,
        bank_name,
        account_name,
        account_number,
        store_logo,
        government_id,
        cac
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        user_id,
        full_name,
        email,
        phone,
        store_name,
        store_description,
        city,
        state,
        country,
        business_address,
        bank_name,
        account_name,
        account_number,
        storeLogo,
        governmentId,
        cac,
      ],
    );

    res.status(201).json({
      message: "Vendor application submitted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json(error);
  }
};

exports.getVendorApplications = async (req, res) => {
  try {
    const [applications] = await db.query(
      `
      SELECT
        vendor_applications.*,
        users.name,
        users.email
      FROM vendor_applications
      JOIN users
      ON vendor_applications.user_id = users.id
      ORDER BY vendor_applications.created_at DESC
      `,
    );

    res.json(applications);
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.getVendors = async (req, res) => {
  try {
    const [vendors] = await db.query(
      `
      SELECT users.name AS owner, vendors.*, vendor_applications.*, (SELECT COUNT(*) FROM products WHERE products.vendor_id = vendors.user_id) AS products_count
      FROM vendors
      JOIN users ON vendors.user_id = users.id
      JOIN vendor_applications ON vendors.user_id = vendor_applications.user_id
      ORDER BY vendors.created_at DESC
      `,
    );

    res.json(vendors);
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.approveVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const [applications] = await db.query(
      "SELECT * FROM vendor_applications WHERE id = ?",
      [id],
    );

    if (applications.length === 0) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    const application = applications[0];

    await db.query(
      `
      UPDATE vendor_applications
      SET status = 'Approved'
      WHERE id = ?
      `,
      [id],
    );

    await db.query(
      `
      UPDATE users
      SET role = 'vendor'
      WHERE id = ?
      `,
      [application.user_id],
    );

    await db.query(
      `
  INSERT INTO vendors (
    user_id,
    store_name,
    store_logo,
    store_description,
    is_verified,
    is_premium,
    v_status,
    rating
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    store_name = VALUES(store_name),
    store_logo = VALUES(store_logo),
    store_description = VALUES(store_description),
    is_verified = VALUES(is_verified),
    is_premium = VALUES(is_premium),
    v_status = VALUES(v_status),
    rating = VALUES(rating)
  `,
      [
        application.user_id,
        application.store_name,
        application.store_logo,
        application.store_description,
        false,
        false,
        "Active",
        0,
      ],
    );

    await createNotification({
      userId: application.user_id,
      type: "vendor",
      title: "Vendor Approved",
      message: "Your vendor account has been approved.",
    });

    res.json({
      message: "Vendor approved successfully",
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.rejectVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const [applications] = await db.query(
      "SELECT * FROM vendor_applications WHERE id = ?",
      [id],
    );

    const application = applications[0];

    await db.query(
      `
      UPDATE vendor_applications
      SET status = 'Rejected'
      WHERE id = ?
      `,
      [id],
    );

    await createNotification({
      userId: application.user_id,
      type: "vendor",
      title: "Vendor Rejected",
      message:
        "Your vendor account has been rejected. You can apply again once you meet the requirements.",
    });

    res.json({
      message: "Vendor application rejected",
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.updateVendorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { v_status } = req.body;

    await db.query(
      `
      UPDATE vendors
      SET v_status = ?
      WHERE user_id = ?
      `,
      [v_status, id],
    );

    res.status(200).json({
      success: true,
      message: "Vendor status updated",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getVendorPremiumStatus = async (req, res) => {
  try {
    const { id } = req.params;

    await ensurePremiumTables();

    const [vendor] = await db.query(
      "SELECT is_premium FROM vendors WHERE user_id = ?",
      [id],
    );

    if (vendor.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    const [subscriptionRows] = await db.query(
      "SELECT * FROM vendor_subscriptions WHERE vendor_id = ? LIMIT 1",
      [id],
    );

    const subscription = subscriptionRows[0] || null;

    const rates = await calculateCommission(
      subscription.amount,
      subscription.plan_id,
    );

    res.status(200).json({
      success: true,
      is_premium: Boolean(vendor[0].is_premium),
      plan_id: subscription?.plan_id || "basic",
      billing_cycle: subscription?.billing_cycle || "monthly",
      status:
        subscription?.status || (vendor[0].is_premium ? "active" : "inactive"),
      auto_renew: Boolean(subscription?.auto_renew),
      amount: Number(subscription?.amount || 0),
      payment_method: subscription?.payment_method
        ? JSON.parse(subscription.payment_method)
        : null,
      history: subscription?.history ? JSON.parse(subscription.history) : [],
      started_at: subscription?.started_at || null,
      next_billing_at: subscription?.next_billing_at || null,
      payment_reference: subscription?.last_payment_reference || null,
      rates: rates.allRates,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.updateVendorPremium = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      isPremium,
      planId = "basic",
      billingCycle = "monthly",
      autoRenew = false,
      amount = 0,
      paymentMethod = null,
      history = [],
      startedAt = null,
      nextBillingAt = null,
      paymentReference = null,
      status = isPremium ? "active" : "cancelled",
      provider = null,
      email = null,
      name = null,
      phone = null,
    } = req.body;

    if (typeof isPremium !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isPremium must be a boolean",
      });
    }

    await ensurePremiumTables();

    if (isPremium && provider && amount > 0) {
      const callbackUrl = buildPremiumPaymentCallbackUrl({
        baseUrl:
          process.env.PREMIUM_CALLBACK_URL ||
          "http://localhost:8080/vendor/premium-payment",
        provider,
        vendorId: id,
        planId,
        billingCycle,
        startedAt,
        nextBillingAt,
        paymentReference,
        amount,
        paymentMethod: paymentMethod?.type || provider,
        autoRenew,
      });

      const reference = paymentReference || `premium-${id}-${Date.now()}`;

      if (provider === "flutterwave") {
        const response = await axios.post(
          "https://api.flutterwave.com/v3/payments",
          {
            tx_ref: reference,
            amount,
            currency: "NGN",
            redirect_url: callbackUrl,
            customer: {
              email: email || "vendor@fitly.app",
              phonenumber: phone || "00000000000",
              name: name || `Vendor ${id}`,
            },
            customizations: {
              title: "Fitly Premium",
              description: "Upgrade your vendor account to Premium",
            },
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
          },
        );

        return res.status(200).json({
          success: true,
          payment_provider: "flutterwave",
          redirect_url: response?.data?.data?.link || null,
          reference,
          message: "Redirecting to Flutterwave checkout",
        });
      }

      if (provider === "paystack") {
        const response = await axios.post(
          "https://api.paystack.co/transaction/initialize",
          {
            email: email || "vendor@fitly.app",
            amount: amount * 100,
            reference,
            callback_url: callbackUrl,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
          },
        );

        return res.status(200).json({
          success: true,
          payment_provider: "paystack",
          redirect_url: response?.data?.data?.authorization_url || null,
          reference,
          message: "Redirecting to Paystack checkout",
        });
      }
    }

    await db.query("UPDATE vendors SET is_premium = ? WHERE user_id = ?", [
      isPremium,
      id,
    ]);

    const payload = buildSubscriptionPayload({
      vendorId: id,
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
    res.status(200).json({
      success: true,
      message: isPremium ? "Premium activated" : "Premium cancelled",
      is_premium: isPremium,
      subscription: payload,
      redirect_url: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.updateVendorProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      store_name,
      store_description,
      category,
      default_courier,
      email,
      phone,
      address,
      city,
      state,
      country,
      bank_name,
      account_name,
      account_number,
      business_address,
    } = req.body;

    const storeLogo = req.file ? req.file.filename : undefined;

    if (storeLogo) {
      const [currentVendor] = await db.query(
        "SELECT store_logo FROM vendors WHERE user_id = ?",
        [id],
      );
      const previousLogo = currentVendor?.[0]?.store_logo;

      if (previousLogo) {
        const previousLogoPath = path.join(
          __dirname,
          "..",
          "uploads",
          "logos",
          previousLogo,
        );

        if (fs.existsSync(previousLogoPath)) {
          fs.unlinkSync(previousLogoPath);
        }
      }
    }

    if (store_name !== undefined) {
      await db.query("UPDATE vendors SET store_name = ? WHERE user_id = ?", [
        store_name,
        id,
      ]);
    }

    if (store_description !== undefined) {
      await db.query(
        "UPDATE vendors SET store_description = ? WHERE user_id = ?",
        [store_description, id],
      );
    }

    if (category !== undefined) {
      await db.query(
        "UPDATE vendor_applications SET category = ? WHERE user_id = ?",
        [category, id],
      );
    }

    if (default_courier !== undefined) {
      await db.query(
        "UPDATE vendors SET default_courier = ? WHERE user_id = ?",
        [default_courier, id],
      );
    }

    if (storeLogo) {
      await db.query("UPDATE vendors SET store_logo = ? WHERE user_id = ?", [
        storeLogo,
        id,
      ]);
      await db.query(
        "UPDATE vendor_applications SET store_logo = ? WHERE user_id = ?",
        [storeLogo, id],
      );
    }

    if (email !== undefined) {
      await db.query("UPDATE users SET email = ? WHERE id = ?", [email, id]);
      await db.query(
        "UPDATE vendor_applications SET email = ? WHERE user_id = ?",
        [email, id],
      );
    }

    if (phone !== undefined) {
      await db.query(
        "UPDATE vendor_applications SET phone = ? WHERE user_id = ?",
        [phone, id],
      );
    }

    if (address !== undefined || business_address !== undefined) {
      const finalAddress = address ?? business_address;
      await db.query("UPDATE users SET address = ? WHERE id = ?", [
        finalAddress,
        id,
      ]);
      await db.query(
        "UPDATE vendor_applications SET business_address = ? WHERE user_id = ?",
        [finalAddress, id],
      );
    }

    if (city !== undefined) {
      await db.query(
        "UPDATE vendor_applications SET city = ? WHERE user_id = ?",
        [city, id],
      );
    }

    if (state !== undefined) {
      await db.query(
        "UPDATE vendor_applications SET state = ? WHERE user_id = ?",
        [state, id],
      );
    }

    if (country !== undefined) {
      await db.query(
        "UPDATE vendor_applications SET country = ? WHERE user_id = ?",
        [country, id],
      );
    }

    if (bank_name !== undefined) {
      await db.query(
        "UPDATE vendor_applications SET bank_name = ? WHERE user_id = ?",
        [bank_name, id],
      );
    }

    if (account_name !== undefined) {
      await db.query(
        "UPDATE vendor_applications SET account_name = ? WHERE user_id = ?",
        [account_name, id],
      );
    }

    if (account_number !== undefined) {
      await db.query(
        "UPDATE vendor_applications SET account_number = ? WHERE user_id = ?",
        [account_number, id],
      );
    }

    res.status(200).json({
      success: true,
      message: "Vendor profile updated successfully",
      store_logo: storeLogo || null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getVendorProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const [vendor] = await db.query(
      `
      SELECT users.name AS owner, users.address, users.email, vendors.*,
      vendor_applications.full_name, vendor_applications.phone , vendor_applications.city , vendor_applications.state ,
      vendor_applications.country, vendor_applications.category ,vendor_applications.government_id ,vendor_applications.cac ,vendor_applications.category ,vendor_applications.business_address,
      vendor_applications.bank_name ,vendor_applications.account_name ,vendor_applications.account_number ,vendor_applications.status ,vendor_applications.created_at AS date_applied 
      FROM vendors
      JOIN users ON vendors.user_id = users.id
      JOIN vendor_applications ON vendors.user_id = vendor_applications.user_id
      WHERE vendors.user_id = ?
      `,
      [id],
    );

    if (vendor.length === 0) {
      return res.status(404).json({
        message: "Vendor not found",
      });
    }

    const vend = vendor[0];

    const [vendorCourier] = await db.query(
      `SELECT * FROM courier where id = ?`,
      [vend.default_courier],
    );

    const courier = vendorCourier[0];

    res.json({ ...vend, courier: courier });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getVendorDashboard = async (req, res) => {
  try {
    const { userId } = req.params;

    const [vendor] = await db.query(`SELECT * FROM vendors WHERE user_id = ?`, [
      userId,
    ]);
    const vendor_type = vendor[0].is_premium == 1 ? "premium" : "basic";
    const commission = await calculateCommission(100, vendor_type);
    const remPct = 1 - Number(commission.commissionRate);
    const [totalProducts] = await db.query(
      `SELECT COUNT(*) AS total FROM products
           WHERE vendor_id = ?`,
      [userId],
    );

    const [totalOrders] = await db.query(
      `SELECT COUNT(*) AS total
        FROM order_items oi

        JOIN products p
        ON oi.product_id=p.id

        WHERE p.vendor_id=?`,
      [userId],
    );

    const [totalSales] = await db.query(
      `SELECT
        COALESCE(SUM(oi.price*oi.quantity),0) AS total

        FROM order_items oi

        JOIN products p
        ON oi.product_id=p.id

        JOIN orders o
        ON oi.order_id=o.id

        WHERE
        p.vendor_id=?
        AND o.status='delivered'`,
      [userId],
    );

    const [totalPendingWithdrawals] = await db.query(
      `SELECT
        COALESCE(SUM(amount),0) AS total

        FROM withdrawals

        WHERE
        vendor_id=?
        AND status='pending'`,
      [userId],
    );

    const [totalEarnings] = await db.query(
      `SELECT
        COALESCE(SUM(oi.price*oi.quantity),0) AS total
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE p.vendor_id = ?`,
      [userId],
    );

    const [commissionDeducted] = await db.query(
      `SELECT
        COALESCE(SUM(oi.price*oi.quantity* ?),0) AS total
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE p.vendor_id = ?`,
      [commission.commissionRate, userId],
    );

    const [netBalance] = await db.query(
      `SELECT
        COALESCE(SUM(oi.price*oi.quantity),0) - COALESCE(SUM(oi.price*oi.quantity*?),0) AS total
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE p.vendor_id = ?`,
      [commission.commissionRate, userId],
    );

    const [monthlySales] = await db.query(
      `SELECT MONTH(o.created_at) month, SUM(oi.price*oi.quantity ) sales

        FROM order_items oi

        JOIN orders o
        ON oi.order_id=o.id

        JOIN products p
        ON oi.product_id=p.id

        WHERE

        p.vendor_id=?

        AND YEAR(o.created_at)=YEAR(CURDATE())

        GROUP BY MONTH(o.created_at)

        ORDER BY MONTH(o.created_at);`,
      [userId],
    );
    const [recentOrders] = await db.query(
      `SELECT

        oi.id, pr.name product, pr.thumbnail, u.name customer, oi.quantity, oi.price, oi.status,
        o.created_at
        
        FROM order_items oi

        JOIN orders o
        ON oi.order_id=o.id

        JOIN users u
        ON o.user_id=u.id

        JOIN products pr
        ON oi.product_id=pr.id

        WHERE
        pr.vendor_id=?

        ORDER BY o.created_at DESC

        LIMIT 5;`,
      [userId],
    );

    const [topSelling] = await db.query(
      `SELECT p.id, p.name, p.stock_quantity, p.thumbnail, SUM(oi.quantity) sales, SUM(oi.quantity*oi.price) revenue

        FROM products p

        JOIN order_items oi
        ON oi.product_id=p.id

        WHERE
        p.vendor_id=?

        GROUP BY p.id

        ORDER BY sales DESC

        LIMIT 5;`,
      [userId],
    );

    const [lowStockAlert] = await db.query(
      `SELECT id, name, thumbnail, stock_quantity

        FROM products

        WHERE

        vendor_id=?

        AND stock_quantity<=5

        ORDER BY stock_quantity;`,
      [userId],
    );

    const type = vendor[0].is_premium ? "premium" : "default";

    const commissionDetails = await calculateCommission(
      totalSales[0].total,
      type,
    );

    res.json({
      stats: {
        totalOrders: totalOrders[0].total,
        totalProducts: totalProducts[0].total,
        totalSales: totalSales[0].total,
        totalPendingWithdrawals: totalPendingWithdrawals[0].total,
      },

      commissionDetails: commissionDetails,
      conversionRate: await conversionRateCalculation(),

      monthlySales,
      recentOrders,
      topSelling,
      lowStockAlert,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const [vendor] = await db.query(
      "SELECT is_premium FROM vendors WHERE user_id = ? ",
      [vendorId],
    );
    const type = vendor[0].is_premium == 1 ? "premium" : "basic";
    const commission = await calculateCommission(100, type);
    const remPct = 1 - Number(commission.commissionRate);

    const [orders] = await db.query(
      `SELECT oi.id AS order_item_id, oi.product_id, oi.quantity, oi.size, oi.color, oi.price, oi.default_courier, oi.status,
        o.id AS orderId, o.order_id, o.payment_method, o.created_at,
        p.name AS product_name, p.thumbnail,
        u.name AS customer_name, u.email, u.phone,
        vu.email AS vendor_email, vu.address AS vendor_address, vu.phone AS vendor_phone,
        v.store_name,
        (
          oi.price * oi.quantity
        ) AS total,
        (
          oi.price * oi.quantity * ?
        ) AS commission,
        (
          oi.price * oi.quantity * ?
        ) AS earning

      FROM order_items oi

      JOIN orders o
          ON oi.order_id = o.id

      JOIN products p
          ON oi.product_id = p.id

      JOIN users u
          ON o.user_id = u.id

      JOIN users vu
          ON o.vendor_id = vu.id

      JOIN vendors v
          ON p.vendor_id = v.user_id

      WHERE p.vendor_id = ?

      ORDER BY o.created_at DESC;`,
      [commission.commissionRate, remPct, vendorId],
    );

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Cannot fetch your orders",
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, orderId } = req.body;

    await db.query(
      `
      UPDATE order_items
      SET status = ?
      WHERE id = ?
      `,
      [status, id],
    );

    const [statuses] = await db.query(
      `
      SELECT status
      FROM order_items
      WHERE order_id = ?
      `,
      [orderId],
    );

    let overall;

    if (statuses.every((s) => s.status === "delivered")) {
      overall = "delivered";

      await db.query(
        `UPDATE orders
        SET delivered_at = ?
        WHERE id = ?`,
        [new Date(), orderId],
      );
    } else if (statuses.every((s) => s.status === "shipped")) {
      overall = "shipped";
    } else if (statuses.every((s) => s.status === "cancelled")) {
      overall = "cancelled";
    } else if (statuses.some((s) => s.status === "shipped")) {
      overall = "processing";
    } else if (statuses.some((s) => s.status === "processing")) {
      overall = "processing";
    } else {
      overall = "processing";
    }

    await db.query(
      `UPDATE orders
        SET status = ?
        WHERE id = ?`,
      [overall, orderId],
    );

    res.status(200).json({
      success: true,
      message: "Product Order status updated",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getVendorCustomers = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const [customers] = await db.query(
      `SELECT u.id, u.name, u.email, COUNT(o.id) AS orders, COALESCE(SUM(oi.price * oi.quantity), 0) AS totalSpent, MAX(o.created_at) AS lastOrder
        FROM users u
        JOIN orders o ON u.id = o.user_id
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE p.vendor_id = ?
        GROUP BY u.id, u.name, u.email
      `,
      [vendorId],
    );

    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Cannot fetch vendor customers",
    });
  }
};
