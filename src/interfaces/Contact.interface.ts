
export enum ContactStatusType {
  Unset = "",
  Archived = "archived"
}

export interface ContactInterface {
  id: string,
  status_id: number,
  first_name: string,
  last_name: string,
  email: string,
  phone: string,
  subject: string,
  message: string,
  datetime: Date,
  status?: ContactStatusType,
  createdAt?: Date,
  updatedAt?: Date,
};