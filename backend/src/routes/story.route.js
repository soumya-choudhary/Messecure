import express from "express";
import {
  uploadStory,
  getFriendStories,
  getUserStories,
  markStoryAsViewed,
  deleteStory,
  getStoryViewers,
} from "../controllers/story.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.post("/upload", uploadStory);
router.get("/friends", getFriendStories);
router.get("/user/:userId", getUserStories);
router.post("/:storyId/view", markStoryAsViewed);
router.delete("/:storyId", deleteStory);
router.get("/:storyId/viewers", getStoryViewers);

export default router;
