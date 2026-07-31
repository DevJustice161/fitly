const db = require("../config/db");
const fs = require("fs");
const path = require("path");
const { calculateCommission } = require("../services/commissionService");
const { conversionRateCalculation } = require("../services/conversionRate");

exports.getAdminDashboardData = async (req, res) => {
  try {
    const { adminId } = req.params;

    const [totalRevenue] = await db.query(
      `SELECT
        COALESCE(SUM(oi.price*oi.quantity),0) AS total
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id`,
    );
    const [platformEarnings] = await db.query(
      `SELECT COALESCE( SUM( (oi.price * oi.quantity) * (c.commission_rate / 100) ), 0 ) AS platform_earnings
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN vendors v ON p.vendor_id = v.user_id
        JOIN commission c ON c.type = CASE WHEN v.is_premium = 1 THEN 'premium' ELSE 'default' END
        WHERE oi.wallet_credited = 1;`,
    );
    const [totalOrders] = await db.query(`SELECT COUNT(*) AS total
        FROM order_items oi

        JOIN products p
        ON oi.product_id=p.id`);
    const [totalProducts] = await db.query(
      "SELECT COUNT(*) AS total FROM products",
    );
    const [totalCustomers] = await db.query(
      "SELECT COUNT(DISTINCT user_id) AS total_users FROM orders",
    );
    const [totalVendors] = await db.query(
      "SELECT COUNT(*) AS total FROM vendors",
    );
    const [totalPremiumVendors] = await db.query(
      "SELECT COUNT(*) AS total FROM vendors WHERE is_premium = 1",
    );
    const [pendingApplications] = await db.query(
      "SELECT COUNT(*) AS total FROM vendor_applications WHERE status = 'Pending'",
    );
    const [pendingWithdrawals] = await db.query(
      "SELECT COUNT(*) AS total FROM withdrawals WHERE status = 'pending'",
    );

    const [orderProcessing] = await db.query(`SELECT COUNT(*) AS total
        FROM order_items oi WHERE status = 'processing'`);
    const [orderShipped] = await db.query(`SELECT COUNT(*) AS total
        FROM order_items oi WHERE status = 'shipped'`);
    const [orderDelivered] = await db.query(`SELECT COUNT(*) AS total
        FROM order_items oi WHERE status = 'delivered'`);
    const [orderCancelled] = await db.query(`SELECT COUNT(*) AS total
        FROM order_items oi WHERE status = 'cancelled'`);

    const [recentApplications] = await db.query(
      `SELECT id, store_name AS storeName, store_logo AS logo, full_name AS owner, created_at AS appliedDate, status
      FROM vendor_applications ORDER BY created_at DESC LIMIT 4 `,
    );
    const [recentWithdrawals] = await db.query(
      `SELECT w.id, v.store_name AS vendor, w.amount, w.bank_name AS bank, w.account_number AS accountNumber, w.created_at AS date, w.status      
      FROM withdrawals w 
      JOIN vendors v ON w.vendor_id = v.user_id
      ORDER BY w.created_at DESC LIMIT 4 `,
    );
    const [recentOrders] = await db.query(
      `SELECT  oi.id, o.order_id, u.name AS customer, v.store_name AS vendor, (oi.price * oi.quantity) AS total, o.payment_method AS paymentMethod, oi.status, p.name AS productName, o.created_at AS date
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN users u ON o.user_id = u.id
        JOIN products p ON oi.product_id = p.id
        JOIN vendors v ON p.vendor_id = v.user_id
        ORDER BY o.created_at DESC LIMIT 4;`,
    );
    const [topVendors] = await db.query(
      `SELECT v.id, v.store_name AS storeName, v.store_logo AS logo, COALESCE(SUM(oi.price * oi.quantity), 0) AS totalSales, COALESCE(SUM(oi.quantity), 0) AS totalOrders, v.rating, v.is_premium AS premium
        FROM vendors v
        LEFT JOIN order_items oi ON oi.vendor_id = v.user_id AND oi.wallet_credited = 1
        GROUP BY v.id, v.store_name, v.store_logo, v.rating, v.is_premium
        ORDER BY totalSales DESC LIMIT 4;`,
    );
    const [topProducts] = await db.query(
      `SELECT p.id, p.name, p.thumbnail AS image, v.store_name AS vendor, COALESCE(SUM(oi.quantity), 0) AS unitsSold,
       COALESCE(SUM(oi.price * oi.quantity), 0) AS revenue
        FROM products p
        JOIN vendors v ON v.user_id = p.vendor_id
        JOIN order_items oi ON oi.product_id = p.id
        GROUP BY p.id, p.name, p.thumbnail, v.store_name
        ORDER BY unitsSold DESC LIMIT 4;`,
    );
    const [notifications] = await db.query(
      `SELECT id, type, title, message AS description, created_at AS time
        FROM notifications WHERE user_id = ? `,
      [adminId],
    );

    res.json({
      stats: {
        totalRevenue: totalRevenue[0]?.total,
        platformEarnings: platformEarnings[0]?.platform_earnings,
        totalOrders: totalOrders[0]?.total,
        totalProducts: totalProducts[0]?.total,
        totalCustomers: totalCustomers[0]?.total,
        totalVendors: totalVendors[0]?.total,
        premiumVendors: totalPremiumVendors[0]?.total,
        pendingApplications: pendingApplications[0]?.total,
        pendingWithdrawals: pendingWithdrawals[0]?.total,
      },
      orderSummary: {
        processing: orderProcessing[0]?.total,
        shipped: orderShipped[0]?.total,
        delivered: orderDelivered[0]?.total,
        cancelled: orderCancelled[0]?.total,
      },
      recentApplications,
      recentWithdrawals,
      recentOrders,
      topVendors,
      topProducts,
      notifications,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load admin dashboard",
    });
  }
};

