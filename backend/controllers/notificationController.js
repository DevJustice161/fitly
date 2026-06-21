const db = require("../config/db");
const { getIO } = require("../socket");

exports.createNotification = async (req, res) => {
  try {
    const { userId, title, message, type, referenceId } = req.body;
    const [result] = await db.query(
      `
        INSERT INTO notifications
        (
            user_id,
            title,
            message,
            type,
            is_read,
            reference_id
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
      [userId, title, message, type, 0, referenceId],
    );

    const notification = {
      id: result.insertId,
      user_id: userId,
      type: type,
      title: title,
      message: message,
      reference_id: referenceId,
      is_read: 0,
      created_at: new Date(),
    };

    getIO().to(`user-${userId}`).emit("new-notification", notification);

    res.status(201).json({
      success: true,
      message: "Added to notifications",
    });
  } catch (error) {
    console.error("Add to notifications error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getNotifications = async (req, res) => {
  const { id } = req.params;
  try {
    const [notifications] = await db.query(
      `SELECT *
        FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC`,
      [id],
    );

    res.json(notifications);
  } catch (error) {
    console.error("Add to notifications error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.markAllRead = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(
      `UPDATE notifications
        SET is_read = 1
        WHERE user_id = ?`,
      [id],
    );

    res.status(201).json({ success: true, message: "notification updated" });
  } catch (error) {
    console.error("update notifications error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.markAsRead = async (req, res) => {
  const { notifId } = req.params;
  try {
    await db.query(
      `UPDATE notifications
        SET is_read = 1
        WHERE id = ?`,
      [notifId],
    );

    res.status(201).json({ success: true, message: "notification updated" });
  } catch (error) {
    console.error("update notifications error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.markAsUnread = async (req, res) => {
  const { notifId } = req.params;
  try {
    await db.query(
      `UPDATE notifications
        SET is_read = 0
        WHERE id = ?`,
      [notifId],
    );

    res.status(201).json({ success: true, message: "notification updated" });
  } catch (error) {
    console.error("update notifications error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteOne = async (req, res) => {
  const { notifId } = req.params;
  try {
    await db.query(`DELETE FROM notifications WHERE id = ?`, [notifId]);

    res.status(201).json({ success: true, message: "notification deleted" });
  } catch (error) {
    console.error("delete notifications error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.clearAll = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(`DELETE FROM notifications WHERE user_id = ?`, [id]);

    res.status(201).json({ success: true, message: "notifications deleted" });
  } catch (error) {
    console.error("delete notifications error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
