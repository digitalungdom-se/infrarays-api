import { Config } from "configs";

import { App } from "./App";
import { loadPSQL } from "./psql";
import { loadLogger } from "./logger";
import { loadSendGridMailService } from "./sendGrid";
import { loadRedis } from "./redis";
import { loadJobs } from "./jobs";

async function load(config: typeof Config): Promise<App> {
  const [logger, knex, redis, sendGridMailService] = await Promise.all([loadLogger(config), loadPSQL(config), loadRedis(config), loadSendGridMailService(config)]);

  loadJobs(knex, redis, sendGridMailService, config, logger);

  const app = new App(config, logger, knex, redis, sendGridMailService);

  return app;
}

export { load };
