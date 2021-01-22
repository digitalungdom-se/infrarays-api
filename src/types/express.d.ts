/* eslint-disable */
import { IServices } from "interfaces";
import { Logger } from "winston";
import { UserType } from "./constants";
/* eslint-enable */

declare global {
  export namespace Express {
    export interface RequestError extends Error {
      message: string;
      customMessage?: string;
      statusCode?: number;
      status?: number;
      info?: string;
      errors?: Array<{ msg?: any; param?: string; value?: any }>;
    }

    export interface Request {
      services: IServices;

      logger: Logger;

      user?: {
        id: string;
        type: UserType;
      };
    }

    export interface Response {
      error?: RequestError;
    }
  }
}
