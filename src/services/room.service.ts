import {
  RoomInterface
} from "../interfaces/Room.interface";
import { APIError } from "../utils/APIError";
import { Room } from "../models/room.model";
import { ObjectId } from "mongodb";


export const getRoomById = async (
  roomId: string
): Promise<RoomInterface | void> => {
  try {
    const room = await Room.findById(roomId);
    if (!room) throw new APIError({message: "Room not found", status: 404, safe: true});

    return room;
  } catch (error) {
    
    throw error;
  }
};

export const getRoomList = async (): Promise<RoomInterface[] | void> => {
  try {
    const roomList = await Room.find();

    if (!roomList) throw new APIError({message: "Rooms not found", status: 400, safe: true});

    return roomList;
  } catch (error) {

    throw error;
  }
};

export const createRoom = async (
  roomData: RoomInterface
): Promise<RoomInterface | void> => {
  try {
    const newRoom = await Room.create(roomData);

    return newRoom;
  } catch (error) {

    throw error
  }
};

export const deleteRoom = async (roomId: string): Promise<void> => {
  try {
    const objectId = new ObjectId(roomId);
    await Room.deleteOne({ _id: objectId });
  } catch (error) {
    
    throw error;
  }
};

export const updateRoom = async (
  roomId: string,
  roomData: RoomInterface
): Promise<RoomInterface | void> => {
  try {
    const updateRoom = await Room.findById(roomId);

    if (!updateRoom) throw new APIError({message: "Room not found", status: 404, safe: true});

    Object.assign(updateRoom, roomData);

    const updatedRoom = await updateRoom.save();

    return updatedRoom;
  } catch (error) {
    
    throw error;
  }
};
