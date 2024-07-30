import { Schema, model, Types } from "mongoose";
import { UserDocument } from "../types/user.interface";
import validator from "validator";
import bcryptjs from "bcryptjs";

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      validate: [validator.isEmail, "Invalid email"],
      unique: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    country: {
      type: String,
      required: false,
    },
    bio: {
      type: String,
      required: false,
    },
    imageFile: {
      type: Buffer,
      required: false,
    },
    verificationToken: {
      type: String,
      required: false,
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      required: false,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      required: false,
      select: false,
    },
    following: [{
      type: Types.ObjectId,
      ref: 'User'
    }],
    followers: [{
      type: Types.ObjectId,
      ref: 'User'
    }],  
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err as Error);
  }
});

userSchema.methods.validatePassword = function (password: string) {
  return bcryptjs.compare(password, this.password);
};

export default model<UserDocument>("User", userSchema);