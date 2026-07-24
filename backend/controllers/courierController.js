const db = require("../config/db");

exports.getCouriers = async (req, res) => {
  try {
    const [couriers] = await db.query(`SELECT * FROM courier ORDER BY id ASC`);

    res.json(couriers);
  } catch (error) {
    console.error("Error fetching couriers:", error);
    res.status(500).json({ message: "Failed to fetch couriers" });
  }
};

exports.getDefaultCourier = async (req, res) => {
  try {
    const [defCourier] = await db.query(
      `SELECT * FROM courier WHERE default_courier = 1`,
    );
    const courier = defCourier[0];
    res.status(200).json(courier);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch default courier" });
  }
};

exports.createCourier = async (req, res) => {
  try {
    const { name, email, company, phone } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Courier name is required" });
    }

    const trimmedName = name.trim();

    const [existingCourier] = await db.query(
      `SELECT id FROM courier WHERE name = ? OR email = ?`,
      [trimmedName, email],
    );

    if (existingCourier.length > 0) {
      return res.status(409).json({ message: "Courier already exists" });
    }

    const [result] = await db.query(
      `INSERT INTO courier (name, email, company, phone) VALUES (?, ?, ?, ?)`,
      [trimmedName, email, company, phone],
    );

    res.status(201).json({
      id: result.insertId,
      name: trimmedName,
      email,
      company,
      phone,
    });
  } catch (error) {
    console.error("Error creating courier:", error);
    res.status(500).json({ message: "Failed to create courier" });
  }
};

exports.updateItemCourier = async (req, res) => {
  try {
    const { id } = req.params;
    const { courier, orderId } = req.body;

    await db.query(
      `
      UPDATE order_items
      SET default_courier = ?
      WHERE id = ?
      `,
      [courier, id],
    );

    res.status(200).json({
      success: true,
      message: "Product Order Courier updated",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
