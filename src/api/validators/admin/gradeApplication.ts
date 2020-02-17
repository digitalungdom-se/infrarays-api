import { Request } from "express";

import { body } from "express-validator";

const gradeApplication = [
    body("userID")
        .isString()
        .custom(async (userID, meta) => {
            const req = meta.req as Request;

            const userExists = await req.db.server.getUserByID(userID);
            if (!userExists) {
                throw new Error("NO_USER");
            }

            return true;
        }),

    body("cv")
        .isInt({ min: 0, max: 4 })
        .toInt(),

    body("coverLetter")
        .isInt({ min: 0, max: 4 })
        .toInt(),

    body("essay")
        .isInt({ min: 0, max: 4 })
        .toInt(),

    body("grade")
        .isInt({ min: 0, max: 4 })
        .toInt(),

    body("recommendation")
        .isInt({ min: 0, max: 4 })
        .toInt(),

    body("overall")
        .isInt({ min: 0, max: 4 })
        .toInt(),

    body("comment")
        .optional()
        .isString()
        .isLength({ max: 10000 }),
];

export { gradeApplication };
