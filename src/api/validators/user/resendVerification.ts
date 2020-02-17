import express from "express";
import { body } from "express-validator";

const resendVerification = [
    body("email")
        .isString()
        .isEmail()
        .normalizeEmail()
        .custom(async function(email: string, meta) {
            const req = (meta.req as unknown) as express.Request;

            const user = await req.db.server.getUserByEmail(email);

            if (!user) {
                throw new Error("no user");
            }

            if (user.verified) {
                throw new Error("already verified");
            }

            return true;
        }),
];

export { resendVerification };
