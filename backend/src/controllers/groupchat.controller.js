import GroupChat from "../models/groupchat.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Create group chat
export const createGroupChat = async (req, res) => {
  try {
    const { name, description, memberIds, groupPic } = req.body;
    const userId = req.user._id;

    if (!name || !memberIds || memberIds.length === 0) {
      return res.status(400).json({ message: "Name and members are required" });
    }

    let groupPicUrl = "";
    if (groupPic) {
      const uploadResponse = await cloudinary.uploader.upload(groupPic);
      groupPicUrl = uploadResponse.secure_url;
    }

    const members = [
      {
        userId,
        role: "admin",
        joinedAt: new Date(),
      },
      ...memberIds.map((id) => ({
        userId: id,
        role: "member",
        joinedAt: new Date(),
      })),
    ];

    const newGroupChat = new GroupChat({
      name,
      description,
      groupPic: groupPicUrl,
      members,
      admin: userId,
    });

    await newGroupChat.save();
    const populatedGroup = await newGroupChat.populate(
      "members.userId",
      "fullName profilePic username"
    );

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error("Error in createGroupChat:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user group chats
export const getUserGroupChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const groupChats = await GroupChat.find({
      "members.userId": userId,
    })
      .populate("members.userId", "fullName profilePic username")
      .populate("admin", "fullName profilePic username")
      .populate("lastMessage", "text image sender createdAt")
      .sort({ updatedAt: -1 });

    res.status(200).json(groupChats);
  } catch (error) {
    console.error("Error in getUserGroupChats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get group chat details
export const getGroupChatDetails = async (req, res) => {
  try {
    const { groupId } = req.params;

    const groupChat = await GroupChat.findById(groupId)
      .populate("members.userId", "fullName profilePic username bio lastSeen")
      .populate("admin", "fullName profilePic username");

    if (!groupChat) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json(groupChat);
  } catch (error) {
    console.error("Error in getGroupChatDetails:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add member to group
export const addMemberToGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberId } = req.body;
    const userId = req.user._id;

    const groupChat = await GroupChat.findById(groupId);

    if (!groupChat) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is admin
    if (groupChat.admin.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only admin can add members" });
    }

    // Check if already a member
    if (groupChat.members.some((m) => m.userId.toString() === memberId)) {
      return res.status(400).json({ message: "User already in group" });
    }

    groupChat.members.push({
      userId: memberId,
      role: "member",
    });

    await groupChat.save();

    const populatedGroup = await groupChat.populate(
      "members.userId",
      "fullName profilePic username"
    );

    // Emit socket event
    io.emit("memberAddedToGroup", {
      groupId,
      groupName: groupChat.name,
    });

    res.status(200).json(populatedGroup);
  } catch (error) {
    console.error("Error in addMemberToGroup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove member from group
export const removeMemberFromGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberId } = req.body;
    const userId = req.user._id;

    const groupChat = await GroupChat.findById(groupId);

    if (!groupChat) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is admin
    if (groupChat.admin.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only admin can remove members" });
    }

    groupChat.members = groupChat.members.filter(
      (m) => m.userId.toString() !== memberId
    );

    await groupChat.save();

    res.status(200).json({ message: "Member removed from group" });
  } catch (error) {
    console.error("Error in removeMemberFromGroup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update group details
export const updateGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, groupPic } = req.body;
    const userId = req.user._id;

    const groupChat = await GroupChat.findById(groupId);

    if (!groupChat) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is admin
    if (groupChat.admin.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only admin can update group" });
    }

    if (name) groupChat.name = name;
    if (description) groupChat.description = description;

    if (groupPic) {
      const uploadResponse = await cloudinary.uploader.upload(groupPic);
      groupChat.groupPic = uploadResponse.secure_url;
    }

    await groupChat.save();

    res.status(200).json(groupChat);
  } catch (error) {
    console.error("Error in updateGroupDetails:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete group chat
export const deleteGroupChat = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const groupChat = await GroupChat.findById(groupId);

    if (!groupChat) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is admin
    if (groupChat.admin.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only admin can delete group" });
    }

    await GroupChat.findByIdAndDelete(groupId);

    res.status(200).json({ message: "Group deleted" });
  } catch (error) {
    console.error("Error in deleteGroupChat:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get group messages
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;

    const messages = await Message.find({
      groupChatId: groupId,
    })
      .populate("senderId", "fullName profilePic username")
      .populate("readBy.userId", "fullName")
      .populate("reactions.userId", "fullName")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getGroupMessages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Send group message
export const sendGroupMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { groupId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      groupChatId: groupId,
      text,
      image: imageUrl,
      messageType: imageUrl ? "image" : "text",
      readBy: [{ userId: senderId }],
    });

    await newMessage.save();
    await newMessage.populate("senderId", "fullName profilePic username");

    // Update last message in group
    await GroupChat.findByIdAndUpdate(groupId, {
      lastMessage: newMessage._id,
    });

    // Emit socket event to all group members
    io.emit("newGroupMessage", {
      groupId,
      message: newMessage,
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendGroupMessage:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Leave group
export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const groupChat = await GroupChat.findById(groupId);

    if (!groupChat) {
      return res.status(404).json({ message: "Group not found" });
    }

    groupChat.members = groupChat.members.filter(
      (m) => m.userId.toString() !== userId.toString()
    );

    await groupChat.save();

    res.status(200).json({ message: "Left group successfully" });
  } catch (error) {
    console.error("Error in leaveGroup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
