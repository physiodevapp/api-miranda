
import request from "supertest";
import { app } from "../app";
import { generateToken } from "../utils/token";
import userDataList from '../data/users.json';
import bookingsDataList from '../data/bookings.json';
import contactsDataList from '../data/contacts.json';
import roomsDataList from '../data/rooms.json';

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

    const response = await request(app)
      .post("/logout")
      .set("authorization", `Bearer ${token}`); 

    const cookies = response.headers['set-cookie'];
    const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
    const clearedTokenCookie = cookieArray.find((cookie: string) => cookie.startsWith('token='));

    expect(cookies).toBeDefined();
    expect(clearedTokenCookie).toContain('token=;');
    expect(response.status).toEqual(302)
  });

});

describe("Testing User routes", () => {
  let payload: { email: string, password: string };
  let token: string;
  let userId: string;

  beforeEach(async () => {
    payload = {
      email: "admin.miranda@example.com",
      password: "0000"
    }

    token = generateToken(payload);

    userId = "c1c692d5-a8bb-4987-bda9-bf0d63cf852f";
  });

  test("Users route returns status code 200 if valid token", async () => {
    const response = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${token}`); 
    
    expect(response.status).toEqual(200);
  });

  test("Users route returns status code 500 if invalid token", async () => {
    const response = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${token}lj`); 
    
    expect(response.status).toEqual(500);
  });

  test("Users route returns status code 401 if invalid credentials", async () => {
    payload = {
      email: "admin.miranda@example.co",
      password: "0000"
    }
    token = generateToken(payload);

    const response = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${token}`); 
    
    expect(response.status).toEqual(401);
  });

  test("Users route returns all users if valid credentials", async () => {
    const response = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${token}`); 
    
    expect(response.body).toEqual(userDataList);
  });

  test("Users route returns a single user if valid credentials", async () => {

    const response = await request(app)
      .get(`/users/${userId}`)
      .set("authorization", `Bearer ${token}`); 
    
    expect(response.body).toEqual(userDataList.find((user) => user.id === userId));
  });

  test("Users route delete a single user if valid credentials", async () => {

    const response = await request(app)
      .delete(`/users/${userId}`)
      .set("authorization", `Bearer ${token}`); 
    
    expect(response.status).toEqual(200);
  });

  test("Users route update a single user if valid credentials", async () => {

    const response = await request(app)
      .patch(`/users/${userId}`)
      .send({first_name: "Emogenee"})
      .set("authorization", `Bearer ${token}`); 
    
    expect(response.body.first_name).toEqual("Emogenee");
  });

  test("Users route create a single user if valid credentials", async () => {
    const newUser = {
      id: "c1c692d5-a8bb-4987-bda9-bf0d63cf854g",
      first_name: "Michael",
      last_name: "Gloy",
      photo: "http://dummyimage.com/69x68.png/cc0000/ffffff",
      start_date: "1698822608000",
      job_description: "Curabitur in libero ut massa volutpat convallis. Morbi odio odio, elementum eu, interdum eu, tincidunt in, leo. Maecenas pulvinar lobortis est.\n\nPhasellus sit amet erat. Nulla tempus. Vivamus in felis eu sapien cursus vestibulum.",
      telephone: "+52 744 533 8760",
      status: "inactive",
      job: "Reservation desk",
      password: "9af15b336e6a9619928537df30b2e6a2376569fcf9d7e773eccede65606529a0",
      email: "admin.miranda@example.com"
    }

    const response = await request(app)
      .post(`/users`)
      .send(newUser)
      .set("authorization", `Bearer ${token}`); 
    
    expect(response.body.id).toEqual(newUser.id);
  });

});

