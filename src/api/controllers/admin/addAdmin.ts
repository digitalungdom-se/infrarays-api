import { Request, Response } from "express";

async function addAdmin(req: Request, res: Response) {
    const adminData = {
        email: req.body.email,
        name: req.body.name,
        super_admin: req.body.superAdmin,
    };

    await req.db.admin.addAdmin(adminData);

    return res.json({ type: "success" });
}

export { addAdmin };
