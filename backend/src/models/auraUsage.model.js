import mongoose from "mongoose";

const DAILY_PROMPT_LIMIT = 5;

const auraUsageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    promptCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

auraUsageSchema.index({ userId: 1, date: 1 }, { unique: true });

export const getTodayDateKey = () => new Date().toISOString().slice(0, 10);

export { DAILY_PROMPT_LIMIT };

const AuraUsage = mongoose.model("AuraUsage", auraUsageSchema);

export default AuraUsage;
