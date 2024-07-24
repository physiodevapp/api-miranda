import { BookingInterface, BookingRoomType, BookingStatusType } from '../interfaces/Booking.interface';
import bookingDataList from '../data/bookings.json';
import { APIError } from '../utils/APIError';

export class Booking implements BookingInterface {
  id: string;
  first_name: string;
  last_name: string;
  order_date: string;
  check_in: string;
  check_out: string;
  room_type: BookingRoomType;
  room_number: number;
  status: BookingStatusType;
  special_request: string;

  constructor(booking: BookingInterface) {
    this.id = booking.id;
    this.first_name = booking.first_name;
    this.last_name = booking.last_name;
    this.order_date = booking.order_date;
    this.check_in = booking.check_in;
    this.check_out = booking.check_out;
    this.room_type = booking.room_type;
    this.room_number = booking.room_number;
    this.status = booking.status;
    this.special_request = booking.special_request;
  }

  static fetchOne (bookingId: string): Booking | void {
    const bookingList = bookingDataList as Booking[]
    if (!bookingList)
      throw new APIError("There is no bookings data", 500, false);

    const booking = bookingList.find((booking: Booking) => booking.id === bookingId)
    if (!booking)
      throw new APIError("Booking not found", 400, true)
    
    return booking;
  }

  static fetchAll (searchTerm: string): Booking[] | void {
    const bookingList = bookingDataList as Booking[]
    
    if (!bookingList)
      throw new APIError("There is no users data", 500, false);

    const filteredBookingList = bookingList.filter((booking: Booking) => booking.first_name.includes(searchTerm) || booking.last_name.includes(searchTerm))

    return filteredBookingList;
  }
}