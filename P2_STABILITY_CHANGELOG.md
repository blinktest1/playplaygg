# 短期稳定性补丁摘要

## 版本：1.2.1 → 1.2.2

---

## 🛡️ FIX 1：Telegram 消息限流器（防 429 封禁）

**新增文件：** `src/rateLimiter.ts`、`src/rateLimiterPatch.ts`

- 实现内存队列 + 令牌桶限流，全局上限 25 msg/s，同一 chat 两条消息间隔 ≥50ms
- 通过 monkey-patch `bot.telegram` 实现零侵入接入：所有 `sendMessage`、`editMessageText`、`ctx.reply` 等调用自动走队列
- 429 Too Many Requests 自动重试（最多 3 次，指数退避），重试期间暂停全局发送
- 队列上限 5000 条，超出时淘汰最旧消息防 OOM
- `answerCallbackQuery` 不走限流（有 10s 超时约束，且不消耗消息配额）
- graceful shutdown 时尝试 flush 队列（最多 3s）
- `lastSendByChat` Map 每 5 分钟自动清理 10 分钟无活跃的 chatId

**影响：高并发场景下不再触发 Telegram 限流，消息不丢失只延迟**

**集成点：**
- `src/index.ts`：bot 创建后立即 `patchBotWithRateLimiter(bot)`
- `src/index.ts`：`gracefulShutdown` 中新增 `flushQueue(3000)`

---

## 🛡️ FIX 2：createRoom 原子化（防并发重复房间）

**改动文件：** `src/games/undercover/redisRooms.ts`

- `createRoom` 改用 Lua 脚本实现：HGETALL + 计算 nextId + HSET 在 Redis 单次 EVAL 中原子执行
- 消除原先 read-compute-write 之间的竞态窗口
- Lua 内通过 `string.find(raw, '"active":true')` 快速判断活跃房间，无需完整反序列化
- 模板 JSON 使用 `"roomId":0` 占位符，Lua 内 `string.gsub` 替换为实际 ID
- 内存模式（非 Redis）不受影响，走原 `InMemoryRoomManager`

**影响：同一群两人同时点击「开始游戏」不再可能创建出相同 roomId 的重复房间**

---

## 🛡️ FIX 3：内存 Map 加 LRU 上限（防 OOM）

**新增文件：** `src/lruMap.ts`
**改动文件：** `src/games/undercover/words.ts`

- 新增 `LruMap<K, V>` 工具类：基于 ES6 Map 插入顺序实现 LRU 淘汰
- `chatGameCounter`（难度渐进计数）和 `recentWordPairsByChat`（词对去重历史）
  从 `Map` 替换为 `LruMap`，上限 2000 个 chat
- 超过上限时自动淘汰最久未访问的 chat 数据
- API 与 Map 兼容（get/set），业务代码零改动

**影响：长期运行后进程内存可控，不再随活跃群数量无限增长**

---

## 文件变动总览

```
新增：
  src/rateLimiter.ts         (消息限流队列核心)
  src/rateLimiterPatch.ts    (Telegraf bot.telegram 透明补丁)
  src/lruMap.ts              (轻量 LRU Map)
  P2_STABILITY_CHANGELOG.md

修改：
  src/index.ts               (import + patchBot + flushQueue)
  src/games/undercover/redisRooms.ts  (createRoom → Lua 原子操作)
  src/games/undercover/words.ts       (Map → LruMap)
  tsconfig.json              (新增 3 个文件到 include)
  package.json               (version 1.2.1 → 1.2.2)
```

## 验证要点

1. **限流器**：多群同时开局，观察日志中是否出现 `Telegram 429, requeuing`；正常情况下不应触发
2. **createRoom 原子化**：同一群快速连点两次「开始谁是卧底」，应只创建一个房间
3. **LRU 上限**：长时间运行后 `process.memoryUsage().heapUsed` 应趋于稳定
4. **交互流程不变**：报名 → 发言 → 讨论 → 投票 → 淘汰 → 胜负判定，所有环节行为与 1.2.1 一致
