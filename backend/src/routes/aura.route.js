import express from "express";
import {
  getChat,
  getUsage,
  postMessage,
  newConversation,
} from "../controllers/aura.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getChat);
router.get("/usage", getUsage);
router.post("/message", postMessage);
router.post("/conversation/new", newConversation);

export default router;
