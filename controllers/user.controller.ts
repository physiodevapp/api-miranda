

import Express, { Request, Response, NextFunction } from 'express';
import { headers } from '../middlewares/response.middleware';
import { User } from '../services/user.service';


const list = (searchText: string = "") => {
  return (_req: Request, res: Response, next: NextFunction) => {
    try {
      const userList = User.fetchAll(searchText);
  
      res.json(userList);      
    } catch (error) {
      next(error);
    }
  }
}

const create = (req: Request, res: Response, next: NextFunction) => {
  
  try {
    const newUser = User.create(req.body)

    res.json(newUser);
  } catch (error) {
    next(error)
  }

}

const detail = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = User.fetchOne(req.params.userId);
    
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

const deleteUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    User.delete(req.params.userId)

    res.status(200);
  } catch (error) {
    next(error)
  }
}

const updateUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedUser = User.update(req.params.userId, req.body)
    
    res.json(updatedUser)
  } catch (error) {
    next(error)
  }
}

export const router = Express.Router();

router.get("/", headers, list());
router.post("/", headers, create);
router.get("/:userId", headers, detail);
router.delete("/:userId", headers, deleteUser);
router.patch("/:userId", headers, updateUser);

