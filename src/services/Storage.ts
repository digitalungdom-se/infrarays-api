import knex from "knex";
import fs from "fs-extra";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import mime from "mime-types";

import { FileType } from "types";
import database from "types/database";
import { Config } from "configs";
import { IFilePublic } from "interfaces/IStorage";

export class StorageService {
  private readonly db: {
    files(): knex.QueryBuilder<database.Files>;
  };

  constructor(private readonly knex: knex, private readonly config: typeof Config) {
    this.db = {
      files: (): knex.QueryBuilder<database.Files> => this.knex<database.Files>("files"),
    };
  }

  public async getByID(fileID: string): Promise<database.Files | undefined> {
    return this.db.files().where({ id: fileID }).select("*").first();
  }

  public async getForUser(userID: string): Promise<database.Files[]> {
    const files = (await this.db.files().where({ userId: userID }).select("*")) as database.Files[];

    return files;
  }

  public async create(userID: string, fileData: { name: string; path: string; mime: string; type: string; id?: string }): Promise<database.Files> {
    const fileExt = mime.extension(fileData.mime);

    await fs.ensureDir(path.join(this.config.server.store, userID));

    const fileID = fileData.id || uuidv4();
    const fileName = `${fileID}.${fileExt}`;
    const dest = path.join(this.config.server.store, userID, fileName);

    await fs.move(fileData.path, dest, { overwrite: true });

    const file = {
      id: fileID,
      userId: userID,
      type: fileData.type,
      created: moment.utc().toDate(),
      name: fileData.name,
      path: dest,
      mime: fileData.mime,
    };

    await this.db.files().insert(file);

    return file;
  }

  public async del(fileID: string): Promise<void> {
    const file = (await this.db.files().where({ id: fileID }).del().returning("*"))[0];

    await fs.remove(file.path);
  }

  public async delUserFiles(userID: string): Promise<void> {
    const userDir = path.join(this.config.server.store, userID);

    await fs.remove(userDir);
  }

  public async delFileType(userID: string, fileType: string): Promise<void> {
    const file = await this.db.files().where({ userId: userID, type: fileType }).del().returning("*");

    await Promise.all(
      file.map(async file => {
        return await fs.remove(file.path);
      }),
    );
  }

  public toFilePublic(file: database.Files): IFilePublic {
    return {
      id: file.id,
      userId: file.userId,
      type: file.type as FileType,
      created: file.created,
      name: file.name,
      mime: file.mime,
    };
  }
}
