import { Request, Response } from "express";

async function getApplicationGrades(req: Request, res: Response) {
    const userID = req.query.userID;

    const applicationGrades = await req.db.admin.getApplicationGrades(userID);

    return res.json({ type: "success", applicationGrades });
}

export { getApplicationGrades };
