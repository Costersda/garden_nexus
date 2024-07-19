// usersController.ts
import { NextFunction, Request, Response } from "express";
import UserModel from "../models/user";
import { UserDocument } from "../types/user.interface";
import { Error } from "mongoose";
import jwt from "jsonwebtoken";
import { secret } from "../config";
import { ExpressRequestInterface } from "../types/expressRequest.interface";

const normalizeUser = (user: UserDocument) => {
  const token = jwt.sign({ id: user.id, email: user.email }, secret);
  return {
    email: user.email,
    username: user.username,
    id: user.id,
    token: `Bearer ${token}`,
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

    // Create and save new user
    const newUser = new UserModel({ email, username, password });
    const savedUser = await newUser.save();

    res.status(201).json(normalizeUser(savedUser));
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
    res.send(normalizeUser(user));
  } catch (error) {
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

    const { email, country, bio, imageFile } = user;
    res.status(200).json({
      email,
      username,
      country,
      bio,
      imageFile: imageFile ? imageFile.toString('base64') : null, // Convert image buffer to base64 string
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
