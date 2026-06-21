import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import cloudinary from "./lib/cloudinary.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import friendRoutes from "./routes/friend.route.js";
import groupChatRoutes from "./routes/groupchat.route.js";
import storyRoutes from "./routes/story.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";

// const __dirname = path.resolve();

const PORT = ENV.PORT || 5001;

app.use(express.json({ limit: "5mb" })); // req.body
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/groups", groupChatRoutes);
app.use("/api/stories", storyRoutes);

// // make ready for deployment
// if (ENV.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../frontend/dist")));

//   app.get("*", (_, res) => {
//     res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
//   });
// }

server.listen(PORT, () => {
  console.log("Server running on port: " + PORT);
  connectDB();
});
