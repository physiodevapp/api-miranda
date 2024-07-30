
export enum BookingRoomType {
  Single_bed = "Single Bed",
  Double_bed = "Double Bed",
  Double_superior = "Double Superior",
  Suite = "Suite"
}

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
  room_type: BookingRoomType,
  room_number: number,
  status: BookingStatusType,
  special_request: string,
  createdAt?: Date,
  updatedAt?: Date,
}