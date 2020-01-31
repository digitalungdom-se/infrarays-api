import { deleteApplication, downloadApplication } from './application';
import { login, logout } from './authorisation';
import { resetPassword, sendForgotPassword } from './forgotPassword';
import { sendRecommendationEmail, uploadRecommendationLetter, getRecommendationInfo } from './recommendationLetter';
import { survey } from './survey';
import { register } from './register';
import { uploadPDF } from './uploadFile';
import { verify } from './verify';

export default {
    deleteApplication,
    downloadApplication,
    getRecommendationInfo,
    login,
    logout,
    register,
    resetPassword,
    sendForgotPassword,
    sendRecommendationEmail,
    survey,
    uploadPDF,
    uploadRecommendationLetter,
    verify,
};
