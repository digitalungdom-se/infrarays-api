const env = process.env.NODE_ENV || "development";

import Knex from "knex";
import knexStringcase from "knex-stringcase";
import moment from "moment";
import pg from "pg";

import knexConfig from "configs/knexfile";
import { Config } from "configs";
import { UserType } from "types";

function parseDates(str: string): Date {
  return moment.utc(str).toDate();
}

pg.types.setTypeParser(pg.types.builtins.DATE, parseDates);
pg.types.setTypeParser(pg.types.builtins.TIME, parseDates);
pg.types.setTypeParser(pg.types.builtins.TIMETZ, parseDates);
pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, parseDates);
pg.types.setTypeParser(pg.types.builtins.TIMESTAMPTZ, parseDates);

// ints
pg.types.setTypeParser(pg.types.builtins.INT2, parseInt);
pg.types.setTypeParser(pg.types.builtins.INT4, parseInt);
pg.types.setTypeParser(pg.types.builtins.INT8, parseInt);

// floats
pg.types.setTypeParser(pg.types.builtins.FLOAT4, parseFloat);
pg.types.setTypeParser(pg.types.builtins.FLOAT8, parseFloat);
pg.types.setTypeParser(pg.types.builtins.NUMERIC, parseFloat);

async function loadPSQL(config: typeof Config): Promise<Knex> {
  const options = knexStringcase(knexConfig[env]);

  const knex = Knex(options);

  if (config.isDevelopment && !(await knex("users").where({ id: "00000000-0000-0000-0000-000000000000" }).select("id").first())) {
    const admin = {
      id: "00000000-0000-0000-0000-000000000000",
      email: "super@admin.com",
      firstName: "Super",
      lastName: "Admin",
      type: UserType.SuperAdmin,
      verified: false,
      created: moment.utc().toDate(),
    };

    await knex("users").insert(admin);
  }

  return knex;
}

export { loadPSQL };
