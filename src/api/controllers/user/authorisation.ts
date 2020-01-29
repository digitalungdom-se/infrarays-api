import passport from 'configs/passport';
import express from 'express';

async function login(req: express.Request, res: express.Response) {
    passport.authenticate('local.user', function(err, user: Express.User, info) {
        if (err) {
            throw err;
        }

        if (!user) {
            res.status(400).json({ 'type': 'fail', 'msg': info });
            return;
        }

        req.login(user, async function(errLogin: Error) {
            if (errLogin) {
                throw errLogin;
            }

            const [userData, files] = await Promise.all([
                                        req.db.server.getUserByID(user.id),
                                        req.db.server.getFilesByUserID(user.id),
                                        ]);

            userData.recommendations.forEach(function(file: any) { delete file.id; });
            delete userData.id;
            delete userData.password;

            res.json({ 'type': 'success', userData, files });
        });
    })(req, res);
}

async function logout(req: express.Request, res: express.Response) {
    req.logout();

    return res.json({
        'type': 'success',
    });
}

export { login, logout };
