import mongoose from "mongoose";
import { ContactStatusType } from "../interfaces/Contact.interface";
import { faker } from '@faker-js/faker';
import { Contact } from "../models/contact.model";

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

const getRandomStatus = (): ContactStatusType => {
  const statuses = [ContactStatusType.Unset, ContactStatusType.Archived];
  const randomIndex = Math.floor(Math.random() * statuses.length);
  return statuses[randomIndex];
};

const seedContacts = async () => {
  try {
    await connectDB();

    await Contact.deleteMany({});
    console.info('Contact collection cleared');

    const contacts = [];
    for (let i = 0; i < 10; i++) {
      contacts.push({
        status: getRandomStatus(),
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

    await mongoose.connection.close();
    console.info(`Disconnected successfully from the database`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding contacts:', error);
    
    process.exit(1);
  }
}

seedContacts();
