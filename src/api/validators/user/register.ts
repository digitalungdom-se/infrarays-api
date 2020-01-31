import express from 'express';
import { body } from 'express-validator';

const register = [
    body('email')
        .isString()
        .isEmail()
        .normalizeEmail()
        .custom(async function (email, meta) {
            const req = meta.req as unknown as express.Request;

            const emailExists = await req.db.server.getUserByEmail(email);
            if (emailExists) {
                throw new Error('email exists');
            }

            return true;
        }),

    body('password')
        .isString()
        .isLength({ 'min': 1, 'max': 72 }),

    body('name')
        .isString()
        .isLength({ 'min': 3, 'max': 256 })
        .customSanitizer(function (name: string) {
            return name.toLowerCase();
        }),

    body('birthdate')
        .isISO8601()
        .toDate(),

    body('finnish')
        .isBoolean()
        .toBoolean(),
];

export { register };
