/**
 * Redis 单例，供 state store 与 room store 使用
 */

import Redis from 'ioredis';
import { config } from '../config';
import { logger, errMsg } from '../logger';

let client: Redis | null = null;

export function getRedis(): Redis | null {
  if (!config.useRedis) return null;
  if (client) return client;
  client = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times: number) {
      const delay = Math.min(times * 100, 3000);
      return delay;
    },
    lazyConnect: true,
  });
  client.on('error', (err: unknown) => {
    logger.error({ err: errMsg(err) }, 'Redis error');
  });
  return client;
}

export async function connectRedis(): Promise<Redis | null> {
  const redis = getRedis();
  if (redis) await redis.connect().catch((e: unknown) => logger.error({ err: errMsg(e) }, 'Redis connect failed'));
  return redis;
}

export async function closeRedis(): Promise<void> {
  if (client) {
    await client.quit();
    client = null;
  }
}
