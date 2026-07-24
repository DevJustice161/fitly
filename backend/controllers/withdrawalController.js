const db = require("../config/db");
const createNotification = require("../utils/createNotification");
const { calculateCommission } = require("../services/commissionService");
const { conversionRateCalculation } = require("../services/conversionRate");

exports.getWithdrawals = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const [vendor] = await db.query(
      `SELECT is_premium
       FROM vendors
       WHERE user_id = ?`,
      [vendorId],
    );

    if (vendor.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    const [salesResult] = await db.query(
      `
      SELECT
        COALESCE(SUM(oi.price * oi.quantity), 0) AS totalEarned
      FROM order_items oi
      JOIN products p
        ON oi.product_id = p.id
      JOIN orders o
        ON oi.order_id = o.id
      WHERE
        p.vendor_id = ?
        AND oi.status = 'delivered'
      `,
      [vendorId],
    );

    const grossSales = Number(salesResult[0].totalEarned);

    const commissionType = vendor[0].is_premium ? "premium" : "default";

    const commissionDetails = await calculateCommission(
      grossSales,
      commissionType,
    );

    const [withdrawalResult] = await db.query(
      `
      SELECT
        COALESCE(SUM(amount), 0) AS totalWithdrawn
      FROM withdrawals
      WHERE vendor_id = ?
      AND status = 'paid'
      `,
      [vendorId],
    );

    const totalWithdrawn = Number(withdrawalResult[0].totalWithdrawn);
    const totalEarnings = commissionDetails.totalEarnings;
    const availableBalance = totalEarnings - totalWithdrawn;

    const [withdrawals] = await db.query(
      `
      SELECT
        id,
        amount,
        created_at,
        status,
        method,
        bank_name, 
        account_number
      FROM withdrawals
      WHERE vendor_id = ?
      ORDER BY created_at DESC
      `,
      [vendorId],
    );

    res.json({
      grossSales,
      commission: commissionDetails.commissionDeducted,
      totalEarnings,
      totalWithdrawn,
      availableBalance,
      withdrawals,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Cannot fetch vendor withdrawals",
    });
  }
};

exports.initiateWithdrawal = async (req, res) => {
  try {
    const { vendorId, amount, method, bank, accountNumber, accountName } =
      req.body;

    const [vendor] = await db.query(
      `SELECT is_premium
       FROM vendors
       WHERE user_id = ?`,
      [vendorId],
    );

    if (vendor.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }
    const [pendingWithdrawals] = await db.query(
      `SELECT COUNT(*) AS pendingCount
       FROM withdrawals
       WHERE vendor_id = ? AND status = 'pending'`,
      [vendorId],
    );

    if (pendingWithdrawals[0].pendingCount > 0) {
      return res.json({
        success: false,
        message: "You have pending withdrawals",
      });
    }

    const [withdrawalResult] = await db.query(
      `INSERT INTO withdrawals (vendor_id, amount, status, method, bank_name, account_number, account_name)
       VALUES (?, ?, 'pending', ?, ?, ?, ?)`,
      [vendorId, amount, method, bank, accountNumber, accountName],
    );

    await createNotification({
      userId: vendorId,
      type: "withdrawal",
      title: "Withdrawal Initiated",
      message: `Your withdrawal of ₦${amount} has been initiated and is pending approval.`,
      referenceId: withdrawalResult.insertId,
    });

    res.status(200).json({
      success: true,
      message: "Withdrawal initiated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(404).json({
      success: false,
      message: "Cannot initiate withdrawal",
    });
  }
};
