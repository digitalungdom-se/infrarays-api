import { MailService } from "@sendgrid/mail";
import knex from "knex";
import { RedisClient } from "redis";

import { IServices } from "interfaces";
import { ApplicationService, AuthenticationService, StorageService, TokenService, UserService } from "services";
import { Config } from "configs";

function loadServices(knex: knex, redis: RedisClient, mailService: MailService, config: typeof Config): IServices {
  const userService = new UserService(knex);
  const tokenService = new TokenService(redis);
  const storageService = new StorageService(knex, config);

  const services: IServices = {
    Authentication: new AuthenticationService(tokenService, userService, mailService, config),
    Application: new ApplicationService(knex, userService, storageService, mailService, config),
    User: userService,
    Storage: storageService,
  };

  return services;
}

export { loadServices };
