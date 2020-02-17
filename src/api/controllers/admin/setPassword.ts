import { Request, Response } from "express";

async function setPassword(req: Request, res: Response) {
    const adminID = req.body.adminID;
    const password = req.body.password;

    await req.db.admin.setPassword(adminID, password);

    req.login({ id: adminID, type: "admin" }, async function(errLogin: Error) {
        if (errLogin) {
            throw errLogin;
        }

        const admin = await req.db.server.getAdminByID(adminID);
        delete admin.password;

        return res.json({ type: "success", admin });
    });
}

export { setPassword };
