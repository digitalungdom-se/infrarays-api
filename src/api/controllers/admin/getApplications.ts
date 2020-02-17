import { Request, Response } from "express";

async function getApplications(req: Request, res: Response) {
    const applications = await req.db.admin.getApplications();

    return res.json({ type: "success", applications });
}

export { getApplications };
