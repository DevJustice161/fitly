const db = require("../config/db");
const socket = require("../socket");

exports.createConversation = async (req, res) => {
  const { buyerId, vendorId, productId, orderId } = req.body;
  try {
    const [existing] = await db.query(
      `SELECT * FROM conversations WHERE buyer_id = ? AND vendor_id = ?`,
      [buyerId, vendorId],
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Conversation already exists",
      });
    }

    const [result] = await db.query(
      `INSERT INTO conversations (buyer_id, vendor_id, product_id, order_id)
       VALUES (?, ?, ?, ?)`,
      [buyerId, vendorId, productId, orderId],
    );

    const [rows] = await db.query(
      `
        SELECT
            c.*,
            u.id AS otherUserId,
            v.store_name AS otherUserName,
            u.avatar AS otherUserAvatar
        FROM conversations c
        JOIN vendors v
        ON v.user_id = ?
        JOIN users u
        ON u.id = ?
        WHERE c.id = ?
    `,
      [vendorId, vendorId, result.insertId],
    );

    const conversation = {
      ...rows[0],
      otherUser: {
        id: rows[0].otherUserId,
        name: rows[0].otherUserName,
        avatar: rows[0].otherUserAvatar,
      },
      unread_count: 0,
      last_message: null,
    };

    socket.getIO().to(`user-${buyerId}`).emit("new-conversation", conversation);
    socket
      .getIO()
      .to(`user-${vendorId}`)
      .emit("new-conversation", conversation);

    res.json(conversation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Conversation creation failed" });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const { userId } = req.params;

    const [conversations] = await db.query(
      `
        SELECT
        c.id,
        c.buyer_id,
        c.vendor_id,
        c.last_message_at,

        m.message AS last_message,

        CASE
        WHEN c.buyer_id = ?
        THEN v.id
        ELSE b.id
        END AS otherUserId,

        CASE
        WHEN c.buyer_id = ?
        THEN vd.store_name
        ELSE b.name
        END AS otherUserName,

        CASE
        WHEN c.buyer_id = ?
        THEN v.avatar
        ELSE b.avatar
        END AS otherUserAvatar

        FROM conversations c

        LEFT JOIN users b
        ON b.id = c.buyer_id

        LEFT JOIN users v
        ON v.id = c.vendor_id

        LEFT JOIN vendors vd
        ON vd.user_id = c.vendor_id

        LEFT JOIN messages m
        ON m.id = (
            SELECT id
            FROM messages
            WHERE conversation_id = c.id
            ORDER BY created_at DESC
            LIMIT 1
        )

        WHERE c.buyer_id = ?
        OR c.vendor_id = ?

        ORDER BY c.last_message_at DESC;
      `,
      [userId, userId, userId, userId, userId],
    );

    for (const convo of conversations) {
      const [unread] = await db.query(
        `
        SELECT COUNT(*) AS unread
        FROM messages
        WHERE conversation_id=?
        AND sender_id!=?
        AND is_read=0
        `,
        [convo.id, userId],
      );

      convo.unread_count = unread[0].unread;

      convo.otherUser = {
        id: convo.otherUserId,
        name: convo.otherUserName,
        avatar: convo.otherUserAvatar,
      };

      delete convo.otherUserId;
      delete convo.otherUserName;
      delete convo.otherUserAvatar;
    }

    res.json(conversations);
  } catch (err) {
    console.error("Error getting conversations", err);
    res.status(500).json({
      message: "Failed to fetch conversations",
    });
  }
};
exports.deleteConversation = async (req, res) => {
  const { id } = req.params;

  await db.query("DELETE FROM messages WHERE conversation_id=?", [id]);

  await db.query("DELETE FROM conversations WHERE id=?", [id]);

  res.json({
    success: true,
    message: "Conversation deleted",
  });
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const [messages] = await db.query(
      `
      SELECT *
      FROM messages
      WHERE conversation_id=?
      ORDER BY created_at ASC
      `,
      [conversationId],
    );

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch messages",
    });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, receiverId, senderId, message } = req.body;

    const image = req.file ? req.file.filename : null;

    const [result] = await db.query(
      `INSERT INTO messages (conversation_id, sender_id, receiver_id, message, image)
       VALUES (?, ?, ?, ?, ?)`,
      [conversationId, senderId, receiverId, message, image],
    );

    await db.query(
      `
      UPDATE conversations
      SET last_message_at=NOW()
      WHERE id=?
      `,
      [conversationId],
    );

    const newMessage = {
      id: result.insertId,
      conversation_id: conversationId,
      sender_id: senderId,
      receiver_id: receiverId,
      message,
      image,
      is_read: 0,
      created_at: new Date(),
    };

    socket.getIO().to(`user-${receiverId}`).emit("new-message", newMessage);
    socket.getIO().to(`user-${senderId}`).emit("new-message", newMessage);

    res.json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Message send failed" });
  }
};

exports.markConversationRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    await db.query(
      `
      UPDATE messages
      SET is_read=1
      WHERE conversation_id=?
      AND sender_id!=?
      `,
      [conversationId, userId],
    );

    res.json({
      message: "Conversation marked read",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to update messages",
    });
  }
};

exports.updateMessage = async (req, res) => {
  const { message } = req.body;

  await db.query("UPDATE messages SET message=? WHERE id=?", [
    message,
    req.params.id,
  ]);

  res.json({ success: true });
};

exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      `
      DELETE FROM messages
      WHERE id=?
      `,
      [id],
    );

    res.json({
      message: "Message deleted",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to delete message",
    });
  }
};
