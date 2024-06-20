import { Request, Response, NextFunction } from "express";
import { ExpressRequestInterface } from "../types/expressRequest.interface";
import { Blog } from "../models/blog";
import  User  from "../models/user"; // Assuming you have a User model

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
      user_id: user._id // Ensure user_id is set to the authenticated user's ID
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
    const blogs = await Blog.find({ categories: { $in: categories } });
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
    res.status(200).send(blog);
  } catch (error) {
    next(error);
  }
};
