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
    if (!room) throw new APIError("Room not found", 400, true);

    return room;
  } catch (error) {
    let errorMessage;

    if (error instanceof Error) errorMessage = error.message;
    else errorMessage = error;

    throw new APIError(
      `An error occurred when trying to get the room: ${errorMessage}`,
      500,
      true
    );
  }
};

export const getRoomList = async (): Promise<RoomInterface[] | void> => {
  try {
    const roomList = await Room.find();

    if (!roomList) throw new APIError("Rooms not found", 400, true);

    return roomList;
  } catch (error) {
    let errorMessage;

    if (error instanceof Error) errorMessage = error.message;
    else errorMessage = error;

    throw new APIError(
      `An error occurred when trying to get the rooms: ${errorMessage}`,
      500,
      true
    );
  }
};

export const createRoom = async (
  roomData: RoomInterface
): Promise<RoomInterface | void> => {
  try {
    const newRoom = await Room.create(roomData);

    return newRoom;
  } catch (error) {
    let errorMessage;

    if (error instanceof Error) errorMessage = error.message;
    else errorMessage = error;

    throw new APIError(
      `An error occurred when trying to create a new room: ${errorMessage}`,
      500,
      true
    );
  }
};

export const deleteRoom = async (roomId: string): Promise<void> => {
  try {
    const objectId = new ObjectId(roomId);
    await Room.deleteOne({ _id: objectId });
  } catch (error) {
    let errorMessage;

    if (error instanceof Error) errorMessage = error.message;
    else errorMessage = error;

    throw new APIError(
      `An error occurred when trying to delete the room: ${errorMessage}`,
      500,
      true
    );
  }
};

export const updateRoom = async (
  roomId: string,
  roomData: RoomInterface
): Promise<RoomInterface | void> => {
  try {
    const updateRoom = await Room.findById(roomId);

    if (!updateRoom) throw new APIError("User not found", 404, true);

    Object.assign(updateRoom, roomData);

    const updatedRoom = await updateRoom.save();

    return updatedRoom;
  } catch (error) {
    let errorMessage;

    if (error instanceof Error) errorMessage = error.message;
    else errorMessage = error;

    throw new APIError(
      `An error occurred when trying to get update the room: ${errorMessage}`,
      500,
      true
    );
  }
};
