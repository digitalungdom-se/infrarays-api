import express from "express";
import "express-async-errors";
import moment from "moment";

const router = express.Router();

import {
    ensureAdminAuthenticated,
    ensureAuthenticated,
    ensureUserAuthenticated,
    ensureSuperAdminAuthenticated,
    lockRoute,
    validate,
} from "./middlewares";

import controllers from "./controllers";
import validators from "./validators";

const lockRoute01032020Date = moment.utc([2020, 3, 1, 3]).toDate();
const lockRoute01032020 = lockRoute(lockRoute01032020Date);
console.log(`${moment.utc().toISOString()}: activating lock routes for ${lockRoute01032020Date.toUTCString()}`);

// auth
router.get("/auth", ensureAuthenticated, controllers.auth);
router.get("/test", lockRoute01032020, function(req: express.Request, res: express.Response) {
    res.sendStatus(200);
});

// user
router.post("/user/login", validate(validators.user.login), controllers.user.login);
router.delete("/user/logout", controllers.user.logout);

router.get("/user/application", ensureUserAuthenticated, controllers.user.downloadApplication);
router.delete("/user/application", lockRoute01032020, ensureUserAuthenticated, controllers.user.deleteApplication);

router.post("/user/password/forgot", validate(validators.user.sendForgotPassword), controllers.user.sendForgotPassword);
router.put("/user/password/reset", validate(validators.user.resetPassword), controllers.user.resetPassword);

router.post("/user/register", lockRoute01032020, validate(validators.user.register), controllers.user.register);
router.post("/user/verify", lockRoute01032020, validate(validators.user.verify), controllers.user.verify);
router.post(
    "/user/resend/verification",
    lockRoute01032020,
    validate(validators.user.resendVerification),
    controllers.user.resendVerification,
);

router.post(
    "/user/send/recommendation",
    lockRoute01032020,
    validate(validators.user.sendRecommendationEmail),
    controllers.user.sendRecommendationEmail,
);
router.post(
    "/user/upload/recommendation/:userID/:recommendationID",
    lockRoute01032020,
    validate(validators.user.uploadRecommendationLetter),
    controllers.user.uploadRecommendationLetter,
);
router.get("/user/recommendation", validate(validators.user.getRecommendationInfo), controllers.user.getRecommendationInfo);

router.post(
    "/user/upload/pdf/:fileType",
    lockRoute01032020,
    ensureUserAuthenticated,
    validate(validators.user.uploadPDF),
    controllers.user.uploadPDF,
);

router.post("/user/survey", lockRoute01032020, ensureUserAuthenticated, validate(validators.user.survey), controllers.user.survey);

// Admins
router.post("/admin/login", validate(validators.admin.login), controllers.admin.login);
router.delete("/admin/logout", controllers.admin.logout);

router.post("/admin/randomise_grading_order", ensureAdminAuthenticated, controllers.admin.randomiseGradingOrder);

router.get("/admin/get/admins", ensureAdminAuthenticated, controllers.admin.getAdmins);
router.get("/admin/get/applications", ensureAdminAuthenticated, controllers.admin.getApplications);
router.get("/admin/get/application", ensureAdminAuthenticated, validate(validators.admin.getApplication), controllers.admin.getApplication);
router.get("/admin/get/application_order", ensureAdminAuthenticated, controllers.admin.getApplicationOrder);
router.get("/admin/get/surveys", ensureAdminAuthenticated, controllers.admin.getSurveys);
router.get(
    "/admin/get/application_grades",
    ensureAdminAuthenticated,
    validate(validators.admin.getApplicationGrades),
    controllers.admin.getApplicationGrades,
);

router.post("/admin/grade", ensureAdminAuthenticated, validate(validators.admin.gradeApplication), controllers.admin.gradeApplication);

router.post("/admin/add_admin", ensureSuperAdminAuthenticated, validate(validators.admin.addAdmin), controllers.admin.addAdmin);
router.post("/admin/set_password", validate(validators.admin.setPassword), controllers.admin.setPassword);

export default router;
