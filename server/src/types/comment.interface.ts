import { Document, ObjectId, Types } from "mongoose";
import { User } from "./user.interface"; // Import the User interface from the user model

export interface Comment {
  user: User | ObjectId; // Use the imported User interface here
  blogId?: ObjectId;
  forumId?: ObjectId;
  comment: string;
  isEdited?: boolean;
  replyingTo?: Types.ObjectId | null;
  replyText: string;
  createdAt: Date;
}

export interface CommentDocument extends Comment, Document {}
