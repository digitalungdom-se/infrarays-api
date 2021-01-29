const supertest = require("supertest");
const { v4 } = require("uuid");

const Profile = require("../profile");

const request = supertest("http://localhost:8080");

describe("User", function () {
  describe("POST /user/send_email_login_code", function () {
    it("should return 201", async () => {
      const p = new Profile(request);
      const u = p.newApplicant();

      await request.post("/application").send(u.getUser());

      const response = await request.post("/user/send_email_login_code").send({ email: u.email });

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });
  });

  describe("GET /user/@me", function () {
    it("should return 200", async () => {
      const p = new Profile(request);
      const u = await p.createApplicant();

      const response = await u.get("/user/@me", {});

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(u.id);
      expect(response.body.email).toBe(u.email);
      expect(response.body.firstName).toBe(u.firstName);
      expect(response.body.lastName).toBe(u.lastName);
      expect(response.body.type).toBe("APPLICANT");
    });

    it("should return 401", async () => {
      const response = await request.get("/user/@me");

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /user/@me", function () {
    it("should return 201", async () => {
      const p = new Profile(request);
      const u = await p.createApplicant();

      let response = await u.delete("/user/@me", {});
      expect(response.status).toBe(204);

      response = await u.get("/user/@me", {});
      expect(response.status).toBe(401);
    });
  });

  describe("PATCH /user/@me", function () {
    it("should return 201", async () => {
      const p = new Profile(request);
      const u = await p.createApplicant();

      u.email = `${v4()}@${v4()}.com`;
      u.firstName = v4();
      u.lastName = v4();

      let response = await u.patch("/user/@me", u.getUser());
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(u.id);
      expect(response.body.email).toBe(u.email);
      expect(response.body.firstName).toBe(u.firstName);
      expect(response.body.lastName).toBe(u.lastName);

      response = await u.get("/user/@me", {});
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(u.id);
      expect(response.body.email).toBe(u.email);
      expect(response.body.firstName).toBe(u.firstName);
      expect(response.body.lastName).toBe(u.lastName);
    });
  });
});
