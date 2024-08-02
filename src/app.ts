
import logger from 'morgan';
import express, { Response, Request, NextFunction } from 'express';
import { checkRequestAuth, isAuth } from "./middlewares/secure.middleware";
import { router as userRoutes } from './controllers/user.controller';
import { router as roomRoutes } from './controllers/room.controller';
import { router as contactRoutes } from './controllers/contact.controller';
import { router as bookingRoutes } from './controllers/booking.controller';
import { login, logout } from './controllers/log.controller';
import { APIError } from './utils/APIError';
import mustache from "mustache";
import fs from 'fs';
import cookieParser from "cookie-parser";
import { headers } from './middlewares/response.middleware';
import mongoose from 'mongoose';
import { connectDB } from './config/db.config';

if (process.env.NODE_ENV !== 'test') 
  connectDB();

export const app = express();

app.use(logger("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(`${__dirname}/public`))

app.engine('mustache', (filePath, options, callback) => {
  fs.readFile(filePath, (err, content) => {
    if (err) return callback(err);

    const rendered = mustache.render(content.toString(), options);
    
    return callback(null, rendered);
  });
});
app.set('view engine', 'mustache');
app.set('views', `${__dirname}/views`);

app.use(checkRequestAuth);

app.post('/login', headers, login);
app.post('/logout', headers, logout);
app.get('/', (req: Request, res: Response) => {
  res.render('index', {user: req.user});
});
app.use('/users', isAuth, userRoutes);
app.use('/rooms', isAuth, roomRoutes);
app.use('/bookings', isAuth, bookingRoutes);
app.use('/contacts', isAuth, contactRoutes);

app.use((_req, _res, next) => {
  next(new APIError({message: 'Resource not found', status: 404, safe: true}))
})

app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof mongoose.Error.ValidationError) {
    error = new APIError({message: error.message, status: 400, safe: true})
  } else if (error instanceof mongoose.Error.CastError
    && error.path === '_id') {
    const modelNameMatch = error.stack!.match(/for model "(.+?)"/);
    const modelName = modelNameMatch ? modelNameMatch[1] : undefined;

    error = new APIError({message: `${modelName} not found`, status: 404, safe: true})
  } else if (error.message.includes('E11000')) {
    Object.keys(error.keyValue).forEach((key) => error.keyValue[key] = "Already exists")
    
    error = new APIError({message: "Duplicate key error", status: 409, safe: true, errors: error.keyValue})
  } else if (!error.status) {
    error = new APIError({message: error.message || "Internal Server Error", status: 500, safe: true})
  }

  interface errorData {
    message: string,
    errors?: {
      [key: string]: string;
    };
  }

  const errorData: errorData = {
    message: error.safe ? error.message : "Application error"
  }

  if (error as APIError && error.errors) {
    const errors = Object.keys(error.errors)
      .reduce((errors, errorKey) => {
        errors![errorKey] = error.errors[errorKey]?.message || error.errors[errorKey]

        return errors
      }, {} as {[key: string]: string});

      errorData.errors = errors
  }

  res.status(error.status || 500).json(errorData)
});

