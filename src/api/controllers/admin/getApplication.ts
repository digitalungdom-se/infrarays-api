import { Request, Response } from "express";

async function getApplication(req: Request, res: Response) {
    const userID = req.query.userID;

    const [user, file] = await Promise.all([req.db.server.getUserByID(userID), req.db.admin.getApplication(userID)]);

    if (!file) {
        res.status(404).json({ type: "fail", msg: "no application" });
    }

    const fileName = user.name.replace(/ /g, "_");

    res.set("Content-disposition", "inline; filename=" + `${fileName}.pdf`);
    res.contentType("application/pdf");
    res.set("Content-Length", file.byteLength.toString());

    return res.send(file);
}

export { getApplication };
