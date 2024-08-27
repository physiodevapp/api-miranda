
import mysql from 'mysql2/promise';

const loadEnvConfig = require('../config/loadEnv.config');

if (process.env.NODE_ENV !== 'production')
  loadEnvConfig();

export const getPool = async () => {
  let pool;

  if (!pool) {
    pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: process.env.MYSQL_DB_PASSWORD,
      database: 'miranda',
      // connectionLimit: 10 // Optional: specify the maximum number of connections in the pool
    });
  }

  return pool
};