import { Document, ObjectId } from "mongoose";

export interface Blog {
  user_id: ObjectId;
  title: string;
  content_section_1: string;
  content_section_2?: string;
  content_section_3?: string;
  image_1: string;
  image_2?: string;
  image_3?: string;
  categories: string[];
  comments: ObjectId[];
  isEdited?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogDocument extends Blog, Document {}
