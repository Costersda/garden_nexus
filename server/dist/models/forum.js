"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Forum = void 0;
const mongoose_1 = require("mongoose");
const forumSchema = new mongoose_1.Schema({
    user_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: { type: String, required: true },
    categories: [{ type: String }],
    comments: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Comment" }],
    isEdited: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});
forumSchema.index({ title: "text", content: "text" });
exports.Forum = (0, mongoose_1.model)("Forum", forumSchema);
//# sourceMappingURL=forum.js.map