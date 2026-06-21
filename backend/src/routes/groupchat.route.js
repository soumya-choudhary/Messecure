import express from "express";
import {
  createGroupChat,
  getUserGroupChats,
  getGroupChatDetails,
  addMemberToGroup,
  removeMemberFromGroup,
  updateGroupDetails,
  deleteGroupChat,
  getGroupMessages,
  sendGroupMessage,
  leaveGroup,
} from "../controllers/groupchat.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.post("/create", createGroupChat);
router.get("/my-groups", getUserGroupChats);
router.get("/:groupId", getGroupChatDetails);
router.post("/:groupId/add-member", addMemberToGroup);
router.post("/:groupId/remove-member", removeMemberFromGroup);
router.put("/:groupId/update", updateGroupDetails);
router.delete("/:groupId", deleteGroupChat);
router.get("/:groupId/messages", getGroupMessages);
router.post("/:groupId/send-message", sendGroupMessage);
router.post("/:groupId/leave", leaveGroup);

export default router;
