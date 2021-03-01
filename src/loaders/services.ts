import { MailService as SendGridMailService } from "@sendgrid/mail";
import knex from "knex";
import { RedisClient } from "redis";

import { IServices } from "interfaces";
import { ApplicationService, AuthenticationService, StorageService, TokenService, UserService, MailService, AdminService } from "services";
import { Config } from "configs";

function loadServices(knex: knex, redis: RedisClient, sendGridMailService: SendGridMailService, config: typeof Config): IServices {
  const tokenService = new TokenService(redis);
  const storageService = new StorageService(knex, config);
  const mailService = new MailService(sendGridMailService, config);

  const userService = new UserService(knex, storageService);

  const services: IServices = {
    Authentication: new AuthenticationService(tokenService, userService, mailService, config),
    Application: new ApplicationService(knex, userService, storageService, mailService, tokenService, config),
    Admin: new AdminService(knex, userService),
    User: userService,
    Storage: storageService,
  };

  return services;
}

export { loadServices };
