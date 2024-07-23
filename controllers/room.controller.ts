import express, { Request, Response, NextFunction } from 'express';
import { headers } from '../middlewares/response.middleware';
import { Room } from '../services/room.service';

const list = (_req: Request, res: Response, next: NextFunction) => {
  try {
    const roomList = Room.fetchAll();

    res.json(roomList);      
  } catch (error) {
    next(error);
  }
}

const create = (req: Request, res: Response, next: NextFunction) => {
  
  try {
    const newRoom = Room.create(req.body);

    res.status(201).json(newRoom);
  } catch (error) {
    next(error)
  }

}

const detail = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = Room.fetchOne(req.params.userId);
    
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

const deleteRoom = (req: Request, res: Response, next: NextFunction) => {
  try {
    Room.delete(req.params.roomId)

    res.status(200);
  } catch (error) {
    next(error)
  }
}

const updateRoom = (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedRoom = Room.update(req.params.roomId, req.body)
    
    res.json(updatedRoom)
  } catch (error) {
    next(error)
  }
}

export const router = express.Router();

router.get("/", headers, list);
router.post("/", headers, create);
router.get("/:roomId", headers, detail);
router.delete("/:roomId", headers, deleteRoom);
router.patch("/:roomId", headers, updateRoom);