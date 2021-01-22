import knex from "knex";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";

import database from "types/database";
import { IUserInput, IUserUpdate } from "interfaces";

export class UserService {
  private readonly db: {
    users(): knex.QueryBuilder<database.Users>;
  };

  private readonly cache: {
    users: Map<string, database.Users>;
  };

  constructor(private readonly knex: knex) {
    this.db = {
      users: (): knex.QueryBuilder<database.Users> => this.knex<database.Users>("users"),
    };

    this.cache = { users: new Map() };
  }

  public async get(skip: number, limit: number): Promise<database.Users[]> {
    return this.db.users().orderBy("lastName", "desc").orderBy("firstName", "desc").offset(skip).limit(limit);
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

  public async update(id: string, update: IUserUpdate): Promise<database.Users> {
    return (await this.db.users().where({ id }).update(update).returning("*"))[0];
  }

  public async delete(id: string): Promise<void> {
    await this.db.users().where({ id }).del();
  }
}
