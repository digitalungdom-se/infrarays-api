import { body, param } from "express-validator";
import { Request } from "express";

const sendEmailLoginCode = [
  body("email")
    .isString()
    .isEmail()
    .bail()
    .custom(async function (email: string, meta) {
      const req = meta.req as Request;

      const user = await req.services.User.getByEmail(email);

      if (!user) {
        throw new Error("User with that email not found.:USER-404:404");
      }

      return true;
    }),
];

const getByID = [param("userID").isString().isUUID()];

const del = [param("userID").isString().isUUID()];

const update = [
  param("userID").isString().isUUID(),
  body("email")
    .optional()
    .isString()
    .isEmail()
    .bail()
    .custom(async function (email: string, meta) {
      const req = meta.req as Request;

      const user = await req.services.User.getByEmail(email);

      if (user) {
        throw new Error("User already exists with that email.:USER-001:422");
      }

      return true;
    }),

  body("firstName").optional().isString().isLength({ min: 1, max: 256 }),
  body("lastName").optional().isString().isLength({ min: 1, max: 256 }),
  // body("birthdate").optional().isString().custom(validators.isDate).customSanitizer(sanitizers.toDate),
  // body("finnish").optional().isBoolean().toBoolean(),
];

export default { sendEmailLoginCode, getByID, del, update };
