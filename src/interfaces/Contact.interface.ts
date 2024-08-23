
export enum ContactStatusType {
  Unset = "",
  Archived = "archived"
}

export interface ContactInterface {
  id: string,
  status: ContactStatusType,
  first_name: string,
  last_name: string,
  email: string,
  phone: string,
  subject: string,
  message: string,
  datetime: Date,
  createdAt?: Date,
  updatedAt?: Date,
};