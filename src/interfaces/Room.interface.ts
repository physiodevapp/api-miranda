// export type RoomStatusType = "available" | "booked"

export enum RoomStatusType {
  Available = "available",
  Booked = "booked"
}

export interface RoomInterface {
  id: string,
  number: number,
  description: string,
  facilities: string[],
  name: string,
  cancellation_policy: string,
  has_offer: boolean,
  type: string,
  price_night: number,
  discount: number,
  status: RoomStatusType,
  photos: string[]
}