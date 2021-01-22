import { Config } from "./index";

interface KnexConfig {
  development: Record<string, unknown>;
  production: Record<string, unknown>;
  [key: string]: Record<string, unknown>;
}

const knexConfig: KnexConfig = {
  development: {
    client: "pg",
    connection: Config.psql.uri,
    pool: {
      max: 10,
      min: 0,
      afterCreate(connection: any, callback: any): void {
        connection.query("SET TIME ZONE 'UTC';", function (err: Error) {
          callback(err, connection);
        });
      },
    },
    useNullAsDefault: true,

    migrations: {
      directory: "../../database/migrations",
    },
  },

  production: {
    client: "pg",
    connection: Config.psql.uri,
    pool: {
      max: 10,
      min: 0,
      afterCreate(connection: any, callback: any): void {
        connection.query("SET TIME ZONE 'UTC';", function (err: Error) {
          callback(err, connection);
        });
      },
    },
    useNullAsDefault: true,

    migrations: {
      directory: "../../database/migrations",
    },
  },
};

module.exports = knexConfig;
export default knexConfig;
