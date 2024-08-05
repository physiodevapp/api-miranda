
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
import { connectDB } from './config/db.config';
import { handleError } from './controllers/error.controller';
import serverless from 'serverless-http';
import cors from 'cors';

export const app = express();

app.use(cors());

if (process.env.NODE_ENV !== 'test') 
  connectDB();

app.use(logger("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const stage = process.env.STAGE;
const basePath = stage ? `/${stage}` : '';
console.log('`${basePath}/` ', `${basePath}/`);

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

app.use((_req: Request, res: Response, next: NextFunction) => {
  res.locals.basePath = basePath;
  next();
});

app.use(checkRequestAuth);

app.post(`/login`, headers, login);
app.post(`/logout`, headers, logout);
app.get(`/`, (req: Request, res: Response) => res.render('index', {user: req.user}));
app.use(`/users`, isAuth, userRoutes);
app.use(`/rooms`, isAuth, roomRoutes);
app.use(`/bookings`, isAuth, bookingRoutes);
app.use(`/contacts`, isAuth, contactRoutes);

app.use((_req, _res, next) => next(new APIError({message: 'Resource not found', status: 404, safe: true})))

app.use(handleError);

export const handler = serverless(app);

