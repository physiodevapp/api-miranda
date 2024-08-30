import {
  RoomInterface,
  RoomStatusType
} from "../interfaces/Room.interface";
import { APIError } from "../utils/APIError";
import { getPool } from "../config/dbMySQL.config";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { PoolConnection } from 'mysql2/promise';

interface relatedFieldIdArgs {
  value: string;
  connection: PoolConnection;
  table: string;
  column: string;
}

interface relatedFieldNameArgs {
  id: number;
  connection: PoolConnection;
  table: string;
  column: string;
}

const getRelatedFieldName = async ({ id, connection, table, column }: relatedFieldNameArgs): Promise<string | null> => {
  try {
    const [rowList] = await connection.query<RowDataPacket[]>(
      `SELECT ${column} FROM ${table} WHERE id = ?`,
      [id]
    );

    if (rowList.length === 0) {
      throw new APIError({ message: `ID '${id}' not found`, status: 400, safe: true });
    }

    return rowList[0][column];
  } catch (error) {
    throw error;
  }
};

const getRelatedFieldId = async ({value, connection, table, column}: relatedFieldIdArgs): Promise<number | null> => {
  try {
    const [rowList] = await connection.query<RowDataPacket[]>(
      `SELECT id FROM ${table} WHERE ${column} = ?`,
      [value]
    );

    if (rowList.length === 0) {
      throw new APIError({ message: `'${value}' not found`, status: 400, safe: true });
    }

    return rowList[0].id;
  } catch (error) {
    throw error;
  }
};

export const getRoomById = async (
  roomId: string
): Promise<Partial<RoomInterface> | void> => {
  try {
    const pool = await getPool();
    const connection = await pool.getConnection();

    const [roomRowList] = await connection.query<RoomInterface[] & RowDataPacket[]>(
      `
        SELECT 
          r.*, GROUP_CONCAT(f.name ORDER BY f.name SEPARATOR ', ') AS facilities
        FROM 
          rooms r
        JOIN 
          rooms_facilities_relation rfr ON r.id = rfr.room_id
        JOIN 
          room_facilities f ON rfr.facility_id = f.id
        WHERE 
          r.id = ?
        GROUP BY 
          r.id;
      `,
      [roomId]
    );

    const roomRow = roomRowList[0];

    if (!roomRow) throw new APIError({message: "Room not found", status: 404, safe: true});

    const statusValue = await getRelatedFieldName({connection, table: 'room_statuses', column: 'name', id: roomRow.status_id!});
    roomRow.status = statusValue as RoomStatusType;

    connection.release();

    roomRow.has_offer = !!roomRow.has_offer;
    
    const { status_id, ...room } = roomRow;

    return room;
  } catch (error) {
    
    throw error;
  }
};

export const getRoomList = async (): Promise<(Partial<RoomInterface> | undefined)[] | void> => {
  try {
    const pool = await getPool();
    const connection = await pool.getConnection();

    const [roomRowList] = await connection.query<RoomInterface[] & RowDataPacket[]>(
      `
        SELECT 
          r.*, GROUP_CONCAT(f.name ORDER BY f.name SEPARATOR ', ') AS facilities
        FROM 
          rooms r
        JOIN 
          rooms_facilities_relation rfr ON r.id = rfr.room_id
        JOIN 
          room_facilities f ON rfr.facility_id = f.id
        GROUP BY 
          r.id;
      `
    );

    if (!roomRowList) throw new APIError({message: "Rooms not found", status: 400, safe: true});

    const roomList = await Promise.all(roomRowList.map(async (room) => {
      const statusValue = room.status_id ? await getRelatedFieldName({ connection, table: 'user_statuses', column: 'name', id: room.status_id }) : null;
      room.status = statusValue as RoomStatusType;

      room.has_offer = !!room.has_offer;

      const { status_id, ...roomWithoutIds } = room;

      return roomWithoutIds;
    }));

    connection.release();

    return roomList;
  } catch (error) {

    throw error;
  }
};

