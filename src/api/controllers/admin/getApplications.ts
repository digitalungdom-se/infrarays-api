import express from 'express';

async function getApplications(req: express.Request, res: express.Response) {
    const applications = await req.db.admin.getApplications();

    return res.json({
        'type': 'success',
        applications
    });
}

export {
    getApplications,
};