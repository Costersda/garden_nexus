import { Request, Response, NextFunction } from "express";
import { ExpressRequestInterface } from "../types/expressRequest.interface";
import { Server } from "socket.io";
import { Socket } from "../types/socket.interface";
import { Comment } from "../models/comment";

// Create a new comment
export const createComment = async (
  req: ExpressRequestInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const comment = new Comment(req.body);
    await comment.save();
    res.status(201).send(comment);
  } catch (error) {
    next(error);
  }
};

// Get all comments for a specific blog post
export const getAllComments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const comments = await Comment.find({ blogId: req.params.blogId });
    res.status(200).send(comments);
  } catch (error) {
    next(error);
  }
};

// Get a single comment by ID
export const getCommentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.id, blogId: req.params.blogId });
    if (!comment) {
      return res.status(404).send();
    }
    res.status(200).send(comment);
  } catch (error) {
    next(error);
  }
};

// Update a comment by ID
export const updateCommentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const comment = await Comment.findOneAndUpdate(
      { _id: req.params.id, blogId: req.params.blogId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!comment) {
      return res.status(404).send();
    }
    res.status(200).send(comment);
  } catch (error) {
    next(error);
  }
};

// Delete a comment by ID
export const deleteCommentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const comment = await Comment.findOneAndDelete({ _id: req.params.id, blogId: req.params.blogId });
    if (!comment) {
      return res.status(404).send();
    }
    res.status(200).send(comment);
  } catch (error) {
    next(error);
  }
};
