import express from 'express';

async function downloadApplication(req: express.Request, res: express.Response) {
    const id = req.user?.id || '';
    const [user, file] = await Promise.all([
        req.db.server.getUserByID(id),
        req.db.user.getCompleteApplication(id),
    ]);

    if (!file) {
        res.status(404).json({ 'type': 'fail', 'msg': 'no application' });
    }

    const fileName = user.name.replace(/ /g, '_');

    res.set('Content-disposition', 'inline; filename=' + `${fileName}.pdf`);
    res.contentType('application/pdf');
    res.set('Content-Length', file.byteLength.toString());

    return res.send(file);
}

async function deleteApplication(req: express.Request, res: express.Response) {
    const userID = req.user?.id || '';

    await req.db.user.deleteApplication(userID);

    req.logout();

    return res.json({
        'type': 'success',
    });
}

export {
    downloadApplication,
    deleteApplication,
};
