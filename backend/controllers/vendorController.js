const db = require("../config/db");
const createNotification = require("../utils/createNotification");

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
      INSERT INTO vendors (user_id, store_name,store_logo, store_description, is_verified, is_premium, v_status,rating)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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

exports.getVendorProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const [vendor] = await db.query(
      `
      SELECT users.name AS owner, users.email, vendors.*, vendor_applications.* 
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

    res.json(vendor[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
