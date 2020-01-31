import express from 'express';
import database from 'types/database';

async function auth(req: express.Request, res: express.Response) {
    const userID = req.user?.id || '';
    const userType = req.user?.type;

    if (userType === 'admin') {
        const admin = await req.db.server.getAdminByID(userID);
        return res.json(admin);
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
}

export { auth };
