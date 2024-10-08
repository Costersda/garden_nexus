import { Schema, model } from "mongoose";
import { BlogDocument } from "../types/blog.interface";

const blogSchema = new Schema<BlogDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
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
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    isEdited: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

blogSchema.index({ title: "text", content_section_1: "text", content_section_2: "text", content_section_3: "text" });

export const Blog = model<BlogDocument>("Blog", blogSchema);
