# P1 Bugfix 补丁摘要

## 版本：1.2.0 → 1.2.1

---

## 🐛 BUG 1：Redis 模式下 room 对象陈旧突变（高危）

**改动文件：** `src/games/undercover/engine.ts`

- `runSpeakingTurn`: `waitWithSkip` 之后重新 `getRoom` 得到 `freshRoom`，后续突变和 `saveRoom` 都使用 `freshRoom`，避免旧快照覆盖中间投票数据
- `startFreeTalk → startVoting` 衔接处：同样用 `freshRoom` 传入 `startVoting`
- **影响：Redis 模式下，发言阶段结束后投票数据可能被旧快照覆盖，导致投票丢失**

## 🐛 BUG 2：GameEngine 基类硬编码 undercover 文案

**改动文件：** `src/games/core/GameEngine.ts`

- 新增两个抽象方法：`getCountdownWarningText(lang)` 和 `getStartCancelledText(lang, current, min)`
- `runCountdown` 中原先直接引用 `t.undercover.countdown10s` 和 `t.undercover.startCancelledWithCount` 替换为调用抽象方法
- 继承 GameEngine 的新游戏不再被迫发送"谁是卧底"文案

## ⚠️ WARN 1：logger.ts 加入 tsconfig include

**改动文件：** `tsconfig.json`

- 显式添加 `"src/logger.ts"` 到 include 列表

## ⚠️ WARN 2：index.ts 全量迁移至结构化日志

**改动文件：** `src/index.ts`

- 新增 `import { logger } from './logger'`
- 全部 15 处 `console.error` / `console.log` 替换为 `logger.error` / `logger.info` / `logger.warn`
- 附带清理：`src/state/redisClient.ts`、`src/games/votingEmojis.ts` 中残留的 console 也一并迁移

## ⚠️ WARN 3：BaseRoom 接口统一

**改动文件：** `src/games/core/RoomRepository.ts`、`GameEngine.ts`、`InMemoryRoomManager.ts`

- `BaseRoom` 和 `BasePlayer` 的唯一定义移入 `RoomRepository.ts`
- `GameEngine.ts` 和 `InMemoryRoomManager.ts` 改为从 `RoomRepository` 导入
- 删除三份重复定义（原 GameEngine 的 BaseRoom/BasePlayer、InMemoryRoomManager 的 BaseRoom、RoomRepository 的 BaseRoomData）

## ℹ️ INFO 1：删除死代码 rooms.ts

- 删除 `src/games/undercover/rooms.ts`（内存版房间管理）
- 该文件无任何 import 引用，所有调用走 `redisRooms.ts`（内含内存 fallback）

## ℹ️ INFO 3：suggestDifficulty 渐进难度修复

**改动文件：** `src/games/undercover/words.ts`、`engine.ts`

- 新增 `chatGameCounter` Map 和 `incrementChatGameCount(chatId)` 函数，按群维度统计已完成的游戏场次
- `startUndercoverGame` 中改为 `suggestDifficulty(incrementChatGameCount(chatId))`
- 第 1 局 easy → 第 2-3 局 medium → 第 4 局起 hard，跨游戏生效

---

## 文件变动总览

```
修改：
  src/games/undercover/engine.ts    (stale room fix + difficulty fix)
  src/games/undercover/words.ts     (chatGameCounter + suggestDifficulty 签名)
  src/games/core/GameEngine.ts      (抽象方法 + import from RoomRepository)
  src/games/core/InMemoryRoomManager.ts (import from RoomRepository)
  src/games/core/RoomRepository.ts  (统一 BaseRoom/BasePlayer)
  src/games/votingEmojis.ts         (console → logger)
  src/state/redisClient.ts          (console → logger)
  src/index.ts                      (console → logger)
  tsconfig.json                     (添加 logger.ts)
  package.json                      (version 1.2.0→1.2.1)

删除：
  src/games/undercover/rooms.ts     (死代码)

新增：
  P1_BUGFIX_CHANGELOG.md
```
