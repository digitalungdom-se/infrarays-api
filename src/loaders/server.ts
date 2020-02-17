import bodyParser from "body-parser";
import compression from "compression";
import connectSessionKnex from "connect-session-knex";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import fileUpload from "express-fileupload";
import helmet from "helmet";
import passport from "passport";
import path from "path";
import session from "express-session";

import AdminService from "services/Admin";
import ServerService from "services/Server";
import UserService from "services/User";

import database from "./database";
import initJobs from "./jobs";

// routes to be used
import apiRoutes from "api/routes";

const KnexSessionStore = connectSessionKnex(session);

export default async function init(state: string): Promise<express.Application> {
    const app = express();

    // Enable trust proxy if in production (needed for nginx?)
    if (state === "production") {
        app.enable("trust proxy");
    }

    app.disable("x-powered-by");

    // Middleware
    // Compression
    app.use(compression());

    app.use(express.static(path.join(__dirname, "..", "build")));

    // Security
    // Helmet
    app.use(helmet());
    app.use(helmet.permittedCrossDomainPolicies());
    app.use(helmet.referrerPolicy({ policy: "same-origin" }));
    app.use(
        helmet.hsts({
            includeSubDomains: true,
            maxAge: 31536000,
            preload: true,
        }),
    );

    // Cross site request and cross site request forgery
    app.use(cors({ origin: false }));
    // app.use( csrf( { cookie: true } ) );

    // Body parser
    app.use(bodyParser.json({ limit: "100kb" }));
    app.use(bodyParser.urlencoded({ limit: "100kb", extended: false }));
    app.use(bodyParser.raw({ limit: "100kb" }));
    app.use(bodyParser.text({ limit: "100kb" }));

    app.use(
        fileUpload({
            limits: {
                fileSize: 5 * 1024 * 1024,
            },
            abortOnLimit: true,
        }),
    );

    // cookie parser
    app.use(cookieParser());

    const db = {
        admin: new AdminService(database),
        server: new ServerService(database),
        user: new UserService(database),
    };

    app.use(function(req: Express.Request, _, next: express.NextFunction) {
        req.db = {
            admin: db.admin,
            server: db.server,
            user: db.user,
        };

        next();
    });

    // Passportjs for local strategy authentication
    const store = new KnexSessionStore({ knex: database });

    app.use(
        session({
            resave: false,
            saveUninitialized: true,
            secret: process.env.SECRET as string,
            store,
        }),
    );

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    app.use(passport.initialize());
    app.use(passport.session());

    // Use routes defined in routes/routes.js
    app.use("/api/", apiRoutes);

    app.all("/api/*", function(req, res, next: express.NextFunction) {
        const err: Express.RequestError = new Error("NOT_FOUND");
        err.statusCode = 404;
        next(err);
    });

    app.get("*", function(req, res) {
        res.sendFile(path.join(__dirname, "..", "build", "index.html"));
    });

    // Error logger
    app.use(function(err: Express.RequestError, req: express.Request, res: express.Response, next: express.NextFunction) {
        if (err.statusCode === 500 || !err.statusCode) {
            const url = req.protocol + "://" + req.get("host") + req.originalUrl;
            if (err.stack) {
                console.error(`${new Date().toISOString()}: ERROR in route ${url}: `, err.stack);
            } else {
                console.error(`${new Date().toISOString()}: ERROR in route ${url}: `, err);
            }
        }

        next(err);
    });

    // eslint-disable-next-line
    app.use(function(err: Express.RequestError, req: express.Request, res: express.Response, next: express.NextFunction) {
        if (typeof err === "string") {
            err = new Error(err);
            err.statusCode = 500;
            err.customMessage = "INTERNAL_SERVER_ERROR";
            err.errors = [];
        } else {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            if (!err.customMessage) {
                err.customMessage = "INTERNAL_SERVER_ERROR";
            }
            if (!err.errors) {
                err.errors = [];
            }
        }

        return res.status(err.statusCode).send({ type: "fail", msg: err.customMessage, errors: err.errors });
    });

    await initJobs({ server: db.server, user: db.user });

    // set port to 6972
    app.set("port", 6972);

    return app;
}
