const { v4 } = require("uuid");
const moment = require("moment");

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

class Profile {
  constructor(request) {
    this.request = request;
    this.users = [];
    this.superAdmins = [];
    this.admins = [];

    // default super admin
    this.superAdmin = new Admin(request, "SUPER_ADMIN");
    this.superAdmin.id = "00000000-0000-0000-0000-000000000000";
    this.superAdmin.firstName = "Super";
    this.superAdmin.lastName = "Admin";
    this.superAdmin.email = "super@admin.com";

    this.superAdmin.loggedin = this.superAdmin.login(); // logs in superAdmin for each profile, can be optimised by using a global superAdmin
    this.superAdmins.push(this.superAdmin);
  }

  newApplicant() {
    const user = new Applicant(this.request);

    return user;
  }

  async createApplicant() {
    const user = new Applicant(this.request);
    await user.register();
    await user.login();
    this.users.push(user);

    return user;
  }

  newSuperAdmin() {
    const superAdmin = new Admin(this.request, "SUPER_ADMIN");

    return superAdmin;
  }

  newAdmin() {
    const admin = new Admin(this.request, "ADMIN");

    return admin;
  }

  async createSuperAdmin() {
    const superAdmin = this.newSuperAdmin();

    await this.superAdmin.loggedin;

    const resp = await this.superAdmin.post("/admin", { ...superAdmin.getUser() });
    superAdmin.id = resp.body.id;

    await superAdmin.login();

    this.superAdmins.push(superAdmin);

    return superAdmin;
  }

  async createAdmin() {
    const admin = this.newAdmin();

    await this.superAdmin.loggedin;

    const resp = await this.superAdmin.post("/admin", { ...admin.getUser() });
    admin.id = resp.body.id;

    await admin.login();

    this.admins.push(admin);

    return admin;
  }
}

class Admin {
  constructor(request, type) {
    this.request = request;
    this.id = "";
    this.email = `${v4()}@${v4()}.com`;
    this.firstName = v4();
    this.lastName = v4();
    this.accessToken = "";
    this.refreshToken = "";
    this.loggedin = undefined;
    this.type = type;
  }

  getUser() {
    return {
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      type: this.type,
    };
  }

  async login() {
    const codeResp = await this.request.post("/user/send_email_login_code").send({ email: this.email });

    const token = Buffer.from(`${this.email}:${codeResp.body}`).toString("base64");

    const tokenResp = await this.request.post("/user/oauth/token").send({ grant_type: "client_credentials" }).set("Authorization", `Email ${token}`);

    this.accessToken = tokenResp.body.access_token;
    this.refreshToken = tokenResp.body.refresh_token;
  }

  async refreshAccessToken() {
    const tokenResp = await this.request.post("/user/oauth/token").send({ grant_type: "refresh_token", refresh_token: this.refreshToken });

    this.accessToken = tokenResp.body.access_token;
    this.refreshToken = tokenResp.body.refresh_token;
  }

  async get(route, query) {
    return await this.request.get(route).query(query).set("Authorization", `Bearer ${this.accessToken}`);
  }

  async post(route, body) {
    return await this.request.post(route).send(body).set("Authorization", `Bearer ${this.accessToken}`);
  }

  async put(route, body) {
    return await this.request.put(route).send(body).set("Authorization", `Bearer ${this.accessToken}`);
  }

  async patch(route, body) {
    return await this.request.patch(route).send(body).set("Authorization", `Bearer ${this.accessToken}`);
  }

  async delete(route, body) {
    return await this.request.delete(route).send(body).set("Authorization", `Bearer ${this.accessToken}`);
  }
}

class Applicant {
  constructor(request) {
    this.request = request;
    this.id = "";
    this.email = `${v4()}@${v4()}.com`;
    this.firstName = v4();
    this.lastName = v4();
    this.finnish = Math.random() < 0.5;
    this.birthdate = moment
      .utc(randomDate(moment.utc().year(2001).startOf("year").toDate(), moment.utc().year(2003).endOf("year").toDate()))
      .startOf("day")
      .toISOString();
    this.accessToken = "";
    this.refreshToken = "";

    this.city = "";
    this.school = "";
  }

  getUser() {
    return {
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      birthdate: this.birthdate,
      finnish: this.finnish,
    };
  }

  async register() {
    const resp = await this.request.post("/application").send(this.getUser());
    this.id = resp.body.id;
  }

  async login() {
    const codeResp = await this.request.post("/user/send_email_login_code").send({ email: this.email });

    const token = Buffer.from(`${this.email}:${codeResp.body}`).toString("base64");

    const tokenResp = await this.request.post("/user/oauth/token").send({ grant_type: "client_credentials" }).set("Authorization", `Email ${token}`);

    this.accessToken = tokenResp.body.access_token;
    this.refreshToken = tokenResp.body.refresh_token;
  }

  async refreshAccessToken() {
    const tokenResp = await this.request.post("/user/oauth/token").send({ grant_type: "refresh_token", refresh_token: this.refreshToken });

    this.accessToken = tokenResp.body.access_token;
    this.refreshToken = tokenResp.body.refresh_token;
  }

  async get(route, query) {
    return await this.request.get(route).query(query).set("Authorization", `Bearer ${this.accessToken}`);
  }

  async post(route, body) {
    return await this.request.post(route).send(body).set("Authorization", `Bearer ${this.accessToken}`);
  }

  async put(route, body) {
    return await this.request.put(route).send(body).set("Authorization", `Bearer ${this.accessToken}`);
  }

  async patch(route, body) {
    return await this.request.patch(route).send(body).set("Authorization", `Bearer ${this.accessToken}`);
  }

  async delete(route, body) {
    return await this.request.delete(route).send(body).set("Authorization", `Bearer ${this.accessToken}`);
  }
}

module.exports = Profile;
