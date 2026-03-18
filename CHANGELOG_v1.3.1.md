# v1.3.1 — 代码质量优化

## 版本：1.3.0 → 1.3.1

---

## 🐛 Bug Fix：投票并发 race condition

**文件：** `redisRooms.ts`、`handler.ts`

**问题：** 投票阶段使用 read-modify-write 模式（`getRoom → 改 votes → saveRoom`），两人几乎同时投票时后写覆盖前写，导致丢票。

**修复：** 新增 `castVote()` 函数，Redis 模式下使用 Lua 脚本原子写入 `state.votes`，无需整个 room JSON 的 read-modify-write。内存模式下直接写入（单线程安全）。

**影响：** `handler.ts` 的 `uc_vote` 回调不再调用 `saveRoom`，改为调用 `castVote`；`tallyVotesAndProceed` 开头增加 `getRoom` 重新读取最新投票数据。

---

## 🛡️ Timer 泄漏防护

**文件：** `engine.ts`

**问题：** 游戏异常结束或 `endRoom` 时，关联的 `setTimeout` 可能未被清理，导致过期回调在已结束的房间上执行。

**修复：** 新增 `cleanupRoomTimers(chatId, roomId)` 函数，清理该房间所有已知 timer suffix + pending resolver。所有 `endRoom` 调用统一通过 `endGameCleanup()` 包装，确保先清 timer 再关房间。

---

## 🔄 代码去重：scheduleNextRound

**文件：** `engine.ts`

**问题：** `tallyVotesAndProceed` 中「平票→下一轮」和「正常淘汰→下一轮」两段代码几乎一模一样。

**修复：** 提取 `scheduleNextRound(bot, room)` 函数，统一处理 `roundNumber++`、`phaseDeadline` 写入、倒计时消息、`setChatTimeout`。

---

## 🌐 i18n：消除硬编码中文

**文件：** `engine.ts`、`types.ts`、`zh.ts`、`en.ts`、`ru.ts`

**问题：**
- 私聊发词的「返回群组」链接文案硬编码中文
- `buildGameOverReport` 的 winnerLabel（"平民阵营"/"卧底阵营"）和 subtitle（"卧底无处遁形！"）硬编码中文

**修复：** 新增 i18n key：
- `returnToGroup`：私聊「返回群组」链接文案
- `civiliansLabel` / `undercoverLabel`：胜负报告阵营名
- `civiliansWinSubtitle` / `undercoverWinSubtitle`：胜负报告副标题
- `btnPlayAgain`：再来一局按钮

所有新 key 为 optional，有中文 fallback，不影响未翻译的语言。

---

## 🔄 「再来一局」按钮

**文件：** `engine.ts`

**问题：** 游戏结束后只有导流按钮，没有快速重开入口。

**修复：** 游戏结束消息新增 `🔄 再来一局` inline button（callback: `start_undercover`），放在导流按钮上方。

---

## 🛡️ rateLimiter：lastSendByChat 换 LruMap

**文件：** `rateLimiter.ts`

**问题：** `lastSendByChat` 用普通 Map + 5分钟定时清理。清理间隔内大量不同 chat 发消息时会无限增长。

**修复：** 替换为 `LruMap<number | string, number>(5000)`，自动淘汰最久未用的 chat 记录。移除手动 cleanup interval。

---

## 🎮 Easy 难度禁用空白局

**文件：** `words.ts`

**问题：** 新手第一局就可能碰到空白局（15% 概率），规则都没搞清楚就遇到特殊局，体验差。

**修复：** `pickWordPair` 在 `difficulty === 'easy'` 时跳过空白概率逻辑，只在 medium/hard 局开启。

---

## 🔧 类型清理

**文件：** `engine.ts`

- 移除所有 timer key 的 `as any` 强转（`TimerKey` 已是 `string`，无需 cast）

---

## 文件变动总览

```
修改：
  src/games/undercover/engine.ts      (scheduleNextRound + cleanupRoomTimers + i18n + 再来一局)
  src/games/undercover/handler.ts     (castVote 替代 read-modify-write)
  src/games/undercover/redisRooms.ts  (新增 LUA_CAST_VOTE + castVote 函数)
  src/games/undercover/words.ts       (easy 难度禁用空白局)
  src/rateLimiter.ts                  (LruMap 替代 Map + 移除手动 cleanup)
  src/i18n/types.ts                   (新增 7 个 optional key)
  src/i18n/zh.ts                      (新增翻译)
  src/i18n/en.ts                      (新增翻译)
  src/i18n/ru.ts                      (新增翻译)
  package.json                        (1.3.0 → 1.3.1)
  CHANGELOG_v1.3.1.md                 (本文件)
```

## 部署注意

1. **无破坏性变更**：所有新 i18n key 为 optional + fallback，不影响现有部署
2. **Redis Lua 脚本**：`castVote` 使用 `cjson.encode/decode`（Redis 内置），无额外依赖
3. **进行中的游戏**：升级后正在投票的游戏会使用新的原子投票路径，无兼容问题

## 测试清单

- [ ] **并发投票**：两人同时点击投票按钮 → 结算时两票都在
- [ ] **再来一局**：游戏结束 → 点击「🔄 再来一局」→ 正常进入下一局报名
- [ ] **i18n 英文**：切换英文 → 游戏结束报告显示 "Civilians" / "Spies"，非中文
- [ ] **i18n 俄文**：切换俄文 → 游戏结束报告显示 "Мирные" / "Шпионы"
- [ ] **Easy 无空白**：首局（easy 难度）→ 连续 20 局不应出现空白词
- [ ] **Timer 清理**：游戏强制结束 → 无后续 stale 消息
