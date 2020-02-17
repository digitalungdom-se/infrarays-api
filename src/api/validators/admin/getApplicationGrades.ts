import { Request } from "express";

import { query } from "express-validator";

const getApplicationGrades = [
    query("userID")
        .isString()
        .custom(async (userID, meta) => {
            const req = meta.req as Request;

            const userExists = await req.db.server.getUserByID(userID);
            if (!userExists) {
                throw new Error("NO_USER");
            }

            return true;
        }),
];

export { getApplicationGrades };
