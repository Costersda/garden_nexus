// usersController.ts
import { NextFunction, Request, Response } from "express";
import UserModel from "../models/user";
import { UserDocument } from "../types/user.interface";
import { Error } from "mongoose";
import jwt from "jsonwebtoken";
import { ExpressRequestInterface } from "../types/expressRequest.interface";
import { Blog } from "../models/blog";
import { Comment } from "../models/comment";
import { Forum } from "../models/forum";
import crypto from 'crypto';
import { sendPasswordResetEmail, sendVerificationEmail } from "../services/emailService";
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables');
}

const normalizeUser = (user: UserDocument) => {
  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET as string
  );
  return {
    email: user.email,
    username: user.username,
    id: user.id,
    token: `Bearer ${token}`,
    isVerified: user.isVerified  // Add this line
  };
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, username, password } = req.body;

    // Check for existing user
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const message =
        existingUser.username === username
          ? 'Username is already taken'
          : 'Email is already in use';
      return res.status(409).json({ message });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create and save new user
    const newUser = new UserModel({ 
      email, 
      username, 
      password, 
      verificationToken,
      isVerified: false 
    });
    const savedUser = await newUser.save();

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    // Generate token and return user info
    const normalizedUser = normalizeUser(savedUser);

    // Return only the normalized user data
    res.status(201).json(normalizedUser);
  } catch (err) {
    if (isMongoError(err) && err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      const message = `${field.charAt(0).toUpperCase() + field.slice(1)} is already in use.`;
      return res.status(409).json({ message });
    } else if (isValidationError(err)) {
      const messages = Object.values(err.errors).map((err) => err.message);
      return res.status(422).json(messages);
    }
    next(err);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;
    const user = await UserModel.findOne({ verificationToken: token });

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/verify-failed`);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    // Redirect to the frontend verification success page
    res.redirect(`${process.env.FRONTEND_URL}/verify-success`);
  } catch (error) {
    console.error('Error during email verification:', error);
    res.redirect(`${process.env.FRONTEND_URL}/verify-failed`);
  }
};

export const resendVerificationEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    // Generate a new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    // Send the new verification email
    await sendVerificationEmail(email, verificationToken);

    res.status(200).json({ message: 'Verification email resent successfully' });
  } catch (error) {
    console.error('Error resending verification email:', error);
    res.status(500).json({ message: 'Error resending verification email', error });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      // Don't reveal that the user doesn't exist
      return res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour

    // Save reset token and expiration to user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(resetTokenExpiration);
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send email
    await sendPasswordResetEmail(user.email, resetUrl);

    res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ message: 'An error occurred while processing your request' });
  }
};


// Type guard for MongoDB errors
function isMongoError(error: unknown): error is { code: number, keyValue: Record<string, any> } {
  return typeof error === 'object' && error !== null && 'code' in error && 'keyValue' in error;
}

// Type guard for Mongoose validation errors
function isValidationError(error: unknown): error is { errors: Record<string, any> } {
  return typeof error === 'object' && error !== null && 'errors' in error;
}

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email }).select(
      "+password"
    );
    const errors = { emailOrPassword: "Incorrect email or password" };

    if (!user) {
      return res.status(422).json(errors);
    }

    const isSamePassword = await user.validatePassword(req.body.password);

    if (!isSamePassword) {
      return res.status(422).json(errors);
    }

    res.send(normalizeUser(user));
  } catch (err) {
    next(err);
  }
};

export const currentUser = async (req: ExpressRequestInterface, res: Response) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.sendStatus(404);
    }
    res.json(normalizeUser(user));  // This will now include isVerified
  } catch (error) {
    console.error('Error in currentUser:', error);
    res.status(500).json({ message: 'Error fetching user', error });
  }
};


export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username } = req.params;
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { email, country, bio, imageFile, isVerified } = user;
    res.status(200).json({
      email,
      username,
      country,
      bio,
      imageFile: imageFile ? imageFile.toString('base64') : null,
      isVerified // Include this field
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error });
  }
};

export const updateProfile = async (req: ExpressRequestInterface, res: Response, next: NextFunction) => {
  try {
    const { username } = req.params;
    const { country, bio, imageFile } = req.body;

    // Check if the authenticated user is the owner of the profile
    if (req.user?.username !== username) {
      return res.status(403).json({ message: "You can only edit your own profile" });
    }

    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.country = country || user.country;
    user.bio = bio || user.bio;

    if (imageFile) {
      user.imageFile = Buffer.from(imageFile, "base64");
    }

    await user.save();

    res.status(200).json({
      email: user.email,
      username: user.username,
      country: user.country,
      bio: user.bio,
      imageFile: user.imageFile ? user.imageFile.toString("base64") : null,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error });
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error });
  }
};

export const checkUserCredentialsAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email } = req.query;

    if (!username && !email) {
      return res.status(400).json({ message: 'Username or email is required' });
    }

    const user = await UserModel.findOne({
      $or: [
        { username: username ? username : '' },
        { email: email ? email : '' }
      ]
    });

    if (user) {
      const message = user.username === username ? 'Username is already taken' : 'Email is already in use';
      return res.json({
        available: false,
        message
      });
    }

    return res.json({ available: true });
  } catch (error) {
    console.error('Error checking credentials availability:', error);
    res.status(500).json({ message: 'Error checking credentials availability', error });
  }
};

export const deleteProfile = async (req: ExpressRequestInterface, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = req.user.id;

    // Delete user's blogs
    await Blog.deleteMany({ user_id: userId });

    // Delete user's forums
    await Forum.deleteMany({ user_id: userId });

    // Delete user's comments
    await Comment.deleteMany({ user: userId });

    // Delete comments on user's blogs
    const userBlogs = await Blog.find({ user_id: userId });
    for (const blog of userBlogs) {
      await Comment.deleteMany({ blogId: blog._id });
    }

    // Delete comments on user's forums
    const userForums = await Forum.find({ user_id: userId });
    for (const forum of userForums) {
      await Comment.deleteMany({ forumId: forum._id });
    }

    // Delete the user
    const deletedUser = await UserModel.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile and associated content deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({ message: "An error occurred while deleting the profile", error });
  }
};
