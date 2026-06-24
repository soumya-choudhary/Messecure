import {
  getAuraChat,
  sendAuraMessage,
  createNewAuraConversation,
  getUsageStats,
} from "../services/aura.service.js";

export const getChat = async (req, res) => {
  try {
    const data = await getAuraChat(req.user._id);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in getAuraChat:", error);
    res.status(500).json({ message: "Failed to load Aura AI chat" });
  }
};

export const getUsage = async (req, res) => {
  try {
    const usage = await getUsageStats(req.user._id);
    res.status(200).json(usage);
  } catch (error) {
    console.error("Error in getAuraUsage:", error);
    res.status(500).json({ message: "Failed to load usage" });
  }
};

export const postMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const result = await sendAuraMessage(req.user._id, { text, image });

    if (result.geminiError) {
      return res.status(200).json({
        ...result,
        warning: "Aura AI encountered an issue generating a full response.",
      });
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in postAuraMessage:", error);
    const status = error.statusCode || 500;
    res.status(status).json({
      message: error.message || "Failed to send message to Aura AI",
    });
  }
};

export const newConversation = async (req, res) => {
  try {
    const data = await createNewAuraConversation(req.user._id);
    res.status(201).json(data);
  } catch (error) {
    console.error("Error in newAuraConversation:", error);
    res.status(500).json({ message: "Failed to create new conversation" });
  }
};
