import { Request, Response, NextFunction } from "express";
import moment from "moment";

export function lock(start: moment.Moment, close: moment.Moment) {
  return function (__: Request, _: Response, next: NextFunction): void {
    if (moment.utc().isBefore(start) || moment.utc().isAfter(close)) {
      const err: Express.RequestError = new Error("LOCKED");
      err.statusCode = 423;
      err.customMessage = "LOCKED";
      return next(err);
    }

    next();
  };
}
