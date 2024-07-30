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
    let errorMessage;

    if (error instanceof Error) errorMessage = error.message;
    else errorMessage = error;

    throw new APIError(
      `An error occurred when trying to get the contact: ${errorMessage}`,
      500,
      true
    );    
  }
}

export const getContactList = async (): Promise<ContactInterface[] | void>  => {
  try {
    const contactList = await Contact.find();
    if (!contactList)
      throw new APIError("Contact not found", 400, true);
      
    return contactList
    
  } catch (error) {
    let errorMessage;

    if (error instanceof Error) errorMessage = error.message;
    else errorMessage = error;

    throw new APIError(
      `An error occurred when trying to get the contacts: ${errorMessage}`,
      500,
      true
    );    
  }
}