import { Types } from "mongoose";

export enum BookingStatusType {
  Check_in = "check_in",
  Check_out = "check_out",
  In_progress = "in_progress"
}

export interface BookingInterface {
  [key: string]: any;
  id: string,
  first_name: string,
  last_name: string,
  order_date: Date,
  check_in: Date,
  check_out: Date,
  room: Types.ObjectId,
  status: BookingStatusType,
  special_request: string,
  createdAt?: Date,
  updatedAt?: Date,
}