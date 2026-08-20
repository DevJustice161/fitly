const db = require("../config/db");

const formatMySQLDateTime = (date) => {
  if (!date) return null;

  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toISOString().slice(0, 19).replace("T", " ");
};

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
      vendor_id,
      description,
      is_active,
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
        user_id,
        vendor_id,
        description,
        is_active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        code,
        discount_type,
        discount_value,
        min_order_amount,
        formatMySQLDateTime(expires_at),
        usage_limit,
        user_id || null,
        vendor_id,
        description,
        is_active,
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

    await db.query(`
    UPDATE vouchers
    SET is_active = 0
    WHERE expires_at < NOW()
      AND is_active = 1
    `);

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

exports.getVendorVouchers = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const [vouchers] = await db.query(
      `
      SELECT *
      FROM vouchers
      WHERE vendor_id = ?
      ORDER BY expires_at ASC
      `,
      [vendorId],
    );

    res.json(vouchers);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch vendor vouchers",
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
      description,
      code,
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
        is_active=?,
        description=?,
        code=?
      WHERE id=?
      `,
      [
        discount_type,
        discount_value,
        min_order_amount,
        formatMySQLDateTime(expires_at),
        usage_limit,
        is_active,
        description,
        code,
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

exports.toggleActive = async (req, res) => {
  try {
    const { id } = req.params;
    const [vouch] = await db.query(
      "SELECT is_active FROM vouchers WHERE id=?",
      [id],
    );
    const voucherStatus = vouch[0].is_active;
    const status = voucherStatus ? 0 : 1;
    await db.query("UPDATE vouchers set is_active = ? WHERE id =?", [
      status,
      id,
    ]);

    res.json({
      success: true,
      message: "Voucher Status updated",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to toggle voucher",
    });
  }
};

exports.validateVoucher = async (req, res) => {
  try {
    const { code, subtotal, vendor_id } = req.body;
    const userId = req.user?.id;
    const [settingsRows] = await db.query(
      "SELECT currency_symbol FROM settings LIMIT 1",
    );
    const currencySymbol = settingsRows[0]?.currency_symbol || "₦";

    const [voucher] = await db.query(
      `
      SELECT *
      FROM vouchers
      WHERE code = ?
        AND is_active = 1
        AND expires_at > NOW()
        AND vendor_id = ?
        AND (user_id IS NULL OR user_id = ?)
      `,
      [code, vendor_id, userId || 0],
    );

    if (!voucher.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired voucher for this vendor",
      });
    }

    const v = voucher[0];

    if (Number(subtotal) < Number(v.min_order_amount || 0)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ${currencySymbol}${v.min_order_amount}`,
      });
    }

    if (
      Number(v.usage_limit) > 0 &&
      Number(v.used_count) >= Number(v.usage_limit)
    ) {
      return res.status(400).json({
        success: false,
        message: "Voucher usage limit has been reached",
      });
    }

    if (userId) {
      const [existingUsage] = await db.query(
        `
        SELECT id
        FROM voucher_usage
        WHERE voucher_id = ?
          AND user_id = ?
        LIMIT 1
        `,
        [v.id, userId],
      );

      if (existingUsage.length) {
        return res.status(400).json({
          success: false,
          message: "You have already used this voucher",
        });
      }
    }

    let discount = 0;

    if (v.discount_type === "percentage") {
      discount = subtotal * (v.discount_value / 100);
    } else {
      discount = Number(v.discount_value || 0);
    }

    const cappedDiscount = Math.min(discount, Number(subtotal || 0));

    res.json({
      success: true,
      voucher: v,
      discount: cappedDiscount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Voucher validation failed",
    });
  }
};
