import bcrypt from 'bcryptjs';
import hasha from 'hasha';
import Hogan from 'hogan.js';
import knex from 'knex';
import pdfjs from 'pdfjs';

import { generateCoverPage, generateID, sendMail } from 'utils';

import database from 'types/database';

export default class User {
    private knex: knex;
    private db: {
        emails(): knex.QueryBuilder<database.emails>,
        files(): knex.QueryBuilder<database.files>,
        surveys(): knex.QueryBuilder<database.surveys>,
        tokens(): knex.QueryBuilder<database.tokens>,
        users(): knex.QueryBuilder<database.users>,
    };

    constructor(knexInput: knex) {
        this.knex = knexInput;
        this.db = {
            'emails': () => this.knex<database.emails>('emails'),
            'files': () => this.knex<database.files>('files'),
            'surveys': () => this.knex<database.surveys>('surveys'),
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

        const templateData = (await this.db.emails().select('content').where({ 'type': 'verify_email' }).first()).content;
        const template = Hogan.compile(templateData);
        const body = template.render({ token });

        await Promise.all([
            this.db.users().insert(user),
            sendMail(userData.email, 'Verifiera din din e-postadress', body),
        ]);

        await this.db.tokens().insert({ 'id': token, 'type': 'verify_email', 'user_id': userID });
    }

    public async uploadFile(userID: string, fileBuffer: Buffer, fileType: string, fileName: string) {
        const fileID = await this.db.files().select('id').where({ 'user_id': userID, 'type': fileType }).first();
        if (fileID) {
            await this.db.files().where({ 'id': fileID.id }).update({ 'file': fileBuffer, 'created': new Date(), 'file_name': fileName });

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
            this.db.users().select('email').where({ 'id': userID }).first(),
            this.db.emails().select('content').where({ 'type': 'delete_confirmation' }).first(),
        ]);

        const templateData = (email).content;
        const template = Hogan.compile(templateData);
        const body = template.render({});

        await Promise.all([
            this.db.surveys().where({ 'user_id': userID }).del(),
            this.db.files().where({ 'user_id': userID }).del(),
            this.db.tokens().where({ 'user_id': userID }).del(),
        ]);

        await Promise.all([
            this.db.users().where({ 'id': userID }).del(),
            sendMail(user.email, 'Ansökan raderad', body),
        ]);
    }

