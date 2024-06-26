import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { secret } from '../config';
import UserModel from '../models/user';
import { ExpressRequestInterface } from '../types/expressRequest.interface';

export default async (
  req: ExpressRequestInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log('Authorization header not found');
      return res.sendStatus(401);
    }
    const token = authHeader.split(" ")[1];
    const data = jwt.verify(token, secret) as { id: string; email: string };
    console.log('Token data:', data);

    const user = await UserModel.findById(data.id);
    if (!user) {
      console.log('User not found');
      return res.sendStatus(401);
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Error in auth middleware:', err);
    res.sendStatus(401);
  }
};
