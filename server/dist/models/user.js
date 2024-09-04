"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const mongoose_1 = require("mongoose");
const validator_1 = __importDefault(require("validator"));
const bcryptjs = __importStar(require("bcryptjs"));
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        validate: [validator_1.default.isEmail, "Invalid email"],
        unique: true,
        lowercase: true,
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        select: false, // Exclude password from query results by default
    },
    country: {
        type: String,
        required: false,
    },
    bio: {
        type: String,
        required: false,
    },
    imageFile: {
        type: Buffer,
        required: false,
    },
    verificationToken: {
        type: String,
        required: false,
        select: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    resetPasswordToken: {
        type: String,
        required: false,
        select: false,
    },
    resetPasswordExpires: {
        type: Date,
        required: false,
        select: false,
    },
    following: [{
            type: mongoose_1.Types.ObjectId,
            ref: 'User'
        }],
    followers: [{
            type: mongoose_1.Types.ObjectId,
            ref: 'User'
        }],
}, {
    timestamps: true,
});
// Case-insensitive index on the username field
userSchema.index({ username: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
// Middleware to hash password before saving
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password")) {
            return next();
        }
        try {
            const salt = yield bcryptjs.genSalt(10);
            this.password = yield bcryptjs.hash(this.password, salt);
            return next();
        }
        catch (err) {
            return next(err);
        }
    });
});
// Method to validate password
userSchema.methods.validatePassword = function (password) {
    return bcryptjs.compare(password, this.password);
};
exports.default = (0, mongoose_1.model)("User", userSchema);
//# sourceMappingURL=user.js.map