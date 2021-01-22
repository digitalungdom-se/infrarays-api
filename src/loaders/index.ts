import { Config } from "configs";

import { App } from "./App";
import { loadPSQL } from "./psql";
import { loadLogger } from "./logger";
import { loadMailService } from "./sendGrid";
import { loadRedis } from "./redis";

async function load(config: typeof Config): Promise<App> {
  const logger = loadLogger(config);

  const psql = loadPSQL();
  const redis = loadRedis(config);

  const mailService = loadMailService(config);

  const app = new App(config, logger, psql, redis, mailService);

  return app;
}

export { load };
