import { deleteApplication, downloadApplication } from './application';
import { login, logout } from './authorisation';
import { resetPassword, sendForgotPassword } from './forgotPassword';
import { sendRecommendationEmail, uploadRecommendationLetter} from './recommendationLetter';
import { register } from './register';
import { uploadPDF } from './uploadFile';
import { verify } from './verify';

export default {
    deleteApplication,
    downloadApplication,
    login,
    logout,
    register,
    resetPassword,
    sendForgotPassword,
    sendRecommendationEmail,
    uploadPDF,
    uploadRecommendationLetter,
    verify,
};
