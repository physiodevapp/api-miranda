import mongoose from "mongoose";
const MONGO_DB_URI = process.env.MONGO_DB_URI || 'mongodb://127.0.0.1:27017/miranda-hotel';

mongoose.connect(MONGO_DB_URI)
.then(() => {
  console.log(`App was connected successfully to database`)
})
.catch((error) => {
  console.log(`An error ocurred while trying to connect to database: `, error)
})

process.on("SIGINT", function() {
  mongoose.connection.close()
  .then(() => {
    console.log(`Mongoose was disconnected on App termination`)
    process.exit(0)
  })
})