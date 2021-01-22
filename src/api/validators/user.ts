import { body, param } from "express-validator";
import { Request } from "express";

import { validators, sanitizers } from "utils";

const createApplicant = [
  body("email")
    .isString()
    .isEmail()
    .custom(async function (email: string, meta) {
      const req = meta.req as Request;

      const user = await req.services.User.getByEmail(email);

      if (user) {
        throw new Error();
      }

      return true;
    }),

  body("firstName").isString().isLength({ min: 1, max: 256 }),
  body("lastName").isString().isLength({ min: 1, max: 256 }),
  body("birthdate").isString().custom(validators.isDate).customSanitizer(sanitizers.toDate),
  body("finnish").isBoolean().toBoolean(),
];

const sendEmailLoginCode = [
  body("email")
    .isString()
    .isEmail()
    .custom(async function (email: string, meta) {
      const req = meta.req as Request;

      const user = await req.services.User.getByEmail(email);

      if (!user) {
        throw new Error();
      }

      return true;
    }),
];

const get = [param("userID").isString().isUUID()];

const del = [param("userID").isString().isUUID()];

const update = [
  param("userID").isString().isUUID(),
  body("email")
    .optional()
    .isString()
    .isEmail()
    .custom(async function (email: string, meta) {
      const req = meta.req as Request;

      const user = await req.services.User.getByEmail(email);

      if (user) {
        throw new Error();
      }

      return true;
    }),

  body("firstName").optional().isString().isLength({ min: 1, max: 256 }),
  body("lastName").optional().isString().isLength({ min: 1, max: 256 }),
  // body("birthdate").optional().isString().custom(validators.isDate).customSanitizer(sanitizers.toDate),
  // body("finnish").optional().isBoolean().toBoolean(),
];

export default { createApplicant, sendEmailLoginCode, get, del, update };
