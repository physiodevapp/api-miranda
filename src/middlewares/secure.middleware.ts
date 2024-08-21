import { Request, Response, NextFunction } from "express";
import { APIError } from "../utils/APIError";
import { verifyToken } from "../utils/token";
import { User } from "../models/user.model"; 

export const checkRequestAuth = (async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      return next();
    }

    const decoded = verifyToken(token);

    if (typeof decoded.sub === 'object' && decoded.sub !== null && 'email' in decoded.sub && 'password' in decoded.sub) {
      req.user = await User.findOne({email: decoded.sub.email});
    } else {
      return next(new APIError({message: "Invalid schema of the token", status: 401, safe: false}));
    }
  } catch (error) {

    return next(new APIError({message: "Invalid token", status: 401, safe: true}));
  }

  next(); 
});


export const isAuth = (req: Request, _res: Response, next: NextFunction) => {
  if (req.user) {
    next();
  } else {
    const error = new APIError({message: "Private route", status: 401, safe: true});

    next(error);
  }
}