exports.getWithdrawalRequests = async (req, res) => {
  try {
    const [requests] = await db.query(
      `SELECT w.id, v.store_name AS vendor, w.amount, w.status, w.bank_name AS bank, w.account_number AS accountNumber, w.created_at AS date
      FROM withdrawals w
      JOIN vendors v ON w.vendor_id = v.user_id
      ORDER BY w.created_at DESC`,
    );

    res.status(200).json(requests);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Cannot fetch withdrawal requests",
    });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `
      SELECT o.id, o.order_id, o.user_id, o.status, o.payment_method AS paymentMethod, o.total, o.subtotal, 
      o.delivery_fee, o.estimated_delivery, o.created_at AS date, o.delivered_at, COUNT(oi.id) AS items, 
      GROUP_CONCAT(DISTINCT v.store_name ORDER BY v.store_name SEPARATOR ', ') AS vendor, u.name AS customer
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN vendors v ON oi.vendor_id = v.user_id
      GROUP BY o.id ORDER BY o.created_at DESC;
      `,
    );

    res.json(orders);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["shipped", "delivered", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    const [orders] = await db.query(
      ` SELECT id FROM orders WHERE id = ?
      `,
      [id],
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (status === "delivered") {
      await db.query(
        ` UPDATE orders SET status = ?, delivered_at = NOW()  WHERE id = ?
        `,
        [status, id],
      );

      await db.query(
        ` UPDATE order_items SET status = 'delivered' WHERE order_id = ? `,
        [id],
      );
    } else {
      await db.query(
        `UPDATE orders SET status = ?, delivered_at = NULL WHERE id = ?
        `,
        [status, id],
      );

      await db.query(
        `UPDATE order_items SET status = ? WHERE order_id = ?
        `,
        [status, id],
      );
    }

    res.json({
      success: true,
      message: `Order marked as ${status}.`,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update order status.",
    });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const [products] = await db.query(
      `
      SELECT p.id, p.name, v.store_name AS vendor, p.category, p.price, p.stock_quantity AS stock, p.status, p.created_at
      FROM products p
      JOIN vendors v ON v.user_id = p.vendor_id
      ORDER BY p.created_at DESC;
      `,
    );

    res.json(products);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
};

exports.updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Active", "Inactive"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product status.",
      });
    }

    const [products] = await db.query(
      ` SELECT * FROM products WHERE id = ?
      `,
      [id],
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    if (products[0].status !== "Out of Stock") {
      if (status === "Active") {
        await db.query(
          ` UPDATE products SET status = ?  WHERE id = ?
        `,
          [status, id],
        );
      } else {
        await db.query(
          `UPDATE products SET status = ? WHERE id = ?
        `,
          [status, id],
        );
      }
    } else {
      await db.query(
        `UPDATE products SET status = ?, stock_quantity = ? + 1 WHERE id = ?
        `,
        [status, Number(products[0].stock_quantity), id],
      );
    }

    res.json({
      success: true,
      message: `Product marked as ${status}.`,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update product status.",
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const [product] = await db.query(
      ` SELECT * FROM products WHERE id = ?
      `,
      [id],
    );
    const [images] = await db.query(
      "SELECT * FROM product_images WHERE product_id = ?",
      [id],
    );
    const [variants] = await db.query(
      "SELECT * FROM product_variants WHERE product_id = ?",
      [id],
    );

    if (product.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
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

    res.json({
      success: true,
      message: `Product deleted from marketplace.`,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete product from marketplace.",
    });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const [customers] = await db.query(`
      SELECT u.id, u.name, u.email, u.phone, u.avatar, CONCAT(u.city, ', ', u.state) AS location, COUNT(DISTINCT o.id) AS orders,
      COALESCE(SUM(o.total), 0) AS spent, u.created_at AS joined, MAX(o.created_at) AS lastOrder, u.status,
      COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.id END) AS deliveredOrders,
      COUNT(DISTINCT CASE WHEN o.status = 'cancelled' THEN o.id END) AS cancelledOrders,
      AVG(o.total) AS averageOrderValue, SUM(CASE WHEN o.payment_method = 'wallet' THEN 1 ELSE 0 END) AS walletOrders
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      WHERE u.role = 'customer'
      GROUP BY u.id, u.name, u.email, u.phone, u.city, u.state, u.created_at
      ORDER BY u.created_at DESC
    `);

    res.status(200).json(customers);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
};

exports.updateCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["active", "inactive", "suspended"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer status.",
      });
    }

    const [customers] = await db.query(
      ` SELECT * FROM users WHERE id = ?
      `,
      [id],
    );

    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    if (status === "active") {
      await db.query(
        ` UPDATE users SET status = ?  WHERE id = ?
        `,
        [status, id],
      );
    } else {
      await db.query(
        `UPDATE users SET status = ? WHERE id = ?
        `,
        [status, id],
      );
    }

    res.json({
      success: true,
      message: `Customer marked as ${status}.`,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update customer status.",
    });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const [user] = await db.query(
      ` SELECT * FROM users WHERE id = ?
      `,
      [id],
    );

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    const userData = user[0];

    if (userData.avatar) {
      const oldThumbnailPath = path.join(
        __dirname,
        "../uploads/avatars",
        userData.avatar,
      );
      if (fs.existsSync(oldThumbnailPath)) {
        fs.unlinkSync(oldThumbnailPath);
      }
    }
    await db.query("DELETE FROM conversations WHERE buyer_id = ?", [id]);
    await db.query("DELETE FROM coupon_usages WHERE user_id = ?", [id]);
    await db.query(
      "DELETE FROM messages WHERE sender_id = ? AND receiver_id = ?",
      [id, id],
    );
    await db.query("DELETE FROM notifications WHERE user_id = ?", [id]);
    await db.query("DELETE FROM orders WHERE user_id = ?", [id]);
    await db.query("DELETE FROM order_items WHERE user_id = ?", [id]);
    await db.query("DELETE FROM payment_method WHERE user_id = ?", [id]);
    await db.query("DELETE FROM recently_viewed WHERE user_id = ?", [id]);
    await db.query("DELETE FROM reviews WHERE user_id = ?", [id]);
    await db.query("DELETE FROM review_images WHERE user_id = ?", [id]);
    await db.query("DELETE FROM review_replies WHERE user_id = ?", [id]);
    await db.query("DELETE FROM vendor_applications WHERE user_id = ?", [id]);
    await db.query("DELETE FROM vouchers WHERE user_id = ?", [id]);
    await db.query("DELETE FROM voucher_usage WHERE user_id = ?", [id]);
    await db.query("DELETE FROM wishlists WHERE user_id = ?", [id]);
    await db.query("DELETE FROM coupon_usages WHERE user_id = ?", [id]);
    await db.query("DELETE FROM users WHERE id = ?", [id]);

    res.json({
      success: true,
      message: `User deleted.`,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete user.",
    });
  }
};
exports.addCourier = async (req, res) => {
  try {
    const {
      name,
      company,
      email,
      location,
      coverage,
      base_fee,
      avg_days,
      phone,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Courier name is required",
      });
    }

    const [existing] = await db.query("SELECT id FROM courier WHERE name = ?", [
      name,
    ]);

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Courier already exists",
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO courier
      (
        name,
        company,
        email,
        location,
        coverage,
        base_fee,
        avg_delivery,
        phone,
        active,
        default_courier,
        rating
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        name,
        company,
        email,
        location,
        coverage || "Nationwide",
        base_fee || 0,
        avg_days || "2-4 days",
        phone || null,
        1,
        0,
        0,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Courier added successfully",
      courier: {
        id: result.insertId,
        name,
        company,
        email,
        location,
        coverage,
        baseFee: base_fee,
        avgDays: avg_days,
        phone,
        active: 1,
        is_default: 0,
        deliveries: 0,
        rating: 0,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to add courier",
    });
  }
};
exports.getCouriers = async (req, res) => {
  try {
    const [couriers] = await db.query(`
      SELECT
        c.id,
        c.name,
        c.coverage,
        c.company,
        c.email,
        c.location,
        c.base_fee AS baseFee,
        c.avg_delivery AS avgDays,
        c.default_courier,
        c.phone,
        c.active,
        c.rating,

        COUNT(DISTINCT o.id) AS deliveries

      FROM courier c

      LEFT JOIN orders o
        ON o.courier_id = c.id

      GROUP BY
        c.id,
        c.name,
        c.coverage,
        c.base_fee,
        c.avg_delivery,
        c.default_courier,
        c.phone,
        c.active,
        c.rating

      ORDER BY c.name ASC
    `);

    res.status(200).json(couriers);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch couriers",
    });
  }
};
exports.updateCourier = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      company,
      email,
      location,
      coverage,
      base_fee,
      avg_days,
      phone,
    } = req.body;

    const [couriers] = await db.query("SELECT * FROM courier WHERE id = ?", [
      id,
    ]);

    if (couriers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Courier not found",
      });
    }

    const [duplicate] = await db.query(
      `
      SELECT id
      FROM courier
      WHERE name = ?
      AND id <> ?
      `,
      [name, id],
    );

    if (duplicate.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Another courier already uses this name",
      });
    }

    await db.query(
      `
      UPDATE courier
      SET
        name = ?,
        company = ?,
        email = ?,
        location = ?,
        coverage = ?,
        base_fee = ?,
        avg_delivery = ?,
        phone = ?
      WHERE id = ?
      `,
      [name, company, email, location, coverage, base_fee, avg_days, phone, id],
    );

    res.json({
      success: true,
      message: "Courier updated successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update courier",
    });
  }
};
exports.setDefaultCourier = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;

    await connection.query(`
      UPDATE courier
      SET default_courier = 0
    `);

    const [result] = await connection.query(
      `
      UPDATE courier
      SET default_courier = 1
      WHERE id = ?
      `,
      [id],
    );

    if (result.affectedRows === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Courier not found",
      });
    }

    await connection.commit();

    res.json({
      success: true,
      message: "Default courier updated successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update default courier",
    });
  } finally {
    connection.release();
  }
};

