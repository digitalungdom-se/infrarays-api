import { Request, Response } from "express";
import fs from "fs-extra";
import fileType from "file-type";
import { promisify } from "util";
import { FileType } from "types";

async function get(req: Request, res: Response): Promise<void> {
  const userID = req.params.userID;

  const application = await req.services.Application.getByUserID(userID);

  res.send(application);
}

async function getPDF(req: Request, res: Response): Promise<void> {
  const userID = req.params.userID;

  const [applicationPDFBuffer, user] = await Promise.all([req.services.Application.getPDF(userID), req.services.User.getByID(userID)]);

  const fileName = `${user!.firstName.toLowerCase()}_${user!.lastName.toLowerCase()}.pdf`.replace(" ", "_");

  res.set("Content-disposition", "inline; filename=" + fileName);
  res.contentType("application/pdf");
  res.send(applicationPDFBuffer);
}

async function getFiles(req: Request, res: Response): Promise<void> {
  const userID = req.params.userID;

  const files = await req.services.Storage.getForUser(userID);

  const filesReturn = files.map(file => {
    return req.services.Storage.toFilePublic(file);
  });

  res.json(filesReturn);
}

async function getFile(req: Request, res: Response): Promise<void> {
  const fileID = req.params.fileID;

  const fileData = await req.services.Storage.getByID(fileID);

  if (fileData) {
    await (promisify(res.download).bind(res) as any)(fileData.path, fileData.name);
  } else {
    res.sendStatus(404);
  }
}

async function uploadFile(req: Request, res: Response): Promise<void> {
  const userID = req.params.userID;
  const uploadFileType = req.params.fileType;
  const tmpPath = req.file.path;
  const originalFileName = req.file.originalname;

  const ft = await fileType.fromFile(tmpPath);

  if (!ft || !["application/pdf"].includes(ft.mime)) {
    await fs.remove(tmpPath);
    res.sendStatus(422);
    return;
  }

  const fileData = { name: originalFileName, path: tmpPath, type: uploadFileType, mime: ft.mime };

  if (req.params.fileType !== "APPENDIX") {
    await req.services.Storage.delFileType(userID, uploadFileType);
  }

  const file = await req.services.Storage.create(userID, fileData);

  const fileReturn = req.services.Storage.toFilePublic(file);

  res.status(201).send(fileReturn);
}

async function deleteFile(req: Request, res: Response): Promise<void> {
  const fileID = req.params.fileID;

  await req.services.Storage.del(fileID);

  res.sendStatus(204);
}

async function getSurvey(req: Request, res: Response): Promise<void> {
  const userID = req.params.userID;

  const survey = await req.services.Application.getSurveyByUserID(userID);

  if (survey) {
    res.json(survey);
  } else {
    res.sendStatus(404);
  }
}

async function saveSurvey(req: Request, res: Response): Promise<void> {
  const userID = req.params.userID;
  const surveyData = {
    city: req.body.city,
    school: req.body.school,
    gender: req.body.gender,
    applicationPortal: req.body.applicationPortal,
    applicationProcess: req.body.applicationProcess,
    improvement: req.body.improvement,
    informant: req.body.informant,
  };

  const survey = await req.services.Application.saveSurvey(userID, surveyData);

  res.status(201).json(survey);
}

async function getRecommendations(req: Request, res: Response): Promise<void> {
  const userID = req.params.userID;

  const recommendations = await req.services.Application.getRecommendationsForUser(userID);

  const recommendationsReturn = recommendations.map(recommendation => {
    return req.services.Application.toRecommendationForUser(recommendation);
  });

  res.json(recommendationsReturn);
}

async function sendRecommendationRequest(req: Request, res: Response): Promise<void> {
  const userID = req.params.userID;
  const index = (req.params.recommendationIndex as unknown) as number;
  const email = req.body.email;

  const recommendation = (await req.services.Application.sendRecommendationRequest(userID, index, email)) as any;

  if (process.env.NODE_ENV === "production") {
    delete recommendation.code;
    delete recommendation.fileId;
  }

  res.status(201).json(recommendation);
}

async function deleteRecommendation(req: Request, res: Response): Promise<void> {
  const userID = req.params.userID;
  const index = (req.params.recommendationIndex as unknown) as number;

  await req.services.Application.deleteRecommendationByUserID(userID, index);

  res.sendStatus(204);
}

async function getRecommendationByCode(req: Request, res: Response): Promise<void> {
  const recommendationCode = req.params.recommendationCode;

  const recommendation = await req.services.Application.getRecommendationByCode(recommendationCode);

  if (recommendation) {
    res.json(recommendation);
  } else {
    res.sendStatus(404);
  }
}

async function uploadRecommendation(req: Request, res: Response): Promise<void> {
  const recommendationCode = req.params.recommendationCode;
  const tmpPath = req.file.path;
  const originalFileName = req.file.originalname;

  const ft = await fileType.fromFile(tmpPath);

  if (!ft || !["application/pdf"].includes(ft.mime)) {
    await fs.remove(tmpPath);
    res.sendStatus(422);
    return;
  }

  const fileData = { name: originalFileName, path: tmpPath, type: FileType.RecommendationLetter, mime: ft.mime };

  const file = await req.services.Application.uploadRecommendation(recommendationCode, fileData);

  const fileReturn = req.services.Storage.toFilePublic(file);

  res.status(201).send(fileReturn);
}

export default { get, getPDF, getFiles, getFile, uploadFile, deleteFile, getSurvey, saveSurvey, getRecommendations, sendRecommendationRequest, deleteRecommendation, getRecommendationByCode, uploadRecommendation };
