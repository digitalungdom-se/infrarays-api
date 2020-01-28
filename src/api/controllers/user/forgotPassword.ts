import express from 'express';

async function sendForgotPassword(req: express.Request, res: express.Response) {
    const email = req.body.email;

    await req.db.user.sendForgotPassword(email);

    return res.json({'type': 'success'});
}

async function resetPassword(req: express.Request, res: express.Response) {
    const token = req.body.token;
    const password = req.body.password;

    await req.db.user.resetPassword(token, password);

    return res.json({'type': 'success'});
}

export {
    sendForgotPassword,
    resetPassword,
};
