import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "../lib/env.js";

const MODEL_NAME = ENV.GEMINI_MODEL || "gemini-2.5-flash";

const getClient = () => {
  const key = ENV.GEMINI_API_KEY?.trim();
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenerativeAI(key);
};

const buildParts = (text, imageBase64) => {
  const parts = [];
  if (text?.trim()) {
    parts.push({ text: text.trim() });
  }
  if (imageBase64) {
    const match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
    if (match) {
      parts.push({
        inlineData: {
          mimeType: match[1],
          data: match[2],
        },
      });
    }
  }
  if (parts.length === 0) {
    parts.push({ text: "Hello" });
  }
  return parts;
};

export const generateAuraReply = async ({ history, text, imageBase64 }) => {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction:
      "You are Aura AI, a helpful, friendly assistant inside a chat app. " +
      "Respond clearly using markdown when helpful. Be concise but thorough.",
  });

  const chat = model.startChat({
    history: history.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: buildParts(msg.text, msg.imageBase64),
    })),
  });

  const result = await chat.sendMessage(buildParts(text, imageBase64));
  const response = result.response;
  const replyText = response.text();

  if (!replyText) {
    throw new Error("Aura AI returned an empty response");
  }

  return replyText;
};
