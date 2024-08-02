const mongoose = require('mongoose');
const { seedData } = require('./src/seed/seed');
const { connectDB, disconnectDB } = require('./src/config/db.config');
const loadEnvConfig = require('./loadEnvConfig');

loadEnvConfig();

beforeAll(async () => {
  await seedData(); 

  await connectDB();
});

afterAll(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];

    await collection.deleteMany({});
  }

  await disconnectDB();
});

