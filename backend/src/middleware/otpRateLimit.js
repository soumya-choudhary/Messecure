import rateLimit from "express-rate-limit";

// Rate limit for OTP requests - max 3 requests per 15 minutes per IP
export const otpRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 OTP requests per windowMs
  message: "Too many OTP requests. Please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit for OTP verification attempts - max 5 attempts per 15 minutes per IP
export const otpVerifyRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 verification attempts per windowMs
  message: "Too many verification attempts. Please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

