# v1.3.0 迭代摘要

## 版本：1.2.1 → 1.3.0（含 1.2.2 短期修复 + 中期迭代）

---

# 一、短期稳定性修复（原 1.2.2）

## 🛡️ Telegram 消息限流器

**新增：** `src/rateLimiter.ts`、`src/rateLimiterPatch.ts`

- 令牌桶 25 msg/s 全局 + 50ms per-chat 冷却
- monkey-patch `bot.telegram`，所有 `sendMessage` / `ctx.reply` 自动排队
- 429 自动重试（最多 3 次，指数退避）
- 队列上限 5000，graceful shutdown 时 flush

## 🛡️ createRoom 原子化

**改动：** `src/games/undercover/redisRooms.ts`

- Lua 脚本将 HGETALL → 计算 nextId → HSET 合并为原子 EVAL
- 消除并发创建重复房间的竞态

## 🛡️ 内存 Map 加 LRU 上限

**新增：** `src/lruMap.ts`
**改动：** `src/games/undercover/words.ts`

- `chatGameCounter` 和 `recentWordPairsByChat` 限制 2000 条 LRU

---

# 二、中期迭代

## 🎯 投票改 Inline Button

**改动：** `engine.ts`、`handler.ts`、`types.ts`、`i18n/types.ts`、`index.ts`

### 改了什么

投票从 Reply Keyboard + Emoji 文本匹配，改为 Inline Keyboard Callback。

**之前的问题：**
- Reply Keyboard 对全群可见，多房间并行时互相覆盖
- Emoji 占用池需要全局 acquire/release + Redis SETNX，复杂度高
- 文本投票依赖用户手动发消息，容易被群聊刷掉
- `votingEmojis.ts` 有 200+ 个 emoji、SCAN 同步、TTL 管理等大量代码

**现在：**
- 每个投票目标一个 inline button：`🗳 玩家名`
- callback data：`uc_vote_{chatId}_{roomId}_{targetUserId}`
- 结束游戏也是 inline button：`🛑 结束游戏`
- 点击即投票，`answerCbQuery` 反馈结果，不发群消息
- 支持改投（覆盖式写入 `votes[voterId] = targetId`）
- 不能投自己（新增 `cannotVoteSelf` i18n）

### 删了什么

- `engine.ts`：移除所有 `EMOJI_POOL` / `acquireVotingEmoji` / `releaseVotingEmojis` / `activeVotingEmojis` 相关代码
- `engine.ts`：移除 `currentUndercoverVotingEndGameByChat` Map
- `engine.ts`：移除所有 `remove_keyboard` 标记
- `handler.ts`：删除整个文本投票 `bot.on('text')` handler（emoji 匹配 + "结束游戏" 文本匹配）
- `types.ts`：移除 `votingEmojis?: string[]` 和 `emojiByPlayerId?: Record<number, string>` 字段
- `index.ts`：移除 `isVotingEmoji` 和 `syncVotingEmojisFromRedis` 引用

### 没删什么

- `votingEmojis.ts` 文件保留（未来其他游戏可复用），但 undercover 不再依赖

### 交互流程对比

| 阶段 | 旧 | 新 |
|------|-----|-----|
| 投票面板 | Reply Keyboard，每个玩家一个 emoji | Inline Keyboard，每个玩家一个按钮 |
| 投票方式 | 群里发 emoji 文本 | 点击按钮 |
| 投票反馈 | bot 回复一条消息 | answerCbQuery 弹出提示（不污染群聊） |
| 改投 | 再发一次 emoji | 再点一次按钮（覆盖） |
| 结束游戏 | 发"结束游戏"文本 或 Reply Keyboard 按钮 | 点击 inline "🛑 结束游戏" 按钮 |
| 投票结算 | 结算消息 + remove_keyboard | 结算消息（无需清理键盘） |

---

## 🎯 词库数据化

**新增：** `src/games/undercover/wordStore.ts`
**改动：** `src/games/undercover/words.ts`

