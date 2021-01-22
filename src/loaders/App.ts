import bodyParser from "body-parser";
import express from "express";
import helmet from "helmet";
import winston from "winston";
import { MailService as SendGridMailService } from "@sendgrid/mail";
import cors from "cors";
import "express-async-errors";
import knex from "knex";
import { RedisClient } from "redis";

import { Config } from "configs";
import { Server } from "http";
import { loadServices } from "./services";
import { httpErrorLogger, httpLogger } from "./logger";

import { attachUser } from "api/middlewares";
import router from "api/routes";

class App {
  public app: express.Application;
  private server?: Server;

  constructor(private readonly config: typeof Config, public readonly logger: winston.Logger, private readonly knex: knex, private readonly redis: RedisClient, private readonly sendGridMailService: SendGridMailService) {
    this.app = express();

    this.init();
    this.initServices();
    this.initMiddlewares();
    this.initRoutes();
    this.initErrorHandler();
  }

  public start(): void {
    this.server = this.app.listen(this.app.get("port"));
  }

  public async close(): Promise<void> {
    await this.knex.destroy();
    this.logger.close();
    this.server?.close();
  }

  public getPort(): number {
    return this.app.get("port");
  }

  public getApp(): express.Application {
    return this.app;
  }

  private init(): void {
    if (process.env.BEHIND_REVERSE_PROXY) {
      this.app.enable("trust proxy");
    }

    this.app.disable("x-powered-by");

    this.app.set("port", this.config.server.port);
  }

  private initServices(): void {
    this.app.use((req, _, next) => {
      req.logger = this.logger;
      req.services = loadServices(this.knex, this.redis, this.sendGridMailService, this.config);

      next();
    });
  }

  private initMiddlewares(): void {
    this.app.use(httpLogger(this.logger));

    if (this.config.environment.production) {
      this.app.use(cors({ origin: "https://ansok.raysforexcellence.se" }));
    } else {
      this.app.use(cors());
    }

    this.app.use(helmet());
    this.app.use(helmet.permittedCrossDomainPolicies());
    this.app.use(helmet.referrerPolicy({ policy: "same-origin" }));
    this.app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));

    this.app.use(bodyParser.json({ limit: "100kb" }));
    this.app.use(bodyParser.urlencoded({ limit: "100kb", extended: false }));
    this.app.use(bodyParser.raw({ limit: "100kb" }));
    this.app.use(bodyParser.text({ limit: "100kb" }));
  }

  private initRoutes(): void {
    this.app.use(attachUser);
    this.app.use(router);

    this.app.use(function (_, res, next) {
      const err: Express.RequestError = new Error("ROUTE:NOT_FOUND");
      err.statusCode = 404;

      next(err);
    });
  }

  private initErrorHandler(): void {
    // respond to the client
    this.app.use(function (err: Express.RequestError, _: express.Request, res: express.Response, next: express.NextFunction) {
      if (!err || typeof err !== "object") {
        err = new Error(err);
      }

      err.statusCode = err.statusCode || 500;
      res.error = err;

      res.sendStatus(err.statusCode);
      next(err);
    });

    // log the request
    this.app.use(httpErrorLogger(this.logger));

    // clear the error so that express does not log it
    this.app.use(function (err: Express.RequestError, _: express.Request, res: express.Response, next: express.NextFunction) {
      next();
    });
  }
}

export { App };
