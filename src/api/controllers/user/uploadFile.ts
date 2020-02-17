import express from "express";
import fileUpload from "express-fileupload";

async function uploadPDF(req: express.Request, res: express.Response) {
    const userID = req.user?.id || "";
    const fileType = req.params.fileType;
    const fileBuffer = (req.files?.file as fileUpload.UploadedFile).data;
    const fileName = (req.files?.file as fileUpload.UploadedFile).name;

    await req.db.user.uploadFile(userID, fileBuffer, fileType, fileName);

    return res.status(201).json({ type: "success" });
}

export { uploadPDF };
