import mongoose from "mongoose";
import { ContactStatusType } from "../interfaces/Contact.interface";
import { faker } from '@faker-js/faker';
import { Contact } from "../models/contact.model";
import { User } from "../models/user.model";
import { UserJobType, UserStatusType } from "../interfaces/User.interface";
import { Room } from "../models/room.model";
import { RoomFacility, RoomStatusType, RoomType } from "../interfaces/Room.interface";
import { BookingStatusType } from "../interfaces/Booking.interface";
import { Booking } from "../models/booking.model";
import { connectDB, disconnectDB } from "../config/db.config";

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
  const price = faker.number.float({ min: 50, max: 500, multipleOf: 0.01 });
  return parseFloat(price.toFixed(2));
};

const getRandomDate = (start: Date, end: Date) => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0]; // Returns date in YYYY-MM-DD format
};

const determineBookingStatus = (checkInDate: string, checkOutDate: string) => {
  const now = new Date();
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (checkOut < now) {
    return BookingStatusType.Check_out;
  } else if (checkIn > now) {
    return BookingStatusType.Check_in;
  } else if (checkIn <= now && now <= checkOut) {
    return BookingStatusType.In_progress;
  } else {
    // Default return value, though this branch should never be reached
    return BookingStatusType.Check_in;
  }
};

const seedContacts = async () => {
  try {
    await Contact.deleteMany({});
    // console.info('Contact collection cleared');

    const contactPromises = Array.from({ length: 10 }).map(() => {
      return Contact.create({
        status: getRandomContactStatus(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        subject: faker.lorem.words(3),
        message: faker.lorem.paragraph(),
        datetime: faker.date.past().toISOString(),
      })
    });

    await Promise.all(contactPromises)
    // console.info('10 contacts have been seeded');
  } catch (error) {
    console.error('Error seeding contacts:', error);
    
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    await User.deleteMany({});
    // console.('User collection cleared');    
    
    const userPromises = Array.from({ length: 10 }).map(() => {
      return User.create({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        photo: faker.image.avatar(), 
        start_date: faker.date.past({ years: 1 }).toISOString(),
        job_description: faker.lorem.sentence(),
        telephone: faker.phone.number(),
        status: getRandomUserStatus(),
        job: getRandomUserJob(),
        password: faker.internet.password(),
        email: faker.internet.email(),
      });
    });

    const userList = await Promise.all(userPromises);

    const customUser = await User.create({
      first_name: "Admin",
      last_name: "Miranda",
      photo: faker.image.avatar(), 
      start_date: faker.date.past({ years: 1 }).toISOString(),
      job_description: faker.lorem.sentence(),
      telephone: faker.phone.number(),
      status: getRandomUserStatus(),
      job: getRandomUserJob(),
      password: "0000",
      email: "admin.miranda@example.com",
    });

    userList.push(customUser)

    // console.('11 users have been seeded');
  } catch (error) {
    console.error('Error seeding contacts:', error);
    
    process.exit(1);
  }
}

const seedRooms = async () => {
  try {
    await Room.deleteMany({});
    // console.('Room collection cleared');    

    const roomPromises = Array.from({ length: 10 }).map(( _, index ) => {
      return Room.create({
        number: index + 1,
        description: faker.lorem.sentences(2),
        facilities: getRandomFacilities(faker.number.int({ min: 1, max: 5 })),
        name: faker.commerce.productName(),
        cancellation_policy: "Free cancellation up to 24 hours before check-in.",
        has_offer: faker.datatype.boolean(),
        type: getRandomRoomType(),
        price_night: generatePrice(),
        discount: faker.number.int({ min: 0, max: 50 }),
        status: getRandomRoomStatusType(),
        photos: [faker.image.url(), faker.image.url()]
      });
    });    
    
    const rooms = await Promise.all(roomPromises);
    // console.('10 rooms have been seeded');

    return rooms.map(room => room._id); 
  } catch (error) {
    console.error('Error seeding rooms:', error);
    
    process.exit(1);
  }
}

const seedBookings = async (roomIds: mongoose.Types.ObjectId[]) => {
  const availableRoomNumbers = new Set(roomIds);

  try {
    await Booking.deleteMany({});
    // console.('Booking collection cleared');    
    
    const bookings = [];
    for (let i = 0; i < 10; i++) {

      if (availableRoomNumbers.size === 0) {
        console.log('No more available room numbers to assign.');
        break;
      }

      const roomIdArray = Array.from(availableRoomNumbers);
      const roomId = faker.helpers.arrayElement(roomIdArray);
      availableRoomNumbers.delete(roomId);

      const now = new Date();
      const DAY_IN_MS = 24*60*60*1000;

      const checkInDate = getRandomDate(new Date(now.getTime() - 30*DAY_IN_MS), new Date(now.getTime() + 30*DAY_IN_MS)); 
      const checkOutDate = new Date(new Date(checkInDate).getTime() + Math.floor(Math.random() * 20) * DAY_IN_MS).toISOString().split('T')[0]; 

      bookings.push({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        order_date: new Date().toISOString().split('T')[0],
        check_in: checkInDate,
        check_out: checkOutDate,
        room: roomId,
        status: determineBookingStatus(checkInDate, checkOutDate),
        special_request: faker.lorem.sentence()
      });
    }

    await Booking.insertMany(bookings)

    // console.('10 bookings have been seeded');
  } catch (error) {
    console.error('Error seeding bookings:', error);
    
    process.exit(1);
  }
}


const createSeedData = async () => {
  await seedContacts();

  await seedUsers();

  const roomIds = await seedRooms();

  await seedBookings(roomIds);
}

export const seedData = async() => {
  await connectDB();

  await createSeedData();

  await disconnectDB();
}

if (process.env.NODE_ENV !== 'test') 
  seedData();



