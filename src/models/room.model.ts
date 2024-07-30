import { Schema, model } from "mongoose";
import { RoomInterface, RoomStatusType } from '../interfaces/Room.interface';

const roomSchema = new Schema<RoomInterface>(
  {
    number: { Number, required: true },
    description: { String },
    facilities: [String],
    name: { String, required: true },
    cancellation_policy: { String, required: true },
    has_offer: { Boolean, default: false },
    type: {
      String,
      enum: ["Single Bed", "Double Bed", "Double Superior", "Suite"],
      default: "Double Bed",
    },
    price_night: { Number, required: true },
    discount: { Number, default: 0 },
    status: { String, enum: Object.values(RoomStatusType), default: RoomStatusType.Available},
    photos: [String],
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

export const Room = model<RoomInterface>("Room", roomSchema);
