import { addAdmin } from "./addAdmin";
import { getApplication } from "./getApplication";
import { getApplicationOrder } from "./getApplicationOrder";
import { getApplications } from "./getApplications";
import { getSurveys } from "./getSurveys";
import { gradeApplication } from "./gradeApplication";
import { login, logout } from "./authorisation";
import { randomiseGradingOrder } from "./randomiseGradingOrder";
import { setPassword } from "./setPassword";
import { getApplicationGrades } from "./getApplicationGrades";

export default {
    addAdmin,
    getApplication,
    getApplicationGrades,
    getApplicationOrder,
    getApplications,
    getSurveys,
    gradeApplication,
    login,
    logout,
    randomiseGradingOrder,
    setPassword,
};
