import express from "express";
import { ValidationChain, validationResult } from "express-validator";

const customValidationResult = validationResult.withDefaults({
    formatter: error => {
        return {
            msg: error.msg,
            param: error.param,
            value: error.value,
        };
    },
});

function validate(validations: Array<ValidationChain>): express.RequestHandler {
    return async function(req: express.Request, _, next: express.NextFunction) {
        await Promise.all(validations.map(validation => validation.run(req)));
        const errors = customValidationResult(req);

        if (!errors || errors.isEmpty()) {
            return next();
        }

        const err: Express.RequestError = new Error("VALIDATION");
        err.customMessage = "VALIDATION_ERROR";
        err.statusCode = 422;
        err.errors = errors.array();

        next(err);
    };
}

export { validate };
