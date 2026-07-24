const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getConversations,
  getMessages,
  getAllMessages,
  markConversationRead,
  deleteMessage,
  updateMessage,
  createConversation,
  deleteConversation,
} = require("../controllers/messageController");
const { verifyToken } = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMessagesImagesMiddleware");

router.get("/conversations/:userId", getConversations);

router.get("/:conversationId", getMessages);

router.get("/all/:userId", getAllMessages);

router.post("/conversation", verifyToken, createConversation);

router.post("/", upload.single("image"), verifyToken, sendMessage);

router.put("/read/:conversationId", verifyToken, markConversationRead);

router.put("/:id", verifyToken, updateMessage);

router.delete("/:id", verifyToken, deleteMessage);

router.delete("/conversations/:id", verifyToken, deleteConversation);

module.exports = router;
