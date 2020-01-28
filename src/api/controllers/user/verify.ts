import express from 'express';

async function verify(req: express.Request, res: express.Response) {
    const token = req.body.token;

    await req.db.user.verify(token);

    return res.json({'type': 'success'});
}

export {
    verify,
};
