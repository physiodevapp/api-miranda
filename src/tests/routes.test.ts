
import request from "supertest";
import { app } from "../app";
import { generateToken } from "../utils/token";
import { faker } from "@faker-js/faker";
import { getUserById, getUserList } from "../services/user.service";
// import { getRoomList } from "../services/room.service";
import { UserInterface } from "../interfaces/User.interface";
// import { getRoomList } from "../services/room.service";
// import { User } from "../models/user.model";
// import { User } from "../models/user.model";
// import userDataList from '../data/users.json';
// import bookingsDataList from '../data/bookings.json';
// import contactsDataList from '../data/contacts.json';
// import roomsDataList from '../data/rooms.json';
// import { User } from "../models/user.model";
// import mockingoose from "mockingoose";
// const { getUserListSeed } = require('../../sharedState.js');
 

describe("Testing User routes", () => {
  let payload: { email: string, password: string };
  let token: string;
  let cookie: string;

  beforeEach(async () => {
    // mockingoose.resetAll();

    payload = {
      email: "admin.miranda@example.com",
      password: "0000"
    }

    token = generateToken(payload);

    cookie = `token=${token}`;
  });

  test("Users route returns status code 200 if valid token", async () => {
    const response = await request(app)
      .get("/users")
      .set('Cookie', cookie) 
    
    expect(response.status).toEqual(200);
  });

  test("Users route returns status code 401 if invalid token", async () => {
    const response = await request(app)
      .get("/users")
      .set("Cookie", `${cookie}lj`); 
    
    expect(response.status).toEqual(401);
  });

  // test("Users route returns status code 401 if invalid credentials", async () => {
  //   payload = {
  //     email: "admin.miranda@example.co",
  //     password: "0000"
  //   }
  //   token = generateToken(payload);

  //   cookie = [`token=${token}`];

  //   const response = await request(app)
  //     .get("/users")
  //     .set('Cookie', cookie) 
    
  //   expect(response.status).toEqual(401);
  // });

  test("Users route returns all users if valid credentials", async () => {
    const response = await request(app)
      .get("/users")
      .set('Cookie', cookie) 

    const userListDB = await getUserList() as UserInterface[];
    const userIdListDB = userListDB.map((user) => {
      return {
        id: user.id.toString(),
        email: user.email
      }
    }) as object[]

    const userIdListRes = response.body.map((user: any) => {
      return {
        id: user.id.toString(),
        email: user.email
      }
    }) as object[]

    expect(userIdListDB).toEqual(userIdListRes);
  });

  test("Users route returns a single user if valid credentials", async () => {
    const userListDB = await getUserList("Admin") as UserInterface[];
    const userDB = await getUserById(userListDB[0].id) as UserInterface;

    const response = await request(app)
      .get(`/users/${userDB.id}`)
      .set('Cookie', cookie) 
    
    expect(response.body.id).toEqual(userDB.id);
  });

  test("Users route update a single user if valid credentials", async () => {
    const userListDB = await getUserList("Admin") as UserInterface[];
    const userDB = await getUserById(userListDB[0].id) as UserInterface;

    const response = await request(app)
      .patch(`/users/${userDB.id}`)
      .send({first_name: "Adminnn"})
      .set('Cookie', cookie) 

    const userDBUpdated = await getUserById(userListDB[0].id) as UserInterface;
    
    expect(response.body.first_name).toEqual(userDBUpdated.first_name);
  });

  test("Users route delete a single user if valid credentials", async () => {
    const userListDB = await getUserList() as UserInterface[];
    const userDB = userListDB.filter((user) => !user.first_name.startsWith("Admin"))[0]
    console.log('userDB ', userDB);

    const response = await request(app)
      .delete(`/users/${userDB.id.toString()}`)
      .set('Cookie', cookie) 
    
    expect(response.status).toEqual(200);
    expect(getUserById(userDB.id)).rejects.toThrow("User not found");
  });

  test("Users route create a single user if valid credentials", async () => {
    const newUser = {
      first_name: "Michael",
      last_name: "Gloy",
      photo: "http://dummyimage.com/69x68.png/cc0000/ffffff",
      start_date: faker.date.past({ years: 1 }).toISOString(),
      job_description: "Curabitur in libero ut massa volutpat convallis. Morbi odio odio, elementum eu, interdum eu, tincidunt in, leo. Maecenas pulvinar lobortis est.\n\nPhasellus sit amet erat. Nulla tempus. Vivamus in felis eu sapien cursus vestibulum.",
      telephone: "+52 744 533 8760",
      status: "inactive",
      job: "Reservation desk",
      password: "1234",
      email: "gloy.miranda@example.com"
    }

    const response = await request(app)
      .post(`/users`)
      .send(newUser)
      .set('Cookie', cookie) 

    const newUserDB = await getUserById(response.body.id)
    
    expect(response.body.id).toEqual(newUserDB!.id);
  });

});

