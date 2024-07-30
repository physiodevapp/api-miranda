import express, { Request, Response, NextFunction } from 'express';
import { headers } from '../middlewares/response.middleware';
import { getContactById, getContactList } from '../services/contact.service';
// import { Contact } from '../services/contact.service';

const list = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // const contactList = Contact.fetchAll();
    const contactList = await getContactList();

    res.json(contactList);      
  } catch (error) {
    next(error);
  }
}

const detail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const contact = Contact.fetchOne(req.params.contactId);
    const contact = await getContactById(req.params.contactId)
    
    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
}

export const router = express.Router();

router.get("/", headers, list);
router.get("/:contactId", headers, detail);