const env = process.env.NODE_ENV || 'development';
import knexConfig from 'configs/knexfile';
import knex from 'knex';
import moment from 'moment';
import pg from 'pg';

function parseDates(str: string): Date {
    return moment.utc(str).toDate();
}

pg.types.setTypeParser(pg.types.builtins.DATE, parseDates);
pg.types.setTypeParser(pg.types.builtins.TIME, parseDates);
pg.types.setTypeParser(pg.types.builtins.TIMETZ, parseDates);
pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, parseDates);
pg.types.setTypeParser(pg.types.builtins.TIMESTAMPTZ, parseDates);

export default knex(knexConfig[env]);
