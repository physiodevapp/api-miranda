import { Schema, model } from "mongoose";
import {
  BookingInterface,
  BookingStatusType,
} from "../interfaces/Booking.interface";
import { RoomType } from "../interfaces/Room.interface";

const bookingSchema = new Schema<BookingInterface>(
  {
    first_name: { String, required: [true, "First name is required"] },
    last_name: { String, required: [true, "Last name is required"] },
    order_date: { String, required: [true, "Order date is required"] },
    check_in: { String, required: true },
    check_out: { String, required: true },
    room_type: {
      String,
      enum: Object.values(RoomType),
      required: [true, "Room type is required"],
    },
    room_number: { Number, required: [true, "Room number is required"] },
    status: { String, enum: Object.values(BookingStatusType), required: true },
    special_request: { String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

export const Booking = model<BookingInterface>("Booking", bookingSchema)
