import { body, param, query } from "express-validator";
import { Request } from "express";

import { UserType } from "types";

const create = [
  body("email")
    .isString()
    .isEmail()
    .normalizeEmail()
    .bail()
    .custom(async function (email: string, meta) {
      const req = meta.req as Request;

      const user = await req.services.User.getByEmail(email);

      if (user) {
        throw new Error("User already exists with that email.:USER-001:422");
      }

      return true;
    }),

  body("firstName").isString().isLength({ min: 1, max: 256 }),
  body("lastName").isString().isLength({ min: 1, max: 256 }),
  body("type").isString().isIn([UserType.Admin, UserType.SuperAdmin]),
];

const get = [query("skip").isInt({ min: 0, max: Number.MAX_SAFE_INTEGER }).toInt(), query("limit").isInt({ min: 0, max: 512 }).toInt()];

const getGradesForApplicant = [
  param("userID")
    .isString()
    .isUUID()
    .bail()
    .custom(async function (userID: string, meta) {
      const req = meta.req as Request;

      const applicant = await req.services.User.getByID(userID);

      if (!applicant || applicant.type !== UserType.Applicant) {
        throw new Error("Applicant with that userID not found.:USER-404:404");
      }

      return true;
    }),
];

const grade = [
  param("userID")
    .isString()
    .isUUID()
    .bail()
    .custom(async function (userID: string, meta) {
      const req = meta.req as Request;

      const applicant = await req.services.User.getByID(userID);

      if (!applicant || applicant.type !== UserType.Applicant) {
        throw new Error("Applicant with that userID not found.:USER-404:404");
      }

      return true;
    }),

  body("cv").isInt({ min: 1, max: 5 }).toInt(),
  body("coverLetter").isInt({ min: 1, max: 5 }).toInt(),
  body("essays").isInt({ min: 1, max: 5 }).toInt(),
  body("grades").isInt({ min: 1, max: 5 }).toInt(),
  body("recommendations").isInt({ min: 1, max: 5 }).toInt(),
  body("overall").isInt({ min: 1, max: 5 }).toInt(),

  body("comment").optional().isString().isLength({ min: 0, max: 8192 }),
];

export default { create, get, getGradesForApplicant, grade };
