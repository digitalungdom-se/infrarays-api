import { RedisClient } from "redis";
import hasha from "hasha";

import { TokenType } from "types";
import { timeConversion, randomBase62String, randomBase58String, randomWordArray } from "utils";

export class TokenService {
  constructor(private readonly redis: RedisClient) {}

  private async set(key: string, value: string, opts?: { prefix?: string; ex?: number }): Promise<void> {
    if (opts?.prefix) {
      key = `${opts.prefix}:${key}`;
    }

    key = await hasha.async(key, { encoding: "base64" });

    if (opts?.ex) {
      await this.redis.setexAsync(key, opts.ex, value);
    } else {
      await this.redis.setAsync(key, value);
    }
  }

  private async get(key: string, opts?: { prefix?: string; delete?: boolean }): Promise<string | null> {
    if (opts?.prefix) {
      key = `${opts.prefix}:${key}`;
    }

    key = await hasha.async(key, { encoding: "base64" });

    const value = this.redis.getAsync(key);

    if (opts?.delete) {
      await this.del(key);
    }

    return value;
  }

  private async del(key: string, prefix?: string): Promise<void> {
    if (prefix) {
      key = `${prefix}:${key}`;
    }

    key = await hasha.async(key, { encoding: "base64" });

    await this.redis.delAsync(key);
  }

  public async createRefreshToken(userID: string): Promise<string> {
    const value = randomBase62String(256);

    await this.set(value, userID, { prefix: TokenType.Refresh, ex: timeConversion(30, "days", "seconds") });

    return value;
  }

  public async getRefreshToken(token: string): Promise<string | null> {
    return this.get(token, { prefix: TokenType.Refresh });
  }

  public async deleteRefreshToken(token: string): Promise<void> {
    await this.del(token, TokenType.Refresh);
  }

  public async createEmailLoginToken(userID: string): Promise<string> {
    const value = [...randomWordArray(4), randomBase58String(4)].join("-");

    await this.set(value, userID, { prefix: TokenType.EmailLogin, ex: timeConversion(15, "minutes", "seconds") });

    return value;
  }
  public async getEmailLoginToken(token: string): Promise<string | null> {
    return this.get(token, { prefix: TokenType.EmailLogin, delete: true });
  }
}
