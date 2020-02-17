import { Request, Response } from "express";

async function gradeApplication(req: Request, res: Response) {
    const adminID = req.user!.id;
    const userID = req.body.userID;
    const gradeData = {
        cv: req.body.cv,
        coverLetter: req.body.coverLetter,
        essay: req.body.essay,
        grade: req.body.grade,
        recommendation: req.body.recommendation,
        overall: req.body.overall,
        comment: req.body.comment,
    };

    await req.db.admin.gradeApplication(adminID, userID, gradeData);

    return res.json({ type: "success" });
}

export { gradeApplication };
