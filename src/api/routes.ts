import { Router } from "./router";

import cats from "utils/cats.json";

import controllers from "./controllers";
import validators from "./validators";

const r = new Router();

// Server
r.get("/").controller(async (req, res) => {
  const catArray = Object.values(cats);

  const cat = catArray[Math.floor(Math.random() * catArray.length)];

  res.status(404).send(`<html> <pre> ${cat.join("<br/>")} <pre/> <br/> <br/> How did you find this? 😳😳🐈 <html/>`);
});

r.get("/health").controller(async (req, res) => {
  res.sendStatus(200);
});

// user
// admins can do GET and OPTION
// super-admins can do every thing
// if userID = @me => userID gets set to JWT userID
r.post("/user/oauth/token").controller(controllers.oauth.newToken);
r.post("/user/oauth/revoke").controller(controllers.oauth.revokeToken);

r.post("/user/send_email_login_code").validator(validators.user.sendEmailLoginCode).controller(controllers.user.sendEmailLoginCode);

r.delete("/user/:userID").ensureAuth().validator(validators.user.del).controller(controllers.user.del);
r.get("/user/:userID").ensureAuth().validator(validators.user.getByID).controller(controllers.user.getByID);
r.patch("/user/:userID").ensureAuth().validator(validators.user.update).controller(controllers.user.update);

// Application
r.post("/application").lock().validator(validators.application.createApplicant).controller(controllers.application.createApplicant);
r.get("/application/:userID").ensureAuth().validator(validators.application.get).controller(controllers.application.get);
r.get("/application/:userID/pdf").ensureAuth().validator(validators.application.getPDF).controller(controllers.application.getPDF);

r.get("/application/:userID/file").ensureAuth().validator(validators.application.getFiles).controller(controllers.application.getFiles);
r.post("/application/:userID/file/:fileType").lock().ensureAuth().file("file").validator(validators.application.uploadFile).controller(controllers.application.uploadFile);
r.get("/application/:userID/file/:fileID").ensureAuth().validator(validators.application.getFile).controller(controllers.application.getFile);
r.delete("/application/:userID/file/:fileID").lock().ensureAuth().validator(validators.application.deleteFile).controller(controllers.application.deleteFile);

r.get("/application/:userID/survey").ensureAuth().validator(validators.application.getSurvey).controller(controllers.application.getSurvey);
r.post("/application/:userID/survey").lock().ensureAuth().validator(validators.application.saveSurvey).controller(controllers.application.saveSurvey);

r.get("/application/:userID/recommendation").ensureAuth().controller(controllers.application.getRecommendations);
r.post("/application/:userID/recommendation/:recommendationIndex").lock().ensureAuth().validator(validators.application.sendRecommendationRequest).controller(controllers.application.sendRecommendationRequest);
r.delete("/application/:userID/recommendation/:recommendationIndex").lock().ensureAuth().validator(validators.application.deleteRecommendation).controller(controllers.application.deleteRecommendation);

r.get("/application/recommendation/:recommendationCode").validator(validators.application.getRecommendationByCode).controller(controllers.application.getRecommendationByCode);
r.post("/application/recommendation/:recommendationCode").file("file").validator(validators.application.uploadRecommendation).controller(controllers.application.uploadRecommendation);

// admin specific application
r.get("/application").ensureAdminAuth().controller(controllers.application.getApplicants);
r.post("/application/:userID/grade").ensureAdminAuth().validator(validators.admin.grade).controller(controllers.admin.grade);
r.get("/application/:userID/grade").ensureAdminAuth().validator(validators.admin.getGradesForApplicant).controller(controllers.admin.getGradesForApplicant);

// admin
r.get("/admin").ensureAdminAuth().validator(validators.admin.get).controller(controllers.admin.get);

r.post("/admin/grading/randomise").ensureAdminAuth().controller(controllers.admin.randomiseGradingOrder);
r.get("/admin/grading").ensureAdminAuth().controller(controllers.admin.getGradingOrder);

r.get("/admin/survey").ensureAdminAuth().controller(controllers.admin.getSurveys);

// Super admins
r.post("/admin").ensureSuperAdminAuth().validator(validators.admin.create).controller(controllers.admin.create);

export default r.export();
