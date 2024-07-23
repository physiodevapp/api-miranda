export type UserStatusType = "active" | "inactive"

export type UserJobType = "Manager" | "Reservation desk" | "Room service"

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
}
