import express, { Request, Response, NextFunction } from 'express';
import { headers } from '../middlewares/response.middleware';
import { createRoom, deleteRoom, getRoomById, getRoomList, updateRoom } from '../services/room.service';
import { dataValidationMiddleware } from '../middlewares/data.middleware';
import { roomSchema } from '../validators/joiSchemas.validator';

const list = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const roomList = await getRoomList();

    res.status(200).json(roomList);      
  } catch (error) {
    next(error);
  }
}

const create = async (req: Request, res: Response, next: NextFunction) => {
  
  try {
    const newRoom = await createRoom(req.body);

    res.status(201).json(newRoom);
  } catch (error) {
    next(error)
  }

}

const detail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const room = await getRoomById(req.params.roomId);
    
    res.status(200).json(room);
  } catch (error) {
    next(error);
  }
}

const deleteOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteRoom(req.params.roomId)

    res.status(200).json();
  } catch (error) {
    next(error)
  }
}

const updateOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedRoom = await updateRoom(req.params.roomId, req.body)
    
    res.status(200).json(updatedRoom);
  } catch (error) {
    next(error)
  }
}

export const router = express.Router();

router.get("/", headers, list);
router.post("/", headers, dataValidationMiddleware(roomSchema), create);
router.get("/:roomId", headers, detail);
router.delete("/:roomId", headers, deleteOne);
router.patch("/:roomId", headers, dataValidationMiddleware(roomSchema, true), updateOne);