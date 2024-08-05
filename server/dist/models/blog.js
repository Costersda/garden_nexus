"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Blog = void 0;
const mongoose_1 = require("mongoose");
const blogSchema = new mongoose_1.Schema({
    user_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content_section_1: { type: String, required: true },
    content_section_2: { type: String },
    content_section_3: { type: String },
    image_1: { type: String, required: true },
    image_2: { type: String },
    image_3: { type: String },
    categories: [{ type: String }],
    comments: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Comment" }],
    isEdited: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});
blogSchema.index({ title: "text", content_section_1: "text", content_section_2: "text", content_section_3: "text" });
exports.Blog = (0, mongoose_1.model)("Blog", blogSchema);
//# sourceMappingURL=blog.js.map