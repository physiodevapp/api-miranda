import mongoose from "mongoose";
import { ContactStatusType } from "../interfaces/Contact.interface";
import { faker } from '@faker-js/faker';
import { Contact } from "../models/contact.model";
import { User } from "../models/user.model";
import { UserJobType, UserStatusType } from "../interfaces/User.interface";

const connectDB = async () => {
  const MONGO_DB_URI = process.env.MONGO_DB_URI || "mongodb://127.0.0.1:27017/miranda-hotel";

  try {
    await mongoose.connect(MONGO_DB_URI);

    console.info(`Connected successfully to the database`);
  } catch (error) {
    console.error(`An error ocurred while trying to connect to the database: `, error);

    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();

    console.info('Disconnected successfully from the database');
  } catch (error) {
    console.error('Error disconnecting from the database:', error);

    process.exit(1);
  }
};

const getRandomContactStatus = (): ContactStatusType => {
  const statuses = [ContactStatusType.Unset, ContactStatusType.Archived];
  const randomIndex = Math.floor(Math.random() * statuses.length);

  return statuses[randomIndex];
};

const getRandomUserStatus = (): UserStatusType => {
  const statuses = [UserStatusType.Active, UserStatusType.Inactive];
  const randomIndex = Math.floor(Math.random() * statuses.length);
  return statuses[randomIndex];
};

const getRandomUserJob = (): UserJobType => {
  const jobs = [UserJobType.Manager, UserJobType.Reservation_desk, UserJobType.Room_service];
  const randomIndex = Math.floor(Math.random() * jobs.length);
  return jobs[randomIndex];
};

const seedContacts = async () => {
  try {
    await Contact.deleteMany({});
    console.info('Contact collection cleared');

    const contacts = [];
    for (let i = 0; i < 10; i++) {
      contacts.push({
        status: getRandomContactStatus(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        subject: faker.lorem.words(3),
        message: faker.lorem.paragraph(),
        datetime: faker.date.past().toISOString(),
      });
    }

    await Contact.insertMany(contacts);
    console.info('10 contacts have been seeded');
  } catch (error) {
    console.error('Error seeding contacts:', error);
    
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    await User.deleteMany({});
    console.info('User collection cleared');
    
    
    for (let i = 0; i < 10; i++) {
      const password = faker.internet.password();
      const user = new User({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        photo: faker.image.avatar(), 
        start_date: faker.date.past({ years: 1 }).toISOString(),
        job_description: faker.lorem.sentence(),
        telephone: faker.phone.number(),
        status: getRandomUserStatus(),
        job: getRandomUserJob(),
        password: password,
        email: faker.internet.email(),
      });

      await user.save();
    }

    const examplePassword = "0000";
    const user = new User({
      first_name: "Admin",
      last_name: "Miranda",
      photo: faker.image.avatar(), 
      start_date: faker.date.past({ years: 1 }).toISOString(),
      job_description: faker.lorem.sentence(),
      telephone: faker.phone.number(),
      status: getRandomUserStatus(),
      job: getRandomUserJob(),
      password: examplePassword,
      email: "admin.miranda@example.com",
    });

    await user.save();

    // await User.insertMany(users);
    console.info('11 users have been seeded');
  } catch (error) {
    console.error('Error seeding contacts:', error);
    
    process.exit(1);
  }
}

const seedData = async() => {
  await connectDB();

  await Promise.all([
    seedContacts(),
    seedUsers()
  ])

  await disconnectDB();

  process.exit(0);
}

seedData();



