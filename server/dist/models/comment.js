"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = void 0;
const mongoose_1 = require("mongoose");
const commentSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    blogId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Blog"
    },
    forumId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Forum"
    },
    comment: {
        type: String,
        required: [true, "Comment is required"]
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    replyingTo: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    },
    replyText: {
        type: String,
        default: null
    }
}, {
    timestamps: {
        createdAt: true,
        updatedAt: false
    },
});
// Ensure at least one of blogId or forumId is present
commentSchema.pre('save', function (next) {
    if (!this.blogId && !this.forumId) {
        return next(new Error('Either blogId or forumId is required'));
    }
    next();
});
exports.Comment = (0, mongoose_1.model)("Comment", commentSchema);
//# sourceMappingURL=comment.js.map