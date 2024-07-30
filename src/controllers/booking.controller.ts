import express, { Request, Response, NextFunction } from 'express';
import { headers } from '../middlewares/response.middleware';
import { getBookingById, getBookingList } from '../services/booking.service';
 
const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const searchTerm =  typeof req.query?.search_term === "string" ? req.query?.search_term : "";
    const bookingList = await getBookingList(searchTerm);

    res.json(bookingList);      
  } catch (error) {
    next(error);
  }
}

const detail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await getBookingById(req.params.bookingId);
    
    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
}

export const router = express.Router();

router.get("/", headers, list);
router.get("/:bookingId", headers, detail);