import { ContactInterface, ContactStatusType } from '../interfaces/Contact.interface';
import contactDataList from '../data/contacts.json';
import { APIError } from '../utils/APIError';

export class Contact implements ContactInterface {
  id: string;
  status: ContactStatusType;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  datetime: string;

  constructor(contact: ContactInterface) {
    this.id = contact.id;
    this.status = contact.status;
    this.first_name = contact.first_name;
    this.last_name = contact.last_name;
    this.email = contact.email;
    this.phone = contact.phone;
    this.subject = contact.subject;
    this.message = contact.message;
    this.datetime = contact.datetime;
  }

  static fetchOne (contactId: string): Contact {
    const contactList = contactDataList as Contact[]
    if (!contactList)
      throw new APIError("There is no contacts data", 500, false);

    const contact = contactList.find((contact: Contact) => contact.id = contactId)
    if (!contact)
      throw new APIError("Contact not found", 400, true)
    
    return contact
  }

  static fetchAll (): Contact[] | void {
    const contactList = contactDataList as Contact[];

    if (!contactList)
      throw new APIError("There is no users data", 500, false);
    
    return contactList;
  }
}