import { body } from "express-validator";

const survey = [
    body("city")
        .isString()
        .isLength({ min: 1, max: 256 })
        .customSanitizer(function(name: string) {
            return name.toLowerCase();
        }),

    body("school")
        .isString()
        .isLength({ min: 1, max: 256 })
        .customSanitizer(function(name: string) {
            return name.toLowerCase();
        }),

    body("gender")
        .isString()
        .isIn(["male", "female", "other", "undisclosed"]),

    body("applicationPortal")
        .isInt({ min: 1, max: 5 })
        .toInt(),

    body("applicationProcess")
        .isInt({ min: 1, max: 5 })
        .toInt(),

    body("improvement")
        .isString()
        .isLength({ min: 1, max: 10000 }),

    body("informant")
        .isString()
        .isLength({ min: 1, max: 10000 }),
];

export { survey };
