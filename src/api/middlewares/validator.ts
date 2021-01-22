import { Request, Response, NextFunction } from "express";
import { ValidationChain, validationResult } from "express-validator";

const customValidationResult = validationResult.withDefaults({
  formatter: error => {
    return { param: error.param, value: error.value, msg: error.msg };
  },
});

export function validate(validations: Array<ValidationChain>) {
  return async function (req: Request, _: Response, next: NextFunction): Promise<void> {
    try {
      await Promise.all(validations.map(validation => validation.run(req)));
      const errors = customValidationResult(req);

      if (!errors || errors.isEmpty()) {
        return next();
      }

      const err: Express.RequestError = new Error("VALIDATION_ERROR");
      err.customMessage = "VALIDATION_ERROR";
      err.statusCode = 422;
      err.errors = errors.array();

      throw err;
    } catch (error) {
      if (process.env.LOG_LEVEL === "silly") {
        const errors = validationResult(req);
        error.errors = errors.array();

        req.logger.warn("VALIDATION_ERROR", { errors: error.errors });
      }

      error.statusCode = 422;

      next(error);
    }
  };
}
