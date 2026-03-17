# Spymebot — Telegram 群组游戏机器人

基于 Telegraf + TypeScript，支持谁是卧底、狼人杀、猜词接力、地堡、阿瓦隆、词爆、词测、骰子、匿名信等。

## 快速开始

1. 复制环境变量并填写 Bot Token：
   ```bash
   cp .env.example .env
   # 编辑 .env，填入 BOT_TOKEN
   ```
2. 安装依赖并启动：
   ```bash
   npm install
   npm run build
   npm start
   ```
3. 群组内发送 `/playgg` 打开游戏菜单。

## 20 万月活生产部署

配置 `REDIS_URL` 与 `WEBHOOK_URL` 后即可支撑高并发与多实例（状态持久化、Webhook 接收）。详见 **[docs/SCALABILITY-200K-MAU.md](docs/SCALABILITY-200K-MAU.md)** 中的环境变量说明与**生产上线清单**。

## 脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发模式（ts-node-dev，热重载） |
| `npm run build` | 编译 TypeScript |
| `npm start` | 运行编译后的 `dist/index.js` |

## 技术栈

- [Telegraf](https://telegraf.js.org/)（Telegram Bot API）
- TypeScript
- 可选：Redis（状态与房间配额）、Webhook（生产推荐）
