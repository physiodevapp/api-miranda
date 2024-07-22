
import Express from "express";
import { app  } from "./server";
import logger from 'morgan';
import { router as userRoutes } from './controllers/user.controller';
import { Response, Request, NextFunction } from 'express';
import { APIError } from './utils/APIError';

app.use(logger("dev"));

app.use(Express.json());

app.use(Express.urlencoded({ extended: true }));

app.use('/users', userRoutes);

app.use((error: APIError, _req: Request, res: Response, _next: NextFunction) => {
  res.status(error.status || 500).json({message: error.safe ? error.message : "Application error"})
})

