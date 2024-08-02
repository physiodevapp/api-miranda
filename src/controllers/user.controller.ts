

import express, { Request, Response, NextFunction } from 'express';
import { headers } from '../middlewares/response.middleware';
import { createUser, deleteUser, getUserById, getUserList, updateUser } from '../services/user.service';
import { APIError } from '../utils/APIError';


const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const searchTerm =  typeof req.query?.search_term === "string" ? req.query?.search_term : "";
    const userList = await getUserList(searchTerm);

    if (!userList) 
      throw new APIError({message: "Contacts not found", status: 400, safe: true});

    res.status(200).json(userList);      
  } catch (error) {
    next(error);
  }
}

const create = async (req: Request, res: Response, next: NextFunction) => {
  
  try {
    const newUser = await createUser(req.body)

    res.status(200).json(newUser);
  } catch (error) {
    next(error)
  }

}

const detail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getUserById(req.params.userId);
    
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

const deleteOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteUser(req.params.userId);

    res.status(200).json();
  } catch (error) {
    next(error)
  }
}

const updateOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedUser = await updateUser(req.params.userId, req.body)
    
    res.status(200).json(updatedUser)
  } catch (error) {
    next(error)
  }
}

export const router = express.Router();

router.get("/", headers, list);
router.post("/", headers, create);
router.get("/:userId", headers, detail);
router.delete("/:userId", headers, deleteOne);
router.patch("/:userId", headers, updateOne);

