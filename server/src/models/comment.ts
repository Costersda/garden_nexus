import { Schema, model } from "mongoose";
import { CommentDocument } from "../types/comment.interface";

const commentSchema = new Schema<CommentDocument>(
  {
    user: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    blogId: { 
        type: Schema.Types.ObjectId, 
        ref: "Blog" 
    },
    forumId: { 
        type: Schema.Types.ObjectId, 
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
        type: Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    },
    replyText: {
      type: String,
      default: null
    }
  },
  {
    timestamps: { 
        createdAt: true, 
        updatedAt: false 
    },
  }
);

// Ensure at least one of blogId or forumId is present
commentSchema.pre('save', function (next) {
  if (!this.blogId && !this.forumId) {
    return next(new Error('Either blogId or forumId is required'));
  }
  next();
});

export const Comment = model<CommentDocument>("Comment", commentSchema);