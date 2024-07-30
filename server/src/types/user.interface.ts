import { Document } from "mongoose";

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
}

export interface UserDocument extends User, Document {
  validatePassword(password: string): Promise<boolean>;
}