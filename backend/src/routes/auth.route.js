import express from "express";
import {
  sendSignupOTP,
  verifySignupOTP,
  resendSignupOTP,
  login,
  logout,
  updateProfile,
  searchUsers,
  getUserProfile,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { loginAttemptLimit } from "../middleware/loginAttemptLimit.js";
import { otpRateLimit, otpVerifyRateLimit } from "../middleware/otpRateLimit.js";
const router = express.Router();

router.post("/signup/send-otp", otpRateLimit, sendSignupOTP);
router.post("/signup/verify-otp", otpVerifyRateLimit, verifySignupOTP);
router.post("/signup/resend-otp", otpRateLimit, resendSignupOTP);
router.post("/login", loginAttemptLimit, login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);
router.get("/search", protectRoute, searchUsers);
router.get("/profile/:userId", protectRoute, getUserProfile);

router.get("/check", protectRoute, (req, res) =>
  res.status(200).json(req.user)
);

export default router;
