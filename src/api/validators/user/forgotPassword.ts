import express from 'express';
import { body } from 'express-validator';
import hasha from 'hasha';

const sendForgotPassword = [
    body('email')
        .isString()
        .isEmail()
        .custom(async function(email: string, meta) {
            const req = meta.req as unknown as express.Request;

            const user = await req.db.server.getUserByEmail(email);

            if (!user) {
                throw new Error('no user');
            }

            if (!user.verified) {
                throw new Error('not verified');
            }

            return true;
        })
        .normalizeEmail(),
];

const resetPassword = [
    body('token')
        .isString()
        .isLength({ 'min': 16, 'max': 16 })
        .custom(async function(token: string, meta) {
            const req = meta.req as unknown as express.Request;
            const tokenHash = await hasha.async(token, { 'encoding': 'base64' });

            const tokenExists = await req.db.server.getTokenByIDAndType(tokenHash, 'reset_password');

            if (!tokenExists) {
                throw new Error('no token');
            }

            return true;
        }),

    body('password')
        .isString()
        .isLength({ 'min': 1, 'max': 72 }),
];

export { sendForgotPassword, resetPassword };
