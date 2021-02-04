import winston from "winston";
import expressWinston from "express-winston";
import express from "express";
import "winston-daily-rotate-file";
import fs from "fs-extra";

import { Config } from "configs";

function loadLogger(config: typeof Config): winston.Logger {
  const transports = [];

  if (fs.readFileSync("/proc/self/cgroup", "utf8").includes("docker") || fs.pathExistsSync("/.dockerenv")) {
    transports.push(
      new winston.transports.DailyRotateFile({
        filename: "infrarays-api-%DATE%.log",
        frequency: "24h",
        datePattern: "YYYY-MM-DD-HH",
        zippedArchive: false,
        utc: true,
        createSymlink: true,
        dirname: "/var/log/infrarays-api",
        format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.splat(), winston.format.json()),
      }),
    );
  }

  if (!config.isDevelopment) {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.cli(),
          winston.format.printf(info => `${info.level} (@${info.timestamp} on ${info.instance}): ${info.message}`),
        ),
      }),
    );
  } else {
    // dev and test
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.splat(), winston.format.json(), winston.format.prettyPrint()),
      }),
    );
  }

  const logger = winston.createLogger({
    level: config.logs.level,
    levels: winston.config.npm.levels,
    defaultMeta: { instance: process.env.NODE_APP_INSTANCE },
    transports,
  });

  return logger;
}

function httpLogger(logger: winston.Logger): express.Handler {
  return expressWinston.logger({
    winstonInstance: logger,
    msg: "{{res.statusCode}} {{req.method}} {{req.url}} {{res.responseTime}}ms ",
    statusLevels: true,
    metaField: null as any,
    requestField: null as any,
    responseField: null as any,
    dynamicMeta: (req, res) => {
      const meta: any = {};

      meta.req = {
        path: req.path,
        method: req.method,
        ip: req.ip,
        size: req.socket.bytesRead,
      };

      if (req.user) {
        meta.req.user = req.user;
      }

      meta.res = {
        statusCode: res.statusCode,
      };

      if (res.error) {
        meta.res.error = res.error;
      }

      return meta;
    },
    ignoreRoute: function (req) {
      if (req.path === "/health" || req.method === "OPTIONS") {
        return true;
      }

      return false;
    },
    skip: function (_, res) {
      // Skip routes not found since bots scraping the API clogs the logs (implement IP ban?) or logs these request separately
      if (!res.statusCode || res.statusCode >= 500 || res.error?.message === "ROUTE:NOT_FOUND") {
        return true;
      }

      return false;
    },
  });
}

function httpErrorLogger(logger: winston.Logger): express.ErrorRequestHandler {
  return expressWinston.errorLogger({
    winstonInstance: logger,
    msg: "{{res.statusCode}} {{req.method}} {{req.url}} {{res.responseTime}}ms ",
    requestField: null as any,
    responseField: null as any,
    metaField: null as any,
    blacklistedMetaFields: ["exception"],
    dynamicMeta: (req, res) => {
      const meta: any = {};

      meta.req = {
        path: req.path,
        method: req.method,
        ip: req.ip,
        size: req.socket.bytesRead,
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers,
      };

      if (req.user) {
        meta.req.user = req.user;
      }

      meta.res = {
        statusCode: res.statusCode,
      };

      if (res.error) {
        meta.res.error = res.error;
      }

      return meta;
    },
    skip: function (_, res) {
      if (res.statusCode && res.statusCode < 500) {
        return true;
      }

      return false;
    },
  });
}

export { loadLogger, httpLogger, httpErrorLogger };
