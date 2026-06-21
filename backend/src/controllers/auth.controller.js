import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import OTP from "../models/otp.model.js";
import bcrypt from "bcryptjs";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";
import { sendWelcomeEmail, sendOTPEmail } from "../emails/emailHandlers.js";
import { generateOTP, hashOTP, verifyOTP, getOTPExpiration, isOTPExpired } from "../lib/otp.js";

// Send OTP for registration
export const sendSignupOTP = async (req, res) => {
  const { fullName, username, email, password } = req.body;

  try {
    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be atleast 6 characters!" });
    }

    if (username.length < 3) {
      return res
        .status(400)
        .json({ message: "Username must be at least 3 characters!" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if email or username already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail)
      return res.status(400).json({ message: "Email already exists" });

    const existingUsername = await User.findOne({ username });
    if (existingUsername)
      return res.status(400).json({ message: "Username already taken" });

    // Hash password before storing in OTP record
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);
    const expiresAt = getOTPExpiration();

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email });

    // Store OTP with user data
    const otpRecord = new OTP({
      email,
      hashedOtp,
      expiresAt,
      userData: {
        fullName,
        username,
        email,
        password: hashedPassword,
      },
      attempts: 0,
    });

    await otpRecord.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, fullName);
    } catch (error) {
      console.error("Failed to send OTP email:", error);
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(500).json({ message: "Failed to send OTP email. Please try again." });
    }

    res.status(200).json({
      message: "OTP sent to your email. Please check your inbox.",
      email: email, // Return email for frontend to use in verification
    });
  } catch (error) {
    console.log("Error in sendSignupOTP controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Verify OTP and create user
export const verifySignupOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required!" });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP. Please request a new one." });
    }

    // Check if OTP is expired
    if (isOTPExpired(otpRecord.expiresAt)) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Check attempts limit
    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "Too many failed attempts. Please request a new OTP." });
    }

    // Verify OTP
    const isValid = await verifyOTP(otp, otpRecord.hashedOtp);
    if (!isValid) {
      // Increment attempts
      otpRecord.attempts += 1;
      await otpRecord.save();
      
      const remainingAttempts = 5 - otpRecord.attempts;
      return res.status(400).json({
        message: `Invalid OTP. ${remainingAttempts > 0 ? `${remainingAttempts} attempts remaining.` : "No attempts remaining. Please request a new OTP."}`,
      });
    }

    // OTP is valid - create user
    const { userData } = otpRecord;
    
    // Double-check email and username are still available
    const existingEmail = await User.findOne({ email: userData.email });
    if (existingEmail) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "Email already exists" });
    }

    const existingUsername = await User.findOne({ username: userData.username });
    if (existingUsername) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "Username already taken" });
    }

    // Create user
    const newUser = new User({
      fullName: userData.fullName,
      username: userData.username,
      email: userData.email,
      password: userData.password,
    });

    const savedUser = await newUser.save();

    // Delete OTP record after successful verification
    await OTP.deleteOne({ _id: otpRecord._id });

    // Generate token and send response
    generateToken(savedUser._id, res);

    res.status(201).json({
      _id: savedUser._id,
      fullName: savedUser.fullName,
      username: savedUser.username,
      email: savedUser.email,
      profilePic: savedUser.profilePic,
    });

    // Send welcome email
    try {
      await sendWelcomeEmail(
        savedUser.email,
        savedUser.fullName,
        ENV.CLIENT_URL
      );
    } catch (error) {
      console.error("Failed to send welcome email:", error);
    }
  } catch (error) {
    console.log("Error in verifySignupOTP controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Resend OTP
export const resendSignupOTP = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required!" });
    }

    // Find existing OTP record
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ message: "No pending verification found. Please start registration again." });
    }

    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "Email already registered" });
    }

    // Generate new OTP
    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);
    const expiresAt = getOTPExpiration();

    // Update OTP record
    otpRecord.hashedOtp = hashedOtp;
    otpRecord.expiresAt = expiresAt;
    otpRecord.attempts = 0; // Reset attempts
    await otpRecord.save();

    // Send new OTP email
    try {
      await sendOTPEmail(email, otp, otpRecord.userData.fullName);
    } catch (error) {
      console.error("Failed to send OTP email:", error);
      return res.status(500).json({ message: "Failed to send OTP email. Please try again." });
    }

    res.status(200).json({
      message: "New OTP sent to your email. Please check your inbox.",
    });
  } catch (error) {
    console.log("Error in resendSignupOTP controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid credentials" });

    // Update last seen
    user.lastSeen = new Date();
    await user.save();

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (_, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "Logged out successfully" });
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName, username } = req.body;
    const userId = req.user._id;

    const updateData = {};

    // Validate required fields
    if (fullName && fullName.trim()) {
      updateData.fullName = fullName.trim();
    }

    if (username && username.trim()) {
      // Check if username is already taken by another user
      const existingUser = await User.findOne({
        username: username.toLowerCase(),
        _id: { $ne: userId },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      updateData.username = username.toLowerCase();
    }

    if (bio) {
      updateData.bio = bio;
    }

    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic, {
        resource_type: "auto",
      });
      updateData.profilePic = uploadResponse.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Search users
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user._id;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: userId } },
        {
          $or: [
            { fullName: { $regex: query, $options: "i" } },
            { username: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
          ],
        },
      ],
    }).select("-password");

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in searchUsers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select("-password")
      .populate("friends", "fullName profilePic username");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};  
