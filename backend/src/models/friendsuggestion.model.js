import mongoose from "mongoose";

const friendSuggestionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    suggestedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      enum: ["mutual_friends", "same_interests", "activity", "random"],
      default: "random",
    },
    dismissed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Ensure unique suggestions per user pair
friendSuggestionSchema.index({ userId: 1, suggestedUserId: 1 }, { unique: true });

const FriendSuggestion = mongoose.model("FriendSuggestion", friendSuggestionSchema);

export default FriendSuggestion;
