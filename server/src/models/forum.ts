import { Schema, model } from "mongoose";
import { ForumDocument } from "../types/forum.interface";

const forumSchema = new Schema<ForumDocument>(
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
    content: { type: String, required: true },
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

forumSchema.index({ title: "text", content: "text" });

export const Forum = model<ForumDocument>("Forum", forumSchema);
