import { Request, Response } from "express";

async function getAdmins(req: Request, res: Response) {
    const admins = await req.db.admin.getAdmins();

    res.send(admins);
}

export { getAdmins };
