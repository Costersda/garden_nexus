import { Document, ObjectId } from "mongoose";

export interface Forum {
  user_id: ObjectId;
  title: string;
  content: string;
  categories: string[];
  comments: ObjectId[];
  isEdited?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumDocument extends Forum, Document { }