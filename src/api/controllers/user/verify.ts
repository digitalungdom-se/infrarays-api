import express from 'express';

async function verify(req: express.Request, res: express.Response) {
    const token = req.body.token;

    const userID = await req.db.user.verify(token);

    req.login({'id': userID, 'type': 'user'}, async function(errLogin: Error) {
        if (errLogin) {
            throw errLogin;
        }

        const [userData, files] = await Promise.all([
                                    req.db.server.getUserByID(userID),
                                    req.db.server.getFilesByUserID(userID),
                                    ]);

        userData.recommendations.forEach(function(file: any) { delete file.id; });
        delete userData.id;
        delete userData.password;

        return res.json({ 'type': 'success', userData, files });
    });
}

export {
    verify,
};
