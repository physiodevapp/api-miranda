import { Request, Response, NextFunction } from "express";
import { APIError } from "../utils/APIError";
import { verifyToken } from "../utils/token";
import { getPool } from "../config/dbMySQL.config";
import { RowDataPacket } from "mysql2";
import { UserInterface } from "../interfaces/User.interface";

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
      const pool = await getPool();
      const connection = await pool.getConnection();

      const [userRowList] = await connection.query<UserInterface[] & RowDataPacket[]>(
        `SELECT * FROM users WHERE email = ? `,
        [decoded.sub.email]
      );
      connection.release();

      req.user = userRowList[0];
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