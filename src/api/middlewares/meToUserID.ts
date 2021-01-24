import { Request, Response, NextFunction } from "express";

import { UserType } from "types";

export async function meToUserID(req: Request, _: Response, next: NextFunction): Promise<void> {
  // only if it is a route that has userID param
  if (req.params.userID) {
    // only if the requester is authenticated
    if (req.user) {
      // if the userID param is @me replace it with authenticated ID
      if (req.params.userID === "@me") {
        req.params.userID = req.user.id;
        return next();
      } else {
        // if it is not @me (thus uuid) make sure that the requester is authorized (admin/superAdmin)
        if (req.user.type === UserType.Admin || req.user.type === UserType.SuperAdmin) {
          // only allow admins to GET/OPTION
          if (["GET", "OPTION"].includes(req.method) || req.user.type === UserType.SuperAdmin) {
            return next();
          }
        }
      }
    }

    // if any thing fails, request fails
    const err: Express.RequestError = new Error("UNAUTHORISED");
    err.statusCode = 401;
    err.errors = [{ message: "Requester is not authenticated.", code: "AUTH-001", param: "Authorization" }];

    return next(err);
  } else {
    return next();
  }
}
