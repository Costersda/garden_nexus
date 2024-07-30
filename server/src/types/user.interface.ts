import { Document, Types } from "mongoose";

export interface User {
  email: string;
  username: string;
  password: string;
  country?: string;
  bio?: string;
  imageFile?: Buffer;
  verificationToken?: string;
  isVerified: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  following: Types.ObjectId[];
  followers: Types.ObjectId[];
}

export interface UserDocument extends User, Document {
  validatePassword(password: string): Promise<boolean>;
}