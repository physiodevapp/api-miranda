import { RoomInterface, RoomStatusType } from '../interfaces/Room.interface';
import roomDataList from '../data/rooms.json';
import { APIError } from '../utils/APIError';

export class Room implements RoomInterface {
  id: string;
  number: number;
  description: string;
  facilities: string[];
  name: string;
  cancellation_policy: string;
  has_offer: boolean;
  type: string;
  price_night: number;
  discount: number;
  status: RoomStatusType;
  photos: string[]

  constructor(room: RoomInterface) {
    this.id = room.id
    this.number = room.number
    this.description = room.description
    this.facilities = room.facilities
    this.name = room.name
    this.cancellation_policy = room.cancellation_policy
    this.has_offer = room.has_offer
    this.type = room.type
    this.price_night = room.price_night
    this.discount = room.discount
    this.status = room.status
    this.photos = room.photos
  }

  static fetchOne (roomId: string): Room | void {
    const roomList = roomDataList as Room[];
    if (!roomList)
      throw new APIError("There is no rooms data", 500, false)

    const room = roomList.find((room: Room) => room.id = roomId)
    if (!room)
      throw new APIError("Room not found", 400, true);
    
    return room;
  }

  static fetchAll (): Room[] | void {
    const roomList = roomDataList as Room[]

    if (!roomList)
      throw new APIError("There is no users data", 500, false);

    return roomList
  }


  static create(room: Room): Room | void {
    if (!room)
      throw new APIError("Room is not provided", 404, false)
    
    return room;
  }

  static delete(roomId: string): void {
    console.log(roomId)
    if (!roomId)
      throw new APIError("Id of the room isn't provided", 400, false);
    
    const roomList = roomDataList as Room[]
    if (!roomList)
      throw new APIError("There is no rooms data", 500, false);
    
    const room = roomList.find((room: Room) => room.id === roomId)
    if (!room)
      throw new APIError("Room not found", 404, false)

  }

  static update(roomId: string, formData: Room): Room | void {
    const roomList = roomDataList as Room[]
    let updateRoom = roomList.find((room: Room) => room.id === roomId)
    
    if (!updateRoom)
      throw new APIError("Room doesn't exist", 404, false);

    updateRoom = {
      ...updateRoom,
      ...formData
    }

    return updateRoom;    
  }
}