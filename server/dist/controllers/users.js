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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProfile = exports.checkIfFollowing = exports.getFollowing = exports.getFollowers = exports.unfollowUser = exports.followUser = exports.checkUserCredentialsAvailability = exports.getUserById = exports.updateProfile = exports.getProfile = exports.currentUser = exports.login = exports.resetPassword = exports.forgotPassword = exports.resendVerificationEmail = exports.verifyEmail = exports.register = void 0;
const user_1 = __importDefault(require("../models/user"));
const mongoose_1 = __importStar(require("mongoose"));
const jwt = __importStar(require("jsonwebtoken"));
const blog_1 = require("../models/blog");
const comment_1 = require("../models/comment");
const forum_1 = require("../models/forum");
const crypto = __importStar(require("crypto"));
const emailService_1 = require("../services/emailService");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
if (!process.env.JWT_SECRET) {
    throw new mongoose_1.Error('JWT_SECRET is not defined in the environment variables');
}
const normalizeUser = (user) => {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    return {
        email: user.email,
        username: user.username,
        id: user.id,
        token: `Bearer ${token}`,
        isVerified: user.isVerified
    };
};
// Register a new user
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, username, password } = req.body;
        // Check for existing user
        const existingUser = yield user_1.default.findOne({
            $or: [{ email }, { username }],
        });
        if (existingUser) {
            const message = existingUser.username === username
                ? 'Username is already taken'
                : 'Email is already in use';
            return res.status(409).json({ message });
        }
        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        // Create and save new user
        const newUser = new user_1.default({
            email,
            username,
            password,
            verificationToken,
            isVerified: false
        });
        const savedUser = yield newUser.save();
        // Send verification email
        yield (0, emailService_1.sendVerificationEmail)(email, verificationToken);
        // Generate token and return user info
        const normalizedUser = normalizeUser(savedUser);
        // Return only the normalized user data
        res.status(201).json(normalizedUser);
    }
    catch (err) {
        if (isMongoError(err) && err.code === 11000) {
            const field = Object.keys(err.keyValue)[0];
            const message = `${field.charAt(0).toUpperCase() + field.slice(1)} is already in use.`;
            return res.status(409).json({ message });
        }
        else if (isValidationError(err)) {
            const messages = Object.values(err.errors).map((err) => err.message);
            return res.status(422).json(messages);
        }
        next(err);
    }
});
exports.register = register;
// Verify a users email
const verifyEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const user = yield user_1.default.findOne({ verificationToken: token });
        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL}/verify-failed`);
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        yield user.save();
        // Redirect to the frontend verification success page
        res.redirect(`${process.env.FRONTEND_URL}/verify-success`);
    }
    catch (error) {
        console.error('Error during email verification:', error);
        res.redirect(`${process.env.FRONTEND_URL}/verify-failed`);
    }
});
exports.verifyEmail = verifyEmail;
// Resend the verification email
const resendVerificationEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield user_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.isVerified) {
            return res.status(400).json({ message: 'User is already verified' });
        }
        // Generate a new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.verificationToken = verificationToken;
        yield user.save();
        // Send the new verification email
        yield (0, emailService_1.sendVerificationEmail)(email, verificationToken);
        res.status(200).json({ message: 'Verification email resent successfully' });
    }
    catch (error) {
        console.error('Error resending verification email:', error);
        res.status(500).json({ message: 'Error resending verification email', error });
    }
});
exports.resendVerificationEmail = resendVerificationEmail;
// Forgot password email
const forgotPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield user_1.default.findOne({ email });
        if (!user) {
            // Don't reveal that the user doesn't exist
            return res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
        }
        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
        // Save reset token and expiration to user document
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(resetTokenExpiration);
        yield user.save();
        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        // Send email
        yield (0, emailService_1.sendPasswordResetEmail)(user.email, resetUrl);
        res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
    }
    catch (error) {
        console.error('Error in forgotPassword:', error);
        res.status(500).json({ message: 'An error occurred while processing your request' });
    }
});
exports.forgotPassword = forgotPassword;
// Reset password
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const { password } = req.body;
        const user = yield user_1.default.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }
        // Set the new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        yield user.save();
        res.json({ message: 'Password has been reset successfully.' });
    }
    catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'An error occurred while resetting the password.' });
    }
});
exports.resetPassword = resetPassword;
// Type guard for MongoDB errors
function isMongoError(error) {
    return typeof error === 'object' && error !== null && 'code' in error && 'keyValue' in error;
}
// Type guard for Mongoose validation errors
function isValidationError(error) {
    return typeof error === 'object' && error !== null && 'errors' in error;
}
// Login a user
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findOne({ email: req.body.email }).select("+password");
        const errors = { emailOrPassword: "Incorrect email or password" };
        if (!user) {
            return res.status(422).json(errors);
        }
        const isSamePassword = yield user.validatePassword(req.body.password);
        if (!isSamePassword) {
            return res.status(422).json(errors);
        }
        res.send(normalizeUser(user));
    }
    catch (err) {
        next(err);
    }
});
exports.login = login;
// Get current user
const currentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.sendStatus(401);
        }
        const user = yield user_1.default.findById(req.user.id);
        if (!user) {
            return res.sendStatus(404);
        }
        res.json(normalizeUser(user));
    }
    catch (error) {
        console.error('Error in currentUser:', error);
        res.status(500).json({ message: 'Error fetching user', error });
    }
});
exports.currentUser = currentUser;
// Get a profile
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.params;
        const user = yield user_1.default.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const { _id, email, country, bio, imageFile, isVerified } = user;
        res.status(200).json({
            id: _id,
            email,
            username,
            country,
            bio,
            imageFile: imageFile ? imageFile.toString('base64') : null,
            isVerified
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error });
    }
});
exports.getProfile = getProfile;
// Update a users profile
const updateProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { username } = req.params;
        const { country, bio, imageFile } = req.body;
        // Check if the authenticated user is the owner of the profile
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.username) !== username) {
            return res.status(403).json({ message: "You can only edit your own profile" });
        }
        const user = yield user_1.default.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.country = country || user.country;
        user.bio = bio || user.bio;
        if (imageFile) {
            user.imageFile = Buffer.from(imageFile, "base64");
        }
        yield user.save();
        res.status(200).json({
            email: user.email,
            username: user.username,
            country: user.country,
            bio: user.bio,
            imageFile: user.imageFile ? user.imageFile.toString("base64") : null,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating profile", error });
    }
});
exports.updateProfile = updateProfile;
const getUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield user_1.default.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching user', error });
    }
});
exports.getUserById = getUserById;
const checkUserCredentialsAvailability = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email } = req.query;
        if (!username && !email) {
            return res.status(400).json({ message: 'Username or email is required' });
        }
        const user = yield user_1.default.findOne({
            $or: [
                { username: username ? username : '' },
                { email: email ? email : '' }
            ]
        });
        // Check the email and username is unique
        if (user) {
            const message = user.username === username ? 'Username is already taken' : 'Email is already in use';
            return res.json({
                available: false,
                message
            });
        }
        return res.json({ available: true });
    }
    catch (error) {
        console.error('Error checking credentials availability:', error);
        res.status(500).json({ message: 'Error checking credentials availability', error });
    }
});
exports.checkUserCredentialsAvailability = checkUserCredentialsAvailability;
const followUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const userToFollowId = req.params.id;
        const currentUserId = req.user.id;
        if (currentUserId === userToFollowId) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }
        const userToFollow = yield user_1.default.findById(userToFollowId);
        const currentUser = yield user_1.default.findById(currentUserId);
        if (!userToFollow || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }
        if (currentUser.following.includes(new mongoose_1.Types.ObjectId(userToFollowId))) {
            return res.status(400).json({ message: "You are already following this user" });
        }
        currentUser.following.push(new mongoose_1.Types.ObjectId(userToFollowId));
        userToFollow.followers.push(new mongoose_1.Types.ObjectId(currentUserId));
        yield currentUser.save();
        yield userToFollow.save();
        res.status(200).json({ message: "Successfully followed user" });
    }
    catch (error) {
        console.error("Error following user:", error);
        res.status(500).json({ message: "Error following user", error });
    }
});
exports.followUser = followUser;
const unfollowUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const userToUnfollowId = req.params.id;
        const currentUserId = req.user.id;
        if (currentUserId === userToUnfollowId) {
            return res.status(400).json({ message: "You cannot unfollow yourself" });
        }
        const userToUnfollow = yield user_1.default.findById(userToUnfollowId);
        const currentUser = yield user_1.default.findById(currentUserId);
        if (!userToUnfollow || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!currentUser.following.includes(new mongoose_1.Types.ObjectId(userToUnfollowId))) {
            return res.status(400).json({ message: "You are not following this user" });
        }
        currentUser.following = currentUser.following.filter(id => id.toString() !== userToUnfollowId);
        userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== currentUserId);
        yield currentUser.save();
        yield userToUnfollow.save();
        res.status(200).json({ message: "Successfully unfollowed user" });
    }
    catch (error) {
        console.error("Error unfollowing user:", error);
        res.status(500).json({ message: "Error unfollowing user", error });
    }
});
exports.unfollowUser = unfollowUser;
const getFollowers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const user = yield user_1.default.findById(userId).populate('followers', 'username');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user.followers);
    }
    catch (error) {
        console.error("Error fetching followers:", error);
        res.status(500).json({ message: "Error fetching followers", error });
    }
});
exports.getFollowers = getFollowers;
const getFollowing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const user = yield user_1.default.findById(userId).populate('following', 'username imageFile');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const followingWithImages = user.following.map((followedUser) => ({
            username: followedUser.username,
            imageFile: followedUser.imageFile ? followedUser.imageFile.toString('base64') : null
        }));
        res.status(200).json(followingWithImages);
    }
    catch (error) {
        console.error("Error fetching following:", error);
        res.status(500).json({ message: "Error fetching following", error });
    }
});
exports.getFollowing = getFollowing;
const checkIfFollowing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userToCheckId = req.params.id;
        const currentUser = req.user;
        if (!currentUser) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Convert string to ObjectId
        let userToCheckObjectId;
        try {
            userToCheckObjectId = new mongoose_1.default.Types.ObjectId(userToCheckId);
        }
        catch (err) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        // Check if the ObjectId exists in the following array
        const isFollowing = currentUser.following.some((id) => id.equals(userToCheckObjectId));
        res.json(isFollowing);
    }
    catch (error) {
        console.error("Error checking if following:", error);
        if (error instanceof mongoose_1.Error) {
            res.status(500).json({ message: "Error checking if following", error: error.message });
        }
        else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
});
exports.checkIfFollowing = checkIfFollowing;
const deleteProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const userId = req.user.id;
        // Delete user's blogs
        yield blog_1.Blog.deleteMany({ user_id: userId });
        // Delete user's forums
        yield forum_1.Forum.deleteMany({ user_id: userId });
        // Delete user's comments
        yield comment_1.Comment.deleteMany({ user: userId });
        // Delete comments on user's blogs
        const userBlogs = yield blog_1.Blog.find({ user_id: userId });
        for (const blog of userBlogs) {
            yield comment_1.Comment.deleteMany({ blogId: blog._id });
        }
        // Delete comments on user's forums
        const userForums = yield forum_1.Forum.find({ user_id: userId });
        for (const forum of userForums) {
            yield comment_1.Comment.deleteMany({ forumId: forum._id });
        }
        // Delete the user
        const deletedUser = yield user_1.default.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "Profile and associated content deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting profile:", error);
        res.status(500).json({ message: "An error occurred while deleting the profile", error });
    }
});
exports.deleteProfile = deleteProfile;
//# sourceMappingURL=users.js.map