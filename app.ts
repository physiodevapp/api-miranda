
import express from "express";
import { config as dotEnvConfig } from 'dotenv';
import logger from 'morgan';
import { router as userRoutes } from './controllers/user.controller';
import { router as roomRoutes } from './controllers/room.controller';
import { router as contactRoutes } from './controllers/contact.controller';
import { router as bookingRoutes } from './controllers/booking.controller';
import { Response, Request, NextFunction } from 'express';
import { APIError } from './utils/APIError';
import { addAuthHeader, auth } from "./middlewares/secure.middleware";
import { app  } from "./server";

dotEnvConfig();

app.use(logger("dev"));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(addAuthHeader(true));

app.use('/users', auth, userRoutes);
app.use('/rooms', auth, roomRoutes);
app.use('/bookings', auth, bookingRoutes);
app.use('/contacts', auth, contactRoutes);

app.use((error: APIError, _req: Request, res: Response, _next: NextFunction) => {
  res.status(error.status || 500).json({message: error.safe ? error.message : "Application error"})
});

