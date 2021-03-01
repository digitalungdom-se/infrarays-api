const supertest = require("supertest");
const { v4 } = require("uuid");
const moment = require("moment");
const hasha = require("hasha");

const Profile = require("../profile");

const request = supertest("http://localhost:8080");

const hash004mb = hasha.fromFileSync("test/assets/004mb.pdf");

describe("User", function () {
  describe("POST /application", function () {
    it("should return 201", async () => {
      const p = new Profile(request);
      const u = p.newApplicant();

      const response = await request.post("/application").send(u.getUser());

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.email).toBe(u.email);
      expect(response.body.firstName).toBe(u.firstName);
      expect(response.body.lastName).toBe(u.lastName);
      expect(Math.round(new Date(response.body.created).valueOf() / 1000)).toBe(Math.round(new Date().valueOf() / 1000));
    });
  });

  describe("GET /application/:userID", function () {
    it("should return 200", async () => {
      const p = new Profile(request);
      const u = await p.createApplicant();

      const response = await u.get("/application/@me");

      expect(response.status).toBe(200);
      expect(response.body.birthdate).toBe(u.birthdate);
      expect(response.body.finnish).toBe(u.finnish);
    });
  });

  describe("GET /application/:userID/pdf", function () {
    it("should return 200", async () => {
      const p = new Profile(request);
      const u = await p.createApplicant();

      const response = await u.get("/application/@me/pdf");

      expect(response.status).toBe(200);

      console.log(u.email);
    });
  });

  describe("POST /application/:userID/file/:fileType", function () {
    it("should return 200", async () => {
      const p = new Profile(request);
      const u = await p.createApplicant();

      const response = await request.post("/application/@me/file/cv").set("Authorization", `Bearer ${u.accessToken}`).attach("file", "test/assets/004mb.pdf");
      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.type).toBe("CV");
      expect(moment.utc(response.body.created).unix()).toBeCloseTo(moment.utc().unix());
      expect(response.body.name).toBe("004mb.pdf");
      expect(response.body.mime).toBe("application/pdf");
    });
  });

  describe("GET /application/:userID/file/:fileID", function () {
    it("should return 200", async () => {
      const p = new Profile(request);
      const u = await p.createApplicant();

      let response = await request.post("/application/@me/file/cv").set("Authorization", `Bearer ${u.accessToken}`).attach("file", "test/assets/004mb.pdf");
      const fileID = response.body.id;

      response = await u.get(`/application/@me/file/${fileID}`);
      expect(response.status).toBe(200);
      expect(await hasha.async(response.body)).toBe(hash004mb);
    });
  });

  describe("DELETE /application/:userID/file/:fileID", function () {
    it("should return 200", async () => {
      const p = new Profile(request);
      const u = await p.createApplicant();

      let response = await request.post("/application/@me/file/cv").set("Authorization", `Bearer ${u.accessToken}`).attach("file", "test/assets/004mb.pdf");
      const fileID = response.body.id;

      response = await u.delete(`/application/@me/file/${fileID}`);
      expect(response.status).toBe(204);

      response = await u.get(`/application/@me/file/${fileID}`);
      expect(response.status).toBe(404);
    });
  });

  describe("POST /application/:userID/survey", function () {
    it("should return 201", async () => {
      const p = new Profile(request);
      const u = await p.createApplicant();

      const surveyData = {
        city: v4(),
        school: v4(),
        gender: ["MALE", "FEMALE", "OTHER", "UNDISCLOSED"][Math.floor(Math.random() * 4)],
        applicationPortal: Math.floor(Math.random() * 5) + 1,
        applicationProcess: Math.floor(Math.random() * 5) + 1,
        improvement: v4(),
        informant: v4(),
      };

      const response = await u.post("/application/@me/survey", surveyData);
      expect(response.status).toBe(201);
      expect(response.body.city).toBe(surveyData.city);
      expect(response.body.school).toBe(surveyData.school);
      expect(response.body.gender).toBe(surveyData.gender);
      expect(response.body.applicationPortal).toBe(surveyData.applicationPortal);
      expect(response.body.applicationProcess).toBe(surveyData.applicationProcess);
      expect(response.body.improvement).toBe(surveyData.improvement);
      expect(response.body.informant).toBe(surveyData.informant);
      expect(Math.round(new Date(response.body.created).valueOf() / 1000)).toBe(Math.round(new Date().valueOf() / 1000));
    });
  });

  describe("GET /application/:userID/survey", function () {
    it("should return 200", async () => {
      const p = new Profile(request);
      const u = await p.createApplicant();

      const surveyData = {
        city: v4(),
        school: v4(),
        gender: ["MALE", "FEMALE", "OTHER", "UNDISCLOSED"][Math.floor(Math.random() * 4)],
        applicationPortal: Math.floor(Math.random() * 5) + 1,
        applicationProcess: Math.floor(Math.random() * 5) + 1,
        improvement: v4(),
        informant: v4(),
      };

      await u.post("/application/@me/survey", surveyData);

      const response = await u.get("/application/@me/survey");
      expect(response.status).toBe(200);
      expect(response.body.city).toBe(surveyData.city);
      expect(response.body.school).toBe(surveyData.school);
      expect(response.body.gender).toBe(surveyData.gender);
      expect(response.body.applicationPortal).toBe(surveyData.applicationPortal);
      expect(response.body.applicationProcess).toBe(surveyData.applicationProcess);
      expect(response.body.improvement).toBe(surveyData.improvement);
      expect(response.body.informant).toBe(surveyData.informant);
      expect(Math.round(new Date(response.body.created).valueOf() / 1000)).toBe(Math.round(new Date().valueOf() / 1000));
    });
  });

  describe("POST /application/:userID/recommendation/:recommendationIndex", function () {
    it("should return 201", async () => {
      const p = new Profile(request);
      const u = await p.createApplicant();
      const index = Math.floor(Math.random() * 3);
      const email = `${v4()}@${v4()}.com`;

      const response = await u.post(`/application/@me/recommendation/${index}`, { email });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.applicantId).toBe(u.id);
      expect(response.body.email).toBe(email);
      expect(Math.round(new Date(response.body.lastSent).valueOf() / 1000)).toBe(Math.round(new Date().valueOf() / 1000));
      expect(response.body.received).toBe(null);
      expect(response.body.index).toBe(index);
    });
  });

  describe("GET /application/:userID/recommendation/:recommendationIndex", function () {
    it("should return 200", async () => {
      const p = new Profile(request);
      const u = await p.createApplicant();
      const emails = [];
      const sent = [];

      for (let i = 0; i < 2; i++) {
        const email = `${v4()}@${v4()}.com`;
        emails.push(email);

        await u.post(`/application/@me/recommendation/${i}`, { email });
        sent.push(new Date().valueOf());
      }

      const response = await u.get(`/application/@me/recommendation`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);

      response.body.forEach(recommendation => {
        expect(recommendation.id).toBeDefined();
        expect(recommendation.index).toBeDefined();
        expect(recommendation.email).toBe(emails[recommendation.index]);
        expect(Math.round(new Date(recommendation.lastSent).valueOf() / 1000)).toBe(Math.round(sent[recommendation.index] / 1000));
        expect(recommendation.received).toBe(null);
      });
    });
  });

  describe("DELETE /application/:userID/recommendation/:recommendationIndex", function () {
    it("should return 204", async () => {
      const p = new Profile(request);
      const u = await p.createApplicant();
      const emails = [];
      const sent = [];

      for (let i = 0; i < 2; i++) {
        const email = `${v4()}@${v4()}.com`;
        emails.push(email);

        await u.post(`/application/@me/recommendation/${i}`, { email });
        sent.push(new Date().valueOf());
      }

      let response = await u.delete(`/application/@me/recommendation/1`);
      expect(response.status).toBe(204);

      response = await u.get(`/application/@me/recommendation`);
      expect(response.body.length).toBe(1);
      expect(response.body[0].index).toBe(0);
      expect(response.body[0].email).toBe(emails[0]);
    });
  });

  describe("GET /application/recommendation/:recommendationCode", function () {
    it("should return 200", async () => {
      const p = new Profile(request);
      const u = await p.createApplicant();
      const index = Math.floor(Math.random() * 3);
      const email = `${v4()}@${v4()}.com`;

      let response = await u.post(`/application/@me/recommendation/${index}`, { email });

      const recommendationId = response.body.id;
      const recommendationCode = response.body.code;

      response = await u.get(`/application/recommendation/${recommendationCode}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(recommendationId);
      expect(response.body.code).toBe(recommendationCode);
      expect(response.body.email).toBe(email);
      expect(response.body.applicantId).toBe(u.id);
      expect(response.body.applicantEmail).toBe(u.email);
      expect(response.body.applicantFirstName).toBe(u.firstName);
      expect(response.body.applicantLastName).toBe(u.lastName);
      expect(response.body.fileId).toBe(null);
      expect(response.body.fileType).toBe(null);
      expect(response.body.fileCreated).toBe(null);
      expect(response.body.fileName).toBe(null);
      expect(response.body.fileMime).toBe(null);
    });
  });

  describe("POST /application/recommendation/:recommendationCode", function () {
    it("should return 200", async () => {
      const p = new Profile(request);
      const u = await p.createApplicant();
      const index = Math.floor(Math.random() * 3);
      const email = `${v4()}@${v4()}.com`;

      let response = await u.post(`/application/@me/recommendation/${index}`, { email });

      const recommendationCode = response.body.code;

      response = await request.post(`/application/recommendation/${recommendationCode}`).attach("file", "test/assets/004mb.pdf");
      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.type).toBe("RECOMMENDATION_LETTER");
      expect(Math.round(new Date(response.body.created).valueOf() / 1000)).toBe(Math.round(new Date().valueOf() / 1000));
      expect(response.body.name).toBe("004mb.pdf");
      expect(response.body.mime).toBe("application/pdf");
    });
  });
});
