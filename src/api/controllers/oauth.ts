/* eslint-disable no-case-declarations */
import { Request, Response } from "express";

async function newToken(req: Request, res: Response): Promise<void> {
  let responseToken;

  if (req.body.grant_type === "client_credentials") {
    if (!req.headers.authorization || req.headers.authorization.split(" ").length !== 2) {
      const err: Express.RequestError = new Error("OAUTH:BAD_REQUEST");
      err.statusCode = 400;
      err.errors = [{ message: "Authorization header is malformed.", code: "OAUTH-001", value: req.headers.authorization, param: "Authorization" }];

      throw err;
    }

    const method = req.headers.authorization.split(" ")[0];
    const authValue = req.headers.authorization.split(" ")[1];

    switch (method) {
      case "Email":
        const [email, code] = Buffer.from(authValue, "base64").toString("ascii").split(":");

        responseToken = await req.services.Authentication.loginWithEmailCode(email, code);
        break;

      default:
        const err: Express.RequestError = new Error("OAUTH:BAD_REQUEST");
        err.statusCode = 400;
        err.errors = [{ message: "Authorization method is not allowed.", code: "OAUTH-002", value: req.headers.authorization, param: "Authorization" }];

        throw err;
    }
  } else if (req.body.grant_type === "refresh_token") {
    const refreshToken = req.body.refresh_token;

    if (typeof refreshToken === "string") {
      responseToken = await req.services.Authentication.refreshToken(refreshToken);
    }
  }

  if (!responseToken) {
    const err: Express.RequestError = new Error("OAUTH:BAD_REQUEST");
    err.statusCode = 401;
    err.errors = [{ message: "Could not authorize.", code: "OAUTH-003", value: req.headers.authorization, param: "Authorization" }];

    throw err;
  }

  res.status(200).json(responseToken);
}

async function revokeToken(req: Request, res: Response): Promise<void> {
  const token = req.body.token;

  await req.services.Authentication.deleteRefreshToken(token);
  res.sendStatus(204);
}

export default { newToken, revokeToken };
