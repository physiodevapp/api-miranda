import { UserInterface } from "../interfaces/User.interface";
import { APIError } from "../utils/APIError";
import { getPool } from "../config/dbMySQL.config";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { hashPassword } from "../utils/password";
import { PoolConnection } from 'mysql2/promise';

interface relatedFieldIdArgs {
  value: string;
  connection: PoolConnection;
  table: string;
  column: string;
}

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

export const getUserById = async (
  userId: string
): Promise<UserInterface | void> => {
  try {
    const pool = await getPool();
    const connection = await pool.getConnection();

    const [userRowList] = await connection.query<UserInterface[] & RowDataPacket[]>(
      `SELECT * FROM users WHERE id = ? `,
      [userId]
    );
    connection.release();

    const user = userRowList[0];

    if (!user) throw new APIError({message: "User not found", status: 404, safe: true});

    return user;
  } catch (error) {
    
    throw error;
  }
};

export const getUserList = async (searchTerm: string = ""): Promise<UserInterface[] | void> => {

  try {
    const formattedSearchTerm = `%${searchTerm}%`;

    const pool = await getPool();
    const connection = await pool.getConnection();

    const [userList] = await connection.query<UserInterface[] & RowDataPacket[]>(
      `SELECT * FROM users WHERE first_name LIKE ? OR last_name LIKE ?`,
      [formattedSearchTerm, formattedSearchTerm]
    );
    connection.release();

    if (!userList) throw new APIError({message: "Users not found", status: 404, safe: true});
    
    return userList;
  } catch (error) {
    
    throw error;
  }
};

export const createUser = async (
  userData: UserInterface
): Promise<UserInterface | void> => {
  try {
    const pool = await getPool();
    const connection = await pool.getConnection();

    const jobId = await getRelatedFieldId({connection, table: 'user_jobs', column: 'name',value: userData.job!});
    userData.job_id = jobId as number;
    delete userData.job;

    const statusId = await getRelatedFieldId({connection, table: 'user_statuses', column: 'name', value: userData.status!});
    userData.status_id = statusId as number;
    delete userData.status;

    const fields = Object.keys(userData).join(', ');
    const placeholders = Object.keys(userData).map(() => '?').join(', ');
    userData.password = await hashPassword(userData.password);
    const values = Object.values(userData);

    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO users (${fields}) VALUES (${placeholders})`,
      values
    );

    if (result.affectedRows === 0)
      throw new APIError({ message: "Creating process failed", status: 500, safe: true });

    const newUserId = result.insertId;

    const [userRowList] = await connection.query<UserInterface[] & RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ?',
      [newUserId]
    );
    connection.release();
    
    const newUser = userRowList[0];

    return newUser;
  } catch (error) {
    
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const pool = await getPool();
    const connection = await pool.getConnection();

    const [result] = await connection.query<ResultSetHeader>(
      `DELETE FROM users WHERE id = ?`,
      [userId]
    );

    connection.release();

    if (result.affectedRows === 0) 
      throw new APIError({ message: "Deletion process failed", status: 500, safe: true });

  } catch (error) {    
    throw error;
  }
};

export const updateUser = async (
  userId: string,
  userData: UserInterface
): Promise<UserInterface | void> => {
  try {
    const pool = await getPool();
    const connection = await pool.getConnection();

    if (userData.job) {
      const jobId = await getRelatedFieldId({connection, table: 'user_jobs', column: 'name',value: userData.job!});
      userData.job_id = jobId as number;
      delete userData.job;
    }

    if (userData.status) {
      const statusId = await getRelatedFieldId({connection, table: 'user_statuses', column: 'name', value: userData.status!});
      userData.status_id = statusId as number;
      delete userData.status;
    }

    const [userRowList] = await connection.query<UserInterface[] & RowDataPacket[]>(
      `SELECT * FROM users WHERE id = ? `,
      [userId]
    );
  
    const user = userRowList[0];

    if (!user) 
      throw new APIError({message: "User not found", status: 404, safe: true});

    const updateFields = Object.keys(userData).map(key => `${key} = ?`).join(', ');
    const updateValues = Object.values(userData);
    updateValues.push(userId);

    const [result] = await connection.query<ResultSetHeader>(
      `UPDATE users SET ${updateFields} WHERE id = ?`,
      updateValues
    );
    
    if (result.affectedRows === 0)
      throw new APIError({ message: "Update failed", status: 500, safe: true });

    const [userUpdatedRowList] = await connection.query<UserInterface[] & RowDataPacket[]>(
      `SELECT * FROM users WHERE id = ? `,
      [userId]
    );
    connection.release();
  
    const userUpdated = userUpdatedRowList[0];

    if (!userUpdated) 
      throw new APIError({message: "Updated user not found", status: 404, safe: true});

    return userUpdated;
  } catch (error) {    
    throw error;

  }
};
