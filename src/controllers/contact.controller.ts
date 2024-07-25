import express, { Request, Response, NextFunction } from 'express';
import { headers } from '../middlewares/response.middleware';
import { Contact } from '../services/contact.service';

const list = (_req: Request, res: Response, next: NextFunction) => {
  try {
    const contactList = Contact.fetchAll();

    res.json(contactList);      
  } catch (error) {
    next(error);
  }
}

const detail = (req: Request, res: Response, next: NextFunction) => {
  try {
    const contact = Contact.fetchOne(req.params.contactId);
    
    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
}

export const router = express.Router();

router.get("/", headers, list);
router.get("/:contactId", headers, detail);