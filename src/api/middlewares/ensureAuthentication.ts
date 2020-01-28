import express from 'express';

async function ensureUserAuthenticated(req: express.Request, _: express.Response, next: express.NextFunction) {
    if (req.isAuthenticated() && req.db.server.getUserByID(req.user?.id || '')) {
        return next();
    }

    const err: Express.RequestError = new Error('UNATHORISED');
    err.statusCode = 401;
    err.customMessage = 'UNATHORISED';
    next(err);

}

async function ensureAdminAuthenticated(req: express.Request, _: express.Response, next: express.NextFunction) {
    if (req.isAuthenticated() && req.db.server.getAdminByID(req.user?.id || '')) {
        return next();
    }

    const err: Express.RequestError = new Error('UNATHORISED');
    err.statusCode = 401;
    err.customMessage = 'UNATHORISED';
    next(err);

}

async function ensureAuthenticated(req: express.Request, _: express.Response, next: express.NextFunction) {
    if (req.isAuthenticated()) {
        return next();
    }

    const err: Express.RequestError = new Error('UNATHORISED');
    err.statusCode = 401;
    err.customMessage = 'UNATHORISED';
    next(err);

}

export { ensureUserAuthenticated, ensureAdminAuthenticated, ensureAuthenticated };
