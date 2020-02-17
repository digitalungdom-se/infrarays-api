import { deleteApplication, downloadApplication } from "./application";
import { login, logout } from "./authorisation";
import { register } from "./register";
import { resetPassword, sendForgotPassword } from "./forgotPassword";
import { sendRecommendationEmail, uploadRecommendationLetter, getRecommendationInfo } from "./recommendationLetter";
import { survey } from "./survey";
import { uploadPDF } from "./uploadFile";
import { verify } from "./verify";
import { resendVerification } from "./resendVerification";

export default {
    deleteApplication,
    downloadApplication,
    getRecommendationInfo,
    login,
    logout,
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
