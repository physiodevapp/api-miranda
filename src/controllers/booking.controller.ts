import express, { Request, Response, NextFunction } from 'express';
import { headers } from '../middlewares/response.middleware';
import { Booking } from './../services/booking.service';
 
const list = (req: Request, res: Response, next: NextFunction) => {
  try {
    const searchTerm =  typeof req.query?.search_term === "string" ? req.query?.search_term : "";
    const bookingList = Booking.fetchAll(searchTerm);

    res.json(bookingList);      
  } catch (error) {
    next(error);
  }
}

const detail = (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = Booking.fetchOne(req.params.bookingId);
    
    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
}

export const router = express.Router();

router.get("/", headers, list);
router.get("/:bookingId", headers, detail);