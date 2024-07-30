import { BookingInterface } from "../interfaces/Booking.interface";
import { APIError } from "../utils/APIError";
import { Booking } from "../models/booking.model";

export const getBookingById = async (
  bookingId: string
): Promise<BookingInterface | void> => {
  try {
    const booking = await Booking.findById(bookingId).populate('room');
    if (!booking) throw new APIError("Booking not found", 400, true);

    return booking;
  } catch (error) {
    let errorMessage;

    if (error instanceof Error) errorMessage = error.message;
    else errorMessage = error;

    throw new APIError(
      `An error occurred when trying to get the booking: ${errorMessage}`,
      500,
      true
    );
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

    if (!bookingList) throw new APIError("Bookings not found", 400, true);

    return bookingList;
  } catch (error) {
    let errorMessage;

    if (error instanceof Error) errorMessage = error.message;
    else errorMessage = error;

    throw new APIError(
      `An error occurred when trying to get the bookings: ${errorMessage}`,
      500,
      true
    );
  }
};

