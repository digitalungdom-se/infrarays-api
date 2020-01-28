const env = process.env.NODE_ENV || 'development';
import knexConfig from 'configs/knexfile';
import knex from 'knex';

export default knex(knexConfig[env]);