/**

describe("Testing public routes", () => {
  test('Route "/" returns status code 200', async () => {
    const response = await request(app).get("/");
 
    expect(response.status).toEqual(200);
  });
})

describe("Testing log process", () => {

  test("Log in with valid credentials", async() => {
    const response = await request(app)
      .post("/login")
      .send({
        email: "admin.miranda@example.com",
        password: "0000"
      })

    const cookies = response.headers['set-cookie'];
    const cookieArray = Array.isArray(cookies) ? cookies : [cookies];

    expect(cookies).toBeDefined();    
    expect(cookieArray.some((cookie: string) => cookie.startsWith('token='))).toBe(true);
    expect(response.status).toEqual(302);
  });

  test("Log in with invalid credentials", async() => {
    const response = await request(app)
      .post("/login")
      .send({
        email: "admin.miranda@example.com",
        password: "000"
      })
    
    expect(response.status).toEqual(401);
  });

  test("Log out with valid credentials remove the credentials-related token", async() => {
    const payload = {
      email: "admin.miranda@example.com",
      password: "0000"
    }
    const token = generateToken(payload);

    const cookie = [`token=${token}`];

    const response = await request(app)
      .post("/logout")
      .set('Cookie', cookie) 

    const cookies = response.headers['set-cookie'];
    const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
    const clearedTokenCookie = cookieArray.find((cookie: string) => cookie.startsWith('token='));

    expect(cookies).toBeDefined();
    expect(clearedTokenCookie).toContain('token=;');
    expect(response.status).toEqual(302)
  });

});

describe("Testing Rooms routes", () => {
  let payload: { email: string, password: string };
  let token: string;
  let roomId: string;
  let cookie: string[];

  beforeEach(async () => {
    payload = {
      email: "admin.miranda@example.com",
      password: "0000"
    }

    token = generateToken(payload);

    cookie = [`token=${token}`];

    roomId = "b8eed84f-771e-4702-844d-58c1862914f0";
  });

  test("Rooms route returns status code 200 if valid token", async () => {
    const response = await request(app)
      .get("/rooms")
      .set('Cookie', cookie) 
    
    expect(response.status).toEqual(200);
  });

  test("Rooms route returns status code 500 if invalid token", async () => {
    const response = await request(app)
      .get("/rooms")
      .set("Cookie", `${cookie}lj`); 
    
    expect(response.status).toEqual(500);
  });

  test("Rooms route returns status code 401 if invalid credentials", async () => {
    payload = {
      email: "admin.miranda@example.co",
      password: "0000"
    }
    token = generateToken(payload);

    cookie = [`token=${token}`];

    const response = await request(app)
      .get("/rooms")
      .set('Cookie', cookie) 
    
    expect(response.status).toEqual(401);
  });

  test("Rooms route returns all rooms if valid credentials", async () => {
    const response = await request(app)
      .get("/rooms")
      .set('Cookie', cookie) 
    
    expect(response.body).toEqual(roomsDataList);
  });

  test("Rooms route returns a single room if valid credentials", async () => {

    const response = await request(app)
      .get(`/rooms/${roomId}`)
      .set('Cookie', cookie) 
    
    expect(response.body).toEqual(roomsDataList.find((room) => room.id === roomId));
  });

  test("Rooms route delete a single room if valid credentials", async () => {

    const response = await request(app)
      .delete(`/rooms/${roomId}`)
      .set('Cookie', cookie) 
    
    expect(response.status).toEqual(200);
  });

  test("Rooms route update a single room if valid credentials", async () => {

    const response = await request(app)
      .patch(`/rooms/${roomId}`)
      .send({price_night: 450})
      .set('Cookie', cookie) 
    
    expect(response.body.price_night).toEqual(450);
  });

  test("Rooms route create a single room if valid credentials", async () => {
    const newRoom = {
      "id": "b8eed84f-771e-4702-844d-58c1862914p2",
      "first_name": "Gilberto",
      "last_name": "Santa Rosa",
      "photo": "http://dummyimage.com/69x68.png/cc0000/ffffff",
      "start_date": "1698822608000",
      "job_description": "Curabitur in libero ut massa volutpat convallis. Morbi odio odio, elementum eu, interdum eu, tincidunt in, leo. Maecenas pulvinar lobortis est.\n\nPhasellus sit amet erat. Nulla tempus. Vivamus in felis eu sapien cursus vestibulum.",
      "telephone": "+52 744 533 8760",
      "status": "active",
      "job": "Reservation desk",
      "password": "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4",
      "email": "edu.gamboa.rodriguez@gmail.com"
    }

    const response = await request(app)
      .post(`/rooms`)
      .send(newRoom)
      .set('Cookie', cookie) 
    
    expect(response.body.id).toEqual(newRoom.id);
  });

});

describe("Testing Bookings routes", () => {
  let payload: { email: string, password: string };
  let token: string;
  let bookingId: string;
  let cookie: string[];

  beforeEach(async () => {
    payload = {
      email: "admin.miranda@example.com",
      password: "0000"
    }

    token = generateToken(payload);

    cookie = [`token=${token}`];

    bookingId = "ba389f14-4c58-46d8-9314-13a479bcfa21";
  });

  test("Bookings route returns status code 200 if valid token", async () => {
    const response = await request(app)
      .get("/bookings")
      .set('Cookie', cookie) 
    
    expect(response.status).toEqual(200);
  });

  test("Bookings route returns status code 500 if invalid token", async () => {
    const response = await request(app)
      .get("/bookings")
      .set("Cookie", `${cookie}lj`); 
    
    expect(response.status).toEqual(500);
  });

  test("Bookings route returns status code 401 if invalid credentials", async () => {
    payload = {
      email: "admin.miranda@example.co",
      password: "0000"
    }
    token = generateToken(payload);

    cookie = [`token=${token}`];

    const response = await request(app)
      .get("/bookings")
      .set('Cookie', cookie) 
    
    expect(response.status).toEqual(401);
  });

  test("Bookings route returns all bookings if valid credentials", async () => {
    const response = await request(app)
      .get("/bookings")
      .set('Cookie', cookie) 
    
    expect(response.body).toEqual(bookingsDataList);
  });

  test("Bookings route returns a single booking if valid credentials", async () => {

    const response = await request(app)
      .get(`/bookings/${bookingId}`)
      .set('Cookie', cookie) 
    
    expect(response.body).toEqual(bookingsDataList.find((booking) => booking.id === bookingId));
  });

});

describe("Testing Contacts routes", () => {
  let payload: { email: string, password: string };
  let token: string;
  let contactId: string;
  let cookie: string[];

  beforeEach(async () => {
    payload = {
      email: "admin.miranda@example.com",
      password: "0000"
    }

    token = generateToken(payload);

    cookie = [`token=${token}`];

    contactId = "ba389f14-4c58-46d8-9314-13a479bcfa21";
  });

  test("Contacts route returns status code 200 if valid token", async () => {
    const response = await request(app)
      .get("/contacts")
      .set('Cookie', cookie) 
    
    expect(response.status).toEqual(200);
  });

  test("Contacts route returns status code 500 if invalid token", async () => {
    const response = await request(app)
      .get("/contacts")
      .set("authorization", `Bearer ${token}lj`); 
    
    expect(response.status).toEqual(500);
  });

  test("Contacts route returns status code 401 if invalid credentials", async () => {
    payload = {
      email: "admin.miranda@example.co",
      password: "0000"
    }
    token = generateToken(payload);

    cookie = [`token=${token}`];

    const response = await request(app)
      .get("/contacts")
      .set('Cookie', cookie) 
    
    expect(response.status).toEqual(401);
  });

  test("Contacts route returns all contacts if valid credentials", async () => {
    const response = await request(app)
      .get("/contacts")
      .set('Cookie', cookie) 
    
    expect(response.body).toEqual(contactsDataList);
  });

  test("Contacts route returns a single contact if valid credentials", async () => {

    const response = await request(app)
      .get(`/contacts/${contactId}`)
      .set('Cookie', cookie) 
    
    expect(response.body).toEqual(contactsDataList.find((contact) => contact.id === contactId));
  });

});

 */
