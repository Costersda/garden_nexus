import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import * as usersController from "./controllers/users";
import * as commentsController from "./controllers/comments";
import * as blogController from "./controllers/blogs";
import * as forumController from "./controllers/forums";
import bodyParser from "body-parser";
import authMiddleware from "./middlewares/auth";
import cors from "cors";
import path from 'path';
import * as dotenv from 'dotenv';
import { startScheduledTasks } from "./services/scheduledTasks";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
dotenv.config();

const allowedOrigins = [process.env.FRONTEND_URL, 'https://gardennexus.com'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get("/", (req, res) => {
  res.send("API is UP");
});

// User Routes
app.get("/api/users/check-credentials", usersController.checkUserCredentialsAvailability);
app.post("/api/users/resend-verification", usersController.resendVerificationEmail);
app.post("/api/users/forgot-password", usersController.forgotPassword);
app.post("/api/users/reset-password/:token", usersController.resetPassword);
app.post("/api/users/login", usersController.login);
app.delete('/api/users/profile', authMiddleware, (req, res, next) => {
  console.log("Delete profile route hit");
  usersController.deleteProfile(req, res, next);
});
app.get("/api/users/profiles", authMiddleware, usersController.getAllProfiles);

// User Routes with :id parameter
app.get("/api/users/:id/is-following", authMiddleware, usersController.checkIfFollowing);
app.post("/api/users/:id/follow", authMiddleware, usersController.followUser);
app.post("/api/users/:id/unfollow", authMiddleware, usersController.unfollowUser);
app.get("/api/users/:id/followers", authMiddleware, usersController.getFollowers);
app.get("/api/users/:id/following", authMiddleware, usersController.getFollowing);
app.get('/api/users/:id', usersController.getUserById);

// Other User Routes
app.post("/api/users", usersController.register);
app.get("/api/verify/:token", (req, res) => {
  usersController.verifyEmail(req, res, (err) => {
    if (err) {
      res.redirect(`${process.env.FRONTEND_URL}/verify-error`);
    }
  });
});
app.get('/api/user', authMiddleware, usersController.currentUser);
app.get('/api/user/current', authMiddleware, usersController.currentUser);
app.get('/api/profile/:username', authMiddleware, usersController.getProfile);
app.put("/api/profile/:username", authMiddleware, usersController.updateProfile);

// Comment routes
app.post("/api/comments", authMiddleware, commentsController.createComment);
app.get("/api/comments/blog/:blogId", commentsController.getAllCommentsByBlogId);
app.get("/api/comments/forum/:forumId", commentsController.getAllCommentsByForumId);
app.get("/api/comments/:id", commentsController.getCommentById);
app.patch("/api/comments/:id", authMiddleware, commentsController.updateCommentById);
app.delete("/api/comments/:id", commentsController.deleteCommentById);

// Blog routes
app.post("/api/blogs", authMiddleware, blogController.createBlog);
app.get("/api/blogs", blogController.getAllBlogs);
app.get("/api/blogs/search", blogController.getBlogsBySearch);
app.get("/api/blogs/category", blogController.getBlogsByCategory);
app.get("/api/blogs/user/:username", blogController.getBlogsByUser);
app.get("/api/blogs/:id", blogController.getBlogById);
app.get("/api/blogs/:id", blogController.getBlogWithUserById);
app.patch("/api/blogs/:id", authMiddleware, blogController.updateBlogById);
app.delete("/api/blogs/:id", blogController.deleteBlogById);

// Forum routes
app.post("/api/forums", authMiddleware, forumController.createForum);
app.get("/api/forums", forumController.getAllForums);
app.get("/api/forums/search", forumController.getForumsBySearch);
app.get("/api/forums/category", forumController.getForumsByCategory);
app.get("/api/forums/user/:username", forumController.getForumsByUser);
app.get("/api/forums/:id", forumController.getForumById);
app.get("/api/forums/:id", forumController.getForumWithUserById);
app.patch("/api/forums/:id", authMiddleware, forumController.updateForumById);
app.delete("/api/forums/:id", forumController.deleteForumById);

io.on("connection", () => {
  console.log("connect");
});

const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('MONGODB_URI is not defined in the environment variables');
  process.exit(1);
}

mongoose.connect(mongoURI).then(() => {
  console.log("connected to mongodb");

  // Start the scheduled tasks
  startScheduledTasks();

  httpServer.listen(4001, () => {
    console.log(`API is listening on port 4001`);
  });
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
  process.exit(1);
});