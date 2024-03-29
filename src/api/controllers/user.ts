import { Request, Response } from "express";
import { cleanObject } from "utils";

async function sendEmailLoginCode(req: Request, res: Response): Promise<void> {
  const email = req.body.email;

  const loginCode = await req.services.Authentication.sendEmailLoginCode(email);

  if (process.env.NODE_ENV === "development") {
    res.json(loginCode);
    return;
  }

  res.sendStatus(204);
}

async function getByID(req: Request, res: Response): Promise<void> {
  const userID = req.params.userID;

  const user = await req.services.User.getByID(userID);

  if (user) {
    res.json(user);
  } else {
    res.sendStatus(404);
  }
}

async function del(req: Request, res: Response): Promise<void> {
  const userID = req.params.userID;

  await req.services.User.delete(userID);

  res.sendStatus(204);
}

async function update(req: Request, res: Response): Promise<void> {
  const userID = req.params.userID;

  const userData = cleanObject({
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    // birthdate: req.body.birthdate, // update application route?
    // finnish: req.body.finnish,
  });

  const user = await req.services.User.update(userID, userData);

  res.json(user);
}

export default { sendEmailLoginCode, getByID, del, update };
