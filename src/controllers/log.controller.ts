import { Request, Response, NextFunction } from "express";
import { generateToken } from "../utils/token";
import { APIError } from "../utils/APIError";
import { User } from "../models/user.model";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  console.log('req.body ', req.body)

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404).json({ message: "User not found" });
  } else {
    const isValid = await user.checkPassword(password);
    if (isValid) {
      const payload = { email, password };

      const token = generateToken(payload);

      res.setHeader('Authorization', `Bearer ${token}`);
      res.setHeader('Access-Control-Expose-Headers', 'Authorization');

      res.status(200).json({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        photo: user.photo,
        email,
      });

    } else {
      const error = new APIError({
        message: "Invalid credentials",
        status: 401,
        safe: true,
      });

      next(error);
    }
  }
};
