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
r.post("/user/oauth/token").controller(controllers.oauth.newToken);
r.post("/user/oauth/revoke").controller(controllers.oauth.revokeToken);

r.post("/user/send_email_login_code").validator(validators.user.sendEmailLoginCode).controller(controllers.user.sendEmailLoginCode);

r.post("/user").validator(validators.user.createApplicant).controller(controllers.user.createApplicant);
r.delete("/user/:userID").ensureAuth().validator(validators.user.del).controller(controllers.user.del);
r.get("/user/:userID").ensureAuth().validator(validators.user.get).controller(controllers.user.get);
r.patch("/user/:userID").ensureAuth().validator(validators.user.update).controller(controllers.user.update);

r.get("/user/:userID/application").ensureAuth().validator(validators.application.get).controller(controllers.application.get);
r.get("/user/:userID/application/pdf").ensureAuth().validator(validators.application.getPDF).controller(controllers.application.getPDF);

r.get("/user/:userID/application/file").ensureAuth().validator(validators.application.getFiles).controller(controllers.application.getFiles);
r.post("/user/:userID/application/file/:fileType").ensureAuth().file("file").validator(validators.application.uploadFile).controller(controllers.application.uploadFile);
r.get("/user/:userID/application/file/:fileID").ensureAuth().validator(validators.application.getFile).controller(controllers.application.getFile);
r.delete("/user/:userID/application/file/:fileID").ensureAuth().validator(validators.application.deleteFile).controller(controllers.application.deleteFile);

r.get("/user/:userID/application/survey").ensureAuth().validator(validators.application.getSurvey).controller(controllers.application.getSurvey);
r.post("/user/:userID/application/survey").ensureAuth().validator(validators.application.saveSurvey).controller(controllers.application.saveSurvey);

r.get("/user/:userID/application/recommendation").ensureAuth().controller(controllers.application.getRecommendations);
r.post("/user/:userID/application/recommendation/:recommendationIndex").ensureAuth().validator(validators.application.sendRecommendationRequest).controller(controllers.application.sendRecommendationRequest);
r.delete("/user/:userID/application/recommendation/:recommendationIndex").ensureAuth().validator(validators.application.deleteRecommendation).controller(controllers.application.deleteRecommendation);

r.get("/application/recommendation/:recommendationCode").validator(validators.application.getRecommendationByCode).controller(controllers.application.getRecommendationByCode);
r.post("/application/recommendation/:recommendationCode").file("file").validator(validators.application.uploadRecommendation).controller(controllers.application.uploadRecommendation);

// admins
r.get("/user").ensureAdminAuth();
r.get("/admin").ensureAdminAuth();

r.post("/user/:userID/grade").ensureAdminAuth();
r.get("/user/:userID/grade").ensureAdminAuth();

r.post("/admin/randomise_grading_order").ensureAdminAuth();
r.get("/admin/grading").ensureAdminAuth();
r.get("/admin/survey").ensureAdminAuth();

// Super admins
r.post("/admin").ensureSuperAdminAuth();

export default r.export();
