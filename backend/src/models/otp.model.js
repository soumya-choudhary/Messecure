import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
    },
    hashedOtp: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
      max: 5,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // Auto-delete expired documents
    },
    userData: {
      // Store user registration data temporarily
      fullName: String,
      username: String,
      email: String,
      password: String, // Hashed password
    },
  },
  { timestamps: true }
);

// Index for faster lookups
otpSchema.index({ email: 1, expiresAt: 1 });

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;

