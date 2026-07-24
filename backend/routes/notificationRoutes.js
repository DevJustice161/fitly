const express = require("express");
const router = express.Router();
const {
  createNotification,
  getNotifications,
  markAllRead,
  markAsRead,
  markAsUnread,
  deleteOne,
  clearAll,
} = require("../controllers/notificationController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/add", verifyToken, createNotification);

router.get("/:id", getNotifications);

router.put("/mark-all-read/:id", verifyToken, markAllRead);

router.put("/mark-as-read/:notifId", verifyToken, markAsRead);

router.put("/mark-as-unread/:notifId", verifyToken, markAsUnread);

router.delete("/delete-one/:notifId", verifyToken, deleteOne);

router.delete("/clear/:id", verifyToken, clearAll);

module.exports = router;
