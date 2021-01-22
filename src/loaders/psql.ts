const env = process.env.NODE_ENV || "development";

import knex from "knex";
import knexStringcase from "knex-stringcase";
import moment from "moment";
import pg from "pg";

import knexConfig from "configs/knexfile";

function parseDates(str: string): Date {
  return moment.utc(str).toDate();
}

pg.types.setTypeParser(pg.types.builtins.DATE, parseDates);
pg.types.setTypeParser(pg.types.builtins.TIME, parseDates);
pg.types.setTypeParser(pg.types.builtins.TIMETZ, parseDates);
pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, parseDates);
pg.types.setTypeParser(pg.types.builtins.TIMESTAMPTZ, parseDates);

function loadPSQL(): knex {
  const options = knexStringcase(knexConfig[env]);

  return knex(options);
}

export { loadPSQL };
