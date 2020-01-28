import { login } from './authorisation';
import { resetPassword, sendForgotPassword } from './forgotPassword';
import { sendRecommendationEmail, uploadRecommendationLetter } from './recommendationLetter';
import { register } from './register';
import { uploadPDF } from './uploadFile';
import { verify } from './verify';

export default {
    login,
    register,
    resetPassword,
    sendForgotPassword,
    sendRecommendationEmail,
    uploadPDF,
    uploadRecommendationLetter,
    verify,
};
