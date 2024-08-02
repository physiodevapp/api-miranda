import { Request, Response, NextFunction } from "express";
import { APIError } from "../utils/APIError";
import { verifyToken } from "../utils/token";
import { User } from "../models/user.model";

export const checkRequestAuth = (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;

    if (!token)
      return next();

    const decoded = verifyToken(token);

    if (typeof decoded.sub === 'object' && decoded.sub !== null && 'email' in decoded.sub && 'password' in decoded.sub) {
      req.user = await User.findOne({email: decoded.sub.email});
    } else {
      return next(new APIError({message: "Invalid schema of the token", status: 401, safe: false}));
    }
  } catch (error) {
    res.clearCookie('token');

    return next(new APIError({message: "Invalid token", status: 401, safe: true}));
  }

  next(); 
});


export const isAuth = (req: Request, _res: Response, next: NextFunction) => {
  if (req.user) {
    next()
  } else {
    const error = new APIError({message: "Protected route", status: 401, safe: true});

    next(error);
  }
}