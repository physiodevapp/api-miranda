import { ContactStatusType } from "../interfaces/Contact.interface";
import { faker } from '@faker-js/faker';
import { getPool } from "../config/dbMySQL.config";
import { UserJobType, UserStatusType } from "../interfaces/User.interface";
import { RoomFacility, RoomStatusType, RoomType } from "../interfaces/Room.interface";
import { BookingStatusType } from "../interfaces/Booking.interface";
import bcryptjs from "bcryptjs";
import { ResultSetHeader, RowDataPacket } from 'mysql2';

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

const seedContacts = async () => {
  const pool = await getPool();
  const connection = await pool.getConnection();

  try {
    // await connection.query(`DROP TABLE IF EXISTS contacts`);
    // await connection.query(`DROP TABLE IF EXISTS contact_statuses`);
    // console.log('Contacts and Statuses tables cleaned before seeding');

    // Create the statuses table
    const createStatusesTableQuery = `
      CREATE TABLE IF NOT EXISTS contact_statuses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
      );
    `;
    await connection.query(createStatusesTableQuery);
    console.log('Statuses table ensured');

    // Insert initial statuses into the statuses table
    const insertStatusesQuery = `
      INSERT INTO contact_statuses (name) VALUES ("${ContactStatusType.Unset}"), ("${ContactStatusType.Archived}");
    `;
    await connection.query(insertStatusesQuery);
    console.log('Initial statuses have been inserted');

    const createContactsTableQuery = `
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT,
        status_id INT,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(50) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        datetime DATETIME NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (status_id) REFERENCES contact_statuses(id)
      );    
    `

    await connection.query(createContactsTableQuery);
    console.log('Contacts table ensured');

    const insertContacts = Array.from({ length: 10 }).map(async () => {
      const status = getRandomContactStatus();

      // Fetch the status_id from the statuses table
      const [statusRowList] = await connection.query<Array<{ id: number }> & RowDataPacket[]>(
        'SELECT id FROM contact_statuses WHERE name = ?',
        [status]
      );
      // const statusRow = statusRowList as Array<{ id: number }>;
      const statusId = statusRowList[0]?.id || null;

      const contact = {
        status_id: statusId,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        subject: faker.lorem.words(3),
        message: faker.lorem.paragraph(),
        datetime: faker.date.past(),
      };

      return connection.query(
        'INSERT INTO contacts (status_id, first_name, last_name, email, phone, subject, message, datetime) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [contact.status_id, contact.first_name, contact.last_name, contact.email, contact.phone, contact.subject, contact.message, contact.datetime]
      )
    });

    await Promise.all(insertContacts);
    console.log('10 contacts have been seeded');

  } catch (error) {
    console.error('Error seeding contacts:', error);

    process.exit(1);
  } finally {
    connection.release();
    
  }
};

