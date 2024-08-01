import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user';
import { ExpressRequestInterface } from '../types/expressRequest.interface';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check if JWT_SECRET is defined
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET is not defined in the environment variables');
}

interface JwtPayload {
  id: string;
  iat?: number;
}

// Middleware for authentication
export default async (
  req: ExpressRequestInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract the authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.sendStatus(401);
    }

    // Extract the token from the header
    const token = authHeader.split(" ")[1];

    // Verify the token
    const decoded = jwt.verify(token, jwtSecret);

    if (typeof decoded === 'object' && decoded !== null && 'id' in decoded) {
      const data = decoded as JwtPayload;

      // Find the user in the database
      const user = await UserModel.findOne({ _id: data.id }).select('+email +username +isVerified');
      if (!user) {
        return res.sendStatus(401);
      }

      // Attach the user to the request object
      req.user = user;
      next();
    } else {
      return res.sendStatus(401);
    }
  } catch (err) {
    res.sendStatus(401);
  }
};