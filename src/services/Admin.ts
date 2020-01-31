import bcrypt from 'bcryptjs';
import hasha from 'hasha';
import Hogan from 'hogan.js';
import knex from 'knex';
import pdfjs from 'pdfjs';

import { generateCoverPage, generateID, sendMail, mapOrder } from 'utils';

import database from 'types/database';

export default class Admin {
    private knex: knex;
    private db: {
        admins(): knex.QueryBuilder<database.admins>,
        emails(): knex.QueryBuilder<database.emails>,
        files(): knex.QueryBuilder<database.files>,
        grades: () => knex.QueryBuilder<database.grades>,
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
            'grades': () => this.knex<database.grades>('grades'),
            'surveys': () => this.knex<database.surveys>('surveys'),
            'tokens': () => this.knex<database.files>('tokens'),
            'users': () => this.knex<database.users>('users'),
        };
    }

    public async addAdmin(adminData: Omit<database.admins, 'id' | 'password' | 'grading_order'>) {
        const admin: database.admins = {
            'id': generateID(16),
            'password': null,
            'grading_order': [],
            ...adminData
        };
        return this.db.admins().insert(admin);
    }

    public async getApplications(): Promise<Array<database.users>> {
        return this.db.users().select('birthdate', 'email', 'finnish', 'id', 'name');
    }

    public async getApplicationOrder(adminID: string): Promise<Array<any>> {
        const [order, users, grades] = await Promise.all([
            this.db.admins().select('grading_order').where({ 'id': adminID }).first(),
            this.db.users().select('birthdate', 'email', 'finnish', 'id', 'name'),
            this.db.grades().select('id').where({ 'admin_id': adminID })
        ]);

        users.forEach(function (user: database.users, index: number) {
            const found = grades.findIndex(function (grade: database.grades) {
                return grade.user_id === user.id;
            });

            if (found > -1) {
                users[index].done = true;
            }
        });

        return mapOrder(users, order, 'id');
    }

    public async getApplication(userID: string): Promise<Buffer> {
        const [files, user, survey] = await Promise.all([
            this.db.files().select('type', 'file').where({ 'user_id': userID }),
            this.db.users().select('*').where({ 'id': userID }).first(),
            this.db.surveys().select('city', 'school').where({ 'user_id': userID }).first()
        ]);

        const recommendationLetters: Array<string> = [];

        for (const letter of user.recommendations) {
            if (letter.received) { recommendationLetters.push(letter.email); }
        }

        const coverLetterEssay: any = {};
        files.forEach(function (file: any) {
            if (file.type === 'coverLetter' || file.type === 'essay') {
                coverLetterEssay[file.type] = file.file;
            }
        });

        if (survey) {
            user.city = survey.city;
            user.school = survey.school;
        }

        const coverPage = await generateCoverPage(user, recommendationLetters, coverLetterEssay);

        const pdfs: Array<Buffer> = [coverPage];
        for (const type of ['cv', 'coverLetter', 'essay', 'grades']) {
            const index = files.findIndex((file: database.files) => file.type === type);
            if (index > -1) {
                pdfs.push(files[index].file);
            }
        }

        files.forEach(function (file: any) {
            if (file.type === 'recommendation') {
                pdfs.push(file.file);
            }
        });

        const doc = new pdfjs.Document();

        for (const pdf of pdfs) {
            const ext = new pdfjs.ExternalDocument(pdf);
            doc.addPagesOf(ext);
        }

        return doc.asBuffer();
    }
}
