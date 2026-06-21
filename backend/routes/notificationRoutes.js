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

router.post("/add", createNotification);

router.get("/:id", getNotifications);

router.put("/mark-all-read/:id", markAllRead);

router.put("/mark-as-read/:notifId", markAsRead);

router.put("/mark-as-unread/:notifId", markAsUnread);

router.delete("/delete-one/:notifId", deleteOne);

router.delete("/clear/:id", clearAll);

module.exports = router;
