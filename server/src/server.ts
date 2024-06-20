import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import * as usersController from "./controllers/users";
import * as commentsController from "./controllers/comments";
import * as blogController from "./controllers/blogs";
import bodyParser from "body-parser";
import authMiddleware from "./middlewares/auth";
import cors from "cors";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); 
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.get("/", (req, res) => {
  res.send("API is UP");
});

app.post("/api/users", usersController.register);
app.post("/api/users/login", usersController.login);
app.get('/api/user', authMiddleware, usersController.currentUser);
app.get('/api/profile/:username', authMiddleware, usersController.getProfile);
app.put("/api/profile/:username", authMiddleware, usersController.updateProfile); // New update profile route
app.get('/api/users/:id', usersController.getUserById); // Add this line

// Comment routes
app.post("/api/comments", authMiddleware, commentsController.createComment);
app.get("/api/comments/:blogId", commentsController.getAllComments);
app.get("/api/comments/:blogId/:id", commentsController.getCommentById);
app.patch("/api/comments/:blogId/:id", authMiddleware, commentsController.updateCommentById);
app.delete("/api/comments/:blogId/:id", commentsController.deleteCommentById);

// Blog routes
app.post("/api/blogs", authMiddleware, blogController.createBlog);
app.get("/api/blogs", blogController.getAllBlogs);
app.get("/api/blogs/:id", blogController.getBlogById);
app.get("/api/blogs/:id", blogController.getBlogWithUserById); // Updated route to include user info
app.get("/api/blogs/category", blogController.getBlogsByCategory); // New route for getting blogs by category
app.get("/api/blogs/user/:username", blogController.getBlogsByUser); // New route for getting blogs by username
app.patch("/api/blogs/:id", authMiddleware, blogController.updateBlogById);
app.delete("/api/blogs/:id", blogController.deleteBlogById);

io.on("connection", () => {
  console.log("connect");
});

mongoose.connect("mongodb://localhost:27017/garden_nexus").then(() => {
  console.log("connected to mongodb");
  httpServer.listen(4001, () => {
    console.log(`API is listening on port 4001`);
  });
});
