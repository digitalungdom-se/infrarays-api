import { Request, Response, NextFunction, request } from "express";
import moment from "moment";
import { UserType } from "types";

export function lock(start: moment.Moment, close: moment.Moment) {
  return function (req: Request, _: Response, next: NextFunction): void {
    if (process.env.NODE_ENV === "production") {
      if (req.user?.type !== UserType.Admin && req.user?.type !== UserType.SuperAdmin) {
        if (moment.utc().isBefore(start) || moment.utc().isAfter(close)) {
          const err: Express.RequestError = new Error("ROUTE:LOCKED");
          err.statusCode = 423;
          err.errors = [{ message: "Route is locked.", code: "SERVER-423" }];
          return next(err);
        }
      }
    }

    next();
  };
}
