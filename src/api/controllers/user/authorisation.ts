import passport from 'configs/passport';
import express from 'express';

async function login(req: express.Request, res: express.Response) {
    passport.authenticate('local.user', function (err, user: { id: string, type: 'user'; }, info) {
        if (err) {
            throw err;
        }

        if (!user) {
            res.status(400).json({ 'type': 'fail', 'msg': info });
            return;
        }

        const userID = user.id;

        req.login({ 'id': userID, 'type': 'user' }, async function (errLogin: Error) {
            if (errLogin) {
                throw errLogin;
            }

            const [userData, files, survey] = await Promise.all([
                req.db.server.getUserByID(userID),
                req.db.server.getFilesByUserID(userID),
                req.db.server.getSurveyByUserID(userID),
            ]);

            if (userData) {
                userData.recommendations.forEach(function (file: any) { delete file.id; });
                delete userData.id;
                delete userData.password;
            }


            if (survey) {
                delete survey.id;
                delete survey.user_id;
            }

            return res.json({ 'type': 'success', userData, files, survey });
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
