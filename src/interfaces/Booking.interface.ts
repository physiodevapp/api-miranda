import { Types } from "mongoose";

export enum BookingStatusType {
  Check_in = "check_in",
  Check_out = "check_out",
  In_progress = "in_progress"
}

export interface BookingInterface {
  id: string,
  first_name: string,
  last_name: string,
  order_date: string,
  check_in: string,
  check_out: string,
  room: Types.ObjectId,
  status: BookingStatusType,
  special_request: string,
  createdAt?: Date,
  updatedAt?: Date,
}