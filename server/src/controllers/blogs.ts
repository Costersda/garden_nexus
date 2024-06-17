import { Request, Response, NextFunction } from "express";
import { ExpressRequestInterface } from "../types/expressRequest.interface";
import { Blog } from "../models/blog";

// Create a new blog post
export const createBlog = async (
  req: ExpressRequestInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const blog = new Blog(req.body);
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