exports.updateCourierStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const [courier] = await db.query("SELECT id FROM courier WHERE id = ?", [
      id,
    ]);

    if (courier.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Courier not found",
      });
    }
    await db.query(
      `
      UPDATE courier
      SET active = ?
      WHERE id = ?
      `,
      [active ? 1 : 0, id],
    );

    res.json({
      success: true,
      message: `Courier ${active ? "activated" : "deactivated"} successfully.`,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update courier status.",
    });
  }
};
exports.deleteCourier = async (req, res) => {
  try {
    const { id } = req.params;

    const [couriers] = await db.query("SELECT * FROM courier WHERE id = ?", [
      id,
    ]);

    if (couriers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Courier not found",
      });
    }

    if (couriers[0].default_courier) {
      return res.status(400).json({
        success: false,
        message:
          "Default courier cannot be deleted. Set another courier as default first.",
      });
    }
    const [orders] = await db.query(
      "SELECT COUNT(*) AS total FROM orders WHERE courier_id = ?",
      [id],
    );

    if (orders[0].total > 0) {
      return res.status(400).json({
        success: false,
        message: "This courier has existing orders and cannot be deleted.",
      });
    }

    const [order_items] = await db.query(
      "SELECT COUNT(*) AS total FROM order_items WHERE default_courier = ?",
      [id],
    );

    if (order_items[0].total > 0) {
      return res.status(400).json({
        success: false,
        message: "This courier has existing orders and cannot be deleted.",
      });
    }

    const [result] = await db.query("DELETE FROM courier WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Courier not found",
      });
    }

    res.json({
      success: true,
      message: "Courier deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete courier",
    });
  }
};