export const createRoom = async (
  roomData: RoomInterface
): Promise<Partial<RoomInterface> | void> => {
  let connection;
  try {
    const pool = await getPool();
    connection = await pool.getConnection();

    await connection.beginTransaction();

    const statusId = await getRelatedFieldId({connection, table: 'room_statuses', column: 'name', value: roomData.status!});
    roomData.status_id = statusId as number;
    delete roomData.status;

    const { facilities, ...roomFields } = roomData;
    const fields = Object.keys(roomFields).join(', ');
    const placeholders = Object.keys(roomFields).map(() => '?').join(', ');
    const values = Object.values(roomFields);

    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO rooms (${fields}) VALUES (${placeholders})`,
      values
    );

    if (result.affectedRows === 0)
      throw new APIError({ message: "Creating process failed", status: 500, safe: true });

    const newRoomId = result.insertId;

    for (const facilityName of facilities) {
      // Retrieve the facility ID (assuming there's a unique constraint on name)
      let [facilityRows] = await connection.query<RowDataPacket[]>(
        'SELECT id FROM room_facilities WHERE name = ?',
        [facilityName]
      );

      let facilityId = facilityRows[0].id;
      // Insert into rooms_facilities_relation
      await connection.query<ResultSetHeader>(
        'INSERT INTO rooms_facilities_relation (room_id, facility_id) VALUES (?, ?)',
        [newRoomId, facilityId]
      );
    }

    await connection.commit();

    const [roomRowList] = await connection.query<RoomInterface[] & RowDataPacket[]>(
      `
        SELECT 
          r.*, GROUP_CONCAT(f.name ORDER BY f.name SEPARATOR ', ') AS facilities
        FROM 
          rooms r
        JOIN 
          rooms_facilities_relation rfr ON r.id = rfr.room_id
        JOIN 
          room_facilities f ON rfr.facility_id = f.id
        WHERE 
          r.id = ?
        GROUP BY 
          r.id;
      `,
      [newRoomId]
    );

    const newRoomRow = roomRowList[0];

    const statusValue = await getRelatedFieldName({connection, table: 'room_statuses', column: 'name', id: newRoomRow.status_id!});
    newRoomRow.status = statusValue as RoomStatusType;

    connection.release();

    const { status_id, ...newRoom } = newRoomRow;

    return newRoom;
  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }

    throw error;
  }
};

export const deleteRoom = async (roomId: string): Promise<void> => {
  try {
    const pool = await getPool();
    const connection = await pool.getConnection();

    await connection.query(
      'DELETE FROM bookings WHERE room_id = ?',
      [roomId]
    );

    await connection.query(
      'DELETE FROM rooms_facilities_relation WHERE room_id = ?',
      [roomId]
    );

    const [result] = await connection.query<ResultSetHeader>(
      `DELETE FROM rooms WHERE id = ?`,
      [roomId]
    );
    connection.release();

    if (result.affectedRows === 0) 
      throw new APIError({ message: "Deletion process failed", status: 500, safe: true });
    
  } catch (error) {
    
    throw error;
  }
};

export const updateRoom = async (
  roomId: string,
  roomData: RoomInterface
): Promise<Partial<RoomInterface> | void> => {
  let connection;

  try {
    const pool = await getPool();
    connection = await pool.getConnection();

    await connection.beginTransaction();

    const { facilities, ...roomFields } = roomData;
    if (roomFields.status) {
      const statusId = await getRelatedFieldId({connection, table: 'room_statuses', column: 'name', value: roomFields.status!});
      roomFields.status_id = statusId as number;
      delete roomFields.status;
    }

    const [roomRowList] = await connection.query<RoomInterface[] & RowDataPacket[]>(
      `SELECT * FROM rooms WHERE id = ? `,
      [roomId]
    );

    const roomRow = roomRowList[0];

    if (!roomRow) 
      throw new APIError({message: "Room not found", status: 404, safe: true});

    const updateFields = Object.keys(roomFields).map(key => `${key} = ?`).join(', ');
    const updateValues = Object.values(roomFields);
    updateValues.push(roomId);

    const [result] = await connection.query<ResultSetHeader>(
      `UPDATE rooms SET ${updateFields} WHERE id = ?`,
      updateValues
    );

    if (result.affectedRows === 0)
      throw new APIError({ message: "Update failed", status: 500, safe: true });

    await connection.query<ResultSetHeader>(
      'DELETE FROM rooms_facilities_relation WHERE room_id = ?',
      [roomId]
    );    
    
    if (facilities) {
      for (const facilityName of facilities) {
        // Retrieve the facility ID (assuming there's a unique constraint on name)
        let [facilityRows] = await connection.query<RowDataPacket[]>(
          'SELECT id FROM room_facilities WHERE name = ?',
          [facilityName]
        );
  
        let facilityId = facilityRows[0].id;
        // Insert into rooms_facilities_relation        
        await connection.query<ResultSetHeader>(
          'INSERT INTO rooms_facilities_relation (room_id, facility_id) VALUES (?, ?)',
          [roomId, facilityId]
        );
      }
    }

    await connection.commit();

    const [roomUpdatedRowList] = await connection.query<RoomInterface[] & RowDataPacket[]>(
      `
        SELECT 
          r.*, GROUP_CONCAT(f.name ORDER BY f.name SEPARATOR ', ') AS facilities
        FROM 
          rooms r
        JOIN 
          rooms_facilities_relation rfr ON r.id = rfr.room_id
        JOIN 
          room_facilities f ON rfr.facility_id = f.id
        WHERE 
          r.id = ?
        GROUP BY 
          r.id;
      `,
      [roomId]
    );
    
    const roomRowUpdated = roomUpdatedRowList[0];
    
    if (!roomRowUpdated) 
      throw new APIError({message: "Updated room not found", status: 404, safe: true});

    await connection.commit();
    
    const statusValue = await getRelatedFieldName({connection, table: 'room_statuses', column: 'name', id: roomRowUpdated.status_id!});
    roomRowUpdated.status = statusValue as RoomStatusType;
    
    connection.release();

    const { status_id, ...roomUpdated } = roomRowUpdated;

    return roomUpdated;
  } catch (error) {
    
    throw error;
  }
};
