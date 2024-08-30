import { BookingInterface, BookingStatusType } from "../interfaces/Booking.interface";
import { APIError } from "../utils/APIError";
import { getPool } from "../config/dbMySQL.config";
import { RowDataPacket } from "mysql2";
import { PoolConnection } from "mysql2/promise";
import { RoomInterface, RoomStatusType } from "../interfaces/Room.interface";

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

export const getBookingById = async (
  bookingId: string
): Promise<Partial<BookingInterface> | void> => {
  try {
    const pool = await getPool();
    const connection = await pool.getConnection();

    const [bookingRowList] = await connection.query<BookingInterface[] & RowDataPacket[]>(
      `
        SELECT 
          b.*, 
          r.id AS room_id, r.number, r.description, r.name AS room_name, 
          r.cancellation_policy, r.has_offer, r.type, r.price_night, r.discount, r.photos, r.status_id AS room_status_id,
          GROUP_CONCAT(f.name ORDER BY f.name SEPARATOR ', ') AS facilities
        FROM 
          bookings b
        INNER JOIN 
          rooms r ON b.room_id = r.id
        LEFT JOIN 
          rooms_facilities_relation rfr ON r.id = rfr.room_id
        LEFT JOIN 
          room_facilities f ON rfr.facility_id = f.id
        WHERE 
          b.id = ?
        GROUP BY 
          b.id, r.id;
      `,
      [bookingId]
    );

    const bookingRow = bookingRowList[0];

    if (!bookingRow) throw new APIError({message: "Booking not found", status: 404, safe: true});

    const bookingStatusValue = await getRelatedFieldName({connection, table: 'booking_statuses', column: 'name', id: bookingRow.status_id!});
    bookingRow.status = bookingStatusValue as BookingStatusType;

    const {
      status_id,
      room_id, 
      room_name, 
      number, 
      description, 
      cancellation_policy, 
      has_offer, 
      type, 
      price_night, 
      discount, 
      photos,
      room_status_id,
      facilities,
      ...booking
    } = bookingRow;

    const roomStatusValue = await getRelatedFieldName({connection, table: 'room_statuses', column: 'name', id: room_status_id!});

    connection.release();

    const bookingRoom: Partial<RoomInterface> = {
      id: room_id,
      number,
      description,
      name: room_name,
      cancellation_policy,
      has_offer,
      type,
      price_night,
      discount,
      status: roomStatusValue as RoomStatusType,
      facilities,
      photos,
    }

    return {
      ...booking,
      room: bookingRoom
    } as any;

  } catch (error) {
    
    throw error;
  }
};

export const getBookingList = async (
  searchTerm: string = ""
): Promise<(Partial<BookingInterface> | undefined)[] | void> => {
  try {
    const formattedSearchTerm = `%${searchTerm}%`;

    const pool = await getPool();
    const connection = await pool.getConnection();

    const [bookingRowList] = await connection.query<BookingInterface[] & RowDataPacket[]>(
      `
        SELECT
          b.*, 
          r.id AS room_id, r.number, r.description, r.name AS room_name, 
          r.cancellation_policy, r.has_offer, r.type, r.price_night, r.discount, r.photos, 
          r.status_id AS room_status_id,
          GROUP_CONCAT(f.name ORDER BY f.name SEPARATOR ', ') AS facilities
        FROM 
          bookings b
        INNER JOIN 
          rooms r ON b.room_id = r.id
        LEFT JOIN 
          rooms_facilities_relation rfr ON r.id = rfr.room_id
        LEFT JOIN 
          room_facilities f ON rfr.facility_id = f.id
        WHERE 
          b.first_name LIKE ? OR b.last_name LIKE ?
        GROUP BY 
          b.id, r.id
      `,
      [formattedSearchTerm, formattedSearchTerm]
    );

    if (!bookingRowList) throw new APIError({message: "Users not found", status: 404, safe: true});

    const bookingList = await Promise.all(bookingRowList.map(async (booking: any) => {
      const bookingStatusValue = booking.status_id ? await getRelatedFieldName({ connection, table: 'booking_statuses', column: 'name', id: booking.status_id }) : null;
      booking.status = bookingStatusValue as BookingStatusType;

      const {
        status_id,
        room_id,
        room_name,
        number,
        description,
        name,
        cancellation_policy,
        has_offer,
        type,
        price_night,
        discount,
        room_status_id,
        facilities,
        photos,
        ...bookingWithoutRoomFields
      } = booking;

      const roomStatusValue = await getRelatedFieldName({connection, table: 'room_statuses', column: 'name', id: room_status_id!});

      const room = {
        id: room_id,
        number,
        name: room_name,
        description,
        cancellation_policy,
        has_offer,
        type,
        price_night,
        discount,
        status: roomStatusValue,
        facilities,
        photos,
      };

      return {
        ...bookingWithoutRoomFields,
        room,
      };

    }));

    connection.release();

    return bookingList;
  } catch (error) {    
    throw error;

  }
};

