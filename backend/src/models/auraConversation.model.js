import mongoose from "mongoose";

const auraConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "Aura AI Chat",
    },
  },
  { timestamps: true }
);

auraConversationSchema.index({ userId: 1, updatedAt: -1 });

const AuraConversation = mongoose.model("AuraConversation", auraConversationSchema);

export default AuraConversation;
