<h1 align="center">💬 Messecure – Intelligent Real-Time Messaging Platform</h1>

---

## 📌 Problem Statement
Modern communication requires more than just sending text back and forth. Users face challenges such as:
* Fragmented applications for messaging, media sharing, and AI assistance.
* Lack of secure, rate-limited environments to prevent spam and abuse.
* The need for seamless group collaboration and smart conversation aids in one unified platform.

---

## 💡 Solution
Messecure is a comprehensive, full-stack application designed to unify real-time communication with artificial intelligence. By integrating core messaging functionalities with smart features, it provides:
* Instant one-on-one and group chat capabilities.
* An integrated AI assistant named "Aura" to enhance conversations.
* Secure authentication flows, including OTP (One-Time Password) verification.
* Robust rate limiting and security measures to ensure a safe user environment.

---

# ✨ MESSECURE – Features

> ⚡ **Real-Time Communication:** All live messaging and socket connections are powered by our custom Node.js backend utilizing WebSockets.
> 🤖 **AI-Powered:** Features a dedicated Gemini service integration for smart, context-aware assistance.

---

## **1. User Authentication & Security**
* 🔐 **Secure Auth Flows:** Comprehensive authentication controllers and middlewares.
* 🔑 **OTP Verification:** Built-in One-Time Password generation and validation models for secure access.
* 🛡️ **Rate Limiting:** Integration with Arcjet for advanced rate limiting and login attempt restrictions to prevent abuse.

## **2. Real-Time Messaging & Group Chats**
* 💬 **Direct Messaging:** Send and receive messages instantly with dedicated message controllers.
* 👨‍👩‍👧‍👦 **Group Chat Functionality:** Create and manage group chats with real-time updates.
* ⚡ **Socket Integration:** Low-latency, bidirectional communication handled via Socket.io.

## **3. AI Assistant "Aura"**
* 🤖 **Gemini Integration:** Powered by Google's Gemini service for intelligent responses.
* 🧠 **Contextual Conversations:** Maintains Aura conversation and message models to keep track of AI interactions.
* 📊 **Usage Tracking:** Monitors Aura usage limits and analytics natively in the backend.

## **4. Social Features & Media Sharing**
* 📸 **Stories:** Upload and share ephemeral stories with friends.
* ☁️ **Cloudinary Integration:** Seamless media upload and storage for user avatars and story media.
* 🤝 **Friend Management:** Robust friend routing and intelligent friend suggestion models.

## **5. Email Services**
* ✉️ **Automated Emails:** Custom email handlers and templates for notifications and user verification.

---

## 🛠 Tech Stack

| **Category** | **Technologies** |
|--------------|------------------|
| **Frontend** | React, Vite, Tailwind CSS |
| **Backend** | Node.js, Express, Custom DB integration |
| **Security** | Arcjet, OTP generation, Custom Rate Limiters |
| **AI/APIs** | Google Gemini API, Cloudinary |
| **Real-Time**| WebSockets / Socket.io |

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* Cloudinary Account
* Arcjet API Key
* Google Gemini API Key

### Setup

```bash
# Clone the repository
git clone [https://github.com/yourusername/Messecure.git](https://github.com/yourusername/Messecure.git)

# Navigate to the backend
cd backend

# Install backend dependencies
npm install

# Set up your environment variables
# Ensure you configure your DB, Cloudinary, Gemini, and Arcjet keys in a .env file

# Start the backend server
npm start

# In a new terminal, navigate to the frontend
cd ../frontend

# Install frontend dependencies
npm install

# Start the frontend application
npm run dev
