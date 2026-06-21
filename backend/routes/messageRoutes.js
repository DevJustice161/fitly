const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getConversations,
  getMessages,
  markConversationRead,
  deleteMessage,
  updateMessage,
  createConversation,
  deleteConversation,
} = require("../controllers/messageController");

const upload = require("../middleware/uploadMessagesImagesMiddleware");

router.get("/conversations/:userId", getConversations);

router.get("/:conversationId", getMessages);

router.post("/conversation", createConversation);

router.post("/", upload.single("image"), sendMessage);

router.put("/read/:conversationId", markConversationRead);

router.put("/:id", updateMessage);

router.delete("/:id", deleteMessage);

router.delete("/conversations/:id", deleteConversation);

module.exports = router;