describe("Testing Rooms routes", () => {
  let payload: { email: string, password: string };
  let token: string;
  let roomId: string;

  beforeEach(async () => {
    payload = {
      email: "admin.miranda@example.com",
      password: "0000"
    }

    token = generateToken(payload);

    roomId = "b8eed84f-771e-4702-844d-58c1862914f0";
  });

  test("Rooms route returns status code 200 if valid token", async () => {
    const response = await request(app)
      .get("/rooms")
      .set("authorization", `Bearer ${token}`); 
    
    expect(response.status).toEqual(200);
  });

  test("Rooms route returns status code 500 if invalid token", async () => {
    const response = await request(app)
      .get("/rooms")
      .set("authorization", `Bearer ${token}lj`); 
    
    expect(response.status).toEqual(500);
  });

  test("Rooms route returns status code 401 if invalid credentials", async () => {
    payload = {
      email: "admin.miranda@example.co",
      password: "0000"
    }
    token = generateToken(payload);

    const response = await request(app)
      .get("/rooms")
      .set("authorization", `Bearer ${token}`); 
    
    expect(response.status).toEqual(401);
  });

  test("Rooms route returns all rooms if valid credentials", async () => {
    const response = await request(app)
      .get("/rooms")
      .set("authorization", `Bearer ${token}`); 
    
    expect(response.body).toEqual(roomsDataList);
  });

  test("Rooms route returns a single room if valid credentials", async () => {

    const response = await request(app)
      .get(`/rooms/${roomId}`)
      .set("authorization", `Bearer ${token}`); 
    
    expect(response.body).toEqual(roomsDataList.find((room) => room.id === roomId));
  });

  test("Rooms route delete a single room if valid credentials", async () => {

    const response = await request(app)
      .delete(`/rooms/${roomId}`)
      .set("authorization", `Bearer ${token}`); 
    
    expect(response.status).toEqual(200);
  });

  test("Rooms route update a single room if valid credentials", async () => {

    const response = await request(app)
      .patch(`/rooms/${roomId}`)
      .send({price_night: 450})
      .set("authorization", `Bearer ${token}`); 
    
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
      .set("authorization", `Bearer ${token}`); 
    
    expect(response.body.id).toEqual(newRoom.id);
  });

});

describe("Testing Bookings routes", () => {
  let payload: { email: string, password: string };
  let token: string;
  let bookingId: string;

  beforeEach(async () => {
    payload = {
      email: "admin.miranda@example.com",
      password: "0000"
    }

    token = generateToken(payload);

    bookingId = "ba389f14-4c58-46d8-9314-13a479bcfa21";
  });

  test("Bookings route returns status code 200 if valid token", async () => {
    const response = await request(app)
      .get("/bookings")
      .set("authorization", `Bearer ${token}`); 
    
    expect(response.status).toEqual(200);
  });

  test("Bookings route returns status code 500 if invalid token", async () => {
    const response = await request(app)
      .get("/bookings")
      .set("authorization", `Bearer ${token}lj`); 
    
    expect(response.status).toEqual(500);
  });

  test("Bookings route returns status code 401 if invalid credentials", async () => {
    payload = {
      email: "admin.miranda@example.co",
      password: "0000"
    }
    token = generateToken(payload);

    const response = await request(app)
      .get("/bookings")
      .set("authorization", `Bearer ${token}`); 
    
    expect(response.status).toEqual(401);
  });

  test("Bookings route returns all bookings if valid credentials", async () => {
    const response = await request(app)
      .get("/bookings")
      .set("authorization", `Bearer ${token}`); 
    
    expect(response.body).toEqual(bookingsDataList);
  });

  test("Bookings route returns a single booking if valid credentials", async () => {

    const response = await request(app)
      .get(`/bookings/${bookingId}`)
      .set("authorization", `Bearer ${token}`); 
    
    expect(response.body).toEqual(bookingsDataList.find((booking) => booking.id === bookingId));
  });

});

describe("Testing Contacts routes", () => {
  let payload: { email: string, password: string };
  let token: string;
  let contactId: string;

  beforeEach(async () => {
    payload = {
      email: "admin.miranda@example.com",
      password: "0000"
    }

    token = generateToken(payload);

    contactId = "ba389f14-4c58-46d8-9314-13a479bcfa21";
  });

  test("Contacts route returns status code 200 if valid token", async () => {
    const response = await request(app)
      .get("/contacts")
      .set("authorization", `Bearer ${token}`); 
    
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

    const response = await request(app)
      .get("/contacts")
      .set("authorization", `Bearer ${token}`); 
    
    expect(response.status).toEqual(401);
  });

  test("Contacts route returns all contacts if valid credentials", async () => {
    const response = await request(app)
      .get("/contacts")
      .set("authorization", `Bearer ${token}`); 
    
    expect(response.body).toEqual(contactsDataList);
  });

  test("Contacts route returns a single contact if valid credentials", async () => {

    const response = await request(app)
      .get(`/contacts/${contactId}`)
      .set("authorization", `Bearer ${token}`); 
    
    expect(response.body).toEqual(contactsDataList.find((contact) => contact.id === contactId));
  });

});