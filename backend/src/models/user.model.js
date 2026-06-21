import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
            minlength: 3,
        },
        fullName: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        profilePic: {
            type: String,
            default: "",
        },
        bio: {
            type: String,
            default: "",
        },
        friends: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }],
        friendRequests: [{
            senderId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            status: {
                type: String,
                enum: ["pending", "accepted", "rejected"],
                default: "pending",
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }],
        blockedUsers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }],
        privateMessaging: {
            type: Boolean,
            default: false, // if true, only friends can message
        },
        lastSeen: {
            type: Date,
            default: Date.now,
        },
    },

    { timestamps: true }

);

const User = mongoose.model("User", userSchema);

export default User;
