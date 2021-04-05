const supertest = require("supertest");
const { v4 } = require("uuid");

const Profile = require("../profile");

const request = supertest("http://localhost:8080");

describe("Admin", function () {
  describe("POST /admin", function () {
    it("should return 201 for super admin", async () => {
      const p = new Profile(request);
      const u = p.newSuperAdmin();

      await p.superAdmin.loggedin;
      let response = await p.superAdmin.post("/admin", u.getUser());
      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.email).toBe(u.email);
      expect(response.body.firstName).toBe(u.firstName);
      expect(response.body.lastName).toBe(u.lastName);
      expect(response.body.type).toBe("SUPER_ADMIN");
      expect(response.body.verified).toBe(false);
      expect(Math.round(new Date(response.body.created).valueOf() / 1000)).toBe(Math.round(new Date().valueOf() / 1000));

      response = await request.post("/user/send_email_login_code").send({ email: u.email });

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it("should return 201 for admin", async () => {
      const p = new Profile(request);
      const u = p.newAdmin();

      await p.superAdmin.loggedin;
      let response = await p.superAdmin.post("/admin", u.getUser());
      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.email).toBe(u.email);
      expect(response.body.firstName).toBe(u.firstName);
      expect(response.body.lastName).toBe(u.lastName);
      expect(response.body.type).toBe("ADMIN");
      expect(response.body.verified).toBe(false);
      expect(Math.round(new Date(response.body.created).valueOf() / 1000)).toBe(Math.round(new Date().valueOf() / 1000));

      response = await request.post("/user/send_email_login_code").send({ email: u.email });

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });
  });

  describe("GET /admin", function () {
    it("should return 200", async () => {
      const p = new Profile(request);
      const admins = await Promise.all([p.createAdmin(), p.createSuperAdmin()]);

      const adminMap = new Map();
      admins.forEach(admin => {
        adminMap.set(admin.id, admin);
      });

      await p.superAdmin.loggedin;
      const response = await p.superAdmin.get("/admin", { skip: 0, limit: 128 });

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThanOrEqual(3);
      expect(response.body[0].id).toBeDefined();
      expect(response.body[0].email).toBeDefined();
      expect(response.body[0].firstName).toBeDefined();
      expect(response.body[0].lastName).toBeDefined();
      expect(response.body[0].type).toBeDefined();
      expect(response.body[0].verified).toBeDefined();
      expect(response.body[0].created).toBeDefined();
    });
  });

  describe("POST /application/:userID/grade", function () {
    it("should return 201", async () => {
      const p = new Profile(request);
      const [u, a] = await Promise.all([p.createAdmin(), p.createApplicant()]);

      const grade = {
        cv: Math.floor(Math.random() * 5) + 1,
        coverLetter: Math.floor(Math.random() * 5) + 1,
        essays: Math.floor(Math.random() * 5) + 1,
        grades: Math.floor(Math.random() * 5) + 1,
        recommendations: Math.floor(Math.random() * 5) + 1,
        overall: Math.floor(Math.random() * 5) + 1,
        comment: v4(),
      };

      const response = await u.post(`/application/${a.id}/grade`, grade);

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      delete response.body.id;
      expect(response.body).toMatchObject(grade);
    });
  });

  describe("GET /admin/survey", function () {
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

      await p.superAdmin.loggedin;
      const response = await p.superAdmin.get("/admin/survey");
      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      expect(response.body[0].applicantId).toBeDefined();
      expect(response.body[0].city).toBeDefined();
      expect(response.body[0].school).toBeDefined();
      expect(response.body[0].gender).toBeDefined();
      expect(response.body[0].applicationPortal).toBeDefined();
      expect(response.body[0].applicationProcess).toBeDefined();
      expect(response.body[0].improvement).toBeDefined();
      expect(response.body[0].informant).toBeDefined();
      expect(response.body[0].created).toBeDefined();
    });
  });

  describe("POST /admin/grading/randomise", function () {
    it("should return 200", async () => {
      const p = new Profile(request);
      const admin = await p.createAdmin();
      const applicants = await Promise.all([p.createApplicant(), p.createApplicant(), p.createApplicant()]);

      const response = await admin.post("/admin/grading/randomise");
      expect(response.status).toBe(200);
      expect(response.body[0].id).toBeDefined();
      expect(response.body[0].adminId).toBeDefined();
      expect(response.body[0].applicantId).toBeDefined();
      expect(response.body[0].order).toBeDefined();
      expect(response.body[0].done).toBeDefined();
    });
  });

  describe("GET /admin/grading", function () {
    it("should return 200", async () => {
      const p = new Profile(request);
      const admin = await p.createAdmin();
      const applicants = await Promise.all([p.createApplicant(), p.createApplicant(), p.createApplicant()]);

      await request.post("/application/@me/file/cv").set("Authorization", `Bearer ${applicants[0].accessToken}`).attach("file", "test/assets/004mb.pdf");

      const grade = {
        cv: Math.floor(Math.random() * 5) + 1,
        coverLetter: Math.floor(Math.random() * 5) + 1,
        essays: Math.floor(Math.random() * 5) + 1,
        grades: Math.floor(Math.random() * 5) + 1,
        recommendations: Math.floor(Math.random() * 5) + 1,
        overall: Math.floor(Math.random() * 5) + 1,
        comment: v4(),
      };

      await admin.post(`/application/${applicants[0].id}/grade`, grade);
      await admin.post("/admin/grading/randomise");
      const response = await admin.get("/admin/grading");
      expect(response.status).toBe(200);
      expect(response.body[0].id).toBeDefined();
      expect(response.body[0].adminId).toBeDefined();
      expect(response.body[0].applicantId).toBeDefined();
      expect(response.body[0].order).toBeDefined();
      expect(response.body[0].done).toBeDefined();

      let found = false;

      response.body.forEach(applicant => {
        if (applicant.applicantId === applicants[0].id) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(applicant.done).toBe(true);
          found = true;
        }
      });

      expect(found).toBe(true);
    });
  });

  describe("GET /application/:userID/grade", function () {
    it("should return 200", async () => {
      const p = new Profile(request);
      const [u1, u2, a] = await Promise.all([p.createAdmin(), p.createAdmin(), p.createApplicant()]);

      const grades = [
        {
          cv: Math.floor(Math.random() * 5) + 1,
          coverLetter: Math.floor(Math.random() * 5) + 1,
          essays: Math.floor(Math.random() * 5) + 1,
          grades: Math.floor(Math.random() * 5) + 1,
          recommendations: Math.floor(Math.random() * 5) + 1,
          overall: Math.floor(Math.random() * 5) + 1,
          comment: v4(),
          adminId: u1.id,
        },
        {
          cv: Math.floor(Math.random() * 5) + 1,
          coverLetter: Math.floor(Math.random() * 5) + 1,
          essays: Math.floor(Math.random() * 5) + 1,
          grades: Math.floor(Math.random() * 5) + 1,
          recommendations: Math.floor(Math.random() * 5) + 1,
          overall: Math.floor(Math.random() * 5) + 1,
          comment: v4(),
          adminId: u2.id,
        },
      ];

      let response = await u1.post(`/application/${a.id}/grade`, grades[0]);
      grades[0].id = response.body.id;

      response = await u2.post(`/application/${a.id}/grade`, grades[1]);
      grades[1].id = response.body.id;

      response = await u1.get(`/application/${a.id}/grade`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(grades);
    });
  });

  describe("GET /application", function () {
    it("should return 200", async () => {
      const p = new Profile(request);
      const admins = await Promise.all([p.createAdmin(), p.createAdmin()]);
      const applicants = await Promise.all([p.createApplicant(), p.createApplicant()]);

      const grades = {};
      const applicantsMap = {};

      applicants.forEach(applicant => {
        applicantsMap[applicant.id] = applicant;
      });

      await Promise.all(
        applicants.map(async applicant => {
          grades[applicant.id] = await Promise.all(
            admins.map(async admin => {
              const grade = {
                cv: Math.floor(Math.random() * 5) + 1,
                coverLetter: Math.floor(Math.random() * 5) + 1,
                essays: Math.floor(Math.random() * 5) + 1,
                grades: Math.floor(Math.random() * 5) + 1,
                recommendations: Math.floor(Math.random() * 5) + 1,
                overall: Math.floor(Math.random() * 5) + 1,
                comment: v4(),
              };

              await admin.post(`/application/${applicant.id}/grade`, grade);

              return grade;
            }),
          );
        }),
      );

      await Promise.all(
        applicants.map(async applicant => {
          const surveyData = {
            city: v4(),
            school: v4(),
            gender: ["MALE", "FEMALE", "OTHER", "UNDISCLOSED"][Math.floor(Math.random() * 4)],
            applicationPortal: Math.floor(Math.random() * 5) + 1,
            applicationProcess: Math.floor(Math.random() * 5) + 1,
            improvement: v4(),
            informant: v4(),
          };

          applicant.school = surveyData.school;
          applicant.city = surveyData.city;

          return applicant.post("/application/@me/survey", surveyData);
        }),
      );

      // this returns all applicants in the database and thus must be filtered
      const response = await admins[0].get("/application");

      expect(response.status).toBe(200);

      const realBody = response.body.filter(applicant => {
        if (grades[applicant.id]) {
          return applicant;
        }
      });

      realBody.forEach(applicant => {
        const realApplicant = applicantsMap[applicant.id];
        expect(applicant.id).toBe(realApplicant.id);
        expect(applicant.email).toBe(realApplicant.email);
        expect(applicant.finnish).toBe(realApplicant.finnish);
        expect(applicant.birthdate).toBe(realApplicant.birthdate);
        expect(applicant.firstName).toBe(realApplicant.firstName);
        expect(applicant.lastName).toBe(realApplicant.lastName);
        expect(applicant.city).toBe(realApplicant.city);
        expect(applicant.school).toBe(realApplicant.school);

        expect(applicant.cv).toBeCloseTo((grades[applicant.id][0].cv + grades[applicant.id][1].cv) / 2);
        expect(applicant.coverLetter).toBeCloseTo((grades[applicant.id][0].coverLetter + grades[applicant.id][1].coverLetter) / 2);
        expect(applicant.essays).toBeCloseTo((grades[applicant.id][0].essays + grades[applicant.id][1].essays) / 2);
        expect(applicant.grades).toBeCloseTo((grades[applicant.id][0].grades + grades[applicant.id][1].grades) / 2);
        expect(applicant.recommendations).toBeCloseTo((grades[applicant.id][0].recommendations + grades[applicant.id][1].recommendations) / 2);
        expect(applicant.overall).toBeCloseTo((grades[applicant.id][0].overall + grades[applicant.id][1].overall) / 2);
      });
    });
  });
});
