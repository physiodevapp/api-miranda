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
    const user = Booking.fetchOne(req.params.userId);
    
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

export const router = express.Router();

router.get("/", headers, list);
router.get("/:userId", headers, detail);