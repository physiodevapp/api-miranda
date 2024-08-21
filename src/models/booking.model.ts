import mongoose, { Schema, model } from "mongoose";
import {
  BookingInterface,
  BookingStatusType,
} from "../interfaces/Booking.interface";

const bookingSchema = new Schema<BookingInterface>(
  {
    first_name: { type: String, required: [true, "First name is required"] },
    last_name: { type: String, required: [true, "Last name is required"] },
    order_date: { type: String, required: [true, "Order date is required"] },
    check_in: { type: String, required: true },
    check_out: { type: String, required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    status: { type: String, enum: Object.values(BookingStatusType), required: true },
    special_request: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret) {
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

export const Booking = model<BookingInterface>("Booking", bookingSchema)
