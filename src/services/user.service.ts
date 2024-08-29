import { UserInterface, UserJobType, UserStatusType } from "../interfaces/User.interface";
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

export const getUserById = async (
  userId: string
): Promise<Partial<UserInterface> | void> => {
  try {
    const pool = await getPool();
    const connection = await pool.getConnection();

    const [userRowList] = await connection.query<UserInterface[] & RowDataPacket[]>(
      `SELECT * FROM users WHERE id = ? `,
      [userId]
    );
    
    const userRow = userRowList[0];

    if (!userRow) throw new APIError({message: "User not found", status: 404, safe: true});

    const jobValue = await getRelatedFieldName({connection, table: 'user_jobs', column: 'name', id: userRow.job_id!});
    userRow.job = jobValue as UserJobType;

    const statusValue = await getRelatedFieldName({connection, table: 'user_statuses', column: 'name', id: userRow.status_id!});
    userRow.status = statusValue as UserStatusType;
    
    connection.release();

    const { job_id, status_id, ...user  } = userRow;

    return user;
  } catch (error) {
    
    throw error;
  }
};

export const getUserList = async (searchTerm: string = ""): Promise<(Partial<UserInterface> | undefined)[] | void> => {
  try {
    const formattedSearchTerm = `%${searchTerm}%`;

    const pool = await getPool();
    const connection = await pool.getConnection();

    const [userRowList] = await connection.query<UserInterface[] & RowDataPacket[]>(
      `SELECT * FROM users WHERE first_name LIKE ? OR last_name LIKE ?`,
      [formattedSearchTerm, formattedSearchTerm]
    );
     
    if (!userRowList) throw new APIError({message: "Users not found", status: 404, safe: true});

    const userList = await Promise.all(userRowList.map(async (user) => {
      const jobValue = user.job_id ? await getRelatedFieldName({ connection, table: 'user_jobs', column: 'name', id: user.job_id }) : null;
      user.job = jobValue as UserJobType;

      const statusValue = user.status_id ? await getRelatedFieldName({ connection, table: 'user_statuses', column: 'name', id: user.status_id }) : null;
      user.status = statusValue as UserStatusType;

      const { job_id, status_id, ...userWithoutIds } = user;

      return userWithoutIds;
    }));
    
    connection.release();
    
    return userList;
  } catch (error) {    
    throw error;

  }
};

export const createUser = async (
  userData: UserInterface
): Promise<Partial<UserInterface> | void> => {
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

    const userRowCreated = userRowList[0];

    const jobValue = await getRelatedFieldName({connection, table: 'user_jobs', column: 'name', id: userRowCreated.job_id!});
    userRowCreated.job = jobValue as UserJobType;

    const statusValue = await getRelatedFieldName({connection, table: 'user_statuses', column: 'name', id: userRowCreated.status_id!});
    userRowCreated.status = statusValue as UserStatusType;

    connection.release();

    const { job_id, status_id, ...newUser } = userRowCreated;

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
): Promise<Partial<UserInterface> | void> => {
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
  
    const userRowUpdated = userUpdatedRowList[0];

    if (!userRowUpdated) 
      throw new APIError({message: "Updated user not found", status: 404, safe: true});

    const jobValue = await getRelatedFieldName({connection, table: 'user_jobs', column: 'name', id: userRowUpdated.job_id!});
    userRowUpdated.job = jobValue as UserJobType;

    const statusValue = await getRelatedFieldName({connection, table: 'user_statuses', column: 'name', id: userRowUpdated.status_id!});
    userRowUpdated.status = statusValue as UserStatusType;

    connection.release();

    const { job_id, status_id, ...userUpdated } = userRowUpdated;

    return userUpdated;
  } catch (error) {    
    throw error;

  }
};