const seedUsers = async () => {
  const pool = await getPool();
  const connection = await pool.getConnection();

  try {
    // await connection.query(`DROP TABLE IF EXISTS users`);
    // await connection.query(`DROP TABLE IF EXISTS user_statuses`);
    // await connection.query(`DROP TABLE IF EXISTS user_jobs`);

    // Create the statuses table
    const createStatusesTableQuery = `
      CREATE TABLE IF NOT EXISTS user_statuses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
      );
    `;
    await connection.query(createStatusesTableQuery);
    console.log('Statuses table ensured');

    // Insert initial statuses into the statuses table
    const insertStatusesQuery = `
      INSERT INTO user_statuses (name) VALUES ("${UserStatusType.Active}"), ("${UserStatusType.Inactive}");
    `;
    await connection.query(insertStatusesQuery);
    console.log('Initial statuses have been inserted');

    // Create the jobs table
    const createJobsTableQuery = `
      CREATE TABLE IF NOT EXISTS user_jobs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
      );
    `;
    await connection.query(createJobsTableQuery);
    console.log('Jobs table ensured');

    // Insert initial jobs into the jobs table
    const insertJobsQuery = `
      INSERT INTO user_jobs (name) VALUES ("${UserJobType.Manager}"), ("${UserJobType.Reservation_desk}"), ("${UserJobType.Room_service}");
    `;
    await connection.query(insertJobsQuery);
    console.log('Initial jobs have been inserted');

    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT,
        status_id INT,
        job_id INT,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        photo VARCHAR(400) NOT NULL,
        start_date DATETIME NOT NULL,
        password VARCHAR(255) NOT NULL,
        job_description VARCHAR(400) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE, 
        telephone varchar(50) NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (status_id) REFERENCES user_statuses(id),
        FOREIGN KEY (job_id) REFERENCES user_jobs(id)
      );
    `
    await connection.query(createUsersTableQuery);
    console.log('Users table ensured');

    const insertUsers = Array.from({ length: 10 }).map(async (_, index) => {
      const status = getRandomUserStatus();

      // Fetch the status_id from the statuses table
      const [statusRowList] = await connection.query<Array<{ id: number }> & RowDataPacket[]>(
        'SELECT id FROM user_statuses WHERE name = ?',
        [status]
      );
      // const statusRow = statusRowList as Array<{ id: number }>;
      const statusId = statusRowList[0]?.id || null;

      const job = getRandomUserJob();

      // Fetch the status_id from the statuses table
      const [jobRowList] = await connection.query<Array<{ id: number }> & RowDataPacket[]>(
        'SELECT id FROM user_jobs WHERE name = ?',
        [job]
      );
      // const jobRow = jobRowList as Array<{ id: number }>;
      const jobId = jobRowList[0]?.id || null;

      let user;

      if (index === 9) {
        user = {
          status_id: statusId,
          job_id: jobId,
          first_name: "Admin",
          last_name: "Miranda",
          photo: faker.image.avatar(), 
          start_date: faker.date.past({ years: 1 }),//.toISOString(),
          job_description: faker.lorem.sentence(),
          telephone: faker.phone.number(),
          password: "0000",
          email: "admin.miranda@example.com",
        }
      } else {
        user = {
          status_id: statusId,
          job_id: jobId,
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          photo: faker.image.avatarGitHub(), 
          start_date: faker.date.past({ years: 1 }),
          job_description: faker.lorem.sentence(),
          telephone: faker.phone.number(),
          password: faker.internet.password(),
          email: faker.internet.email(),
        };
      }

      // Generate a salt
      const salt = await bcryptjs.genSalt(10);
      // Hash the plain text password
      user.password = await bcryptjs.hash(user.password, salt);

      return connection.query(
        ' INSERT INTO users (status_id, job_id, first_name, last_name, photo, start_date, job_description, telephone, password, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [user.status_id, user.job_id, user.first_name, user.last_name, user.photo, user.start_date, user.job_description, user.telephone, user.password, user.email]
      );
      
    });

    await Promise.all(insertUsers);
    console.log('10 users have been seeded');
  } catch (error) {
    console.error('Error seeding contacts:', error);
    
    process.exit(1);
  } finally {
    connection.release();
    
  }
}

const seedRooms = async (): Promise<number[]> => {
  const pool = await getPool();
  const connection = await pool.getConnection();

  try {
    // await connection.query(`DROP TABLE IF EXISTS rooms_facilities_relation`);
    // await connection.query(`DROP TABLE IF EXISTS rooms`);
    // await connection.query(`DROP TABLE IF EXISTS room_statuses`);
    // await connection.query(`DROP TABLE IF EXISTS room_facilities`);

    // Create the statuses table
    const createStatusesTableQuery = `
      CREATE TABLE IF NOT EXISTS room_statuses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
      );
    `;
    await connection.query(createStatusesTableQuery);
    console.log('Statuses table ensured');

    // Insert initial statuses into the statuses table
    const insertStatusesQuery = `
      INSERT INTO room_statuses (name) VALUES ("${RoomStatusType.Available}"), ("${RoomStatusType.Booked}");
    `;
    await connection.query(insertStatusesQuery);
    console.log('Initial statuses have been inserted');

    const createFacilitiesTable = `
      CREATE TABLE IF NOT EXISTS room_facilities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL
      );
    `;
    await connection.query(createFacilitiesTable);
    console.log('Facilitites table ensured');

    const facilities = Object.values(RoomFacility);
    for (const facility of facilities) {
      await connection.query(`INSERT IGNORE INTO room_facilities (name) VALUES (?)`, [facility]);
    }
    console.log('Initial facilitites have been inserted');

    const createRoomsTable = `
      CREATE TABLE IF NOT EXISTS rooms (
        id INT AUTO_INCREMENT,
        status_id INT,
        number INT NOT NULL,
        description TEXT NOT NULL,
        name VARCHAR(255) NOT NULL,
        cancellation_policy TEXT,
        has_offer BOOLEAN,
        type VARCHAR(50),
        price_night DECIMAL(10, 2),
        discount INT,
        PRIMARY KEY (id),
        FOREIGN KEY (status_id) REFERENCES room_statuses(id)
      );
    `;
    await connection.query(createRoomsTable);
    console.log('Rooms table ensured');

    const createRoomsFacilitiesRelationTable = `
      CREATE TABLE IF NOT EXISTS rooms_facilities_relation (
        room_id INT,
        facility_id INT,
        PRIMARY KEY (room_id, facility_id),
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
        FOREIGN KEY (facility_id) REFERENCES room_facilities(id) ON DELETE CASCADE
      );
    `;
    await connection.query(createRoomsFacilitiesRelationTable);

    const roomIdList: number[]  = [];

    const roomPromises = Array.from({ length: 10 }).map(async (_, index) => {
      const status = getRandomRoomStatusType();

      // Fetch the status_id from the statuses table
      const [statusRowList] = await connection.query<Array<{ id: number }> & RowDataPacket[]>(
        'SELECT id FROM room_statuses WHERE name = ?',
        [status]
      );
      // const statusRow = statusRowList as Array<{ id: number }>;
      const statusId = statusRowList[0]?.id || null;
      
      const room = {
        status_id: statusId,
        number: index + 1,
        description: faker.lorem.sentences(2),
        facilities: getRandomFacilities(faker.number.int({ min: 1, max: 5 })),
        name: faker.commerce.productName(),
        cancellation_policy: "Free cancellation up to 24 hours before check-in.",
        has_offer: faker.datatype.boolean(),
        type: getRandomRoomType(),
        price_night: generatePrice(),
        discount: faker.number.int({ min: 0, max: 50 }),
      };

      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO rooms 
         (status_id, number, description, name, cancellation_policy, has_offer, type, price_night, discount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [room.status_id, room.number, room.description, room.name, room.cancellation_policy, room.has_offer, room.type, room.price_night, room.discount]
      );

      const roomId = result.insertId;
      roomIdList.push(roomId);

      // Insert room facilities into the room_facilities table
      for (const facility of room.facilities) {
        const [facilityResult] = await connection.query(
          `SELECT id FROM room_facilities WHERE name = ?`, 
          [facility]
        );
        const facilityRow = facilityResult as Array<{ id: number }>;

        const facilityId = facilityRow[0]!.id;

        await connection.query(`INSERT INTO rooms_facilities_relation (room_id, facility_id) VALUES (?, ?)`, [roomId, facilityId]);
      };

    });

    await Promise.all(roomPromises);
    console.log('10 rooms have been seeded');

    return roomIdList;
  } catch(error) {
    console.error('Error seeding rooms:', error);
    
    process.exit(1);
  } finally {
    connection.release();
    
  }

}

const seedBookings = async (roomIds: number[]) => {
  const availableRoomNumbers = new Set(roomIds);

  const pool = await getPool();
  const connection = await pool.getConnection();

  try {
    // await connection.query(`DROP TABLE IF EXISTS booking_statuses`);

    // Create the statuses table
    const createStatusesTableQuery = `
      CREATE TABLE IF NOT EXISTS booking_statuses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
      );
    `;
    await connection.query(createStatusesTableQuery);
    console.log('Statuses table ensured');

    // Insert initial statuses into the statuses table
    const insertStatusesQuery = `
      INSERT INTO booking_statuses (name) VALUES ("${BookingStatusType.Check_in}"), ("${BookingStatusType.Check_out}"), ("${BookingStatusType.In_progress}");
    `;
    await connection.query(insertStatusesQuery);
    console.log('Initial statuses have been inserted');

    const createBookingsTableQuery = `
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT,
        status_id INT,
        room_id INT,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        order_date DATETIME NOT NULL,
        check_in DATETIME NOT NULL,
        check_out DATETIME NOT NULL,
        special_request VARCHAR(400) NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (status_id) REFERENCES booking_statuses(id),
        FOREIGN KEY (room_id) REFERENCES rooms(id)
      );
    `
    await connection.query(createBookingsTableQuery);
    console.log('Bookings table ensured'); 
    
    const insertBookings = Array.from({ length: roomIds.length }).map(async () => {
      const roomIdArray = Array.from(availableRoomNumbers);
      const roomId = faker.helpers.arrayElement(roomIdArray);
      availableRoomNumbers.delete(roomId);

      const now = new Date();
      const DAY_IN_MS = 24*60*60*1000;

      const checkInDate = getRandomDate(new Date(now.getTime() - 30*DAY_IN_MS), new Date(now.getTime() + 30*DAY_IN_MS)); 
      // const checkOutDate = new Date(new Date(checkInDate).getTime() + Math.floor(Math.random() * 20) * DAY_IN_MS).toISOString().split('T')[0]; 
      const checkOutDate = new Date(new Date(checkInDate).getTime() + Math.floor(Math.random() * 20) * DAY_IN_MS);

      const status = determineBookingStatus(checkInDate, checkOutDate);

      // Fetch the status_id from the statuses table
      const [statusRowList] = await connection.query<Array<{ id: number }> & RowDataPacket[]>(
        'SELECT id FROM booking_statuses WHERE name = ?',
        [status]
      );
      // const statusRow = statusRowList as Array<{ id: number }>;
      const statusId = statusRowList[0]?.id || null;

      const booking = {
        status_id: statusId,
        room_id: roomId,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        order_date: getRandomOrderDate(checkInDate),//new Date().toISOString().split('T')[0],
        check_in: checkInDate,
        check_out: checkOutDate,
        special_request: faker.lorem.sentence()
      }

      return connection.query(
        ' INSERT INTO bookings (status_id, room_id, first_name, last_name, order_date, check_in, check_out, special_request) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [booking.status_id, booking.room_id, booking.first_name, booking.last_name, booking.order_date, booking.check_in, booking.check_out, booking.special_request]
      );
    })

    await Promise.all(insertBookings);
    console.log('10 bookings have been seeded');
  } catch (error) {
    console.error('Error seeding bookings:', error);
    
    process.exit(1);
  } finally {
    connection.release();
    
  }
}

const createSeedData = async () => {
  await seedContacts();

  await seedUsers();

  const roomIds = await seedRooms();

  await seedBookings(roomIds);
}

const dropTables = async () => {
  const pool = await getPool();
  const connection = await pool.getConnection();

  try {
    // Drop tables in order based on foreign key dependencies
    await connection.query(`DROP TABLE IF EXISTS bookings`);
    await connection.query(`DROP TABLE IF EXISTS rooms_facilities_relation`);
    await connection.query(`DROP TABLE IF EXISTS rooms`);
    await connection.query(`DROP TABLE IF EXISTS room_facilities`);
    await connection.query(`DROP TABLE IF EXISTS room_statuses`);
    await connection.query(`DROP TABLE IF EXISTS users`);
    await connection.query(`DROP TABLE IF EXISTS user_jobs`);
    await connection.query(`DROP TABLE IF EXISTS user_statuses`);
    await connection.query(`DROP TABLE IF EXISTS contacts`);
    await connection.query(`DROP TABLE IF EXISTS contact_statuses`);
    await connection.query(`DROP TABLE IF EXISTS booking_statuses`);

    console.log('All tables have been dropped successfully before seeding');
  } catch (error) {
    console.error('Error dropping tables:', error);
    process.exit(1);
  } finally {
    connection.release();

  }
};

export const seedData = async() => {
  await dropTables();

  await createSeedData();

  process.exit(0);
}

if (process.env.NODE_ENV !== 'test') 
  seedData();



