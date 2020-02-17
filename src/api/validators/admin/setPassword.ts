import { Request } from "express";

import { body } from "express-validator";

const setPassword = [
    body("adminID")
        .isString()
        .custom(async (adminID, meta) => {
            const req = meta.req as Request;

            const adminExists = await req.db.server.getAdminByID(adminID);
            if (!adminExists) {
                throw new Error();
            }

            if (adminExists.password) {
                throw new Error();
            }

            return true;
        }),
    body("password")
        .isString()
        .isLength({ min: 1, max: 72 }),
];

export { setPassword };
