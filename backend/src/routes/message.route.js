import express from "express";
import {
  getAllContacts,
  getChatPartners,
  getMessagesByUserId,
  sendMessage,
  markMessageAsRead,
  getUnreadCount,
  getUnreadByChat,
  markChatAsRead,
  toggleReaction,
  deleteMessage,
  getChatSummary,
  getSmartReplies,
  translateMessage,
  translateText,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { userRateLimit } from "../middleware/userRatelimit.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();
router.use(arcjetProtection, protectRoute);

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/unread/count", getUnreadCount);
router.get("/unread/by-chat", getUnreadByChat);

// AI routes — must be registered before /:id catch-all
router.get("/:partnerId/summarize", userRateLimit(10, 60_000), getChatSummary);
router.get("/:partnerId/smart-replies", userRateLimit(20, 60_000), getSmartReplies);
router.post("/translate-text", userRateLimit(30, 60_000), translateText);

router.post("/read-chat/:id", markChatAsRead);
router.post("/send/:id", userRateLimit(20, 10_000), sendMessage);
router.post("/:messageId/react", toggleReaction);
router.post("/:messageId/read", markMessageAsRead);
router.post("/:messageId/translate", userRateLimit(30, 60_000), translateMessage);
router.delete("/:messageId", deleteMessage);

router.get("/:id", getMessagesByUserId);

export default router;
