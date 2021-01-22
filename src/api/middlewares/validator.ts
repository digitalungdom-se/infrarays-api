import { Request, Response, NextFunction } from "express";
import { ValidationChain, validationResult } from "express-validator";

const customValidationResult = validationResult.withDefaults({
  formatter: error => {
    console.log(error);

    const [message, code, statusCode] = (error.msg as string).split(":");
    if (statusCode) {
      return { param: error.param, value: error.value, message, code, statusCode: parseInt(statusCode) };
    } else {
      return { param: error.param, value: error.value, message: "Simple validation error.", code: "VAL-422" };
    }
  },
});

export function validate(validations: Array<ValidationChain>) {
  return async function (req: Request, _: Response, next: NextFunction): Promise<void> {
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = customValidationResult(req);
    if (!errors || errors.isEmpty()) {
      return next();
    }

    const err: Express.RequestError = new Error("VALIDATION_ERROR");
    err.errors = Object.values(errors.mapped());

    const customError = err.errors.find((error: any) => error.statusCode);

    if (customError) {
      err.statusCode = (customError as any).statusCode;
    } else {
      err.statusCode = 422;
    }

    next(err);
  };
}
