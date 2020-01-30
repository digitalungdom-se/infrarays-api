import express from 'express';
import { body , param} from 'express-validator';
import fileType from 'file-type';
import moment from 'moment';

const sendRecommendationEmail = [
    body('email')
        .isString()
        .isEmail()
        .custom(async function(email, meta) {
            const req = meta.req as unknown as express.Request;

            const id = req.user?.id || '';
            const user = await req.db.server.getUserByID(id);

            if (user.recommendations.length >= 3) {
                if (!req.body.newEmail) {
                    throw new Error('too many');
                }

                const found = user.recommendations.find(function(element: any) {
                    return element.email === email;
                });

                if (!found) {
                    throw new Error('too many');
                }
            }

            const foundNotValid = user.recommendations.find(function(element: any) {
                const nextSendDate = moment.utc(element.send_date).add(1, 'day');

                if (element.email === email && (element.received || nextSendDate.isAfter(moment.utc()))) {
                    return true;
                }

                return false;
            });

            if (foundNotValid) {
                throw new Error('too fast');
            }
        })
        .normalizeEmail(),

        body('newEmail')
        .optional()
        .custom(async function(email, meta) {
            const req = meta.req as unknown as express.Request;

            const id = req.user?.id || '';
            const user = await req.db.server.getUserByID(id);

            const foundNotValid = user.recommendations.find(function(element: any) {
                if (element.email === email) {
                    return true;
                }

                return false;
            });

            if (foundNotValid) {
                throw new Error('already sent');
            }
        })
        .isEmail()
        .normalizeEmail(),
];

const uploadRecommendationLetter = [
    param('recommendationID')
    .isString(),

    param('userID')
        .isString()
        .custom(async function(userID: string, meta) {
            const req = meta.req as unknown as express.Request;

            const recommendations = (await req.db.server.getUserByID(userID)).recommendations;

            const found = recommendations.find(function(value: any) {
                if (value.id === req.params.recommendationID && !value.received) {
                    return true;
                }

                return false;
            });

            if (!found) { throw new Error('no recommendation'); }

            return true;
        })
        .custom(async function(_, { req }) {
            const file = req.files.file;

            if (!file || !file.data) {
                throw new Error('no file');
            }

            if (file.truncated) {
                throw new Error('too large');
            }

            const buffer = file.data;

            if (buffer == null || buffer.byteLength < 512) {
                throw new Error('no data');
            }

            if (((await fileType.fromBuffer(buffer) || { 'mime': '' }).mime) !== 'application/pdf') {
                throw new Error('not pdf');
            }

            return true;
        }),
];

export { sendRecommendationEmail, uploadRecommendationLetter };
