import express from 'express';
import fileUpload from 'express-fileupload';

async function sendRecommendationEmail(req: express.Request, res: express.Response) {
    const id = req.user?.id || '';
    const email = req.body.email;
    await req.db.user.sendRecommendationEmail(id, email);

    return res.json({'type': 'success'});
}

async function uploadRecommendationLetter(req: express.Request, res: express.Response) {
    const userID = req.params.userID;
    const recommendationID = req.params.recommendationID;
    const recommendationBuffer = (req.files?.file as fileUpload.UploadedFile).data;
    const recommendationName = (req.files?.file as fileUpload.UploadedFile).name;

    await req.db.user.uploadRecommendationLetter(userID, recommendationID, recommendationBuffer, recommendationName);

    return res.status(201).json({'type': 'success'});
}

export {
    sendRecommendationEmail,
    uploadRecommendationLetter,
};
