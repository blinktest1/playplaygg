/**
 * 20 万月活目标架构：统一配置
 * REDIS_URL 必填时启用 Redis 状态；WEBHOOK_URL 存在时用 Webhook，否则 Polling
 */

import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL ?? '';
const WEBHOOK_URL = process.env.WEBHOOK_URL ?? ''; // 例如 https://yourdomain.com
const PORT = Number(process.env.PORT) || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN ?? '';

/** 是否使用 Redis（未配置 REDIS_URL 时退化为内存，便于本地开发） */
export const useRedis = REDIS_URL.length > 0;

/** 是否使用 Webhook（未配置 WEBHOOK_URL 时使用 Polling） */
export const useWebhook = WEBHOOK_URL.length > 0;

export const config = {
  BOT_TOKEN,
  REDIS_URL: REDIS_URL || 'redis://127.0.0.1:6379',
  WEBHOOK_URL,
  PORT,
  useRedis,
  useWebhook,
} as const;
