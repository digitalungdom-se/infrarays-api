/* eslint-disable */

import AdminService from "services/Admin";
import UserService from "services/User";
import ServerService from "services/Server";

declare global {
    namespace Express {
        export interface RequestError extends Error {
            message: string;
            customMessage?: string;
            statusCode?: number;
            info?: string;
            errors?: Array<{ msg: any; param: string; value?: any }>;
        }

        export interface Request {
            db: {
                admin: AdminService;
                user: UserService;
                server: ServerService;
            };
        }

        export interface User {
            id: string;
            type: "user" | "admin";
        }
    }
}
