/* eslint-disable */
import { IServices } from "interfaces";
import { Logger } from "winston";
import { UserType } from "./constants";
/* eslint-enable */

declare global {
  export namespace Express {
    export interface RequestError extends Error {
      message: string;
      statusCode?: number;
      info?: string;
      errors?: Array<{ message?: any; param?: string; value?: any; code?: string }>;
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
