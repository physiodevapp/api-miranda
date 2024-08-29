import { ContactInterface, ContactStatusType } from '../interfaces/Contact.interface';
import { APIError } from '../utils/APIError';
import { getPool } from '../config/dbMySQL.config';
import { RowDataPacket } from 'mysql2';
import { PoolConnection } from 'mysql2/promise';

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

export const getContactById = async (contactId: string): Promise<Partial<ContactInterface> | void>  => {
  try {
    const pool = await getPool();
    const connection = await pool.getConnection();

    const [contactRowList] = await connection.query<ContactInterface[] & RowDataPacket[]>(
      `SELECT * FROM contacts WHERE id = ? `,
      [contactId]
    );

    const contactRow = contactRowList[0];  

    if (!contactRow) throw new APIError({message: "Contact not found", status: 404, safe: true});

    const statusValue = await getRelatedFieldName({connection, table: 'contact_statuses', column: 'name', id: contactRow.status_id!});
    contactRow.status = statusValue as ContactStatusType;

    connection.release();

    const { status_id, ...contact } = contactRow;

    return contact;    
  } catch (error) {
    
    throw error;    
  }
}

export const getContactList = async (): Promise<(Partial<ContactInterface> | undefined)[] | void>  => {
  try {
    const pool = await getPool();
    const connection = await pool.getConnection();

    const [contactRowList] = await connection.query<ContactInterface[] & RowDataPacket[]>(
      `SELECT * FROM contacts`
    );

    if (!contactRowList) throw new APIError({message: "Contacts not found", status: 400, safe: true});

    const contactList = await Promise.all(contactRowList.map(async (contact) => {
      const statusValue = contact.status_id ? await getRelatedFieldName({ connection, table: 'contact_statuses', column: 'name', id: contact.status_id }) : null;
      contact.status = statusValue as ContactStatusType;

      const { status_id, ...contactWithoutIds } = contact;

      return contactWithoutIds;
    }));

    connection.release();
      
    return contactList;    
  } catch (error) {
    
    throw error;   
  }
}