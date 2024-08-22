import mongoose, { Schema, model } from "mongoose";
import {
  BookingInterface,
  BookingStatusType,
} from "../interfaces/Booking.interface";
import { APIError } from "../utils/APIError";

const bookingSchema = new Schema<BookingInterface>(
  {
    first_name: { type: String, required: [true, "First name is required"] },
    last_name: { type: String, required: [true, "Last name is required"] },
    order_date: { type: Date, required: [true, "Order date is required"] },
    check_in: { type: Date, required: true },
    check_out: { type: Date, required: true },
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

bookingSchema.pre("save", async function (next) {
  const doc = this as BookingInterface & mongoose.Document; // Explicitly type `this`
  const dateFields: (keyof BookingInterface)[] = ['order_date', 'check_in', 'check_out'];

  dateFields.forEach((field) => {
    if (doc[field] && typeof doc[field] === 'string') {
      const date = new Date(doc[field] as string);

      if (!isNaN(date.getTime())) {
        doc[field] = date as unknown as Date;
      } else {
        const error = new APIError({ message: `Invalid date format for ${field}`, status: 400, safe: true });
        return next(error);
      }
    }
  });

  next();
});

export const Booking = model<BookingInterface>("Booking", bookingSchema)
