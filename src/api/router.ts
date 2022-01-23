import { Request, Response, NextFunction, RequestHandler, Router as ExpressRouter } from "express";
import { ValidationChain } from "express-validator";
import moment from "moment";
import multer from "multer";

import { meToUserID, ensureAuthenticated, ensureApplicantAuthenticated, ensureAdminAuthenticated, ensureSuperAdminAuthenticated, lock, validate } from "./middlewares";

enum MethodTypes {
  get = "GET",
  post = "POST",
  put = "PUT",
  delete = "DELETE",
  patch = "PATCH",
}

class Route {
  public controllers: RequestHandler[];
  private storage: multer.StorageEngine;
  private upload: multer.Multer;

  constructor(public readonly path: string | string[], public readonly method: MethodTypes) {
    this.controllers = [];

    this.storage = multer.diskStorage({});

    this.upload = multer({
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mib max file size
      storage: this.storage,
    });

    this.controllers.push(meToUserID);
  }

  public ensureAuth(): Route {
    this.controllers.push(ensureAuthenticated);

    return this;
  }

  public ensureApplicantAuth(): Route {
    this.controllers.push(ensureApplicantAuthenticated);

    return this;
  }

  public ensureAdminAuth(): Route {
    this.controllers.push(ensureAdminAuthenticated);

    return this;
  }

  public ensureSuperAdminAuth(): Route {
    this.controllers.push(ensureSuperAdminAuthenticated);

    return this;
  }

  public lock(): Route {
    const start = moment.utc().month(0).startOf("month");
    const close = moment.utc().month(2).endOf("month").add(12, "hours");

    this.controllers.push(lock(start, close));

    return this;
  }

  public file(fieldName: string): Route {
    this.controllers.push(this.upload.single(fieldName));
    return this;
  }

  public validator(validations: Array<ValidationChain>): Route {
    this.controllers.push(validate(validations));

    return this;
  }

  public controller(controller: (req: Request, res: Response) => Promise<void>): Route {
    this.controllers.push(async function (req: Request, res: Response, next: NextFunction) {
      try {
        await controller(req, res);
        next();
      } catch (error) {
        next(error);
      }
    });

    return this;
  }
}

export class Router {
  private routes: Route[];
  private expressRouter: ExpressRouter;

  constructor() {
    this.routes = [];
    this.expressRouter = ExpressRouter();
  }

  public get(path: string | string[]): Route {
    const route = new Route(path, MethodTypes.get);
    this.routes.push(route);
    return route;
  }

  public post(path: string | string[]): Route {
    const route = new Route(path, MethodTypes.post);
    this.routes.push(route);
    return route;
  }

  public put(path: string | string[]): Route {
    const route = new Route(path, MethodTypes.put);
    this.routes.push(route);
    return route;
  }

  public delete(path: string | string[]): Route {
    const route = new Route(path, MethodTypes.delete);
    this.routes.push(route);
    return route;
  }

  public patch(path: string | string[]): Route {
    const route = new Route(path, MethodTypes.patch);
    this.routes.push(route);
    return route;
  }

  public export(): ExpressRouter {
    this.routes.forEach(route => {
      switch (route.method) {
        case MethodTypes.get:
          this.expressRouter.get(route.path, ...route.controllers);
          break;
        case MethodTypes.post:
          this.expressRouter.post(route.path, ...route.controllers);
          break;
        case MethodTypes.put:
          this.expressRouter.put(route.path, ...route.controllers);
          break;
        case MethodTypes.delete:
          this.expressRouter.delete(route.path, ...route.controllers);
          break;
        case MethodTypes.patch:
          this.expressRouter.patch(route.path, ...route.controllers);
          break;
      }
    });

    return this.expressRouter;
  }
}
