const db = require("../config/db");

exports.createVoucher = async (req, res) => {
  try {
    const {
      code,
      discount_type,
      discount_value,
      min_order_amount,
      expires_at,
      usage_limit,
      user_id,
    } = req.body;

    const [existing] = await db.query(
      "SELECT id FROM vouchers WHERE code = ?",
      [code],
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Voucher code already exists",
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO vouchers
      (
        code,
        discount_type,
        discount_value,
        min_order_amount,
        expires_at,
        usage_limit,
        user_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        code,
        discount_type,
        discount_value,
        min_order_amount,
        expires_at,
        usage_limit,
        user_id || null,
      ],
    );

    res.status(201).json({
      success: true,
      id: result.insertId,
      message: "Voucher created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create voucher",
    });
  }
};

exports.getAllVouchers = async (req, res) => {
  try {
    const [vouchers] = await db.query(`
      SELECT *
      FROM vouchers
      ORDER BY created_at DESC
    `);

    res.json(vouchers);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch vouchers",
    });
  }
};

exports.getUserVouchers = async (req, res) => {
  try {
    const { userId } = req.params;

    const [vouchers] = await db.query(
      `
      SELECT *
      FROM vouchers
      WHERE user_id IS NULL
         OR user_id = ?
      ORDER BY expires_at ASC
      `,
      [userId],
    );

    res.json(vouchers);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch user vouchers",
    });
  }
};

exports.getVoucherById = async (req, res) => {
  try {
    const [voucher] = await db.query("SELECT * FROM vouchers WHERE id = ?", [
      req.params.id,
    ]);

    if (!voucher.length) {
      return res.status(404).json({
        message: "Voucher not found",
      });
    }

    res.json(voucher[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch voucher",
    });
  }
};

exports.updateVoucher = async (req, res) => {
  try {
    const {
      discount_type,
      discount_value,
      min_order_amount,
      expires_at,
      usage_limit,
      is_active,
    } = req.body;

    await db.query(
      `
      UPDATE vouchers
      SET
        discount_type=?,
        discount_value=?,
        min_order_amount=?,
        expires_at=?,
        usage_limit=?,
        is_active=?
      WHERE id=?
      `,
      [
        discount_type,
        discount_value,
        min_order_amount,
        expires_at,
        usage_limit,
        is_active,
        req.params.id,
      ],
    );

    res.json({
      success: true,
      message: "Voucher updated",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update voucher",
    });
  }
};

exports.deleteVoucher = async (req, res) => {
  try {
    await db.query("DELETE FROM vouchers WHERE id = ?", [req.params.id]);

    res.json({
      success: true,
      message: "Voucher deleted",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to delete voucher",
    });
  }
};

exports.validateVoucher = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    const [voucher] = await db.query(
      `
      SELECT *
      FROM vouchers
      WHERE code = ?
      AND is_active = 1
      AND expires_at > NOW()
      `,
      [code],
    );

    if (!voucher.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired voucher",
      });
    }

    const v = voucher[0];

    if (subtotal < v.min_order_amount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ₦${v.min_order_amount}`,
      });
    }

    let discount = 0;

    if (v.discount_type === "percentage") {
      discount = subtotal * (v.discount_value / 100);
    } else {
      discount = v.discount_value;
    }

    res.json({
      success: true,
      voucher: v,
      discount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Voucher validation failed",
    });
  }
};
