import mongoose from "mongoose";
import { ContactStatusType } from "../interfaces/Contact.interface";
import { faker } from '@faker-js/faker';
import { Contact } from "../models/contact.model";
import { User } from "../models/user.model";
import { UserJobType, UserStatusType } from "../interfaces/User.interface";
import { Room } from "../models/room.model";
import { RoomFacility, RoomStatusType, RoomType } from "../interfaces/Room.interface";

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

const getRandomRoomType = (): RoomType => {
  const roomTypes = [RoomType.Double_bed, RoomType.Double_superior, RoomType.Single_bed, RoomType.Suite];
  const randomIndex = Math.floor(Math.random() * roomTypes.length);

  return roomTypes[randomIndex];
};

const getRandomRoomStatusType = (): RoomStatusType => {
  const roomStatuses = [RoomStatusType.Available, RoomStatusType.Booked];
  const randomIndex = Math.floor(Math.random() * roomStatuses.length);

  return roomStatuses[randomIndex];
}

const getRandomFacilities = (count: number) => {
  const shuffled = [...Object.values(RoomFacility)].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const generatePrice = () => {
  const price = faker.number.float({ min: 50, max: 500, precision: 0.01 });
  return parseFloat(price.toFixed(2));
};

const seedContacts = async () => {
  try {
    await Contact.deleteMany({});
    console.info('Contact collection cleared');

    for (let i = 0; i < 10; i++) {
      const contact = new Contact({
        status: getRandomContactStatus(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        subject: faker.lorem.words(3),
        message: faker.lorem.paragraph(),
        datetime: faker.date.past().toISOString(),
      });

      await contact.save();
    }

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

    console.info('11 users have been seeded');
  } catch (error) {
    console.error('Error seeding contacts:', error);
    
    process.exit(1);
  }
}

const seedRooms = async () => {
  try {
    await Room.deleteMany({});
    console.info('Room collection cleared');    
    
    for (let i = 0; i < 10; i++) {
      const room = new Room({
        number: i + 1,
        description: faker.lorem.sentences(2),
        facilities: getRandomFacilities(faker.number.int({ min: 1, max: 5 })),
        name: faker.commerce.productName(),
        cancellation_policy: "Free cancellation up to 24 hours before check-in.",
        has_offer: faker.datatype.boolean(),
        type: getRandomRoomType(),
        price_night: generatePrice(),
        discount: faker.number.int({ min: 0, max: 50 }),
        status: getRandomRoomStatusType(),
        photos: [faker.image.imageUrl(), faker.image.imageUrl()]
      });

      await room.save();
    }

    console.info('10 rooms have been seeded');
  } catch (error) {
    console.error('Error seeding rooms:', error);
    
    process.exit(1);
  }
}

const seedData = async() => {
  await connectDB();

  await Promise.all([
    seedContacts(),
    seedUsers(),
    seedRooms()
  ])

  await disconnectDB();

  process.exit(0);
}

seedData();



