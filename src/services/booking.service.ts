import { BookingInterface } from "../interfaces/Booking.interface";
import { APIError } from "../utils/APIError";
import { Booking } from "../models/booking.model";

export const getBookingById = async (
  bookingId: string
): Promise<BookingInterface | void> => {
  try {
    const booking = await Booking.findById(bookingId).populate('room');
    if (!booking) throw new APIError({message: "Booking not found", status: 400, safe: true});

    return booking;
  } catch (error) {
    
    throw error;
  }
};

export const getBookingList = async (
  searchTerm: string
): Promise<BookingInterface[] | void> => {
  try {
    const searchRegex = new RegExp(searchTerm, "i");
    const bookingList = await Booking.find({
      $or: [
        { first_name: { $regex: searchRegex } },
        { last_name: { $regex: searchRegex } },
      ],
    }).populate('room');

    if (!bookingList) throw new APIError({message: "Bookings not found", status: 400, safe: true});

    return bookingList;
  } catch (error) {
    
    throw error;
  }
};

