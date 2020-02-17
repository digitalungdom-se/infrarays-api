import express from "express";
import { body } from "express-validator";
import moment from "moment";

const register = [
    body("email")
        .isString()
        .isEmail()
        .normalizeEmail()
        .custom(async function(email, meta) {
            const req = (meta.req as unknown) as express.Request;

            const emailExists = await req.db.server.getUserByEmail(email);
            if (emailExists) {
                throw new Error("email exists");
            }

            return true;
        }),

    body("password")
        .isString()
        .isLength({ min: 1, max: 72 }),

    body("name")
        .isString()
        .isLength({ min: 3, max: 256 })
        .customSanitizer(function(name: string) {
            return name.toLowerCase();
        }),

    body("birthdate")
        .custom(function(dateString: string) {
            if (!moment.utc(dateString).isValid()) {
                throw new Error("invalid date");
            }

            return true;
        })
        .customSanitizer(function(dateString: string) {
            return moment.utc(dateString).toDate();
        }),

    body("finnish")
        .isBoolean()
        .toBoolean(),
];

export { register };
