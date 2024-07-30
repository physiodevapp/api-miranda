import { Request, Response, NextFunction } from "express";
import { APIError } from "../utils/APIError";
import { verifyToken } from "../utils/token";
import { User } from "../models/user.model";

export const checkRequestAuth = (async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;

    if (!token)
      return next();

    const decoded = verifyToken(token);

    if (typeof decoded.sub === 'object' && decoded.sub !== null && 'email' in decoded.sub && 'password' in decoded.sub) {
      req.user = await User.findOne({email: decoded.sub.email});
    } else {
      return next(new APIError("Invalid schema of the token", 401, false));
    }
  } catch (error) {
    return next(new APIError("Invalid token", 401, true));
  }

  next(); 
});


export const isAuth = (req: Request, _res: Response, next: NextFunction) => {
  if (req.user) {
    next()
  } else {
    const error = new APIError("Protected route", 401, true);

    next(error);
  }
}