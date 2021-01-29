import knex from "knex";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";

import database from "types/database";
import { IUserInput, IUserUpdate } from "interfaces";
import { StorageService } from "./";
import { UserType } from "types";

export class UserService {
  private readonly db: {
    applications(): knex.QueryBuilder<database.Applications>;
    grades(): knex.QueryBuilder<database.Grades>;
    users(): knex.QueryBuilder<database.Users>;
  };

  private readonly cache: {
    users: Map<string, database.Users>;
  };

  constructor(private readonly knex: knex, private readonly Storage: StorageService) {
    this.db = {
      applications: (): knex.QueryBuilder<database.Applications> => this.knex<database.Applications>("applications"),
      grades: (): knex.QueryBuilder<database.Grades> => this.knex<database.Grades>("grades"),
      users: (): knex.QueryBuilder<database.Users> => this.knex<database.Users>("users"),
    };

    this.cache = { users: new Map() };
  }

  public async getApplicants(): Promise<any[]> {
    const [applications, grades] = await Promise.all([
      this.db
        .applications()
        .select({
          id: "applications.userId",
          email: "users.email",
          firstName: "users.firstName",
          lastName: "users.lastName",

          finnish: "applications.finnish",
          birthdate: "applications.birthdate",

          city: "surveys.city",
          school: "surveys.school",
        })
        .join("surveys", "applications.userId", "surveys.applicantId")
        .join("users", "applications.userId", "users.id"),
      this.db.grades().select("applicantId").avg({ cv: "cv", coverLetter: "coverLetter", essays: "essays", grades: "grades", recommendations: "recommendations", overall: "overall" }).groupBy("applicantId"),
    ]);

    const gradesHashMap = new Map();

    grades.forEach((grade: any) => {
      gradesHashMap.set(grade.applicantId, grade);
    });

    return applications.map((applicant: any) => {
      if (gradesHashMap.has(applicant.id)) {
        applicant = { ...applicant, ...gradesHashMap.get(applicant.id) };
        delete applicant.applicantId;
      }

      return applicant;
    });
  }

  public async getUsers(applicants?: boolean): Promise<database.Users[]> {
    if (applicants) {
      return (this.db.users().select("*").where({ type: UserType.Applicant }) as unknown) as database.Users[];
    } else {
      return (this.db.users().select("*").where({ type: UserType.Admin }).orWhere({ type: UserType.SuperAdmin }) as unknown) as database.Users[];
    }
  }

  public async getAdmins(skip: number, limit: number): Promise<database.Users[]> {
    return this.db.users().where({ type: UserType.Admin }).orWhere({ type: UserType.SuperAdmin }).orderBy("lastName", "asc").orderBy("firstName", "asc").offset(skip).limit(limit);
  }

  public async getByID(id: string): Promise<database.Users | undefined> {
    if (this.cache.users.has(id)) {
      return this.cache.users.get(id);
    }

    const user = await this.db.users().where({ id }).select("*").first();

    if (user) {
      this.cache.users.set(id, user);
    }

    return user;
  }

  public async getByEmail(email: string): Promise<database.Users | undefined> {
    let user;
    this.cache.users.forEach(userCached => {
      if (userCached.email === email) {
        user = userCached;
      }
    });

    if (user) {
      return user;
    }

    user = await this.db.users().where({ email }).select("*").first();

    if (user) {
      this.cache.users.set(user.id, user);
    }

    return user;
  }

  public async create(userData: IUserInput): Promise<database.Users> {
    const user = {
      id: uuidv4(),
      ...userData,
      verified: false,
      created: moment.utc().toDate(),
    };

    await this.db.users().insert(user);

    return user;
  }

  public async verify(userID: string): Promise<void> {
    await this.db.users().where({ id: userID }).update({ verified: true });
  }

  public async update(id: string, update: IUserUpdate): Promise<database.Users> {
    return (await this.db.users().where({ id }).update(update).returning("*"))[0];
  }

  public async delete(id: string): Promise<void> {
    await Promise.all([this.db.users().where({ id }).del(), this.Storage.delUserFiles(id)]);
  }
}
