import { Request, Response, NextFunction } from "express";

import { UserType } from "types";

export async function meToUserID(req: Request, _: Response, next: NextFunction): Promise<void> {
  if (req.params.userID) {
    if (req.user) {
      if (req.params.userID === "@me") {
        req.params.userID = req.user.id;
        return next();
      } else {
        if (req.user.type === UserType.Admin || req.user.type === UserType.SuperAdmin) {
          return next();
        }
      }
    }

    const err: Express.RequestError = new Error("UNAUTHORISED");
    err.statusCode = 401;
    err.customMessage = "UNAUTHORISED";
    return next(err);
  } else {
    return next();
  }
}
