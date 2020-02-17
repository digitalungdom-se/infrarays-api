import express from "express";
import { body } from "express-validator";

const verify = [
    body("token")
        .isString()
        .isLength({ min: 16, max: 16 })
        .custom(async function(token: string, meta) {
            const req = (meta.req as unknown) as express.Request;

            const tokenExists = await req.db.server.getTokenByIDAndType(token, "verify_email");

            if (!tokenExists) {
                throw new Error("no token");
            }

            return true;
        }),
];

export { verify };
