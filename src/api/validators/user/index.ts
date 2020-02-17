import { login } from "./authorisation";
import { register } from "./register";
import { resendVerification } from "./resendVerification";
import { resetPassword, sendForgotPassword } from "./forgotPassword";
import { sendRecommendationEmail, uploadRecommendationLetter, getRecommendationInfo } from "./recommendationLetter";
import { survey } from "./survey";
import { uploadPDF } from "./uploadFile";
import { verify } from "./verify";

export default {
    getRecommendationInfo,
    login,
    register,
    resendVerification,
    resetPassword,
    sendForgotPassword,
    sendRecommendationEmail,
    survey,
    uploadPDF,
    uploadRecommendationLetter,
    verify,
};
