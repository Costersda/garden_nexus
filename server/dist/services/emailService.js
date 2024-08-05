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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendVerificationEmail = void 0;
const AWS = __importStar(require("aws-sdk"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
const ses = new AWS.SES({ apiVersion: '2010-12-01' });
const sendVerificationEmail = (to, verificationToken) => __awaiter(void 0, void 0, void 0, function* () {
    const backendUrl = process.env.NODE_ENV === 'production'
        ? 'https://api.gardennexus.com' // Use your actual production API URL here
        : 'http://localhost:4001'; // Use your local backend port
    const verificationLink = `${backendUrl}/api/verify/${verificationToken}`;
    const params = {
        Source: 'Garden Nexus <noreply@gardennexus.com>',
        Destination: {
            ToAddresses: [to]
        },
        Message: {
            Subject: {
                Data: 'Welcome to Garden Nexus - Please Verify Your Email'
            },
            Body: {
                Html: {
                    Data: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email for GardenNexus</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; font-size: 16px; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #DDE5B6; color: #6C584C; text-align: center; padding: 20px; font-size: 20px; }
        .content { background-color: #f4f4f4; padding: 20px; border-radius: 5px; color: #000000; font-size: 16px; }
        .button { display: inline-block; background-color: #DDE5B6; color: #6C584C; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; }
        .footer { text-align: center; margin-top: 20px; font-size: 14px; color: #777; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Garden Nexus!</h1>
        </div>
        <div class="content">
            <p>Dear Garden Nexus Member,</p>
            <p>Thank you for joining our community. We're excited to have you on board!</p>
            <p>To complete your registration, please verify your email address by clicking the button below:</p>
            <p style="text-align: center;">
                <a href="${verificationLink}" class="button" style="color: #6C584C;">Verify My Email</a>
            </p>
            <p>If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
            <p>${verificationLink}</p>
            <p>This link will expire in 24 hours for security reasons.</p>
            <p>If you didn't create an account with Garden Nexus, please ignore this email.</p>
            <p>Happy Gardening!</p>
            <p>Best regards,<br>The Garden Nexus Team</p>
        </div>
        <div class="footer">
            <p>© 2024 GardenNexus. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
          `
                }
            }
        }
    };
    try {
        const result = yield ses.sendEmail(params).promise();
        console.log('Verification email sent:', result.MessageId);
        return result;
    }
    catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
});
exports.sendVerificationEmail = sendVerificationEmail;
const sendPasswordResetEmail = (to, resetUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const params = {
        Source: 'Garden Nexus <noreply@gardennexus.com>',
        Destination: {
            ToAddresses: [to]
        },
        Message: {
            Subject: {
                Data: 'Garden Nexus - Password Reset Request'
            },
            Body: {
                Html: {
                    Data: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset for GardenNexus</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; font-size: 16px; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #DDE5B6; color: #6C584C; text-align: center; padding: 20px; font-size: 20px; }
        .content { background-color: #f4f4f4; padding: 20px; border-radius: 5px; color: #000000; font-size: 16px; }
        .button { display: inline-block; background-color: #DDE5B6; color: #6C584C; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; }
        .footer { text-align: center; margin-top: 20px; font-size: 14px; color: #777; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Request</h1>
        </div>
        <div class="content">
            <p>Dear Garden Nexus Member,</p>
            <p>We received a request to reset the password for your Garden Nexus account. If you didn't make this request, you can safely ignore this email.</p>
            <p>To reset your password, please click the button below:</p>
            <p style="text-align: center;">
                <a href="${resetUrl}" class="button" style="color: #6C584C;">Reset My Password</a>
            </p>
            <p>If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
            <p>${resetUrl}</p>
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>
            <p>Best regards,<br>The Garden Nexus Team</p>
        </div>
        <div class="footer">
            <p>© 2024 GardenNexus. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
          `
                }
            }
        }
    };
    try {
        const result = yield ses.sendEmail(params).promise();
        console.log('Password reset email sent:', result.MessageId);
        return result;
    }
    catch (error) {
        console.error('Error sending password reset email:', error);
        throw error;
    }
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
//# sourceMappingURL=emailService.js.map