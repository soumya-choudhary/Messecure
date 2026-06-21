import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Send friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const senderId = req.user._id;

    if (senderId.toString() === recipientId) {
      return res
        .status(400)
        .json({ message: "Cannot send request to yourself" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already friends
    if (recipient.friends.includes(senderId)) {
      return res.status(400).json({ message: "Already friends" });
    }

    // Check if request already exists
    const existingRequest = recipient.friendRequests.find(
      (req) => req.senderId.toString() === senderId.toString()
    );

    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    // Add friend request
    recipient.friendRequests.push({
      senderId,
      status: "pending",
    });

    await recipient.save();

    // Emit socket event
    const recipientSocketId = getReceiverSocketId(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("friendRequestReceived", {
        from: senderId,
        senderName: req.user.fullName,
        senderPic: req.user.profilePic,
      });
    }

    res.status(200).json({ message: "Friend request sent" });
  } catch (error) {
    console.error("Error in sendFriendRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { senderId } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const sender = await User.findById(senderId);

    if (!sender) {
      return res.status(404).json({ message: "User not found" });
    }

    const requestIndex = user.friendRequests.findIndex(
      (req) => req.senderId.toString() === senderId
    );

    if (requestIndex === -1) {
      return res.status(400).json({ message: "Friend request not found" });
    }

    // Update request status
    user.friendRequests[requestIndex].status = "accepted";

    // Add to friends list
    if (!user.friends.includes(senderId)) {
      user.friends.push(senderId);
    }
    if (!sender.friends.includes(userId)) {
      sender.friends.push(userId);
    }

    await user.save();
    await sender.save();

    // Emit socket event
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("friendRequestAccepted", {
        userId: userId,
        userName: req.user.fullName,
        userPic: req.user.profilePic,
      });
    }

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error in acceptFriendRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reject friend request
export const rejectFriendRequest = async (req, res) => {
  try {
    const { senderId } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    const requestIndex = user.friendRequests.findIndex(
      (req) => req.senderId.toString() === senderId
    );

    if (requestIndex === -1) {
      return res.status(400).json({ message: "Friend request not found" });
    }

    // Update request status
    user.friendRequests[requestIndex].status = "rejected";

    // Remove from array after some time or keep as rejected record
    await user.save();

    res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    console.error("Error in rejectFriendRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get pending friend requests
export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate(
      "friendRequests.senderId",
      "fullName profilePic username bio"
    );

    const pendingRequests = user.friendRequests.filter(
      (req) => req.status === "pending"
    );

    res.status(200).json(pendingRequests);
  } catch (error) {
    console.error("Error in getPendingRequests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user friends
export const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate(
      "friends",
      "fullName profilePic username bio lastSeen"
    );

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error in getFriends:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove friend
export const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!friend) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove from both friend lists
    user.friends = user.friends.filter((id) => id.toString() !== friendId);
    friend.friends = friend.friends.filter((id) => id.toString() !== userId);

    await user.save();
    await friend.save();

    res.status(200).json({ message: "Friend removed" });
  } catch (error) {
    console.error("Error in removeFriend:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Block user
export const blockUser = async (req, res) => {
  try {
    const { userId: blockUserId } = req.body;
    const userId = req.user._id;

    if (userId.toString() === blockUserId) {
      return res.status(400).json({ message: "Cannot block yourself" });
    }

    const user = await User.findById(userId);

    if (user.blockedUsers.includes(blockUserId)) {
      return res.status(400).json({ message: "User already blocked" });
    }

    user.blockedUsers.push(blockUserId);
    await user.save();

    res.status(200).json({ message: "User blocked" });
  } catch (error) {
    console.error("Error in blockUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Unblock user
export const unblockUser = async (req, res) => {
  try {
    const { userId: unblockUserId } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    user.blockedUsers = user.blockedUsers.filter(
      (id) => id.toString() !== unblockUserId
    );

    await user.save();

    res.status(200).json({ message: "User unblocked" });
  } catch (error) {
    console.error("Error in unblockUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Search users
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user._id;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const users = await User.find({
      _id: { $ne: userId },
      $or: [
        { fullName: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    })
      .select("_id fullName username profilePic bio")
      .limit(20);

    // Enrich users with friend status
    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        const userObj = user.toObject();
        
        // Check if already friends
        const isFriend = currentUser.friends.some(
          (friendId) => friendId.toString() === user._id.toString()
        );
        
        if (isFriend) {
          userObj.friendStatus = "accepted";
          return userObj;
        }

        // Check if there's a pending request FROM this user TO current user (they sent us a request)
        const incomingRequest = currentUser.friendRequests.find(
          (req) => req.senderId.toString() === user._id.toString() && req.status === "pending"
        );
        
        if (incomingRequest) {
          userObj.friendStatus = "pending_incoming"; // They sent us a request
          return userObj;
        }

        // Check if we sent them a request (check their friendRequests for a pending request from us)
        const searchedUser = await User.findById(user._id).select("friendRequests");
        const outgoingRequest = searchedUser.friendRequests.find(
          (req) => req.senderId.toString() === userId.toString() && req.status === "pending"
        );
        
        if (outgoingRequest) {
          userObj.friendStatus = "pending_outgoing"; // We sent them a request
          return userObj;
        }

        userObj.friendStatus = "none"; // No relationship
        return userObj;
      })
    );

    res.status(200).json(usersWithStatus);
  } catch (error) {
    console.error("Error in searchUsers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
