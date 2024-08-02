
export enum UserStatusType {
  Active = "active",
  Inactive = "inactive"
}

export enum UserJobType {
  Manager = "Manager",
  Reservation_desk = "Reservation desk",
  Room_service = "Room service"
}

export interface UserInterface {
  [key: string]: any;
  id: string,
  first_name: string,
  last_name: string,
  photo: string,
  start_date: string,
  job_description: string,
  telephone: string,
  status: UserStatusType,
  job: UserJobType,
  password: string,
  email: string,
  createdAt?: Date,
  updatedAt?: Date,
}
