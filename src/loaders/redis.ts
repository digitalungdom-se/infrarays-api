import redis from "redis";
import { promisify } from "util";

import { Config } from "configs";

function loadRedis(config: typeof Config): redis.RedisClient {
  const client = redis.createClient(config.redis.uri);

  client.getAsync = promisify(client.get).bind(client);
  client.setAsync = promisify(client.set).bind(client);
  client.setexAsync = promisify(client.setex).bind(client);
  client.delAsync = promisify(client.del).bind(client);

  return client;
}

export { loadRedis };
