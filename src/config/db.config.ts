import mongoose from "mongoose";

const loadEnvConfig = require('../config/loadEnv.config');

loadEnvConfig();

export const connectDB = async () => {
  console.log('MONGO_DB_URI ', process.env.MONGO_DB_URI ? 'true' : 'false');
  const MONGO_DB_URI = process.env.MONGO_DB_URI as string;

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