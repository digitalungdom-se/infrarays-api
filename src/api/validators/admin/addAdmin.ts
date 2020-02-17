import { Request } from "express";

import { body } from "express-validator";

const addAdmin = [
    body("email")
        .isString()
        .isEmail()
        .normalizeEmail()
        .custom(async function(email, meta) {
            const req = meta.req as Request;

            const emailExists = await req.db.server.getAdminByEmail(email);
            if (emailExists) {
                throw new Error("email exists");
            }

            return true;
        }),

    body("name")
        .isString()
        .isLength({ min: 1, max: 256 })
        .customSanitizer(function(name: string) {
            return name.toLowerCase();
        }),

    body("superAdmin")
        .isBoolean()
        .toBoolean(),
];

export { addAdmin };
