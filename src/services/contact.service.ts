import { ContactInterface } from '../interfaces/Contact.interface';
import { APIError } from '../utils/APIError';
import { Contact } from '../models/contact.model';

export const getContactById = async (contactId: string): Promise<ContactInterface | void>  => {
  try {
    const contact = await Contact.findById(contactId);
    if (!contact)
      throw new APIError({message: "Contact not found", status: 400, safe: true});
      
    return contact;
    
  } catch (error) {
    
    throw error;    
  }
}

export const getContactList = async (): Promise<ContactInterface[] | void>  => {
  try {
    const contactList = await Contact.find();
    if (!contactList)
      throw new APIError({message: "Contact not found", status: 400, safe: true});
      
    return contactList
    
  } catch (error) {
    
    throw error;   
  }
}

export const updateContact = async (
  contactId: string,
  contactData: ContactInterface
): Promise<ContactInterface | void> => {
  try {
    const updateContact = await Contact.findById(contactId);

    if (!updateContact) throw new APIError({message: "Contact not found", status: 404, safe: true});

    Object.assign(updateContact, contactData);

    const updatedContact = await updateContact.save();

    return updatedContact;
  } catch (error) {
    
    throw error;
  }
};
