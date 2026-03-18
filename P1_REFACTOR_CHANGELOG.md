# P1 修复 + 重构 改动摘要（第二轮）

## 版本：1.1.0 → 1.2.0

---

## ✅ P1-2：i18n 幽灵字段清理（完成）

**改动文件：** `src/i18n/types.ts`

- 删除 `wordTest?`、`wordBomb?`、`dice?`、`anonymous?`、`bunker?`、`alias?` 六个可选块
- `types.ts` 从 193 行缩减到 118 行（删除 ~75 行）
- zh / en / ru 三个实现文件原本就没有这些块，无需改动
- **不影响任何运行时行为**

---

## ✅ P1-4：结构化日志（完成）

**新增文件：** `src/logger.ts`

- 运行时尝试 `require('pino')`，pino 可用则用 pino，否则降级为 JSON-over-console（零依赖）
- 统一接口：`logger.info({ chatId, roomId, phase }, 'msg')`
- 提供 `errMsg(err)` 辅助函数提取 unknown catch 值的消息字符串
- `package.json` 新增 `"pino": "^9.0.0"` 依赖
- engine.ts / handler.ts 中所有 `console.error/warn` 替换为结构化 logger

**部署时需要：**
```bash
npm install   # 安装 pino
```

---

## ✅ P1-1：undercover.ts 拆分（完成）

原 `src/games/undercover.ts`（993 行）拆分为：

| 文件 | 职责 | 行数 |
|------|------|------|
| `src/games/undercover/handler.ts` | Telegraf 事件注册（bot.action / bot.start / bot.on）、轮询线程 | ~220 行 |
| `src/games/undercover/engine.ts` | 游戏流程（startUndercoverGame → beginSpeakingRound → runSpeakingTurn → startFreeTalk → startVoting → tallyVotesAndProceed）、phaseDeadline、resolver map | ~280 行 |
| `src/games/undercover/messages.ts` | 纯展示函数（buildGroupReturnLink、sendRoomMessage、formatSpeakingOrder、buildGameOverReport） | ~60 行 |

原 `src/games/undercover.ts` 改为 11 行 shim：
```typescript
export { registerUndercover } from './undercover/handler';
```
`src/index.ts` 的 import 路径**无需改动**。

**重构原则：纯结构调整，零逻辑改动。**

---

## ✅ GameEngine 基类（完成）

**新增文件：** `src/games/core/GameEngine.ts`（~180 行）

提供下一个游戏所需的脚手架：

```typescript
abstract class GameEngine<TRoom extends BaseRoom> {
  abstract gameName: string;
  abstract minPlayers: number;
  abstract maxPlayers: number;

  // 实现以下即可接入完整流程：
  abstract getIntroText(lang, deepLink, seconds): string;
  abstract onGameStart(bot, room): Promise<void>;
  abstract createRoom(chatId): Promise<TRoom | null>;
  abstract getRoom(chatId, roomId): Promise<TRoom | null>;
  abstract saveRoom(room): Promise<void>;
  abstract endRoom(room): Promise<void>;

  // 继承即得：
  async handleJoin(room, user): Promise<'ok' | 'already_joined' | 'room_full'>
  runCountdown(chatId, room): void     // 10s 提醒 + 到期启动游戏
  registerCreateAction(): void         // bot.action('start_<gameName>')
  register(): void                     // 一键注册所有 handler
}
```

---

## 文件变动总览

```
新增：
  src/logger.ts
  src/games/undercover/handler.ts
  src/games/undercover/engine.ts
  src/games/undercover/messages.ts
  src/games/core/GameEngine.ts

修改：
  src/games/undercover.ts     (993 行 → 11 行 shim)
  src/i18n/types.ts           (193 行 → 118 行，删 6 个幽灵块)
  package.json                (version 1.1.0→1.2.0，新增 pino 依赖)
```

---

## 部署步骤

```bash
tar xzf playplaygg-p1-refactor.tar.gz
cd playplaygg
npm install       # 新增 pino 依赖
npm run build
# Railway 自动部署
```

## 测试重点

```
□ 正常游戏全流程（功能无回归）
□ 日志：Railway 控制台应看到 JSON 格式日志
□ 重启恢复：kill 后重启，轮询仍能推进游戏
□ i18n：zh / en / ru 无 TypeScript 报错
```
