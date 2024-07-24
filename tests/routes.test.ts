
import request from "supertest";
import { app } from "../app";
import { generateToken } from "../utils/token";

describe("Routes testing", () => {

  test("Public route returns status code 200", async () => {
    const response = await request(app).get("/");
 
    expect(response.status).toEqual(200);
  });

  test("Users route returns status code 200", async () => {
    const payload = {
      email: "admin.miranda@example.com",
      password: "0000"
    }
    const token = generateToken(payload);

    const response = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${token}`); 
    
    expect(response.status).toEqual(200);
  });

})