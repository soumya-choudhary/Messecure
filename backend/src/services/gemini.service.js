import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "../lib/env.js";

// Prefer models with separate/free quotas; env override is tried last
const FALLBACK_MODELS = [
  ...new Set(
    [
      "gemini-2.5-flash-lite",
      "gemini-2.5-flash",
      "gemini-flash-latest",
      ENV.GEMINI_MODEL,
    ].filter(Boolean)
  ),
];

const getClient = () => {
  const key = ENV.GEMINI_API_KEY?.trim();
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenerativeAI(key);
};

const isQuotaOrUnavailable = (error) => {
  const msg = error?.message || "";
  return (
    msg.includes("429") ||
    msg.includes("quota") ||
    msg.includes("404") ||
    msg.includes("503") ||
    msg.includes("overloaded")
  );
};

const generateWithModel = async (modelName, prompt, systemInstruction) => {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: modelName, systemInstruction });
  const result = await model.generateContent(prompt);
  const text = result.response.text()?.trim();
  if (!text) throw new Error("Empty response from Gemini");
  return text;
};

const callGemini = async (prompt, systemInstruction) => {
  let lastError;

  for (const modelName of FALLBACK_MODELS) {
    try {
      return await generateWithModel(modelName, prompt, systemInstruction);
    } catch (error) {
      lastError = error;
      console.error(`Gemini [${modelName}] failed:`, (error?.message || "").slice(0, 150));
      if (!isQuotaOrUnavailable(error)) throw error;
    }
  }

  throw lastError || new Error("All Gemini models unavailable. Check API key and quota.");
};

const buildParts = (text, imageBase64) => {
  const parts = [];
  if (text?.trim()) parts.push({ text: text.trim() });
  if (imageBase64) {
    const match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
    if (match) {
      parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
    }
  }
  if (parts.length === 0) parts.push({ text: "Hello" });
  return parts;
};

export const generateAuraReply = async ({ history, text, imageBase64 }) => {
  let lastError;

  for (const modelName of FALLBACK_MODELS) {
    try {
      const genAI = getClient();
      const model = genAI.getGenerativeModel({
        model: modelName,
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
      const replyText = result.response.text()?.trim();
      if (!replyText) throw new Error("Aura AI returned an empty response");
      return replyText;
    } catch (error) {
      lastError = error;
      if (!isQuotaOrUnavailable(error)) throw error;
    }
  }

  throw lastError || new Error("Aura AI is temporarily unavailable");
};

const parseJsonArray = (text) => {
  const attempts = [
    text.replace(/```json\n?|```/g, "").trim(),
    text.match(/\[[\s\S]*\]/)?.[0],
  ].filter(Boolean);

  for (const candidate of attempts) {
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item) => typeof item === "string" && item.trim())
          .map((s) => s.trim())
          .slice(0, 3);
      }
    } catch {
      // try next
    }
  }
  return null;
};

export const summarizeChat = async (messages) => {
  if (!messages?.length) return "No messages to summarize yet.";

  const chatHistory = messages
    .filter((m) => m.text && m.text !== "[Image]")
    .map((m) => `${m.senderName}: ${m.text}`)
    .join("\n");

  if (!chatHistory.trim()) {
    return "This chat only contains images with no text to summarize.";
  }

  return callGemini(
    `Summarize this chat conversation:\n\n${chatHistory}`,
    "Summarize the provided chat history in 3-4 concise sentences. Capture main topics, decisions, and any action items. Use plain text only."
  );
};

export const generateSmartReplies = async (recentMessages) => {
  const context = recentMessages
    .filter((m) => m.text && m.text !== "[Image]")
    .map((m) => `${m.role}: ${m.text}`)
    .join("\n");

  if (!context.trim()) {
    return ["Sounds good!", "Got it 👍", "Let me check"];
  }

  try {
    const raw = await callGemini(
      `Generate exactly 3 short quick-reply options for the "current user" based on this chat:\n\n${context}\n\nReturn ONLY a JSON array of 3 strings, e.g. ["Reply 1","Reply 2","Reply 3"]`,
      "You generate contextual quick replies for a chat app. Return ONLY a valid JSON array of exactly 3 short strings. No markdown, no explanation."
    );
    const parsed = parseJsonArray(raw);
    if (parsed?.length) return parsed;
  } catch (error) {
    console.error("Smart replies Gemini error:", error.message);
  }

  return ["Sounds good!", "Got it 👍", "Tell me more"];
};

export const translateMessageText = async (text, targetLanguage = "English") => {
  if (!text?.trim()) throw new Error("No text to translate");

  return callGemini(
    `Translate to ${targetLanguage}:\n\n${text}`,
    `Translate the text to ${targetLanguage}. Keep the original tone. Return ONLY the translated text with no quotes or explanation.`
  );
};
