const db = require("../config/db");
const createNotification = require("../utils/createNotification");
const { calculateCommission } = require("../services/commissionService");
const { conversionRateCalculation } = require("../services/conversionRate");

exports.getWithdrawals = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const [wallet] = await db.query(
      `
      SELECT
      balance,
      total_earned,
      total_withdrawn
      FROM wallets
      WHERE vendor_id=?
      `,
      [vendorId],
    );

    if (wallet.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

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

    res.status(200).json({
      availableBalance: wallet[0].balance,

      totalEarnings: wallet[0].total_earned,

      totalWithdrawn: wallet[0].total_withdrawn,

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
        message: "You have pending withdrawal(s)",
      });
    }

    const [wallet] = await db.query(
      `
      SELECT balance
      FROM wallets
      WHERE vendor_id=?
      `,
      [vendorId],
    );

    if (wallet.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    if (Number(amount) > Number(wallet[0].balance)) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
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

exports.approveWithdrawal = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;

    const [withdrawals] = await connection.query(
      `
      SELECT *
      FROM withdrawals
      WHERE id = ?
      FOR UPDATE
      `,
      [id],
    );

    if (withdrawals.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Withdrawal not found",
      });
    }

    const withdrawal = withdrawals[0];

    if (withdrawal.status === "paid") {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Withdrawal already approved",
      });
    }

    if (withdrawal.status === "rejected") {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "This withdrawal has already been rejected",
      });
    }

    const [wallets] = await connection.query(
      `
      SELECT *
      FROM wallets
      WHERE vendor_id = ?
      FOR UPDATE
      `,
      [withdrawal.vendor_id],
    );

    if (wallets.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Vendor wallet not found",
      });
    }

    const wallet = wallets[0];

    if (Number(wallet.balance) < Number(withdrawal.amount)) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
      });
    }

    let transactionHistory = [];

    try {
      transactionHistory = wallet.transaction_history
        ? JSON.parse(wallet.transaction_history)
        : [];
    } catch (err) {
      transactionHistory = [];
    }

    const newTransaction = {
      id: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: new Date().toISOString(),
      amount: withdrawal.amount.toString(),
      title: "Withdrawal",
      status: "successful",
      to:
        withdrawal.method === "bank"
          ? `${withdrawal.bank_name} • ${withdrawal.account_number}`
          : withdrawal.method,
      method: withdrawal.method,
      reference: withdrawal.id,
    };

    transactionHistory.unshift(newTransaction);

    await connection.query(
      ` UPDATE wallets SET balance = balance - ?, total_withdrawn = total_withdrawn + ?,
        transaction_history = ? WHERE vendor_id = ?
  `,
      [
        withdrawal.amount,
        withdrawal.amount,
        JSON.stringify(transactionHistory),
        withdrawal.vendor_id,
      ],
    );

    await connection.query(
      `
      UPDATE withdrawals
      SET
        status = 'paid',
        paid_at = NOW()
      WHERE id = ?
      `,
      [id],
    );

    await createNotification({
      userId: withdrawal.vendor_id,
      type: "withdrawal",
      title: "Withdrawal Approved",
      message: `Your withdrawal of ₦${Number(withdrawal.amount).toLocaleString()} has been approved.`,
      referenceId: id,
    });

    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Withdrawal approved successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to approve withdrawal",
    });
  } finally {
    connection.release();
  }
};

exports.rejectWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;

    const [withdrawals] = await db.query(
      "SELECT * FROM withdrawals WHERE id = ?",
      [id],
    );

    if (withdrawals.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal not found",
      });
    }

    if (withdrawals[0].status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Withdrawal has already been processed",
      });
    }

    await db.query(
      `
      UPDATE withdrawals
      SET status = 'rejected'
      WHERE id = ?
      `,
      [id],
    );

    await createNotification({
      userId: withdrawals[0].vendor_id,
      type: "withdrawal",
      title: "Withdrawal Rejected",
      message: `Your withdrawal request of ₦${Number(withdrawals[0].amount).toLocaleString()} was rejected.`,
      referenceId: id,
    });

    res.json({
      success: true,
      message: "Withdrawal rejected",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
