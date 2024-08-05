"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const mongoose_1 = __importDefault(require("mongoose"));
const usersController = __importStar(require("./controllers/users"));
const commentsController = __importStar(require("./controllers/comments"));
const blogController = __importStar(require("./controllers/blogs"));
const forumController = __importStar(require("./controllers/forums"));
const body_parser_1 = __importDefault(require("body-parser"));
const auth_1 = __importDefault(require("./middlewares/auth"));
const cors = require('cors');
const path_1 = __importDefault(require("path"));
const dotenv = __importStar(require("dotenv"));
const scheduledTasks_1 = require("./services/scheduledTasks");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer);
dotenv.config();

console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL}`);
app.use(cors({
  origin: function(origin, callback){
    const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:3000'];
    if(!origin || allowedOrigins.indexOf(origin) !== -1){
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(body_parser_1.default.json({ limit: '10mb' }));
app.use(body_parser_1.default.urlencoded({ limit: '10mb', extended: true }));
app.use('/assets', express_1.default.static(path_1.default.join(__dirname, 'assets')));
app.get("/", (req, res) => {
    res.send("API is UP");
});

app.options('*', cors());

console.log(`CORS origin: ${process.env.FRONTEND_URL}`);
app.set('trust proxy', true);
// User Routes
app.get("/api/users/check-credentials", usersController.checkUserCredentialsAvailability);
app.post("/api/users/resend-verification", usersController.resendVerificationEmail);
app.post("/api/users/forgot-password", usersController.forgotPassword);
app.post("/api/users/reset-password/:token", usersController.resetPassword);
app.post("/api/users/login", usersController.login);
app.delete('/api/users/profile', auth_1.default, (req, res, next) => {
    console.log("Delete profile route hit");
    usersController.deleteProfile(req, res, next);
});
// User Routes with :id parameter
app.get("/api/users/:id/is-following", auth_1.default, usersController.checkIfFollowing);
app.post("/api/users/:id/follow", auth_1.default, usersController.followUser);
app.post("/api/users/:id/unfollow", auth_1.default, usersController.unfollowUser);
app.get("/api/users/:id/followers", auth_1.default, usersController.getFollowers);
app.get("/api/users/:id/following", auth_1.default, usersController.getFollowing);
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
app.get('/api/user', auth_1.default, usersController.currentUser);
app.get('/api/user/current', auth_1.default, usersController.currentUser);
app.get('/api/profile/:username', auth_1.default, usersController.getProfile);
app.put("/api/profile/:username", auth_1.default, usersController.updateProfile);
// Comment routes
app.post("/api/comments", auth_1.default, commentsController.createComment);
app.get("/api/comments/blog/:blogId", commentsController.getAllCommentsByBlogId);
app.get("/api/comments/forum/:forumId", commentsController.getAllCommentsByForumId);
app.get("/api/comments/:id", commentsController.getCommentById);
app.patch("/api/comments/:id", auth_1.default, commentsController.updateCommentById);
app.delete("/api/comments/:id", commentsController.deleteCommentById);
// Blog routes
app.post("/api/blogs", auth_1.default, blogController.createBlog);
app.get("/api/blogs", blogController.getAllBlogs);
app.get("/api/blogs/search", blogController.getBlogsBySearch);
app.get("/api/blogs/category", blogController.getBlogsByCategory);
app.get("/api/blogs/user/:username", blogController.getBlogsByUser);
app.get("/api/blogs/:id", blogController.getBlogById);
app.get("/api/blogs/:id", blogController.getBlogWithUserById);
app.patch("/api/blogs/:id", auth_1.default, blogController.updateBlogById);
app.delete("/api/blogs/:id", blogController.deleteBlogById);
// Forum routes
app.post("/api/forums", auth_1.default, forumController.createForum);
app.get("/api/forums", forumController.getAllForums);
app.get("/api/forums/search", forumController.getForumsBySearch);
app.get("/api/forums/category", forumController.getForumsByCategory);
app.get("/api/forums/user/:username", forumController.getForumsByUser);
app.get("/api/forums/:id", forumController.getForumById);
app.get("/api/forums/:id", forumController.getForumWithUserById);
app.patch("/api/forums/:id", auth_1.default, forumController.updateForumById);
app.delete("/api/forums/:id", forumController.deleteForumById);
io.on("connection", () => {
    console.log("connect");
});
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
    console.error('MONGODB_URI is not defined in the environment variables');
    process.exit(1);
}
mongoose_1.default.connect(mongoURI).then(() => {
    console.log("connected to mongodb");
    // Start the scheduled tasks
    (0, scheduledTasks_1.startScheduledTasks)();
    httpServer.listen(4001, () => {
        console.log(`API is listening on port 4001`);
    });
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map
