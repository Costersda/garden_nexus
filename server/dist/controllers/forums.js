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
exports.getForumsBySearch = exports.getForumWithUserById = exports.deleteForumById = exports.updateForumById = exports.getForumsByUser = exports.getForumsByCategory = exports.getForumById = exports.getAllForums = exports.createForum = void 0;
const forum_1 = require("../models/forum");
const comment_1 = require("../models/comment");
const user_1 = __importDefault(require("../models/user"));
// Create a new forum post
const createForum = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req;
        if (!user) {
            return res.status(401).send({ error: "Unauthorized" });
        }
        const forumData = Object.assign(Object.assign({}, req.body), { user_id: user._id });
        const forum = new forum_1.Forum(forumData);
        yield forum.save();
        res.status(201).send(forum);
    }
    catch (error) {
        next(error);
    }
});
exports.createForum = createForum;
// Get all forum posts
const getAllForums = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const forums = yield forum_1.Forum.find();
        res.status(200).send(forums);
    }
    catch (error) {
        next(error);
    }
});
exports.getAllForums = getAllForums;
// Get a single forum post by ID
const getForumById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const forum = yield forum_1.Forum.findById(req.params.id).populate('comments');
        if (!forum) {
            return res.status(404).send();
        }
        res.status(200).send(forum);
    }
    catch (error) {
        next(error);
    }
});
exports.getForumById = getForumById;
// Get forum posts by categories
const getForumsByCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const categories = (_a = req.query.categories) === null || _a === void 0 ? void 0 : _a.toString().split(",");
        const forums = yield forum_1.Forum.find({ categories: { $in: categories } });
        res.status(200).send(forums);
    }
    catch (error) {
        next(error);
    }
});
exports.getForumsByCategory = getForumsByCategory;
// Get forum posts by username
const getForumsByUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.params;
        const user = yield user_1.default.findOne({ username });
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        const forums = yield forum_1.Forum.find({ user_id: user._id });
        res.status(200).send(forums);
    }
    catch (error) {
        next(error);
    }
});
exports.getForumsByUser = getForumsByUser;
// Update a forum post by ID
const updateForumById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const forum = yield forum_1.Forum.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!forum) {
            return res.status(404).send();
        }
        res.status(200).send(forum);
    }
    catch (error) {
        next(error);
    }
});
exports.updateForumById = updateForumById;
// Delete a forum post by ID
const deleteForumById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const forum = yield forum_1.Forum.findByIdAndDelete(req.params.id);
        if (!forum) {
            return res.status(404).send();
        }
        // Delete all comments associated with the forum
        yield comment_1.Comment.deleteMany({ forumId: req.params.id });
        res.status(200).send(forum);
    }
    catch (error) {
        next(error);
    }
});
exports.deleteForumById = deleteForumById;
// Get a single forum post by ID
const getForumWithUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const forum = yield forum_1.Forum.findById(req.params.id).populate('comments');
        if (!forum) {
            return res.status(404).send();
        }
        const user = yield user_1.default.findById(forum.user_id);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        res.status(200).send({ forum, user });
    }
    catch (error) {
        next(error);
    }
});
exports.getForumWithUserById = getForumWithUserById;
// Get forum posts by search query and categories
const getForumsBySearch = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query, categories } = req.query;
        const searchCriteria = {};
        if (typeof query === 'string' && query.trim() !== '') {
            searchCriteria.$text = { $search: query };
        }
        if (typeof categories === 'string' && categories.trim() !== '') {
            searchCriteria.categories = { $in: categories.split(',') };
        }
        const forums = yield forum_1.Forum.find(searchCriteria);
        res.status(200).send(forums);
    }
    catch (error) {
        next(error);
    }
});
exports.getForumsBySearch = getForumsBySearch;
//# sourceMappingURL=forums.js.map