const { MongoMemoryServer } = require( 'mongodb-memory-server');
const mongoose = require('mongoose');
const { createSeedData } = require('./src/seed/seed');
const { setUserListSeed } = require('./sharedState');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const { userCollection } = await createSeedData();
  setUserListSeed(userCollection);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});


// const mongoose = require('mongoose');
// const { seedData } = require('./src/seed/seed');
// const { connectDB, disconnectDB } = require('./src/config/db.config');
// const loadEnvConfig = require('./loadEnvConfig');

// loadEnvConfig();

// beforeAll(async () => {
//   await seedData(); 

//   await connectDB();
// });

// afterAll(async () => {
//   const collections = mongoose.connection.collections;
//   for (const key in collections) {
//     const collection = collections[key];

//     await collection.deleteMany({});
//   }

//   await disconnectDB();
// });

