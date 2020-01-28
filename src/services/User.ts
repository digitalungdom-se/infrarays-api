import bcrypt from 'bcryptjs';
import hasha from 'hasha';
import Hogan from 'hogan.js';
import knex from 'knex';
import pdfjs from 'pdfjs';

import fs from 'fs';

import { generateCoverPage, generateID, sendMail } from 'utils';

import database from 'types/database';

export default class User {
    private knex: knex;
    private db: {
        emails(): knex.QueryBuilder<database.emails>,
        files(): knex.QueryBuilder<database.files>,
        tokens(): knex.QueryBuilder<database.tokens>,
        users(): knex.QueryBuilder<database.users>,
    };

    constructor(knexInput: knex) {
        this.knex = knexInput;
        this.db = {
            'emails': () => this.knex<database.emails>('emails'),
            'files': () => this.knex<database.files>('files'),
            'tokens': () => this.knex<database.files>('tokens'),
            'users': () => this.knex<database.users>('users'),
        };
    }

    public async register(userData: Omit<database.users, 'id' | 'recommendations' | 'verified'>) {
        const userID = generateID(16);
        const user: database.users = {
            'birthdate': userData.birthdate,
            'email': userData.email,
            'finnish': userData.finnish,
            'id': userID,
            'name': userData.name,
            'password': await bcrypt.hash(userData.password, 12),
            'recommendations': [],
            'verified': false,
        };

        const token = generateID(16);

        const templateData = (await this.db.emails().select('content').where({'type': 'verify_email'}).first()).content;
        const template = Hogan.compile(templateData);
        const body = template.render({token});

        await Promise.all([
            this.db.users().insert(user),
            this.db.tokens().insert({'id': token, 'type': 'verify_email', 'user_id': userID}),
            sendMail(userData.email, 'Verifiera din din e-postadress', body),
        ]);
    }

    public async uploadFile(userID: string, fileBuffer: Buffer, fileType: string, fileName: string) {
        const fileID = await this.db.files().select('id').where({ 'user_id': userID, 'type': fileType }).first();
        if (fileID) {
            await this.db.files().where({ 'id': fileID.id }).update({'file': fileBuffer, 'created': new Date(), 'file_name': fileName});

            return;
        }

        const fileData: database.files = {
            'created': new Date(),
            'file': fileBuffer,
            'file_name': fileName,
            'id': generateID(16),
            'type': fileType,
            'user_id': userID,
        };

        await this.db.files().insert(fileData);
    }

    public async deleteApplication(userID: string) {
        const [user, email] = await Promise.all([
            this.db.users().select('email').where({'id': userID}),
            this.db.emails().select('content').where({'type': 'delete_confirmation'}),
        ]);

        const templateData = (email).content;
        const template = Hogan.compile(templateData);
        const body = template.render({});

        await Promise.all([
            this.db.users().where({ 'id': userID }).del(),
            this.db.files().where({ 'user_id': userID }).del(),
            this.db.tokens().where({'user_id': userID}).del(),

            sendMail(user.email, 'Ansökan raderad', body),
        ]);
    }

    public async getCompleteApplication(userID: string): Promise<Buffer> {
        const [files, user] = await Promise.all([
            this.db.files().where({ 'user_id': userID }).whereNot({ 'type': 'recommendation' }).select('type', 'file'),
            this.db.users().where({ 'id': userID }).select('*').first()]);

        const recommendationLetters: Array<string> = [];

        for (const letter of user.recommendations) {
            if (letter.file_id) { recommendationLetters.push(letter.email); }
        }

        const coverPage = await generateCoverPage(user, recommendationLetters, files);

        const pdfs: Array<Buffer> = [coverPage];
        for (const type of ['cv', 'coverLetter', 'essay', 'grades']) {
            const index = files.findIndex((file: database.files) => file.type === type);
            if (index > -1) {
                pdfs.push(files[index].file);
            }
        }

        const doc = new pdfjs.Document();

        for (const pdf of pdfs) {
            const ext = new pdfjs.ExternalDocument(pdf);
            doc.addPagesOf(ext);
        }

        return doc.asBuffer();
    }

