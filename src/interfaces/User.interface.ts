
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
  job_id: number,
  status_id: number,
  first_name: string,
  last_name: string,
  photo: string,
  start_date: Date,
  job_description: string,
  telephone: string,
  password: string,
  email: string,
  status?: UserStatusType,
  job?: UserJobType,
  createdAt?: Date,
  updatedAt?: Date,
}
