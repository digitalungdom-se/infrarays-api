import { Request, Response } from "express";

async function create(req: Request, res: Response): Promise<void> {
  const adminData = {
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    type: req.body.type,
  };

  const user = await req.services.Admin.create(adminData);

  res.status(201).send(user);
}

async function get(req: Request, res: Response): Promise<void> {
  const skip = (req.query.skip as unknown) as number;
  const limit = (req.query.limit as unknown) as number;

  const admins = await req.services.User.getAdmins(skip, limit);

  res.json(admins);
}

async function getGradingOrder(req: Request, res: Response): Promise<void> {
  const adminID = req.user!.id;

  const order = await req.services.Admin.getGradingOrder(adminID);

  res.json(order);
}

async function randomiseGradingOrder(req: Request, res: Response): Promise<void> {
  const adminID = req.user!.id;

  const order = await req.services.Admin.randomiseGradingOrder(adminID);

  res.json(order);
}

async function getSurveys(req: Request, res: Response): Promise<void> {
  const surveys = await req.services.Admin.getSurveys();

  res.json(surveys);
}

async function grade(req: Request, res: Response): Promise<void> {
  const adminID = req.user!.id;
  const applicantID = req.params.userID;

  const gradeInput = {
    adminId: adminID,
    applicantId: applicantID,

    cv: req.body.cv,
    coverLetter: req.body.coverLetter,
    essays: req.body.essays,
    grades: req.body.grades,
    recommendations: req.body.recommendations,
    overall: req.body.overall,

    comment: req.body.comment,
  };

  const grade = await req.services.Admin.grade(gradeInput);

  res.status(201).json(grade);
}

async function getGradesForApplicant(req: Request, res: Response): Promise<void> {
  const applicantID = req.params.userID;

  const surveys = await req.services.Admin.getGradesForApplicant(applicantID);

  res.json(surveys);
}

export default { create, get, getGradingOrder, randomiseGradingOrder, getSurveys, grade, getGradesForApplicant };
