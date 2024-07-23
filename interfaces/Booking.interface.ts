
export type BookingRoomType = "Single Bed" | "Double Bed" | "Double Superior" | "Suite"

export type BookingStatusType = "check_in" | "check_out" | "in_progress"


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
  special_request: string
}