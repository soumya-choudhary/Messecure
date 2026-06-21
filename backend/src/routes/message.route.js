import express from "express";
import {
  getAllContacts,
  getChatPartners,
  getMessagesByUserId,
  sendMessage,
  markMessageAsRead,
  getUnreadCount,
  deleteMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { userRateLimit } from "../middleware/userRatelimit.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";
const router = express.Router();
router.use(arcjetProtection, protectRoute);

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/unread/count", getUnreadCount);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", userRateLimit(20, 10_000), sendMessage);
router.post("/:messageId/read", markMessageAsRead);
router.delete("/:messageId", deleteMessage);

export default router;
