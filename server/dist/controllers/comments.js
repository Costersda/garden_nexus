"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCommentById = exports.updateCommentById = exports.getCommentById = exports.getAllComments = exports.getAllCommentsByForumId = exports.getAllCommentsByBlogId = exports.createComment = void 0;
const comment_1 = require("../models/comment");
const normalizeComment = (comment) => {
    const user = comment.user;
    let userImage = null;
    if (user && user.imageFile && Buffer.isBuffer(user.imageFile)) {
        const base64String = user.imageFile.toString('base64');
        userImage = `data:image/jpeg;base64,${base64String}`;
    }
    return {
        id: comment.id,
        blogId: comment.blogId,
        forumId: comment.forumId,
        comment: comment.comment,
        createdAt: comment.createdAt,
        isEdited: comment.isEdited,
        replyingTo: comment.replyingTo,
        user: user ? {
            id: user._id,
            username: user.username,
            imageFile: userImage
        } : null
    };
};
// Create a new comment
const createComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const commentData = req.body;
        if (commentData.replyingTo && commentData.replyingTo.id) {
            commentData.replyingTo = commentData.replyingTo.id;
        }
        else {
            delete commentData.replyingTo;
        }
        const comment = new comment_1.Comment(commentData);
        yield comment.save();
        const populatedComment = yield comment.populate('user', 'username imageFile');
        res.status(201).send(normalizeComment(populatedComment));
    }
    catch (error) {
        next(error);
    }
});
exports.createComment = createComment;
// Get all comments by blogId
const getAllCommentsByBlogId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comments = yield comment_1.Comment.find({ blogId: req.params.blogId })
            .populate('user', 'username imageFile')
            .populate('replyingTo', 'id user comment')
            .exec();
        res.status(200).send(comments.map(normalizeComment));
    }
    catch (error) {
        next(error);
    }
});
exports.getAllCommentsByBlogId = getAllCommentsByBlogId;
// Get all comments by forumId
const getAllCommentsByForumId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comments = yield comment_1.Comment.find({ forumId: req.params.forumId })
            .populate('user', 'username imageFile')
            .populate('replyingTo', 'id user comment')
            .exec();
        const normalizedComments = comments.map(comment => {
            try {
                return normalizeComment(comment);
            }
            catch (error) {
                console.error('Error normalizing comment:', error);
                return null;
            }
        }).filter(comment => comment !== null);
        res.status(200).send(normalizedComments);
    }
    catch (error) {
        next(error);
    }
});
exports.getAllCommentsByForumId = getAllCommentsByForumId;
// Get all comments for a specific blog post
const getAllComments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comments = yield comment_1.Comment.find({ blogId: req.params.blogId })
            .populate('user', 'username imageFile')
            .populate('replyingTo', 'id user comment')
            .exec();
        const normalizedComments = comments.map(normalizeComment);
        res.status(200).send(normalizedComments);
    }
    catch (error) {
        next(error);
    }
});
exports.getAllComments = getAllComments;
// Get a single comment by ID
const getCommentById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comment = yield comment_1.Comment.findOne({ _id: req.params.id, blogId: req.params.blogId })
            .populate('user', 'username imageFile')
            .populate('replyingTo', 'id user comment')
            .exec();
        if (!comment) {
            return res.status(404).send();
        }
        res.status(200).send(normalizeComment(comment));
    }
    catch (error) {
        next(error);
    }
});
exports.getCommentById = getCommentById;
// Update a comment by ID
const updateCommentById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comment = yield comment_1.Comment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        })
            .populate('user', 'username imageFile')
            .populate('replyingTo', 'id user comment');
        if (!comment) {
            return res.status(404).send({ message: "Comment not found" });
        }
        res.status(200).send(normalizeComment(comment));
    }
    catch (error) {
        next(error);
    }
});
exports.updateCommentById = updateCommentById;
// Delete a comment by ID
const deleteCommentById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comment = yield comment_1.Comment.findByIdAndDelete(req.params.id);
        if (!comment) {
            return res.status(404).send({ message: "Comment not found" });
        }
        res.status(200).send({ message: "Comment deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteCommentById = deleteCommentById;
//# sourceMappingURL=comments.js.map