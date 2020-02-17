import express from "express";

async function survey(req: express.Request, res: express.Response) {
    const userID = req.user?.id || "";

    const surveyData = {
        city: req.body.city,
        school: req.body.school,
        gender: req.body.gender,
        application_portal: req.body.applicationPortal,
        application_process: req.body.applicationProcess,
        improvement: req.body.improvement,
        informant: req.body.informant,
    };

    await req.db.user.updateSurvey(userID, surveyData);

    return res.json({
        type: "success",
    });
}

export { survey };
