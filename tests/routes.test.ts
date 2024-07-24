
import request from "supertest";
import { app } from "../app";
import { generateToken } from "../utils/token";

describe("Routes testing", () => {
  let payload: { email: string, password: string };
  let token: string;

  beforeEach(async () => {
    payload = {
      email: "admin.miranda@example.com",
      password: "0000"
    }

    token = generateToken(payload);
  });
  

  test("Public route returns status code 200", async () => {
    const response = await request(app).get("/");
 
    expect(response.status).toEqual(200);
  });

  test("Users route returns status code 200 with valid token", async () => {
    const response = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${token}`); 
    
    expect(response.status).toEqual(200);
  });

  test("Users route returns status code 401 with invalid token", async () => {
    const response = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${token}lj`); 
    
    expect(response.status).toEqual(500);
  });

});