import { addAdmin } from "./addAdmin";
import { getAdmins } from "./getAdmins";
import { getApplication } from "./getApplication";
import { getApplicationGrades } from "./getApplicationGrades";
import { getApplicationOrder } from "./getApplicationOrder";
import { getApplications } from "./getApplications";
import { getSurveys } from "./getSurveys";
import { gradeApplication } from "./gradeApplication";
import { login, logout } from "./authorisation";
import { randomiseGradingOrder } from "./randomiseGradingOrder";
import { setPassword } from "./setPassword";

export default {
    addAdmin,
    getAdmins,
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
