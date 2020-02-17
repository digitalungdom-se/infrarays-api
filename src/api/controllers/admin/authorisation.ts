import passport from "configs/passport";
import express from "express";

async function login(req: express.Request, res: express.Response) {
    passport.authenticate("local.admin", function(err, admin: { id: string; type: "admin" }, info) {
        if (err) {
            throw err;
        }

        if (!admin) {
            res.status(400).json({ type: "fail", msg: info });
            return;
        }

        const adminID = admin.id;

        req.login({ id: adminID, type: "admin" }, async function(errLogin: Error) {
            if (errLogin) {
                throw errLogin;
            }

            return res.json({ type: "success" });
        });
    })(req, res);
}

function logout(req: express.Request, res: express.Response) {
    req.logout();

    return res.json({ type: "success" });
}

export { login, logout };
