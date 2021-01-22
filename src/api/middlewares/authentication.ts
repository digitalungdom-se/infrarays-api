import { Request, Response, NextFunction } from "express";
import { UserType } from "types";

export async function attachUser(req: Request, _: Response, next: NextFunction): Promise<void> {
  const authorisationHeader = req.header("authorization");

  if (authorisationHeader && authorisationHeader.split(" ").length === 2) {
    const authorisation = {
      method: authorisationHeader.split(" ")[0],
      accessToken: authorisationHeader.split(" ")[1],
    };

    let userID;

    if (authorisation.method === "Bearer") {
      userID = req.services.Authentication.parseToken(authorisation.accessToken);
    }

    if (userID) {
      const user = await req.services.User.getByID(userID);

      if (user) {
        req.user = {
          id: user.id,
          type: user.type as UserType,
        };
      }
    }
  }

  return next();
}

export function ensureAuthenticated(req: Request, _: Response, next: NextFunction): void {
  if (req.user?.id) {
    return next();
  }

  // if any thing fails (no header, invalid header, no consumer, etc) fail the request
  const err: Express.RequestError = new Error("UNAUTHORISED");
  err.statusCode = 401;
  err.customMessage = "UNAUTHORISED";
  return next(err);
}

export function ensureApplicantAuthenticated(req: Request, _: Response, next: NextFunction): void {
  if (req.user?.type === UserType.Applicant) {
    return next();
  }

  // if any thing fails (no header, invalid header, no consumer, etc) fail the request
  const err: Express.RequestError = new Error("UNAUTHORISED");
  err.statusCode = 401;
  err.customMessage = "UNAUTHORISED";
  return next(err);
}

export async function ensureAdminAuthenticated(req: Request, _: Response, next: NextFunction): Promise<void> {
  if (req.user?.type === UserType.Admin || req.user?.type === UserType.SuperAdmin) {
    return next();
  }

  // if any thing fails (no header, invalid header, no consumer, etc) fail the request
  const err: Express.RequestError = new Error("UNAUTHORISED");
  err.statusCode = 401;
  err.customMessage = "UNAUTHORISED";
  return next(err);
}

export async function ensureSuperAdminAuthenticated(req: Request, _: Response, next: NextFunction): Promise<void> {
  if (req.user?.type === UserType.SuperAdmin) {
    return next();
  }

  // if any thing fails (no header, invalid header, no consumer, etc) fail the request
  const err: Express.RequestError = new Error("UNAUTHORISED");
  err.statusCode = 401;
  err.customMessage = "UNAUTHORISED";
  return next(err);
}
