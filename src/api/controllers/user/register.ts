import express from "express";

async function register(req: express.Request, res: express.Response) {
    const user = {
        birthdate: req.body.birthdate as Date,
        email: req.body.email as string,
        finnish: req.body.finnish as boolean,
        name: req.body.name as string,
        password: req.body.password as string,
    };

    await req.db.user.register(user);

    res.status(201).json({ type: "success" });
}

export { register };
