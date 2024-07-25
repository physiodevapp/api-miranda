
export type ContactStatusType = "" | "archived";

export interface ContactInterface {
  id: string,
  status: ContactStatusType,
  first_name: string,
  last_name: string,
  email: string,
  phone: string,
  subject: string,
  message: string,
  datetime: string
};