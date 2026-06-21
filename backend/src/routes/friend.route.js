import express from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getPendingRequests,
  getFriends,
  removeFriend,
  blockUser,
  unblockUser,
  searchUsers,
} from "../controllers/friend.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/search", searchUsers);
router.post("/request/send", sendFriendRequest);
router.post("/request/accept", acceptFriendRequest);
router.post("/request/reject", rejectFriendRequest);
router.get("/requests/pending", getPendingRequests);
router.get("/list", getFriends);
router.post("/remove", removeFriend);
router.post("/block", blockUser);
router.post("/unblock", unblockUser);

export default router;
