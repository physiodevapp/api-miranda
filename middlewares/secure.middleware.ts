import { Request, Response, NextFunction } from "express";
import { APIError } from "../utils/APIError";
import { verifyToken } from "../utils/token";

export const checkRequestAuth = ((req: Request, _res: Response, next: NextFunction) => {
  const cookieToken: string = req.cookies.token;
  const headerToken = req.headers.authorization?.split(" ")[1];
  const token = headerToken ?? cookieToken;

  if (token) {
    const decoded = verifyToken(token);

    if (typeof decoded.sub === 'object' && decoded.sub !== null && 'email' in decoded.sub && decoded.sub.email === "admin.miranda@example.com" && decoded.sub.password === "0000") {
      req.headers['authorization'] = `Bearer ${token}`;

      req.user = decoded.sub;
    }
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