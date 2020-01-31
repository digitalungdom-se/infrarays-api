import knex from 'knex';

import { Optional } from 'express-validator/src/context';
import database, { files, surveys } from 'types/database';

export default class Server {
    private knex: knex;
    private db: {
        admins(): knex.QueryBuilder<database.admins>,
        emails(): knex.QueryBuilder<database.emails>,
        files(): knex.QueryBuilder<database.files>,
        surveys(): knex.QueryBuilder<database.surveys>,
        tokens(): knex.QueryBuilder<database.tokens>,
        users(): knex.QueryBuilder<database.users>,
    };

    constructor(knexInput: knex) {
        this.knex = knexInput;
        this.db = {
            'admins': () => this.knex<database.admins>('admins'),
            'emails': () => this.knex<database.emails>('emails'),
            'files': () => this.knex<database.files>('files'),
            'surveys': () => this.knex<database.surveys>('surveys'),
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

    public async getEmail(emailType: string): Promise<string> {
        return (await this.db.emails().select('content').where({ 'type': emailType }).first() || {}).content;
    }

    public async getAllApplicants(): Promise<Array<{ 'id': string, 'email': string, 'name': string; }>> {
        return this.db.users().select('id', 'email', 'name').where({ 'verified': true });
    }

    public async getSurveyByUserID(userID: string): Promise<database.surveys | undefined> {
        return this.db.surveys().select('*').where({ 'user_id': userID }).first();
    }

    public async getFilesByUserID(userID: string, options?: { returnBuffer?: boolean, returnRecommendations?: boolean; }): Promise<Array<{ type: string, file: Buffer, created: Date, file_name: string; }>> {
        options = options || {};
        const columns = ['type', 'created', 'file_name'];
        const whereNot = options.returnRecommendations ? {} : { 'type': 'recommendation' };
        if (options.returnBuffer) {
            columns.push('file');
        }

        const fileArray = await this.db.files().select(columns).where({ 'user_id': userID }).whereNot(whereNot);

        return fileArray as Array<files>;
    }
}
