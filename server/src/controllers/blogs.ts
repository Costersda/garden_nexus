import { Request, Response, NextFunction } from "express";
import { ExpressRequestInterface } from "../types/expressRequest.interface";
import { Blog } from "../models/blog";
import { Comment } from "../models/comment";
import User from "../models/user";

// Create a new blog post
export const createBlog = async (
  req: ExpressRequestInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = req;

    if (!user) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    const blogData = {
      ...req.body,
      user_id: user._id
    };

    const blog = new Blog(blogData);
    await blog.save();
    res.status(201).send(blog);
  } catch (error) {
    next(error);
  }
};

// Get all blog posts
export const getAllBlogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const blogs = await Blog.find();
    res.status(200).send(blogs);
  } catch (error) {
    next(error);
  }
};

// Get a single blog post by ID
export const getBlogById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('comments');
    if (!blog) {
      return res.status(404).send();
    }
    res.status(200).send(blog);
  } catch (error) {
    next(error);
  }
};

// Get blog posts by categories
export const getBlogsByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = req.query.categories?.toString().split(",");
    const blogs = await Blog.find({ category: { $in: categories } });
    res.status(200).send(blogs);
  } catch (error) {
    next(error);
  }
};

// Get blog posts by username
export const getBlogsByUser = async (
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

    const blogs = await Blog.find({ user_id: user._id });
    res.status(200).send(blogs);
  } catch (error) {
    next(error);
  }
};

// Update a blog post by ID
export const updateBlogById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!blog) {
      return res.status(404).send();
    }
    res.status(200).send(blog);
  } catch (error) {
    next(error);
  }
};

// Delete a blog post by ID
export const deleteBlogById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).send();
    }

    // Delete all comments associated with the blog
    await Comment.deleteMany({ blogId: req.params.id });

    res.status(200).send(blog);
  } catch (error) {
    next(error);
  }
};

// Get a single blog post by ID including user information
export const getBlogWithUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('comments');
    if (!blog) {
      return res.status(404).send();
    }

    const user = await User.findById(blog.user_id);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    res.status(200).send({ blog, user });
  } catch (error) {
    next(error);
  }
};

// Get blog posts by search query and categories
export const getBlogsBySearch = async (
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

    const blogs = await Blog.find(searchCriteria);
    res.status(200).send(blogs);
  } catch (error) {
    next(error);
  }
};