import { config as dotenvConfig } from "dotenv";

const envFound = dotenvConfig({ path: `${process.env.PWD}/.env` });
if (!envFound) {
  throw new Error("Could not find .env file");
}

const Config = {
  isDevelopment: process.env.NODE_ENV === "development",
  environment: {
    production: process.env.ENVIRONMENT === "production",
    sandbox: process.env.ENVIRONMENT === "sandbox",
    development: process.env.ENVIRONMENT === "development",
    test: process.env.ENVIRONMENT === "test",
    staging: process.env.ENVIRONMENT === "staging",
  },

  server: {
    port: parseInt(process.env.PORT || "8080", 10),
    store: process.env.STORE!,
  },

  secret: process.env.SECRET!,

  logs: {
    level: process.env.LOG_LEVEL || "silly",
  },

  psql: {
    uri: process.env.PSQL_URI!,
  },

  redis: {
    uri: process.env.REDIS_URI!,
  },

  sendGrid: {
    apiKey: process.env.SEND_GRID_API_KEY!,
    email: process.env.SEND_GRID_EMAIL!,
    emailTemplates: {
      login: process.env.SEND_GRID_TEMPLATE_LOGIN!,
      recommendationRequest: process.env.SEND_GRID_TEMPLATE_RECOMMENDATION_REQUEST!,
      recommendationReceivedApplicant: process.env.SEND_GRID_TEMPLATE_RECOMMENDATION_RECEIVED_APPLICANT!,
      recommendationReceivedSender: process.env.SEND_GRID_TEMPLATE_RECOMMENDATION_RECEIVED_SENDER!,
      closingReminder: process.env.SEND_GRID_TEMPLATE_CLOSING_REMINDER!,
    },
  },
};

export { Config };
