import express from "express";
import "express-async-errors";

const router = express.Router();

import { validate } from "./middlewares";
import {
    ensureAdminAuthenticated,
    ensureAuthenticated,
    ensureUserAuthenticated,
    ensureSuperAdminAuthenticated,
} from "./middlewares/ensureAuthentication";

import controllers from "./controllers";
import validators from "./validators";

// auth
router.get("/auth", ensureAuthenticated, controllers.auth);

// user
router.post("/user/login", validate(validators.user.login), controllers.user.login);
router.delete("/user/logout", controllers.user.logout);

router.get("/user/application", ensureUserAuthenticated, controllers.user.downloadApplication);
router.delete("/user/application", ensureUserAuthenticated, controllers.user.deleteApplication);

router.post("/user/password/forgot", validate(validators.user.sendForgotPassword), controllers.user.sendForgotPassword);
router.put("/user/password/reset", validate(validators.user.resetPassword), controllers.user.resetPassword);

router.post("/user/register", validate(validators.user.register), controllers.user.register);
router.post("/user/verify", validate(validators.user.verify), controllers.user.verify);
router.post("/user/resend/verification", validate(validators.user.resendVerification), controllers.user.resendVerification);

router.post("/user/send/recommendation", validate(validators.user.sendRecommendationEmail), controllers.user.sendRecommendationEmail);
router.post(
    "/user/upload/recommendation/:userID/:recommendationID",
    validate(validators.user.uploadRecommendationLetter),
    controllers.user.uploadRecommendationLetter,
);
router.get("/user/recommendation", validate(validators.user.getRecommendationInfo), controllers.user.getRecommendationInfo);

router.post("/user/upload/pdf/:fileType", ensureUserAuthenticated, validate(validators.user.uploadPDF), controllers.user.uploadPDF);

router.post("/user/survey", validate(validators.user.survey), controllers.user.survey);

// Admins
router.post("/admin/login", validate(validators.admin.login), controllers.admin.login);
router.delete("/admin/logout", controllers.admin.logout);

router.post("/admin/randomise_grading_order", ensureAdminAuthenticated, controllers.admin.randomiseGradingOrder);

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
