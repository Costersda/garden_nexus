import { Document, ObjectId } from "mongoose";

export interface Comment {
  user: ObjectId;
  blogId: ObjectId;
  comment: string;
  createdAt: Date;
}

export interface CommentDocument extends Comment, Document {}
