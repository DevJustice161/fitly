const db = require("../config/db");
const socket = require("../socket");

const createNotification = async ({
  userId,
  type,
  title,
  message,
  referenceId = null,
}) => {
  const [result] = await db.query(
    `
    INSERT INTO notifications
    (user_id, reference_id, type, title, message)
    VALUES (?, ?, ?, ?, ?)
    `,
    [userId, referenceId, type, title, message],
  );

  const notification = {
    id: result.insertId,
    user_id: userId,
    reference_id: referenceId,
    type,
    title,
    message,
    is_read: 0,
    created_at: new Date(),
  };

  socket.getIO().to(`user-${userId}`).emit("new-notification", notification);

  return notification;
};

module.exports = createNotification;
