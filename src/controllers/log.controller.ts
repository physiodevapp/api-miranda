import { Request, Response, NextFunction } from 'express';
import { generateToken } from '../utils/token';
import { APIError } from '../utils/APIError';
import { User } from '../models/user.model';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  const user = await User.findOne({email});

  if (!user) {

    res.status(404).json({ message: 'User not found' });

  } else {
    const isValid = await user.checkPassword(password); 
    if (isValid) {
      const payload = { email, password };
  
      const token = generateToken(payload);
    
      res.cookie('token', token, { httpOnly: true });
  
      res.redirect(302, "/");
    } else {
      const error = new APIError("Invalid credentials", 401, true);
  
      next(error);
    } 
  }
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
  if (req.user) {
    res.clearCookie('token');
    
    res.redirect(302, "/");
  } else {
    const error = new APIError("User is not authenticated", 401, true);

    next(error)
  }
};