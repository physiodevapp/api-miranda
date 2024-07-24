
import { config as dotEnvConfig } from 'dotenv';
import logger from 'morgan';
import express, { Response, Request, NextFunction } from 'express';
import { checkRequestAuth, isAuth } from "./middlewares/secure.middleware";
import { router as userRoutes } from './controllers/user.controller';
import { router as roomRoutes } from './controllers/room.controller';
import { router as contactRoutes } from './controllers/contact.controller';
import { router as bookingRoutes } from './controllers/booking.controller';
import { APIError } from './utils/APIError';
import mustache from "mustache";
import fs from 'fs';
import cookieParser from "cookie-parser";
import { generateToken } from './utils/token';

dotEnvConfig();

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

app.post('/login', (req: Request, res: Response, next: NextFunction) => {

  if (req.user) {
    res.clearCookie('token')

    res.redirect('/');
  }

  const { email, password } = req.body;

  if (email === "admin.miranda@example.com" && password === "0000") {
    const payload = { email, password };
    const token = generateToken(payload);
  
    res.cookie('token', token, { httpOnly: true });

    res.redirect("/");
  } else {
    const error = new APIError("Invalid credentials", 401, true);

    next(error);
  }   
});

app.get('/', (req: Request, res: Response) => {
  res.render('index', {user: req.user});
});

app.use('/users', isAuth, userRoutes);
app.use('/rooms', isAuth, roomRoutes);
app.use('/bookings', isAuth, bookingRoutes);
app.use('/contacts', isAuth, contactRoutes);

app.use((error: APIError, _req: Request, res: Response, _next: NextFunction) => {
  res.status(error.status || 500).json({message: error.safe ? error.message : "Application error"})
});

