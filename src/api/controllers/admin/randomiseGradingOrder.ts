import { Request, Response } from "express";

async function randomiseGradingOrder(req: Request, res: Response) {
    const adminID = req.user!.id;

    const gradingOrder = await req.db.admin.randomiseGradingOrder(adminID);

    return res.json({ type: "success", gradingOrder });
}

export { randomiseGradingOrder };
