import express, { Request, Response, NextFunction } from 'express';
import { headers } from '../middlewares/response.middleware';
import { generateToken } from '../utils/token';
import { APIError } from '../utils/APIError';


const login = (req: Request, res: Response, next: NextFunction) => {

  const { email, password } = req.body;

  if (email === "admin.miranda@example.com" && password === "0000") {
    const payload = { email, password };
    const token = generateToken(payload);
  
    res.cookie('token', token, { httpOnly: true });

    res.redirect(302, "/");
  } else {
    const error = new APIError("Invalid credentials", 401, true);

    next(error);
  }   
};

const logout = (req: Request, res: Response, next: NextFunction) => {
  if (req.user) {
    res.clearCookie('token');
    
    res.redirect(302, "/");
  } else {
    const error = new APIError("User is not authenticated", 401, true);

    next(error)
  }
};

export const router = express.Router();

router.get("/login", headers, login);
router.get("/logout", headers, logout);