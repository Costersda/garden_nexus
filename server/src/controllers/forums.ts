import { Request, Response, NextFunction } from "express";
import { ExpressRequestInterface } from "../types/expressRequest.interface";
import { Forum } from "../models/forum";
import { Comment } from "../models/comment"; // Import the Comment model
import User from "../models/user";

// Create a new forum post
export const createForum = async (
  req: ExpressRequestInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = req;

    if (!user) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    const forumData = {
      ...req.body,
      user_id: user._id // Ensure user_id is set to the authenticated user's ID
    };

    const forum = new Forum(forumData);
    await forum.save();
    res.status(201).send(forum);
  } catch (error) {
    next(error);
  }
};

// Get all forum posts
export const getAllForums = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const forums = await Forum.find();
    res.status(200).send(forums);
  } catch (error) {
    next(error);
  }
};

// Get a single forum post by ID
export const getForumById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const forum = await Forum.findById(req.params.id).populate('comments');
    if (!forum) {
      return res.status(404).send();
    }
    res.status(200).send(forum);
  } catch (error) {
    next(error);
  }
};

// Get forum posts by categories
export const getForumsByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = req.query.categories?.toString().split(",");
    const forums = await Forum.find({ categories: { $in: categories } });
    res.status(200).send(forums);
  } catch (error) {
    next(error);
  }
};

// Get forum posts by username
export const getForumsByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    const forums = await Forum.find({ user_id: user._id });
    res.status(200).send(forums);
  } catch (error) {
    next(error);
  }
};

// Update a forum post by ID
export const updateForumById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const forum = await Forum.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!forum) {
      return res.status(404).send();
    }
    res.status(200).send(forum);
  } catch (error) {
    next(error);
  }
};

// Delete a forum post by ID
export const deleteForumById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const forum = await Forum.findByIdAndDelete(req.params.id);
    if (!forum) {
      return res.status(404).send();
    }

    // Delete all comments associated with the forum
    await Comment.deleteMany({ forumId: req.params.id });

    res.status(200).send(forum);
  } catch (error) {
    next(error);
  }
};

// Get a single forum post by ID including user information
export const getForumWithUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const forum = await Forum.findById(req.params.id).populate('comments');
    if (!forum) {
      return res.status(404).send();
    }

    const user = await User.findById(forum.user_id);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    res.status(200).send({ forum, user });
  } catch (error) {
    next(error);
  }
};

// Get forum posts by search query and categories
export const getForumsBySearch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query, categories } = req.query;

    const searchCriteria: any = {};

    if (typeof query === 'string' && query.trim() !== '') {
      searchCriteria.$text = { $search: query };
    }

    if (typeof categories === 'string' && categories.trim() !== '') {
      searchCriteria.categories = { $in: categories.split(',') };
    }

    const forums = await Forum.find(searchCriteria);
    res.status(200).send(forums);
  } catch (error) {
    next(error);
  }
};
