// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { RedisClient } from "redis";

declare module "redis" {
  interface RedisClient {
    getAsync(key: string): Promise<string | null>;
    setAsync(key: string, value: string): Promise<unknown>;
    setexAsync(key: string, expiration: number, value: string): Promise<unknown>;
    delAsync(...key: string[]): Promise<number>;
  }
}
