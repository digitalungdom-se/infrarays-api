import express from 'express';

async function auth(req: express.Request, res: express.Response) {
    const id = req.user?.id || '';
    const userType = req.user?.type;

    if (userType === 'admin') {
        const admin = await req.db.server.getAdminByID(id);
        return res.json(admin);
    }

    const user = await req.db.server.getUserByID(id);
    return res.json(user);
}

export { auth };
