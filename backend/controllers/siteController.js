const db = require("../config/db");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

exports.getSettings = async (req, res) => {
  try {
    const [settings] = await db.query("SELECT * FROM settings LIMIT 1");

    res.status(200).json(settings[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Unable to load settings",
    });
  }
};

exports.updateSiteSettings = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      description,
      currency,
      currencySymbol,
      minWithdrawal,
    } = req.body;

    await db.query(
      `UPDATE settings
       SET
       site_name=?,
       support_email=?,
       support_phone=?,
       business_address=?,
       description=?,
       currency=?,
       currency_symbol=?,
       minimum_withdrawal=?`,
      [
        name,
        email,
        phone,
        address,
        description,
        currency,
        currencySymbol,
        minWithdrawal,
      ],
    );

    res.json({
      success: true,
      message: "Site settings updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Unable to update settings",
    });
  }
};

exports.updateSiteLogo = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT site_logo FROM settings LIMIT 1");

    if (rows[0].site_logo) {
      const imagePath = path.join(
        __dirname,
        "../uploads/site",
        rows[0].site_logo,
      );

      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await db.query("UPDATE settings SET site_logo=?", [req.file.filename]);

    res.json({
      success: true,
      filename: req.file.filename,
      message: "Logo updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Unable to update logo",
    });
  }
};

exports.updateTaxSettings = async (req, res) => {
  try {
    const { vatEnabled, vatRate, vatInclusive } = req.body;

    await db.query(
      `UPDATE settings
      SET
      vat_enabled=?,
      vat_rate=?,
      vat_inclusive=?`,
      [vatEnabled, vatRate, vatInclusive],
    );

    res.json({
      success: true,
      message: "VAT settings updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Unable to update VAT",
    });
  }
};
exports.updateShippingSettings = async (req, res) => {
  try {
    const {
      baseFee,
      interstateFee,
      freeThreshold,
      estimatedDays,
      freeShippingEnabled,
    } = req.body;

    await db.query(
      `UPDATE settings
      SET
      base_delivery_fee=?,
      interstate_fee=?,
      free_shipping_threshold=?,
      estimated_delivery_days=?,
      free_shipping_enabled=?`,
      [
        baseFee,
        interstateFee,
        freeThreshold,
        estimatedDays,
        freeShippingEnabled,
      ],
    );

    res.json({
      success: true,
      message: "Shipping settings updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Unable to update shipping",
    });
  }
};
exports.updateMaintenanceSettings = async (req, res) => {
  try {
    const { enabled, message } = req.body;

    await db.query(
      `UPDATE settings
      SET
      maintenance_mode=?,
      maintenance_message=?`,
      [enabled, message],
    );

    res.json({
      success: true,
      message: "Maintenance settings updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Unable to update maintenance settings",
    });
  }
};
exports.updateNotificationSettings = async (req, res) => {
  try {
    const {
      newApplications,
      withdrawalRequests,
      weeklyReport,
      securityAlerts,
      marketingEmails,
    } = req.body;

    await db.query(
      `UPDATE settings
      SET
      notify_vendor_applications=?,
      notify_withdrawals=?,
      notify_weekly_report=?,
      notify_security_alerts=?,
      notify_marketing_emails=?`,
      [
        newApplications,
        withdrawalRequests,
        weeklyReport,
        securityAlerts,
        marketingEmails,
      ],
    );

    res.json({
      success: true,
      message: "Notification settings updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Unable to update notifications",
    });
  }
};
exports.updateSecuritySettings = async (req, res) => {
  try {
    const { twoFactor, requireEmailVerification, autoApproveVendors } =
      req.body;

    await db.query(
      `UPDATE settings
      SET
      two_factor=?,
      email_verification=?,
      auto_approve_vendors=?`,
      [twoFactor, requireEmailVerification, autoApproveVendors],
    );

    res.json({
      success: true,
      message: "Security settings updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Unable to update security settings",
    });
  }
};

exports.changeAdminPassword = async (req, res) => {
  try {
    const adminId = req.user.id;

    const { currentPassword, newPassword } = req.body;

    const [admins] = await db.query(
      "SELECT password FROM users WHERE id=? AND role='admin'",
      [adminId],
    );

    if (!admins.length) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    const valid = await bcrypt.compare(currentPassword, admins[0].password);

    if (!valid) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await db.query("UPDATE users SET password=? WHERE id=?", [hashed, adminId]);

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Unable to change password",
    });
  }
};