    public async getCompleteApplication(userID: string): Promise<Buffer> {
        const [files, user, survey] = await Promise.all([
            this.db.files().select('type', 'file').where({ 'user_id': userID }).whereNot({ 'type': 'recommendation' }),
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

        const doc = new pdfjs.Document();

        for (const pdf of pdfs) {
            const ext = new pdfjs.ExternalDocument(pdf);
            doc.addPagesOf(ext);
        }

        return doc.asBuffer();
    }

    public async sendRecommendationEmail(userID: string, email: string, newEmail?: string) {
        const user = await this.db.users().select('recommendations', 'name', 'id').where({ 'id': userID }).first();
        const recommendations = user.recommendations;

        const index = recommendations.findIndex(function (element: any) {
            if (element.email === email) {
                return true;
            }
            return false;
        });

        let id = '';
        if (index > -1) {
            recommendations[index].send_date = new Date();

            if (!newEmail) {
                id = recommendations[index].id;
            } else {
                recommendations[index].id = generateID(16);
                recommendations[index].email = newEmail;
            }
        } else {
            id = generateID(16);
            recommendations.push({ id, email, 'send_date': new Date(), 'received': false });
        }

        const name = user.name.toLowerCase().split(' ').map((s: string) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');

        const templateData = (await this.db.emails().select('content').where({ 'type': 'recommendation_send' }).first()).content;
        const template = Hogan.compile(templateData);
        const body = template.render({ 'token': id, 'name': name, 'userID': user.id });

        await Promise.all([
            this.db.users().update({ 'recommendations': recommendations }).where({ 'id': userID }),
            sendMail(email, 'Förfrågan att skriva rekommendationsbrev', body),
        ]);
    }

    public async uploadRecommendationLetter(userID: string, recommendationID: string, recommendationBuffer: Buffer, fileName: string) {
        const user = await this.db.users().select('recommendations', 'email').where({ 'id': userID }).first();
        const recommendations = user.recommendations;
        let uploaderEmail = '';

        recommendations.forEach(function (element: any, index: number) {
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
            'id': recommendationID,
            'type': 'recommendation',
            'user_id': userID,
        };

        const templateDataUser = (await this.db.emails().select('content').where({ 'type': 'recommendation_received' }).first()).content;
        const templateUser = Hogan.compile(templateDataUser);
        const bodyUser = templateUser.render({ 'email': uploaderEmail });

        const templateData = (await this.db.emails().select('content').where({ 'type': 'recommendation_confirmation' }).first()).content;
        const template = Hogan.compile(templateData);
        const body = template.render({});

        await Promise.all([
            this.db.files().insert(fileData),

            this.db.users().update({ 'recommendations': recommendations }).where({ 'id': userID }),

            sendMail(user.email, 'Rekommendationsbrev mottaget', bodyUser),

            sendMail(uploaderEmail, 'Rekommendationsbrev mottaget', body,
                [{ 'filename': fileName, 'content': recommendationBuffer }]),
        ]);
    }

    public async verify(token: string): Promise<string> {
        const verification = await this.db.tokens().select('user_id').where({ 'id': token, 'type': 'verify_email' }).first();

        await Promise.all([
            this.db.users().update({ 'verified': true }).where({ 'id': verification.user_id }),
            this.db.tokens().del().where({ 'id': token, 'type': 'verify_email' }),
        ]);

        return verification.user_id;
    }

    public async sendForgotPassword(email: string) {
        const userID = (await this.db.users().select('id').where({ email }).first()).id;
        const token = generateID(16);
        const tokenHash = await hasha.async(token, { 'encoding': 'base64' });

        const [templateDataRow, tokenExists] = await Promise.all([
            this.db.emails().select('content').where({ 'type': 'reset_password' }).first(),
            this.db.tokens().select('id').where({ 'user_id': userID, 'type': 'reset_password' }).first()
        ]);

        const templateData = templateDataRow.content;
        const template = Hogan.compile(templateData);
        const body = template.render({ token });

        const promiseArray: any = [sendMail(email, 'Återställ lösenord', body)];

        if (tokenExists) {
            promiseArray.push(this.db.tokens().update({ 'id': tokenHash }).where({ 'user_id': userID, 'type': 'reset_password' }));
        } else {
            promiseArray.push(this.db.tokens().insert({ 'id': tokenHash, 'type': 'reset_password', 'user_id': userID }));
        }

        await Promise.all(promiseArray);
    }

    public async resetPassword(token: string, password: string): Promise<string> {
        const tokenHash = await hasha.async(token, { 'encoding': 'base64' });
        const passwordHash = await bcrypt.hash(password, 12);
        const userID = (await this.db.tokens().select('user_id').where({ 'id': tokenHash, 'type': 'reset_password' }).first()).user_id;

        await this.db.users().update({ 'password': passwordHash }).where({ 'id': userID });

        await this.db.tokens().del().where({ 'id': tokenHash, 'type': 'reset_password' });

        return userID;
    }

    public async getRecommendationInfo(userID: string, recommendationID: string): Promise<{ name: string, fileName?: string, received: boolean, uploaded?: Date; }> {
        const [user, file] = await Promise.all([
            this.db.users().select('name').where({ 'id': userID }).first(),
            this.db.files().select('file_name', 'created').where({ 'id': recommendationID }).first()
        ]);

        if (file) {
            return { 'name': user.name, 'fileName': file.file_name, 'received': true, 'uploaded': file.created };
        }

        return { 'name': user.name, 'received': false };

    }

    public async updateSurvey(userID: string, surveyData: Omit<database.surveys, 'id' | 'user_id'>) {
        const survey: database.surveys = {
            'id': generateID(16),
            'user_id': userID,
            ...surveyData
        };

        const surveyExists = await this.db.surveys().select('id').where({ 'user_id': userID }).first();

        if (surveyExists) {
            survey.id = surveyExists.id;

            await this.db.surveys().update(survey).where({ 'id': survey.id });
        } else {
            await this.db.surveys().insert(survey);
        }
    }

    public async resendVerification(email: string) {
        const user = await this.db.users().select('id', 'verified').where({ 'email': email }).first();
        const token = await this.db.tokens().select('id').where({ 'user_id': user.id }).first();

        const templateData = (await this.db.emails().select('content').where({ 'type': 'verify_email' }).first()).content;
        const template = Hogan.compile(templateData);
        const body = template.render({ 'token': token.id });

        await sendMail(email, 'Verifiera din din e-postadress', body);
    }
}
