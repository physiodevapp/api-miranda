import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { APIError } from "../utils/APIError";

interface DecodedToken {
  sub: {
    email: string;
  } | string;
}

export const addAuthHeader = (req: Request, _res: Response, next: NextFunction) => {
  const payload = { email: "admin.miranda@example.com" };
  const secretKey: string = process.env.SECRET_KEY || 'exAmpL3_seCreT_K3y';
  const token = jwt.sign({ sub: payload }, secretKey, { expiresIn: '1h' });

  req.headers['authorization'] = `Bearer ${token}`;

  next();
};


export const auth = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")?.[1]
  if (!token) {
    const error = new APIError("Missing token", 401, true)
    next(error)

    return
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY || 'exAmpL3_seCreT_K3y') as DecodedToken
    if (typeof decoded.sub === 'object' && decoded.sub !== null && 'email' in decoded.sub) {
      req.user = decoded.sub;

      next();
    } else {
      const error = new APIError("Invalid token payload", 400, true);

      next(error);
    }
  } catch (error) {
    next(error)
  }
}