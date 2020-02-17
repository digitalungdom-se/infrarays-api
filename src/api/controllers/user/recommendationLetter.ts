import express from "express";
import fileUpload from "express-fileupload";

async function sendRecommendationEmail(req: express.Request, res: express.Response) {
    const id = req.user?.id || "";
    const email = req.body.email;
    const newEmail = req.body.newEmail;

    await req.db.user.sendRecommendationEmail(id, email, newEmail);

    return res.json({ type: "success" });
}

async function getRecommendationInfo(req: express.Request, res: express.Response) {
    const userID = req.query.userID;
    const recommendationID = req.query.recommendationID;

    const recommendationInfo = await req.db.user.getRecommendationInfo(userID, recommendationID);

    return res.json({ type: "success", recommendationInfo });
}

async function uploadRecommendationLetter(req: express.Request, res: express.Response) {
    const userID = req.params.userID;
    const recommendationID = req.params.recommendationID;
    const recommendationBuffer = (req.files?.file as fileUpload.UploadedFile).data;
    const recommendationName = (req.files?.file as fileUpload.UploadedFile).name;

    await req.db.user.uploadRecommendationLetter(userID, recommendationID, recommendationBuffer, recommendationName);

    return res.status(201).json({ type: "success" });
}

export { getRecommendationInfo, sendRecommendationEmail, uploadRecommendationLetter };
