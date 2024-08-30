export enum RoomStatusType {
  Available = "available",
  Booked = "booked"
}

export enum RoomType {
  Single_bed = "Single Bed",
  Double_bed = "Double Bed",
  Double_superior = "Double Superior",
  Suite = "Suite"
}

export enum RoomFacility {
  Air_conditioner = "Air conditioner",
  High_speed_WiFi = "High speed WiFi",
  Breakfast = "Breakfast",
  Kitchen = "Kitchen",
  Cleaning = "Cleaning",
  Shower = "Shower",
  Grocery = "Grocery",
  Single_bed = "Single bed",
  Shop_near = "Shop near",
  Towels = "Towels"
}

export interface RoomInterface {
  id: string,
  status_id: number,
  number: number,
  description: string,
  facilities: string[],
  name: string,
  cancellation_policy: string,
  has_offer: boolean,
  type: RoomType,
  price_night: number,
  discount: number,
  photos: string | string[],
  status?: RoomStatusType,
  createdAt?: Date,
  updatedAt?: Date,
}