import { config } from "dotenv";

process.env.NODE_ENV = process.env.NODE_ENV || "development";

const envFound = config({ path: `${process.env.PWD}/.env` });
if (!envFound) {
    throw new Error("⚠ Couldn't find .env file ⚠");
}

export default {
    env: process.env.NODE_ENV,

    port: parseInt(process.env.PORT || "6972", 10),

    databaseURI: process.env.DATABASE_URI,

    email: {
        email: process.env.EMAIL,
        password: process.env.EMAIL_PASSWORD,
    },
};
