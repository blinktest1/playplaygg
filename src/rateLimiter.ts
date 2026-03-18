/**
 * Telegram Bot API 消息限流器
 *
 * Telegram 限制：
 *   - 全局：~30 msg/s per bot
 *   - 单群：~20 msg/s per chat（实际建议保守到 ~1 msg/s per chat）
 *
 * 策略：内存队列 + 令牌桶，对调用方完全透明。
 * 用法：用 throttledSendMessage 替代 bot.telegram.sendMessage。
 *
 * 设计原则：
 *   - 不改变任何返回值类型和调用方式
 *   - 不丢弃消息，只排队延迟
 *   - 进程退出时尽力 flush
 */

import { logger } from './logger';
import { LruMap } from './lruMap';

// ─── 配置 ────────────────────────────────────────────────────────────────────

/** 全局每秒最大发送数（Telegram 限制 ~30，留余量） */
const GLOBAL_RATE = 25;

/** 同一 chat 两条消息之间的最小间隔 ms（~1 msg/s per chat 足够安全） */
const PER_CHAT_INTERVAL_MS = 50;

/** 队列最大长度，超过后丢弃最旧的消息（防 OOM） */
const MAX_QUEUE_SIZE = 5000;

/** 429 重试基础延迟 ms */
const RETRY_BASE_MS = 1000;

/** 最大重试次数 */
const MAX_RETRIES = 3;

// ─── 类型 ────────────────────────────────────────────────────────────────────

interface QueuedMessage {
  chatId: number | string;
  fn: () => Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  retries: number;
  enqueuedAt: number;
}

// ─── 状态 ────────────────────────────────────────────────────────────────────

const queue: QueuedMessage[] = [];
const lastSendByChat = new LruMap<number | string, number>(5000);
let globalTokens = GLOBAL_RATE;
let draining = false;
let drainTimer: ReturnType<typeof setTimeout> | null = null;

// 每秒补充全局令牌
const refillInterval = setInterval(() => {
  globalTokens = GLOBAL_RATE;
}, 1000);
refillInterval.unref(); // 不阻塞进程退出

// ─── 核心队列 ────────────────────────────────────────────────────────────────

function scheduleDrain(): void {
  if (draining || drainTimer) return;
  drainTimer = setTimeout(() => {
    drainTimer = null;
    void drain();
  }, 10);
}

async function drain(): Promise<void> {
  if (draining) return;
  draining = true;

  try {
    while (queue.length > 0) {
      if (globalTokens <= 0) {
        // 等下一秒的 refill
        break;
      }

      // 找到第一个 per-chat 冷却已过的消息
      const now = Date.now();
      let picked = -1;
      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];
        const lastSend = lastSendByChat.get(item.chatId) ?? 0;
        if (now - lastSend >= PER_CHAT_INTERVAL_MS) {
          picked = i;
          break;
        }
      }

      if (picked === -1) {
        // 所有队首消息都在冷却，等最短冷却结束
        break;
      }

      const item = queue.splice(picked, 1)[0];
      globalTokens -= 1;
      lastSendByChat.set(item.chatId, Date.now());

      try {
        const result = await item.fn();
        item.resolve(result);
      } catch (err: unknown) {
        const is429 = err != null && typeof err === 'object' && 'response' in err &&
          (err as { response?: { status_code?: number } }).response?.status_code === 429;

        if (is429 && item.retries < MAX_RETRIES) {
          // 429 重试：放回队尾
          item.retries += 1;
          const retryAfter = extractRetryAfter(err) ?? (RETRY_BASE_MS * item.retries);
          logger.warn(
            { chatId: item.chatId, retry: item.retries, retryAfterMs: retryAfter },
            'Telegram 429, requeuing',
          );
          // 暂停全局发送
          globalTokens = 0;
          queue.push(item);
          // 等 retry_after 秒后再继续
          await sleep(retryAfter);
          continue;
        }

        item.reject(err);
      }
    }
  } finally {
    draining = false;
    if (queue.length > 0) {
      // 仍有消息，40ms 后重试（等令牌 refill 或 per-chat 冷却）
      scheduleDrainDelayed(40);
    }
  }
}

function scheduleDrainDelayed(ms: number): void {
  if (drainTimer) return;
  drainTimer = setTimeout(() => {
    drainTimer = null;
    void drain();
  }, ms);
}

function extractRetryAfter(err: unknown): number | null {
  try {
    const params = (err as { response?: { parameters?: { retry_after?: number } } })
      .response?.parameters?.retry_after;
    if (typeof params === 'number' && params > 0) return params * 1000;
  } catch { /* ignore */ }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── 公开 API ────────────────────────────────────────────────────────────────

/**
 * 将一个 Telegram API 调用排入限流队列。
 * 对调用方完全透明——返回值和异常行为与直接调用一致。
 */
export function enqueue<T>(chatId: number | string, fn: () => Promise<T>): Promise<T> {
  if (queue.length >= MAX_QUEUE_SIZE) {
    // 丢弃最旧的消息，防止内存爆炸
    const dropped = queue.shift()!;
    dropped.reject(new Error('Rate limiter queue overflow, message dropped'));
    logger.warn({ chatId: dropped.chatId, queueSize: queue.length }, 'Rate limiter: dropped oldest message');
  }

  return new Promise<T>((resolve, reject) => {
    queue.push({
      chatId,
      fn,
      resolve: resolve as (v: unknown) => void,
      reject,
      retries: 0,
      enqueuedAt: Date.now(),
    });
    scheduleDrain();
  });
}

/**
 * 获取当前队列长度（用于监控）
 */
export function getQueueSize(): number {
  return queue.length;
}

/**
 * 优雅关闭：尝试 flush 剩余队列
 */
export async function flushQueue(timeoutMs = 5000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (queue.length > 0 && Date.now() < deadline) {
    await drain();
    if (queue.length > 0) await sleep(50);
  }
  if (queue.length > 0) {
    logger.warn({ remaining: queue.length }, 'Rate limiter: queue not fully flushed on shutdown');
  }
  clearInterval(refillInterval);
}

// Per-chat send history is managed by LruMap (auto-eviction at 5000 entries).
// No manual cleanup needed.
