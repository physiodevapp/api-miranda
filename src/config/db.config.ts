import mongoose from "mongoose";
// import { config as dotenvConfig } from 'dotenv';

// dotenvConfig();
const loadEnvConfig = require('../../loadEnvConfig');

loadEnvConfig();

export const connectDB = async () => {
  const MONGO_DB_URI = process.env.MONGO_DB_URI as string;
  console.log('db.config MONGO_DB_URI')

  try {
    await mongoose.connect(MONGO_DB_URI);

    console.info(`Connected successfully to the database`);
  } catch (error) {

    console.error(`An error ocurred while trying to connect to the database: `, error);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();

    console.info('Disconnected successfully from the database');
  } catch (error) {

    console.error('Error disconnecting from the database', error);
  }
};

process.on("SIGINT", function() {
  mongoose.connection.close()
  .then(() => {
    console.info(`Disconnected successfully from the database using the terminal `);

    process.exit(0);
  })
  .catch((error) => {
    console.info(`Error trying to disconnected successfully from the database using the terminal: `, error);

    process.exit(1);
  })
});

if (process.env.NODE_ENV !== 'test') 
  connectDB();

// const MONGO_DB_URI = process.env.MONGO_DB_URI || 'mongodb://127.0.0.1:27017/miranda-hotel';
// const MONGO_DB_URI = (process.env.NODE_ENV === 'test' ? process.env.MONGO_DB_URI_TEST : process.env.MONGO_DB_URI) as string

// mongoose.connect(MONGO_DB_URI)
// .then(() => {
//   console.info(`App was connected successfully to the database `, MONGO_DB_URI)
// })
// .catch((error) => {
//   console.info(`An error ocurred while trying to connect to database: `, error);

//   process.exit(1);
// })

// process.on("SIGINT", function() {
//   mongoose.connection.close()
//   .then(() => {
//     console.info(`Disconnected successfully from the database`);

//     process.exit(0);
//   })
// })