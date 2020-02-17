import { Request, Response } from "express";

async function getSurveys(req: Request, res: Response) {
    const surveys = await req.db.admin.getSurveys();

    return res.json({ type: "success", surveys });
}

export { getSurveys };
