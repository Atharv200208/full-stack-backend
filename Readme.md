# 🔥 Full-Stack Social Media Backend (Twitter + YouTube Clone)

![Node.js](https://img.shields.io/badge/Node.js-14.x-green?logo=node.js)
![Express](https://img.shields.io/badge/Express.js-Backend-black?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

This is a **full-stack backend API** designed to power a social media platform with core functionalities inspired by **Twitter** and **YouTube**. It supports features like video uploads, playlists, tweet posting, likes, subscriptions, comments, and JWT-based user authentication.

---

## 📚 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Setup Instructions](#-setup-instructions)
- [API Overview](#-api-overview)
- [Inspiration](#-inspiration)
- [Future Enhancements](#-future-enhancements)

---

## 🚀 Features

### Authentication
- User registration, login, logout
- JWT-based auth (access + refresh tokens)
- Route protection with middleware

### Video Module
- Upload video and thumbnails to Cloudinary
- Manage video title, category, visibility
- Publish/unpublish videos
- Watch history tracking

### Tweet System
- Post tweets
- Like/unlike tweets
- Add/edit/delete comments

### Comments
- Nested comments on both tweets and videos
- Edit/delete own comments

### Playlists
- Create, edit, delete playlists
- Add/remove videos from playlists

### Likes & Subscriptions
- Like/unlike both tweets and videos
- Subscribe/unsubscribe to channels
- See your subscriptions and subscriber count

---

## 🧰 Tech Stack

| Category           | Tech Used                    |
|--------------------|------------------------------|
| Backend Runtime     | Node.js                     |
| Framework           | Express.js                  |
| Database            | MongoDB + Mongoose          |
| Authentication      | JWT                          |
| Media Upload        | Cloudinary + Multer          |
| Environment Config  | dotenv                       |
| Validation          | express-validator            |
| File Uploads        | Multer                       |
| Error Handling      | Custom ApiError/ApiResponse |
| Dev Tools           | nodemon, morgan             |

---

## 🏗️ Project Structure

```bash
src/
├── config/               # Cloudinary, DB, dotenv configs
├── controllers/          # All route logic
├── models/               # Mongoose schemas
├── routes/               # Express routers (modularized)
├── middlewares/          # Auth, file upload, error handlers
├── utils/                # ApiError, ApiResponse
├── services/             # Business logic (optional split)
├── index.js              # Entry point
```
🛠️ Setup Instructions
1. Clone the Repository
git clone https://github.com/your-username/social-media-backend.git
cd social-media-backend
2. Install Dependencies
npm install
3. Configure Environment Variables
Create a .env file in the root:
PORT=8000
MONGODB_URI=mongodb+srv://your-db-uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=15m
REFRESH_SECRET=your_refresh_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
4. Start the Development Server
npm run dev
Your server will start on http://localhost:8000

📡 API Overview
All APIs are versioned under /api/v1/ and follow RESTful conventions. Some examples:

| Method | Endpoint                     | Description                  |
| ------ | ---------------------------- | ---------------------------- |
| POST   | `/api/v1/auth/register`      | Register a new user          |
| POST   | `/api/v1/auth/login`         | Login and receive JWT tokens |
| GET    | `/api/v1/videos`             | List all videos              |
| POST   | `/api/v1/tweets`             | Create a tweet               |
| POST   | `/api/v1/videos/:id/like`    | Like a video                 |
| POST   | `/api/v1/comments/:id/reply` | Add a nested comment         |


You can use Postman or ThunderClient to test endpoints.

🌟 Inspiration
This project was inspired by the Full Stack series by Hitesh Choudhary. About 25% of the structure and setup follows the initial tutorial, while the remaining 75% was independently built, including advanced features like:

Cloudinary video uploads

Subscriptions & playlist engine

Aggregation pipelines for likes/history

Modular tweet/comment handling

Robust error-handling architecture

🔮 Future Enhancements
 Admin panel with RBAC

 Notification system (email or push)

 Realtime features with WebSocket

 Full frontend in React/Vue/Svelte

 Deployment on Render, Railway or Vercel (serverless)

📬 Contact
Feel free to reach out or connect if you found this helpful or want to collaborate!

GitHub: Atharv200208
LinkedIn: www.linkedin.com/in/atharv-raut-437014213




