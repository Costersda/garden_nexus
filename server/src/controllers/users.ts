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
    const newUser = new UserModel({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    });
    const savedUser = await newUser.save();
    res.send(normalizeUser(savedUser));
  } catch (err) {
    if (err instanceof Error.ValidationError) {
      const messages = Object.values(err.errors).map((err) => err.message);
      return res.status(422).json(messages);
    }
    next(err);
  }
};

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
      console.log('No user found in request');
      return res.sendStatus(401);
    }

    const user = await UserModel.findById(req.user.id);
    if (!user) {
      console.log('User not found in database');
      return res.sendStatus(404);
    }

    console.log('User found:', user);
    res.send(normalizeUser(user));
  } catch (error) {
    console.error('Error fetching user:', error);
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