    public async sendRecommendationEmail(userID: string, email: string) {
        const user = await this.db.users().select('recommendations', 'name', 'id').where({'id': userID}).first();
        const recommendations = user.recommendations;

        const index = recommendations.findIndex(function(element: any) {
            if (element.email === email) {
                return true;
            }
            return false;
        });
        let id = '';
        if (index > -1) {
            recommendations[index].send_date = new Date();
            id = recommendations[index].id;
        } else {
            id = generateID(16);
            recommendations.push({id, email, 'send_date': new Date(), 'received': false});
        }

        const name = user.name.toLowerCase().split(' ').map((s: string) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');

        const templateData = (await this.db.emails().select('content').where({'type': 'recommendation_send'}).first()).content;
        const template = Hogan.compile(templateData);
        const body = template.render({ 'token': id, 'name': name, 'userID': user.id});

        await Promise.all([
            this.db.users().update({'recommendations': recommendations}).where({'id': userID}),
            sendMail(email, 'Förfrågan att skriva rekommendationsbrev', body),
        ]);
    }

    public async uploadRecommendationLetter(userID: string, recommendationID: string, recommendationBuffer: Buffer, fileName: string) {
        const user = await this.db.users().select('recommendations', 'email').where({'id': userID}).first();
        const recommendations = user.recommendations;
        let uploaderEmail = '';

        recommendations.forEach(function(element: any, index: number) {
            if (element.id === recommendationID) {
                recommendations[index].received = true;
                uploaderEmail = recommendations[index].email;
                delete recommendations[index].send_date;
            }
        });

        const fileData: database.files = {
            'created': new Date(),
            'file': recommendationBuffer,
            'file_name': fileName,
            'id': generateID(16),
            'type': 'recommendation',
            'user_id': userID,
        };

        const templateDataUser = (await this.db.emails().select('content').where({'type': 'recommendation_received'}).first()).content;
        const templateUser = Hogan.compile(templateDataUser);
        const bodyUser = templateUser.render({ 'email': uploaderEmail });

        const templateData = (await this.db.emails().select('content').where({'type': 'recommendation_confirmation'}).first()).content;
        const template = Hogan.compile(templateData);
        const body = template.render({});

        await Promise.all([
            this.db.files().insert(fileData),

            this.db.users().update({'recommendations': recommendations}).where({'id': userID}),

            sendMail(user.email, 'Rekommendationsbrev mottaget', bodyUser),

            sendMail(uploaderEmail, 'Rekommendationsbrev mottaget', body,
            [{'filename': fileName, 'content': recommendationBuffer}]),
        ]);
    }

    public async verify(token: string) {
        const verification = await this.db.tokens().select('user_id').where({'id': token, 'type': 'verify_email'}).first();

        await this.db.users().update({'verified': true}).where({'id': verification.user_id});

        await this.db.tokens().del().where({'id': token, 'type': 'verify_email'});
    }

    public async sendForgotPassword(email: string) {
        const userID = (await this.db.users().select('id').where({email}).first()).id;
        const token = generateID(16);
        const tokenHash = await hasha.async(token, {'encoding': 'base64'});

        const templateData = (await this.db.emails().select('content').where({'type': 'reset_password'}).first()).content;
        const template = Hogan.compile(templateData);
        const body = template.render({token});

        await Promise.all([
            this.db.tokens().insert({'id': tokenHash, 'type': 'reset_password', 'user_id': userID}),
            sendMail(email, 'Återställ lösenord', body),
        ]);
    }

    public async resetPassword(token: string, password: string) {
        const tokenHash = await hasha.async(token, {'encoding': 'base64'});
        const passwordHash = await bcrypt.hash(password, 12);
        const userID = (await this.db.tokens().select('user_id').where({'id': tokenHash, 'type': 'reset_password'}).first()).user_id;

        await this.db.users().update({'password': passwordHash}).where({'id': userID});

        await this.db.tokens().del().where({'id': tokenHash, 'type': 'reset_password'});
    }
}
