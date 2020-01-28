import knex from 'knex';

import database from 'types/database';

export default class Admin {
    private knex: knex;
    private db: {
        admins(): knex.QueryBuilder<database.admins>,
        files(): knex.QueryBuilder<database.files>,
        users(): knex.QueryBuilder<database.users>,
    };

    constructor(knexInput: knex) {
        this.knex = knexInput;
        this.db = {
            'admins': () => this.knex<database.admins>('admins'),
            'files': () => this.knex<database.files>('files'),
            'users': () => this.knex<database.users>('users'),
        };
    }
}