### 改了什么

词库从硬编码数组改为 Redis Hash 优先 + 硬编码 fallback。

**数据结构：**
```
Redis Hash: uc:words:{lang}
  field: "可口可乐|百事可乐"
  value: {"difficulty":"easy","tags":["general"]}
```

**`pickWordPair` 改为 async：**
- 先查 Redis `uc:words:{lang}`
- Redis 为空或不可用 → fallback 到 `undercoverWords.ts`
- 调用方 `engine.ts` 已加 `await`

**启动自动 seed：**
- `index.ts` 的 `start()` 中 Redis 连接后调用 `seedAllLanguages()`
- 使用 `HSETNX`（只写入不存在的词对，不覆盖运营修改）
- pipeline 批量写入，高效

**运营 CRUD：**
- `addWordPair(lang, civ, uc, difficulty, tags?)` — 添加/覆盖词对
- `disableWordPair(lang, civ, uc)` — 软删除（标记 disabled）
- `getWordStats(lang)` — 统计总数、各难度分布

### 没改什么

- `undercoverWords.ts` 硬编码文件保留，作为 seed 数据源和非 Redis 环境的 fallback
- 词对选取逻辑（去重、空白局、swap 概率）完全不变
- 渐进难度逻辑不变

---

## 文件变动总览

```
新增：
  src/rateLimiter.ts              (消息限流队列)
  src/rateLimiterPatch.ts         (Telegraf 透明补丁)
  src/lruMap.ts                   (LRU Map)
  src/games/undercover/wordStore.ts (Redis 词库)
  CHANGELOG_v1.3.0.md

修改：
  src/index.ts                    (限流补丁 + 移除 emoji 引用 + seed 词库)
  src/games/undercover/engine.ts  (inline 投票 + 移除 emoji 逻辑 + await pickWordPair)
  src/games/undercover/handler.ts (inline 投票 callback + 删除文本投票)
  src/games/undercover/types.ts   (移除 votingEmojis/emojiByPlayerId)
  src/games/undercover/words.ts   (async pickWordPair + wordStore 集成 + LRU)
  src/games/undercover/redisRooms.ts (createRoom Lua 原子化)
  src/i18n/types.ts               (新增 cannotVoteSelf)
  tsconfig.json                   (新增文件)
  package.json                    (1.2.1 → 1.3.0)
```

## 部署注意

1. **Redis 词库 seed 自动执行**：首次启动会自动将硬编码词库写入 Redis，后续启动跳过已有词对
2. **旧版本 Redis 数据兼容**：旧的 `uc:emoji:*` key 仍可能存在，会自然 TTL 过期（1h），不影响新版
3. **进行中的游戏**：升级时如果有正在投票阶段的游戏，旧的 Reply Keyboard 不会自动消失；这些游戏会在超时后正常结算，下一局开始就是 inline button
4. **i18n 新增字段**：`cannotVoteSelf` 是 optional，未翻译时有硬编码 fallback '不能投自己'

## 测试清单

- [ ] **Inline 投票**：开局 → 投票阶段出现 inline button → 点击投票 → answerCbQuery 提示
- [ ] **不能投自己**：点击自己名字的按钮 → 弹出"不能投自己"提示
- [ ] **改投**：先投 A 再投 B → 结算时算 B 的票
- [ ] **非玩家点击**：不在游戏中的人点击投票按钮 → 弹出"你不在本局游戏中"
- [ ] **结束游戏**：点击 🛑 按钮 → 游戏正常终止
- [ ] **词库 seed**：首次启动后检查 Redis `HLEN uc:words:zh` 应 > 0
- [ ] **Redis 词库优先**：`HSET uc:words:zh "测试词A|测试词B" '{"difficulty":"easy"}'` → 开局可能抽到"测试词A/测试词B"
- [ ] **disableWordPair**：禁用一个词对后不再被抽到
- [ ] **限流器**：高并发开局观察日志，无 429 错误
