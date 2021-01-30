import { Logger } from "winston";
import nodeSchedule from "node-schedule";
import moment from "moment-timezone";
import { MailService as SendGridMailService } from "@sendgrid/mail";
import knex from "knex";
import { RedisClient } from "redis";

import { When, sendClosingReminderJob } from "jobs";
import { loadServices } from "./services";
import { Config } from "configs";
import { MailService } from "services";

export function loadJobs(knex: knex, redis: RedisClient, sendGridMailService: SendGridMailService, config: typeof Config, logger: Logger): void {
  const services = loadServices(knex, redis, sendGridMailService, config);
  const mailService = new MailService(sendGridMailService, config);

  if (process.env.NODE_APP_INSTANCE === "0" || !process.env.NODE_APP_INSTANCE) {
    const oneWeekLeftDate = moment().tz("Europe/Stockholm").month(2).date(25).hour(17).startOf("hour").toDate();
    const fourDaysLeft = moment().tz("Europe/Stockholm").month(2).date(27).hour(17).startOf("hour").toDate();
    const oneDayLeftDate = moment().tz("Europe/Stockholm").month(2).date(30).hour(8).startOf("hour").toDate();
    const closedDate = moment().tz("Europe/Stockholm").month(3).date(1).hour(1).startOf("hour").toDate();

    logger.info(`Scheduling closing reminder job for ${oneWeekLeftDate.toString()} (${When.Week})`);
    nodeSchedule.scheduleJob(oneWeekLeftDate, sendClosingReminderJob(When.Week, services.User, services.Application, mailService, logger));

    logger.info(`Scheduling closing reminder job for ${fourDaysLeft.toString()} (${When.FourDays})`);
    nodeSchedule.scheduleJob(fourDaysLeft, sendClosingReminderJob(When.FourDays, services.User, services.Application, mailService, logger));

    logger.info(`Scheduling closing reminder job for ${oneDayLeftDate.toString()} (${When.OneDay})`);
    nodeSchedule.scheduleJob(oneDayLeftDate, sendClosingReminderJob(When.OneDay, services.User, services.Application, mailService, logger));

    logger.info(`Scheduling closing reminder job for ${closedDate.toString()} (${When.Closed})`);
    nodeSchedule.scheduleJob(closedDate, sendClosingReminderJob(When.Closed, services.User, services.Application, mailService, logger));
  }
}
