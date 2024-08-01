import { Document, ObjectId, Types } from "mongoose";
import { User } from "./user.interface";

export interface Comment {
  user: User | ObjectId;
  blogId?: ObjectId;
  forumId?: ObjectId;
  comment: string;
  isEdited?: boolean;
  replyingTo?: Types.ObjectId | null;
  replyText: string;
  createdAt: Date;
}

export interface CommentDocument extends Comment, Document { }
