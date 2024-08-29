import { Types } from "mongoose";

export enum BookingStatusType {
  Check_in = "check_in",
  Check_out = "check_out",
  In_progress = "in_progress"
}

export interface BookingInterface {
  id: string,
  status_id: number,
  first_name: string,
  last_name: string,
  order_date: Date,
  check_in: Date,
  check_out: Date,
  room: Types.ObjectId,
  special_request: string,
  status?: BookingStatusType,
  createdAt?: Date,
  updatedAt?: Date,
}