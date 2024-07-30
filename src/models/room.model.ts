import { Schema, model } from "mongoose";
import {
  RoomFacility,
  RoomInterface,
  RoomStatusType,
  RoomType,
} from "../interfaces/Room.interface";

const roomSchema = new Schema<RoomInterface>(
  {
    number: { type: Number, required: [true, "Room number is required"], unique: true },
    description: { type: String },
    facilities: { type: [String], enum: Object.values(RoomFacility) },
    name: { type: String, required: true },
    cancellation_policy: { type: String, required: true },
    has_offer: { type: Boolean, default: false },
    type: {
      type: String,
      enum: Object.values(RoomType),
      default: RoomType.Double_bed,
    },
    price_night: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: Object.values(RoomStatusType),
      default: RoomStatusType.Available,
    },
    photos: { type: [String] },
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

export const Room = model<RoomInterface>("Room", roomSchema);
