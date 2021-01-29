import { Config } from "configs";

import { App } from "./App";
import { loadPSQL } from "./psql";
import { loadLogger } from "./logger";
import { loadSendGridMailService } from "./sendGrid";
import { loadRedis } from "./redis";

async function load(config: typeof Config): Promise<App> {
  const [logger, psql, redis, sendGridMailService] = await Promise.all([loadLogger(config), loadPSQL(config), loadRedis(config), loadSendGridMailService(config)]);

  const app = new App(config, logger, psql, redis, sendGridMailService);

  return app;
}

export { load };
