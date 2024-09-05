
export enum ContactStatusType {
  Unset = "",
  Archived = "archived"
}

export interface ContactInterface {
  [key: string]: any;
  id: string,
  status: ContactStatusType,
  first_name: string,
  last_name: string,
  email: string,
  phone: string,
  subject: string,
  message: string,
  photo: string,
  datetime: Date,
  createdAt?: Date,
  updatedAt?: Date,
};