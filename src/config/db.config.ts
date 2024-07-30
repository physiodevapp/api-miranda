import mongoose from "mongoose";

const MONGO_DB_URI = process.env.MONGO_DB_URI || 'mongodb://127.0.0.1:27017/miranda-hotel';

mongoose.connect(MONGO_DB_URI)
.then(() => {
  console.info(`App was connected successfully to database`)
})
.catch((error) => {
  console.info(`An error ocurred while trying to connect to database: `, error);

  process.exit(1);
})

process.on("SIGINT", function() {
  mongoose.connection.close()
  .then(() => {
    console.info(`Disconnected successfully from the database`);

    process.exit(0);
  })
})