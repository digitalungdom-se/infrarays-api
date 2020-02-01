import express from 'express';

async function resendVerification(req: express.Request, res: express.Response) {
    const email = req.body.email;

    await req.db.user.resendVerification(email);

    return res.json({
        'type': 'success',
    });
}

export { resendVerification };