exports.getCommissionDetails = async (req, res) => {
  try {
    const [defaultCommission] = await db.query(
      "SELECT * FROM commission WHERE type = 'default'",
    );

    const [premiumCommission] = await db.query(
      "SELECT * FROM commission WHERE type = 'premium'",
    );

    res.status(200).json({
      default: defaultCommission[0] || null,
      premium: premiumCommission[0] || null,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Cannot get commission details",
    });
  }
};

exports.updateCommissionDetails = async (req, res) => {
  try {
    const {
      defaultCommission,
      premiumCommission,
      defaultMinProducts,
      premiumSubPrice,
    } = req.body;

    await db.query(
      "UPDATE commission set commission_rate = ? WHERE type = 'default'",
      [defaultCommission],
    );
    await db.query(
      "UPDATE commission set commission_rate = ? WHERE type = 'premium'",
      [premiumCommission],
    );
    await db.query(
      "UPDATE commission set min_products = ? WHERE type = 'default'",
      [defaultMinProducts],
    );
    await db.query("UPDATE commission set price = ? WHERE type = 'premium'", [
      premiumSubPrice,
    ]);

    res.status(200).json({
      message: "Commission Updated Successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Cannot update commission details",
    });
  }
};
exports.getReportsAndAnalytics = async (req, res) => {
  try {
    const [adminStats] = await db.query(
      `SELECT  (SELECT COUNT(*) FROM vendors) AS totalVendors,(SELECT COUNT(*) 
      FROM vendor_applications WHERE status = 'pending') AS pendingApplications, 
      ( SELECT COALESCE(SUM(oi.price * oi.quantity), 0) FROM order_items oi WHERE oi.status = 'delivered' ) 
       AS totalRevenue, 
      ( SELECT COALESCE( SUM( (oi.price * oi.quantity) * 
      (CASE WHEN v.is_premium = 1 THEN ( SELECT commission_rate FROM commission WHERE type = 'premium' LIMIT 1 ) 
      ELSE (SELECT commission_rate FROM commission WHERE type = 'default' LIMIT 1) END) / 100), 0) 
      FROM order_items oi JOIN vendors v ON oi.vendor_id = v.user_id WHERE oi.status = 'delivered' ) 
      AS commissionEarned,
      (SELECT COALESCE(SUM(amount), 0) FROM vendor_subscriptions WHERE status = 'active') AS totalPremiumSubscriptions, 
      (SELECT COALESCE(SUM(total_withdrawn), 0) FROM wallets) AS netPayoutToVendors, (SELECT COUNT(*) FROM withdrawals WHERE status = 'pending') AS pendingWithdrawals, 
      (SELECT COUNT(*) FROM products WHERE status = 'active') AS activeProducts;`,
    );
    const [monthlySalesData] = await db.query(
      `SELECT DATE_FORMAT(o.created_at, '%b') AS month, SUM(oi.price * oi.quantity) AS sales, 
      COUNT(DISTINCT o.id) AS orders, SUM( (oi.price * oi.quantity) * CASE WHEN v.is_premium = 1 
      THEN pc.commission_rate / 100 ELSE dc.commission_rate / 100 END ) AS commission 
      FROM order_items oi JOIN orders o ON oi.order_id = o.id 
      JOIN vendors v ON oi.vendor_id = v.user_id CROSS JOIN 
      ( SELECT commission_rate FROM commission WHERE type = 'default' LIMIT 1 ) dc 
       CROSS JOIN ( SELECT commission_rate FROM commission WHERE type = 'premium' LIMIT 1 ) pc 
       WHERE oi.status = 'Delivered' GROUP BY YEAR(o.created_at), MONTH(o.created_at), 
       DATE_FORMAT(o.created_at, '%b') ORDER BY YEAR(o.created_at), MONTH(o.created_at);`,
    );
    const [vendorPerformance] = await db.query(`SELECT v.store_name AS vendor, 
      COALESCE(SUM(oi.price * oi.quantity), 0) AS revenue, COUNT(DISTINCT oi.order_id) AS orders 
      FROM vendors v LEFT JOIN order_items oi ON oi.vendor_id = v.user_id WHERE oi.status = 'delivered' 
      GROUP BY v.user_id, v.store_name 
      ORDER BY revenue DESC LIMIT 5;`);

    const [topProducts] =
      await db.query(`SELECT p.name, COALESCE(SUM(oi.quantity),0) AS sold, 
      COALESCE(SUM(oi.price * oi.quantity),0) AS revenue FROM products p 
      LEFT JOIN order_items oi ON oi.product_id = p.id WHERE oi.status = 'Delivered' 
      GROUP BY p.id, p.name ORDER BY sold DESC LIMIT 5;`);

    const [topCategories] = await db.query(
      `SELECT p.category AS name, 
      ROUND( ( SUM(oi.quantity) / ( SELECT SUM(quantity) FROM order_items WHERE status = 'Delivered' ) ) * 100, 1 ) AS value 
      FROM products p JOIN order_items oi ON oi.product_id = p.id WHERE oi.status = 'Delivered' 
      GROUP BY p.category ORDER BY value DESC;`,
    );

    const [breakdown] =
      await db.query(`SELECT source, amount,  ROUND((amount / SUM(amount) OVER ()) * 100, 1) AS pct
      FROM ( SELECT 'Commission on Sales' AS source, COALESCE( SUM( (oi.price * oi.quantity) * 
      CASE  WHEN v.is_premium = 1 THEN pc.commission_rate / 100 ELSE dc.commission_rate / 100 END), 0) AS amount 
      FROM order_items oi JOIN vendors v ON oi.vendor_id = v.user_id
      CROSS JOIN (SELECT commission_rate FROM commission WHERE type = 'default' LIMIT 1) dc
      CROSS JOIN (SELECT commission_rate FROM commission WHERE type = 'premium' LIMIT 1 ) pc
      WHERE oi.status = 'Delivered'
      UNION ALL
      SELECT 'Premium Subscriptions' AS source, COALESCE(SUM(amount), 0) AS amount FROM vendor_subscriptions
      WHERE status = 'active') AS revenue_breakdown
      ORDER BY amount DESC;`);

    res.status(200).json({
      adminStats: adminStats[0],
      monthlySalesData,
      vendorPerformance,
      topProducts,
      topCategories,
      breakdown,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Cannot fetch reports and analytics",
    });
  }
};
