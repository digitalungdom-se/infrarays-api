import express from 'express';
import fileUpload from 'express-fileupload';

async function uploadPDF(req: express.Request, res: express.Response) {
    const userID = req.user?.id || '';
    const fileType = req.params.fileType;
    const file = req.files?.file as fileUpload.UploadedFile;

    const fileBuffer = file.data;

    await req.db.user.uploadFile(userID, fileBuffer, fileType);

    return res.status(201).json({ 'type': 'success' });
}

export { uploadPDF };
