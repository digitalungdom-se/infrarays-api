import { Request, Response, NextFunction } from "express";

function lockRoute(dateToClose: Date) {
    return function(req: Request, _: Response, next: NextFunction) {
        if (new Date() > dateToClose) {
            const err: Express.RequestError = new Error("LOCKED");
            err.statusCode = 423;
            err.customMessage = "LOCKED";
            next(err);
        }

        next();
    };
}

export { lockRoute };
