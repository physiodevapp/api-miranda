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

// const getRandomDate = (start: Date, end: Date) => {
//   const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
//   return date.toISOString().split('T')[0]; // Returns date in YYYY-MM-DD format
// };

const getRandomDate = (start: Date, end: Date): Date => {
  // Generate a random timestamp between start and end
  const randomTimestamp = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  
  // Create a new Date object from the random timestamp
  const randomDate = new Date(randomTimestamp);
  
  // Return the Date object (in UTC format internally)
  return randomDate;
};

const getRandomOrderDate = (checkInDate: Date): Date => {
  const MIN_DAYS_BEFORE = 7; // Minimum days before check-in
  const MAX_DAYS_BEFORE = 20; // Maximum days before check-in

  // Ensure the check-in date is in UTC
  const checkInUTC = new Date(Date.UTC(checkInDate.getUTCFullYear(), checkInDate.getUTCMonth(), checkInDate.getUTCDate()));

  // Calculate the range in milliseconds
  const minTimeBefore = MIN_DAYS_BEFORE * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  const maxTimeBefore = MAX_DAYS_BEFORE * 24 * 60 * 60 * 1000; // 20 days in milliseconds

  // Get the time of check-in date in UTC
  const checkInTime = checkInUTC.getTime();

  // Generate a random number of milliseconds to subtract (within the defined range)
  const randomTimeBefore = minTimeBefore + Math.random() * (maxTimeBefore - minTimeBefore);

  // Calculate the order date time in UTC
  const orderDateTime = new Date(checkInTime - randomTimeBefore);

  return orderDateTime;
};

const determineBookingStatus = (checkInDate: Date, checkOutDate: Date) => {
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

// const getRandomImages = (urls: string[], count: number = 2): string[] => {
//   // Create a copy of the original array
//   const shuffled = [...urls].sort(() => 0.5 - Math.random());
  
//   // Return the first `count` elements from the shuffled array
//   return shuffled.slice(0, count);
// }

const getRandomImages = (urls: string[], count: number = 2, deleteSelected: boolean = false): string[] => {
  // Create a copy of the original array to avoid modifying the original
  const shuffled = [...urls].sort(() => 0.5 - Math.random());
  
  // Get the first `count` elements from the shuffled array
  const selected = shuffled.slice(0, count);
  
  // If deleteSelected is true, remove the selected elements from the original array
  if (deleteSelected) {
    selected.forEach(url => {
      const index = urls.indexOf(url);
      if (index > -1) {
        urls.splice(index, 1);
      }
    });
  }
  
  // Return the selected elements
  return selected;
};


const roomImageUrlList: string[] = [
  "https://images.pexels.com/photos/1484981/pexels-photo-1484981.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/376531/pexels-photo-376531.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/1879061/pexels-photo-1879061.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/2082087/pexels-photo-2082087.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/2029687/pexels-photo-2029687.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/15743369/pexels-photo-15743369/free-photo-of-cama-habitacion-pintura-pintando.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/5644286/pexels-photo-5644286.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/5179599/pexels-photo-5179599.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/14917454/pexels-photo-14917454.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/4300056/pexels-photo-4300056.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/5644284/pexels-photo-5644284.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/8135105/pexels-photo-8135105.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/7167062/pexels-photo-7167062.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/9565781/pexels-photo-9565781.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/12289357/pexels-photo-12289357.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/14286298/pexels-photo-14286298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/9565725/pexels-photo-9565725.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
];

const userImageUrlList: string[] = [
  "https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/5924172/pexels-photo-5924172.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/3797926/pexels-photo-3797926.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/3811717/pexels-photo-3811717.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/3797837/pexels-photo-3797837.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/6801642/pexels-photo-6801642.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/3088526/pexels-photo-3088526.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/3786525/pexels-photo-3786525.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/3545784/pexels-photo-3545784.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/3812742/pexels-photo-3812742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
];

const contactImageUrlList: string[] = [
  "https://images.pexels.com/photos/8171181/pexels-photo-8171181.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/5711541/pexels-photo-5711541.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/3757008/pexels-photo-3757008.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/1644924/pexels-photo-1644924.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/19091621/pexels-photo-19091621/free-photo-of-chica-guapa-que-tiene-trenzas-con-gafas.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/19089120/pexels-photo-19089120/free-photo-of-una-chica-con-tatuajes-en-el-cuello.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/7648239/pexels-photo-7648239.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/7148689/pexels-photo-7148689.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/27928350/pexels-photo-27928350/free-photo-of-blanco-y-negro-moda-mujer-textura.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/16072507/pexels-photo-16072507/free-photo-of-blanco-y-negro-moda-mujer-misterioso.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
];



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
        photo: getRandomImages(contactImageUrlList, 1, true)[0],
        subject: faker.lorem.words(3),
        message: faker.lorem.paragraph(),
        datetime: faker.date.past(),
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
        photo: getRandomImages(userImageUrlList, 1, true)[0], 
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
      photo: "https://avatars.githubusercontent.com/u/69968873?v=4", 
      start_date: faker.date.past({ years: 1 }),
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
        photos: getRandomImages(roomImageUrlList, 2)
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
      // const checkOutDate = new Date(new Date(checkInDate).getTime() + Math.floor(Math.random() * 20) * DAY_IN_MS).toISOString().split('T')[0]; 
      const checkOutDate = new Date(new Date(checkInDate).getTime() + Math.floor(Math.random() * 20) * DAY_IN_MS);

      bookings.push({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        order_date: getRandomOrderDate(checkInDate),//new Date().toISOString().split('T')[0],
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



