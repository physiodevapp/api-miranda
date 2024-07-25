
import request from "supertest";
import { app } from "../app";
import { generateToken } from "../utils/token";
import userDataList from '../data/users.json';

describe("Testing public routes", () => {
  test("Root route returns status code 200", async () => {
    const response = await request(app).get("/");
 
    expect(response.status).toEqual(200);
  });
})

describe("Testing User routes", () => {
  let payload: { email: string, password: string };
  let token: string;

  beforeEach(async () => {
    payload = {
      email: "admin.miranda@example.com",
      password: "0000"
    }

    token = generateToken(payload);
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

  test("Users route returns users if valid credentials", async () => {
    const response = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${token}`); 
    
    expect(response.body).toEqual(userDataList);
  });

  test("Users route returns a single user if valid credentials", async () => {
    const userId = "c1c692d5-a8bb-4987-bda9-bf0d63cf852f";

    const response = await request(app)
      .get(`/users/${userId}`)
      .set("authorization", `Bearer ${token}`); 
    
    expect(response.body).toEqual(userDataList.find((user) => user.id === userId));
  });

});