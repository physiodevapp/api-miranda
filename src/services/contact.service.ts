import { ContactInterface } from '../interfaces/Contact.interface';
import { APIError } from '../utils/APIError';
import { Contact } from '../models/contact.model';

export const getContactById = async (contactId: string): Promise<ContactInterface | void>  => {
  try {
    const contact = await Contact.findById(contactId);
    if (!contact)
      throw new APIError("Contact not found", 400, true);
      
    return contact;
    
  } catch (error) {
    if (error instanceof Error)
      console.error(error.message)
    else 
      console.error(error)    
  }
}

export const getContactList = async (): Promise<ContactInterface[] | void>  => {
  try {
    const contactList = await Contact.find();
    if (!contactList)
      throw new APIError("Contact not found", 400, true);
      
    return contactList
    
  } catch (error) {
    if (error instanceof Error)
      console.error(error.message)
    else 
      console.error(error)    
  }
}