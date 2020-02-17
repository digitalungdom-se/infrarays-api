import express from "express";

async function verify(req: express.Request, res: express.Response) {
    const token = req.body.token;

    const userID = await req.db.user.verify(token);

    req.login({ id: userID, type: "user" }, async function(errLogin: Error) {
        if (errLogin) {
            throw errLogin;
        }

        const [userData, files, survey] = await Promise.all([
            req.db.server.getUserByID(userID),
            req.db.server.getFilesByUserID(userID),
            req.db.server.getSurveyByUserID(userID),
        ]);

        if (userData) {
            userData.recommendations.forEach(function(file: any) {
                delete file.id;
            });
            delete userData.id;
            delete userData.password;
        }

        if (survey) {
            delete survey.id;
            delete survey.user_id;
        }

        return res.json({ type: "success", userData, files, survey });
    });
}

export { verify };
