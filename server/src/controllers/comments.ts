import { Request, Response, NextFunction } from "express";
import { ExpressRequestInterface } from "../types/expressRequest.interface";
import { Comment } from "../models/comment";
import { CommentDocument } from "../types/comment.interface";

const normalizeComment = (comment: CommentDocument) => {
  const user = comment.user as any;
  let userImage = null;

  if (user && user.imageFile && Buffer.isBuffer(user.imageFile)) {
    const base64String = user.imageFile.toString('base64');
    userImage = `data:image/jpeg;base64,${base64String}`;
  }

  return {
    id: comment.id,
    blogId: comment.blogId,
    forumId: comment.forumId,
    comment: comment.comment,
    createdAt: comment.createdAt,
    isEdited: comment.isEdited,
    replyingTo: comment.replyingTo,
    user: user ? {
      id: user._id,
      username: user.username,
      imageFile: userImage
    } : null
  };
};

// Create a new comment
export const createComment = async (
  req: ExpressRequestInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const commentData = req.body;

    if (commentData.replyingTo && commentData.replyingTo.id) {
      commentData.replyingTo = commentData.replyingTo.id;
    } else {
      delete commentData.replyingTo;
    }

    const comment = new Comment(commentData);
    await comment.save();
    const populatedComment = await comment.populate('user', 'username imageFile');
    res.status(201).send(normalizeComment(populatedComment));
  } catch (error) {
    next(error);
  }
};

// Get all comments by blogId
export const getAllCommentsByBlogId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const comments = await Comment.find({ blogId: req.params.blogId })
      .populate('user', 'username imageFile')
      .populate('replyingTo', 'id user comment')
      .exec();
    res.status(200).send(comments.map(normalizeComment));
  } catch (error) {
    next(error);
  }
};

// Get all comments by forumId
export const getAllCommentsByForumId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const comments = await Comment.find({ forumId: req.params.forumId })
      .populate('user', 'username imageFile')
      .populate('replyingTo', 'id user comment')
      .exec();

    const normalizedComments = comments.map(comment => {
      try {
        return normalizeComment(comment);
      } catch (error) {
        console.error('Error normalizing comment:', error);
        return null;
      }
    }).filter(comment => comment !== null);

    res.status(200).send(normalizedComments);
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
    const comments = await Comment.find({ blogId: req.params.blogId })
      .populate('user', 'username imageFile')
      .populate('replyingTo', 'id user comment')
      .exec();
    const normalizedComments = comments.map(normalizeComment);
    res.status(200).send(normalizedComments);
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
    const comment = await Comment.findOne({ _id: req.params.id, blogId: req.params.blogId })
      .populate('user', 'username imageFile')
      .populate('replyingTo', 'id user comment')
      .exec();

    if (!comment) {
      return res.status(404).send();
    }

    res.status(200).send(normalizeComment(comment));
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
    const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate('user', 'username imageFile')
      .populate('replyingTo', 'id user comment');
    if (!comment) {
      return res.status(404).send({ message: "Comment not found" });
    }
    res.status(200).send(normalizeComment(comment));
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
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) {
      return res.status(404).send({ message: "Comment not found" });
    }
    res.status(200).send({ message: "Comment deleted successfully" });
  } catch (error) {
    next(error);
  }
};