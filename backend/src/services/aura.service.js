import AuraConversation from "../models/auraConversation.model.js";
import AuraMessage from "../models/auraMessage.model.js";
import AuraUsage, {
  DAILY_PROMPT_LIMIT,
  getTodayDateKey,
} from "../models/auraUsage.model.js";
import cloudinary from "../lib/cloudinary.js";
import { generateAuraReply } from "./gemini.service.js";

export const getUsageStats = async (userId) => {
  const date = getTodayDateKey();
  const usage = await AuraUsage.findOne({ userId, date });
  const used = usage?.promptCount || 0;
  return {
    limit: DAILY_PROMPT_LIMIT,
    used,
    remaining: Math.max(DAILY_PROMPT_LIMIT - used, 0),
    date,
  };
};

const getOrCreateConversation = async (userId) => {
  let conversation = await AuraConversation.findOne({ userId }).sort({ createdAt: -1 });
  if (!conversation) {
    conversation = await AuraConversation.create({ userId });
  }
  return conversation;
};

export const getAuraChat = async (userId) => {
  let conversation = await AuraConversation.findOne({ userId }).sort({ createdAt: -1 });
  if (!conversation) {
    conversation = await AuraConversation.create({ userId });
  }
  const messages = await AuraMessage.find({ conversationId: conversation._id })
    .sort({ createdAt: 1 })
    .limit(100);
  const usage = await getUsageStats(userId);

  return { conversation, messages, usage };
};

const uploadImageIfNeeded = async (image) => {
  if (!image) return null;
  if (image.startsWith("http")) return image;
  const uploadResponse = await cloudinary.uploader.upload(image);
  return uploadResponse.secure_url;
};

const buildGeminiHistory = async (conversationId, excludeLatest = true) => {
  const messages = await AuraMessage.find({ conversationId })
    .sort({ createdAt: 1 })
    .limit(20);

  const slice = excludeLatest ? messages.slice(0, -1) : messages;

  return slice.map((msg) => {
    let messageText = msg.text || "";
    if (msg.imageUrl) {
      messageText = messageText
        ? `${messageText}\n[User shared an image]`
        : "[User shared an image]";
    }
    return {
      role: msg.role,
      text: messageText || (msg.role === "assistant" ? "..." : "Hello"),
      imageBase64: null,
    };
  });
};

export const sendAuraMessage = async (userId, { text, image }) => {
  const usage = await getUsageStats(userId);
  if (usage.remaining <= 0) {
    const error = new Error("Daily Aura AI limit reached. Try again tomorrow.");
    error.statusCode = 429;
    throw error;
  }

  if (!text?.trim() && !image) {
    const error = new Error("Message text or image is required");
    error.statusCode = 400;
    throw error;
  }

  const conversation = await getOrCreateConversation(userId);
  const imageUrl = await uploadImageIfNeeded(image);

  const userMessage = await AuraMessage.create({
    conversationId: conversation._id,
    userId,
    role: "user",
    text: text?.trim() || "",
    imageUrl: imageUrl || undefined,
  });

  const date = getTodayDateKey();
  await AuraUsage.findOneAndUpdate(
    { userId, date },
    { $inc: { promptCount: 1 } },
    { upsert: true, new: true }
  );

  conversation.updatedAt = new Date();
  await conversation.save();

  let assistantMessage;
  let geminiError = null;
  try {
    const history = await buildGeminiHistory(conversation._id, true);
    const replyText = await generateAuraReply({
      history,
      text: userMessage.text,
      imageBase64: image && !image.startsWith("http") ? image : null,
    });

    assistantMessage = await AuraMessage.create({
      conversationId: conversation._id,
      userId,
      role: "assistant",
      text: replyText,
    });
  } catch (error) {
    console.error("Aura AI Gemini error:", error.message || error);
    geminiError = error.message;
    assistantMessage = await AuraMessage.create({
      conversationId: conversation._id,
      userId,
      role: "assistant",
      text:
        "I'm having trouble responding right now. Please try again in a moment.",
    });
  }

  const updatedUsage = await getUsageStats(userId);

  return {
    userMessage,
    assistantMessage,
    usage: updatedUsage,
    geminiError,
  };
};

export const createNewAuraConversation = async (userId) => {
  const conversation = await AuraConversation.create({
    userId,
    title: "Aura AI Chat",
  });
  const usage = await getUsageStats(userId);
  return { conversation, messages: [], usage };
};
