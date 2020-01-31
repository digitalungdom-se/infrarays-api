import express from 'express';
import 'express-async-errors';

const router = express.Router();

import { validate } from './middlewares';
import { ensureAdminAuthenticated, ensureAuthenticated, ensureUserAuthenticated } from './middlewares/ensureAuthentication';

import controllers from './controllers';
import validators from './validators';

// auth
router.get('/auth', ensureAuthenticated, controllers.auth);

// user
router.post('/user/login', validate(validators.user.login), controllers.user.login);
router.delete('/user/logout', controllers.user.logout);

router.get('/user/application', ensureUserAuthenticated, controllers.user.downloadApplication);
router.delete('/user/application', ensureUserAuthenticated, controllers.user.deleteApplication);

router.post('/user/password/forgot', validate(validators.user.sendForgotPassword), controllers.user.sendForgotPassword);
router.put('/user/password/reset', validate(validators.user.resetPassword), controllers.user.resetPassword);

router.post('/user/register', validate(validators.user.register), controllers.user.register);
router.post('/user/verify', validate(validators.user.verify), controllers.user.verify);

router.post('/user/send/recommendation', validate(validators.user.sendRecommendationEmail), controllers.user.sendRecommendationEmail);
router.post('/user/upload/recommendation/:userID/:recommendationID', validate(validators.user.uploadRecommendationLetter), controllers.user.uploadRecommendationLetter);
router.get('/user/recommendation', validate(validators.user.getRecommendationInfo), controllers.user.getRecommendationInfo);


router.post('/user/upload/pdf/:fileType', ensureUserAuthenticated, validate(validators.user.uploadPDF), controllers.user.uploadPDF);

router.post('/user/survey', ensureAdminAuthenticated, validate(validators.user.survey), controllers.user.survey);

export default router;
