import express from 'express';

async function auth(req: express.Request, res: express.Response) {
    const id = req.user?.id || '';
    const userType = req.user?.type;

    if (userType === 'admin') {
        const admin = await req.db.server.getAdminByID(id);
        return res.json(admin);
    }

    const [userData, files] = await Promise.all([
        req.db.server.getUserByID(id),
        req.db.server.getFilesByUserID(id),
        ]);

    userData.recommendations.forEach(function(file: any) { delete file.id; });

    return res.json({'type': 'success', userData, files});
}

export { auth };
