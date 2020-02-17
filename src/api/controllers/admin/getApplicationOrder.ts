import { Request, Response } from "express";

async function getApplicationOrder(req: Request, res: Response) {
    const adminID = req.user!.id;

    const applicationOrder = await req.db.admin.getApplicationOrder(adminID);

    return res.json({ type: "success", applicationOrder });
}

export { getApplicationOrder };
