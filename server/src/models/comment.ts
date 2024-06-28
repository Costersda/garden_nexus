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
        ref: "Blog", 
        required: true 
    },
    comment: { 
        type: String, 
        required: [true, "Comment is required"] 
    },
    isEdited: {
        type: Boolean,
        default: false
    }
  },
  {
    timestamps: { 
        createdAt: true, 
        updatedAt: false 
    },
  }
);

export const Comment = model<CommentDocument>("Comment", commentSchema);
