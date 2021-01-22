import { body, param } from "express-validator";
import { Request } from "express";
import validator from "validator";

import { validators } from "utils";
import { FileType } from "types";

const get = [param("userID").isString().isUUID().custom(validators.isUserApplicant)];
const getPDF = [param("userID").isString().isUUID().custom(validators.isUserApplicant)];
const getFile = [
  param("userID").isString().isUUID().custom(validators.isUserApplicant),
  param("fileID")
    .isString()
    .isUUID()
    .custom(async function (fileID: string, meta) {
      const req = meta.req as Request;

      const userID = req.params.userID;
      const file = await req.services.Storage.getByID(fileID);

      if (!file || file.userId !== userID || file.type === FileType.RecommendationLetter) {
        throw new Error();
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
    .custom(async function (fileType: string, meta) {
      const req = meta.req as Request;
      const userID = req.user!.id;

      const files = await req.services.Storage.getForUser(userID);

      let appendixCount = 0;

      files.forEach(file => {
        if (file.type === FileType.Appendix) {
          appendixCount++;
        }
      });

      if (appendixCount >= 5) {
        throw new Error();
      }

      return true;
    }),
];

const deleteFile = [
  param("userID").isString().isUUID().custom(validators.isUserApplicant),
  param("fileID")
    .isString()
    .isUUID()
    .custom(async function (fileID: string, meta) {
      const req = meta.req as Request;

      const userID = req.params.userID;
      const file = await req.services.Storage.getByID(fileID);

      if (!file || file.userId !== userID) {
        throw new Error();
      }

      return true;
    }),
];

const getSurvey = [param("userID").isString().isUUID().custom(validators.isUserApplicant)];

const saveSurvey = [
  param("userID").isString().isUUID().custom(validators.isUserApplicant),
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
    .custom(async function (email: string, meta) {
      const req = meta.req as Request;

      const userID = req.params.userID;

      const recommendations = await req.services.Application.getRecommendationsForUser(userID);

      recommendations.forEach(recommendation => {
        if (validator.normalizeEmail(recommendation.email) === validator.normalizeEmail(email) && recommendation.index !== +req.params.index) {
          throw new Error();
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
    .custom(async function (recommendationCode: string, meta) {
      const req = meta.req as Request;

      const recommendation = await req.services.Application.getRecommendationByCode(recommendationCode);

      if (!recommendation) {
        throw new Error();
      }

      return true;
    }),
];

export default { get, getPDF, getFile, getFiles, uploadFile, deleteFile, getSurvey, saveSurvey, sendRecommendationRequest, deleteRecommendation, getRecommendationByCode, uploadRecommendation };
