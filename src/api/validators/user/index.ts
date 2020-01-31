import { login } from './authorisation';
import { resetPassword, sendForgotPassword } from './forgotPassword';
import { sendRecommendationEmail, uploadRecommendationLetter, getRecommendationInfo } from './recommendationLetter';
import { survey } from './survey';
import { register } from './register';
import { uploadPDF } from './uploadFile';
import { verify } from './verify';

export default {
    getRecommendationInfo,
    login,
    register,
    resetPassword,
    sendForgotPassword,
    sendRecommendationEmail,
    survey,
    uploadPDF,
    uploadRecommendationLetter,
    verify,
};
