import { body } from 'express-validator';

const login = [
    body('username')
        .isString()
        .isEmail()
        .normalizeEmail(),

    body('password')
        .isString()
        .isLength({ 'min': 1, 'max': 72 }),
];

export { login };
