import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import {
  summarizeChat,
  generateSmartReplies,
  translateMessageText,
} from "../services/gemini.service.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getAllContacts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
      deletedBy: { $nin: [myId] },
    })
      .populate("senderId", "fullName profilePic username")
      .populate("readBy.userId", "fullName")
      .populate("reactions.userId", "fullName");

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      messageType: imageUrl ? "image" : "text",
      readBy: [{ userId: senderId }],
    });

    await newMessage.save();
    await newMessage.populate("senderId", "fullName profilePic username");

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
      groupChatId: { $exists: false },
    });

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    const chatPartners = await User.find({
      _id: { $in: chatPartnerIds },
    }).select("-password");

    res.status(200).json(chatPartners);
  } catch (error) {
    console.error("Error in getChatPartners: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark message as read
export const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const alreadyRead = message.readBy.some(
      (read) => read.userId.toString() === userId.toString()
    );

    if (!alreadyRead) {
      message.readBy.push({
        userId,
        readAt: new Date(),
      });
      message.isRead = true;
      message.readAt = new Date();
      await message.save();

      // Emit socket event to sender
      const senderSocketId = getReceiverSocketId(message.senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageRead", {
          messageId,
          readBy: req.user.fullName,
        });
      }
    }

    res.status(200).json({ message: "Message marked as read" });
  } catch (error) {
    console.error("Error in markMessageAsRead:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get unread messages count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      isRead: false,
      deletedBy: { $nin: [userId] },
    });

    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error("Error in getUnreadCount:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get unread counts per chat partner
export const getUnreadByChat = async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadMessages = await Message.find({
      receiverId: userId,
      isRead: false,
      groupChatId: { $exists: false },
    }).select("senderId");

    const counts = {};
    unreadMessages.forEach((msg) => {
      const chatId = msg.senderId.toString();
      counts[chatId] = (counts[chatId] || 0) + 1;
    });

    res.status(200).json({ counts });
  } catch (error) {
    console.error("Error in getUnreadByChat:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Mark all messages in a DM chat as read
export const markChatAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: partnerId } = req.params;

    const unreadMessages = await Message.find({
      senderId: partnerId,
      receiverId: userId,
      isRead: false,
    });

    for (const message of unreadMessages) {
      const alreadyRead = message.readBy.some(
        (read) => read.userId.toString() === userId.toString()
      );
      if (!alreadyRead) {
        message.readBy.push({ userId, readAt: new Date() });
      }
      message.isRead = true;
      message.readAt = new Date();
      await message.save();
    }

    res.status(200).json({ message: "Chat marked as read", count: unreadMessages.length });
  } catch (error) {
    console.error("Error in markChatAsRead:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Toggle reaction on a message
export const toggleReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    if (!emoji) {
      return res.status(400).json({ message: "Emoji is required" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const existingIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId.toString() && r.emoji === emoji
    );

    if (existingIndex >= 0) {
      message.reactions.splice(existingIndex, 1);
    } else {
      message.reactions.push({ emoji, userId });
    }

    await message.save();
    await message.populate("reactions.userId", "fullName");

    res.status(200).json(message);
  } catch (error) {
    console.error("Error in toggleReaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only sender can delete
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Cannot delete other's message" });
    }

    message.deletedBy.push(userId);
    await message.save();

    res.status(200).json({ message: "Message deleted" });
  } catch (error) {
    console.error("Error in deleteMessage:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// --- AI Features ---

const formatMessagesForAI = (messages, myId) =>
  messages.map((m) => ({
    senderName:
      m.senderId?.fullName || (m.senderId?.toString() === myId.toString() ? "You" : "User"),
    text: m.text || "[Image]",
    role: m.senderId?.toString() === myId.toString() ? "current user" : "chat partner",
  }));

export const getChatSummary = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: partnerId },
        { senderId: partnerId, receiverId: myId },
      ],
      deletedBy: { $nin: [myId] },
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("senderId", "fullName");

    messages.reverse();

    if (messages.length === 0) {
      return res.status(200).json({ summary: "No messages to summarize yet." });
    }

    const formatted = formatMessagesForAI(messages, myId);
    const summary = await summarizeChat(formatted);
    res.status(200).json({ summary });
  } catch (error) {
    console.error("Summarization failed:", error.message);
    res.status(500).json({
      message: error.message?.includes("429")
        ? "AI is busy. Please try again in a moment."
        : "Failed to summarize chat",
    });
  }
};

export const getSmartReplies = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: partnerId },
        { senderId: partnerId, receiverId: myId },
      ],
      deletedBy: { $nin: [myId] },
    })
      .sort({ createdAt: -1 })
      .limit(8);

    messages.reverse();

    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.senderId.toString() === myId.toString()) {
      return res.status(200).json({ replies: [] });
    }

    const context = formatMessagesForAI(messages, myId);
    const replies = await generateSmartReplies(context);
    res.status(200).json({ replies });
  } catch (error) {
    console.error("Smart replies failed:", error.message);
    res.status(500).json({
      message: error.message?.includes("429")
        ? "AI is busy. Please try again in a moment."
        : "Failed to generate replies",
      replies: [],
    });
  }
};

export const translateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { targetLanguage, text: bodyText } = req.body;
    const target = targetLanguage || "English";

    let textToTranslate = bodyText;
    if (!textToTranslate) {
      const message = await Message.findById(messageId);
      if (!message?.text) {
        return res.status(400).json({ message: "No text to translate" });
      }
      textToTranslate = message.text;
    }

    const translatedText = await translateMessageText(textToTranslate, target);
    res.status(200).json({ translatedText, targetLanguage: target });
  } catch (error) {
    console.error("Translation failed:", error.message);
    res.status(500).json({
      message: error.message?.includes("429")
        ? "AI is busy. Please try again in a moment."
        : "Failed to translate",
    });
  }
};

export const translateText = async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ message: "Text is required" });
    }

    const target = targetLanguage || "English";
    const translatedText = await translateMessageText(text.trim(), target);
    res.status(200).json({ translatedText, targetLanguage: target });
  } catch (error) {
    console.error("Text translation failed:", error.message);
    res.status(500).json({ message: "Failed to translate text" });
  }
};