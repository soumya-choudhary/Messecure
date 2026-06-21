import Story from "../models/story.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Upload story
export const uploadStory = async (req, res) => {
  try {
    const { content, mediaType, caption } = req.body;
    const userId = req.user._id;

    if (!content || !mediaType) {
      return res
        .status(400)
        .json({ message: "Content and mediaType are required" });
    }

    let mediaUrl = content;

    // If content is not already a URL, upload to cloudinary
    if (!content.startsWith("http")) {
      const uploadResponse = await cloudinary.uploader.upload(content, {
        resource_type: mediaType === "video" ? "video" : "image",
      });
      mediaUrl = uploadResponse.secure_url;
    }

    const newStory = new Story({
      userId,
      content: mediaUrl,
      mediaType,
      caption,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await newStory.save();
    const populatedStory = await newStory.populate(
      "userId",
      "fullName profilePic username"
    );

    // Notify friends
    const user = await User.findById(userId);
    user.friends.forEach((friendId) => {
      const friendSocketId = getReceiverSocketId(friendId);
      if (friendSocketId) {
        io.to(friendSocketId).emit("newStory", {
          story: populatedStory,
          userName: req.user.fullName,
        });
      }
    });

    res.status(201).json(populatedStory);
  } catch (error) {
    console.error("Error in uploadStory:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get stories from friends
export const getFriendStories = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    const now = new Date();
    const stories = await Story.find({
      userId: { $in: user.friends },
      expiresAt: { $gt: now },
      isVisible: true,
    })
      .populate("userId", "fullName profilePic username")
      .populate("viewedBy.userId", "fullName")
      .sort({ createdAt: -1 });

    // Group stories by user
    const groupedStories = {};
    stories.forEach((story) => {
      const userId = story.userId._id.toString();
      if (!groupedStories[userId]) {
        groupedStories[userId] = {
          user: story.userId,
          stories: [],
        };
      }
      groupedStories[userId].stories.push(story);
    });

    res.status(200).json(Object.values(groupedStories));
  } catch (error) {
    console.error("Error in getFriendStories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user stories
export const getUserStories = async (req, res) => {
  try {
    const { userId } = req.params;

    const now = new Date();
    const stories = await Story.find({
      userId,
      expiresAt: { $gt: now },
      isVisible: true,
    })
      .populate("userId", "fullName profilePic username")
      .populate("viewedBy.userId", "fullName")
      .sort({ createdAt: -1 });

    res.status(200).json(stories);
  } catch (error) {
    console.error("Error in getUserStories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Mark story as viewed
export const markStoryAsViewed = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user._id;

    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    // Check if already viewed
    const alreadyViewed = story.viewedBy.some(
      (view) => view.userId.toString() === userId.toString()
    );

    if (!alreadyViewed) {
      story.viewedBy.push({
        userId,
        viewedAt: new Date(),
      });
      await story.save();

      // Notify story owner
      const storyOwnerSocketId = getReceiverSocketId(story.userId);
      if (storyOwnerSocketId) {
        io.to(storyOwnerSocketId).emit("storyViewed", {
          storyId,
          viewedBy: req.user.fullName,
          totalViews: story.viewedBy.length,
        });
      }
    }

    res.status(200).json({ message: "Story marked as viewed" });
  } catch (error) {
    console.error("Error in markStoryAsViewed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete story
export const deleteStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user._id;

    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    if (story.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Cannot delete other's story" });
    }

    await Story.findByIdAndDelete(storyId);

    res.status(200).json({ message: "Story deleted" });
  } catch (error) {
    console.error("Error in deleteStory:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get story viewers
export const getStoryViewers = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user._id;

    const story = await Story.findById(storyId).populate(
      "viewedBy.userId",
      "fullName profilePic username"
    );

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    if (story.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Cannot view other's viewers" });
    }

    res.status(200).json(story.viewedBy);
  } catch (error) {
    console.error("Error in getStoryViewers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
