import knex from 'knex';

import database from 'types/database';

export default class Server {
    private knex: knex;
    private db: {
        admins(): knex.QueryBuilder<database.admins>,
        emails(): knex.QueryBuilder<database.emails>,
        files(): knex.QueryBuilder<database.files>,
        tokens(): knex.QueryBuilder<database.tokens>,
        users(): knex.QueryBuilder<database.users>,
    };

    constructor(knexInput: knex) {
        this.knex = knexInput;
        this.db = {
            'admins': () => this.knex<database.admins>('admins'),
            'emails': () => this.knex<database.emails>('emails'),
            'files': () => this.knex<database.files>('files'),
            'tokens': () => this.knex<database.files>('tokens'),
            'users': () => this.knex<database.users>('users'),
        };
    }

    public async getUserByID(id: string): Promise<database.users> {
        return this.db.users().select().where({ id }).first();
    }

    public async getUserByEmail(email: string): Promise<database.users> {
        return this.db.users().select().where({ email }).first();
    }

    public async getAdminByID(id: string): Promise<database.users> {
        return this.db.admins().select().where({ id }).first();
    }

    public async getAdminByEmail(email: string): Promise<database.users> {
        return this.db.admins().select().where({ email }).first();
    }

    public async getTokenByIDAndType(token: string, type: string): Promise<database.tokens> {
        return this.db.tokens().select().where({ 'id': token, type }).first();
    }
}
