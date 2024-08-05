"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlogsBySearch = exports.getBlogWithUserById = exports.deleteBlogById = exports.updateBlogById = exports.getBlogsByUser = exports.getBlogsByCategory = exports.getBlogById = exports.getAllBlogs = exports.createBlog = void 0;
const blog_1 = require("../models/blog");
const comment_1 = require("../models/comment");
const user_1 = __importDefault(require("../models/user"));
// Create a new blog post
const createBlog = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req;
        if (!user) {
            return res.status(401).send({ error: "Unauthorized" });
        }
        const blogData = Object.assign(Object.assign({}, req.body), { user_id: user._id });
        const blog = new blog_1.Blog(blogData);
        yield blog.save();
        res.status(201).send(blog);
    }
    catch (error) {
        next(error);
    }
});
exports.createBlog = createBlog;
// Get all blog posts
const getAllBlogs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blogs = yield blog_1.Blog.find();
        res.status(200).send(blogs);
    }
    catch (error) {
        next(error);
    }
});
exports.getAllBlogs = getAllBlogs;
// Get a single blog post by ID
const getBlogById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blog = yield blog_1.Blog.findById(req.params.id).populate('comments');
        if (!blog) {
            return res.status(404).send();
        }
        res.status(200).send(blog);
    }
    catch (error) {
        next(error);
    }
});
exports.getBlogById = getBlogById;
// Get blog posts by categories
const getBlogsByCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const categories = (_a = req.query.categories) === null || _a === void 0 ? void 0 : _a.toString().split(",");
        const blogs = yield blog_1.Blog.find({ category: { $in: categories } });
        res.status(200).send(blogs);
    }
    catch (error) {
        next(error);
    }
});
exports.getBlogsByCategory = getBlogsByCategory;
// Get blog posts by username
const getBlogsByUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.params;
        const user = yield user_1.default.findOne({ username });
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        const blogs = yield blog_1.Blog.find({ user_id: user._id });
        res.status(200).send(blogs);
    }
    catch (error) {
        next(error);
    }
});
exports.getBlogsByUser = getBlogsByUser;
// Update a blog post by ID
const updateBlogById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blog = yield blog_1.Blog.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!blog) {
            return res.status(404).send();
        }
        res.status(200).send(blog);
    }
    catch (error) {
        next(error);
    }
});
exports.updateBlogById = updateBlogById;
// Delete a blog post by ID
const deleteBlogById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blog = yield blog_1.Blog.findByIdAndDelete(req.params.id);
        if (!blog) {
            return res.status(404).send();
        }
        // Delete all comments associated with the blog
        yield comment_1.Comment.deleteMany({ blogId: req.params.id });
        res.status(200).send(blog);
    }
    catch (error) {
        next(error);
    }
});
exports.deleteBlogById = deleteBlogById;
// Get a single blog post by ID including user information
const getBlogWithUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blog = yield blog_1.Blog.findById(req.params.id).populate('comments');
        if (!blog) {
            return res.status(404).send();
        }
        const user = yield user_1.default.findById(blog.user_id);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        res.status(200).send({ blog, user });
    }
    catch (error) {
        next(error);
    }
});
exports.getBlogWithUserById = getBlogWithUserById;
// Get blog posts by search query and categories
const getBlogsBySearch = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query, categories } = req.query;
        const searchCriteria = {};
        if (typeof query === 'string' && query.trim() !== '') {
            searchCriteria.$text = { $search: query };
        }
        if (typeof categories === 'string' && categories.trim() !== '') {
            searchCriteria.categories = { $in: categories.split(',') };
        }
        const blogs = yield blog_1.Blog.find(searchCriteria);
        res.status(200).send(blogs);
    }
    catch (error) {
        next(error);
    }
});
exports.getBlogsBySearch = getBlogsBySearch;
//# sourceMappingURL=blogs.js.map