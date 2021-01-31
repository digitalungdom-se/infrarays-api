import { body, param } from "express-validator";
import { Request } from "express";
import validator from "validator";
import moment from "moment";

import { validators, sanitizers } from "utils";
import { FileType } from "types";

const get = [param("userID").isString().isUUID().custom(validators.isUserApplicant)];

const createApplicant = [
  body("email")
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

  body("firstName").isString().isLength({ min: 1, max: 256 }),
  body("lastName").isString().isLength({ min: 1, max: 256 }),
  body("birthdate").isString().custom(validators.isDate).customSanitizer(sanitizers.toDate),
  body("finnish").isBoolean().toBoolean(),
];

const getPDF = [param("userID").isString().isUUID().custom(validators.isUserApplicant)];

const getFile = [
  param("userID").isString().isUUID().custom(validators.isUserApplicant),
  param("fileID")
    .isString()
    .isUUID()
    .bail()
    .custom(async function (fileID: string, meta) {
      const req = meta.req as Request;

      const userID = req.params.userID;
      const file = await req.services.Storage.getByID(fileID);

      if (!file || file.userId !== userID || file.type === FileType.RecommendationLetter) {
        throw new Error("No such file.:STORAGE-404:404");
      }

      return true;
    }),
];

const getFiles = [param("userID").isString().isUUID().custom(validators.isUserApplicant)];

const uploadFile = [
  param("userID").isString().isUUID().custom(validators.isUserApplicant),
  param("fileType")
    .isString()
    .toUpperCase()
    .isIn(["CV", "COVER_LETTER", "ESSAY", "GRADES", "APPENDIX"])
    .if((fileType: string) => fileType === FileType.Appendix)
    .bail()
    .custom(async function (fileType: string, meta) {
      const req = meta.req as Request;
      const userID = req.user!.id;

      const files = await req.services.Storage.getForApplicant(userID);

      let appendixCount = 0;

      files.forEach(file => {
        if (file.type === FileType.Appendix) {
          appendixCount++;
        }
      });

      if (appendixCount >= 5) {
        throw new Error("Too many appendix files.:STORAGE-429:422");
      }

      return true;
    }),
];

const deleteFile = [
  param("userID").isString().isUUID().custom(validators.isUserApplicant),
  param("fileID")
    .isString()
    .isUUID()
    .bail()
    .custom(async function (fileID: string, meta) {
      const req = meta.req as Request;

      const userID = req.params.userID;
      const file = await req.services.Storage.getByID(fileID);

      if (!file || file.userId !== userID) {
        throw new Error("No such file.:STORAGE-404:404");
      }

      return true;
    }),
];

const getSurvey = [param("userID").isString().isUUID().custom(validators.isUserApplicant)];

const saveSurvey = [
  param("userID").isString().isUUID().bail().custom(validators.isUserApplicant),
  body("city").isString().isLength({ min: 1, max: 256 }),
  body("school").isString().isLength({ min: 1, max: 256 }),
  body("gender").isString().isIn(["MALE", "FEMALE", "OTHER", "UNDISCLOSED"]),
  body("applicationPortal").isInt({ min: 1, max: 5 }),
  body("applicationProcess").isInt({ min: 1, max: 5 }),
  body("improvement").isString().isLength({ min: 1, max: 8192 }),
  body("informant").isString().isLength({ min: 1, max: 8192 }),
];

const sendRecommendationRequest = [
  param("recommendationIndex").isInt({ min: 0, max: 2 }).toInt(),
  body("email")
    .isString()
    .isEmail()
    .bail()
    .custom(async function (email: string, meta) {
      const req = meta.req as Request;

      const userID = req.params.userID;

      const recommendations = await req.services.Application.getRecommendationsForApplicant(userID);

      recommendations.forEach(recommendation => {
        if (validator.normalizeEmail(recommendation.email) === validator.normalizeEmail(email) && recommendation.index !== +req.params.recommendationIndex) {
          throw new Error("Recommendation already sent to that email address.:APPLICATION-429:422");
        }

        if (recommendation.index === +req.params.recommendationIndex && moment.utc().diff(recommendation.lastSent, "hours") < 24) {
          throw new Error("Recommendation to that index is on a cooldown.:APPLICATION-430:422");
        }
      });

      return true;
    }),
];

const deleteRecommendation = [param("recommendationIndex").isInt({ min: 0, max: 2 }).toInt()];

const getRecommendationByCode = [param("recommendationCode").isString().isLength({ min: 0, max: 256 })];

const uploadRecommendation = [
  param("recommendationCode")
    .isString()
    .isLength({ min: 0, max: 256 })
    .bail()
    .custom(async function (recommendationCode: string, meta) {
      const req = meta.req as Request;

      const recommendation = await req.services.Application.getRecommendationByCode(recommendationCode);

      if (!recommendation) {
        throw new Error("No such recommendation.:APPLICATION-405:404");
      }

      return true;
    }),
];

export default { get, createApplicant, getPDF, getFile, getFiles, uploadFile, deleteFile, getSurvey, saveSurvey, sendRecommendationRequest, deleteRecommendation, getRecommendationByCode, uploadRecommendation };
