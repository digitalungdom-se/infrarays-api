import express from 'express';

async function ensureUserAuthenticated(req: express.Request, _: express.Response, next: express.NextFunction) {
    if (req.isAuthenticated() && req.db.server.getUserByID(req.user?.id || '')) {
        return next();
    }

    const err: Express.RequestError = new Error('UNAUTHORISED');
    err.statusCode = 401;
    err.customMessage = 'UNAUTHORISED';
    next(err);

}

async function ensureAdminAuthenticated(req: express.Request, _: express.Response, next: express.NextFunction) {
    if (req.isAuthenticated() && req.db.server.getAdminByID(req.user?.id || '')) {
        return next();
    }

    const err: Express.RequestError = new Error('UNAUTHORISED');
    err.statusCode = 401;
    err.customMessage = 'UNAUTHORISED';
    next(err);

}

function ensureAuthenticated(req: express.Request, _: express.Response, next: express.NextFunction) {
    if (req.isAuthenticated()) {
        return next();
    }

    const err: Express.RequestError = new Error('UNAUTHORISED');
    err.statusCode = 401;
    err.customMessage = 'UNAUTHORISED';
    next(err);
}

export { ensureUserAuthenticated, ensureAdminAuthenticated, ensureAuthenticated };
