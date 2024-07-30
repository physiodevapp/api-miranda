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

// export class Room implements RoomInterface {
//   id: string;
//   number: number;
//   description: string;
//   facilities: string[];
//   name: string;
//   cancellation_policy: string;
//   has_offer: boolean;
//   type: RoomType;
//   price_night: number;
//   discount: number;
//   status: RoomStatusType;
//   photos: string[]

//   constructor(room: RoomInterface) {
//     this.id = room.id
//     this.number = room.number
//     this.description = room.description
//     this.facilities = room.facilities
//     this.name = room.name
//     this.cancellation_policy = room.cancellation_policy
//     this.has_offer = room.has_offer
//     this.type = room.type
//     this.price_night = room.price_night
//     this.discount = room.discount
//     this.status = room.status
//     this.photos = room.photos
//   }

//   static fetchOne(roomId: string): Room | void {
//     const roomList = roomDataList as Room[];
//     if (!roomList)
//       throw new APIError("There is no rooms data", 500, false)

//     const room = roomList.find((room: Room) => room.id === roomId)
//     if (!room)
//       throw new APIError("Room not found", 400, true);

//     return room;
//   }

//   static fetchAll(): Room[] | void {
//     const roomList = roomDataList as Room[]

//     if (!roomList)
//       throw new APIError("There is no users data", 500, false);

//     return roomList
//   }

//   static create(room: Room): Room | void {
//     if (!room)
//       throw new APIError("Room is not provided", 404, false)

//     return room;
//   }

//   static delete(roomId: string): void {
//     if (!roomId)
//       throw new APIError("Id of the room isn't provided", 400, false);

//     const roomList = roomDataList as Room[]
//     if (!roomList)
//       throw new APIError("There is no rooms data", 500, false);

//     const room = roomList.find((room: Room) => room.id === roomId)
//     if (!room)
//       throw new APIError("Room not found", 404, false)

//   }

//   static update(roomId: string, formData: Room): Room | void {
//     const roomList = roomDataList as Room[]
//     let updateRoom = roomList.find((room: Room) => room.id === roomId)

//     if (!updateRoom)
//       throw new APIError("Room doesn't exist", 404, false);

//     updateRoom = {
//       ...updateRoom,
//       ...formData
//     }

//     return updateRoom;
//   }
// }
