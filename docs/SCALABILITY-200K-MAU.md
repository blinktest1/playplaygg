# 20 万月活 (MAU) 架构评估与实现

## 已实现的目标架构（2025）

| 维度 | 实现 | 说明 |
|------|------|------|
| **接收更新** | **Webhook 可选** | 设置 `WEBHOOK_URL` 时使用 Webhook + HTTP 服务（含 `/health`）；未设置时退化为 Polling |
| **状态存储** | **Redis 可选** | 设置 `REDIS_URL` 时：聊天状态、用户/群语言、房间配额写入 Redis（TTL 7–30 天）；未设置时使用内存 |
| **房间配额** | **Redis 可选** | `roomQuota` 的 tryAcquireRoom / releaseRoom / getChatRoomUsage 支持 Redis |
| **计时器** | 进程内 | 仍使用 `setChatTimeout`（内存），多实例需按 chat 粘性路由 |

结论：**配置 REDIS_URL + WEBHOOK_URL 后，可支撑 20 万月活**（状态持久、可多实例 + 粘性路由）。游戏房间数据仍为进程内 Map，重启会丢进行中对局；后续可再迁房间到 Redis。

### 环境变量与启动

| 变量 | 必填 | 说明 |
|------|------|------|
| `BOT_TOKEN` | 是 | Telegram Bot Token |
| `REDIS_URL` | 否 | 配置后启用 Redis（状态、房间配额）；不配置则使用内存 |
| `WEBHOOK_URL` | 否 | 例如 `https://yourdomain.com`，配置后使用 Webhook；不配置则 Polling |
| `PORT` | 否 | Webhook 时 HTTP 服务端口，默认 3000 |

- **本地/开发**：只设 `BOT_TOKEN`，不设 REDIS_URL/WEBHOOK_URL → 内存 + Polling。
- **生产 20 万目标**：设 `BOT_TOKEN`、`REDIS_URL`、`WEBHOOK_URL`，前置 Nginx/Caddy 做 HTTPS 并反代到 `http://localhost:PORT`，健康检查用 `GET /health`。

### 生产上线清单（20 万月活）

1. **环境变量**（参考项目根目录 `.env.example`）
   - `BOT_TOKEN`：必填，从 @BotFather 获取。
   - `REDIS_URL`：生产必填，如 `redis://localhost:6379` 或云 Redis 连接串。
   - `WEBHOOK_URL`：生产必填，公网 HTTPS 地址（不含路径），如 `https://yourdomain.com`。
   - `PORT`：可选，默认 3000；需与反向代理一致。

2. **反向代理（HTTPS）**
   - 使用 Nginx/Caddy 等将 `https://yourdomain.com/webhook` 反代到 `http://127.0.0.1:PORT/webhook`。
   - Telegram 只接受 HTTPS，且需公网可访问。

3. **健康检查**
   - Webhook 模式下：`GET https://yourdomain.com/health` 返回 200 即正常。
   - 用于负载均衡或 PaaS 存活探测。

4. **多实例（可选）**
   - 状态与配额已在 Redis，可起多进程/多机；同一群组（chat）的请求需**粘性路由**到同一实例（因计时器在进程内），或保持单实例扩容垂直。

5. **启动**
   - `npm run build && npm start`（或 `node dist/index.js`）；确保先有 Redis 可连、再设好 Webhook。

---

## 20 万 MAU 粗算

- 月活 20 万 → 日活约 5k–15k（依留存假设）
- 每人每天若干次交互 → 日均约 **几万次 update**，峰值约 **数 updates/秒～数十 updates/秒**
- Telegram Bot API：同一 bot 向同一 chat 约 **30 条消息/秒**；`getUpdates` 每次最多约 **100 条**，轮询间隔通常 1–2 秒
- 瓶颈更可能来自：**单进程事件循环、内存状态膨胀、重启/扩容时状态丢失**，而不是单纯“每秒几条 update”

---

## 必须/强烈建议的改造

### 1. 用 Webhook 替代 Polling

- **原因**：高并发时由 Telegram 主动推送，延迟更低、单机吞吐更好，且便于在前置层做负载均衡。
- **做法**：使用 `bot.webhookCallback()` 或 Telegraf 的 webhook 模式，并配置 HTTPS 公网 URL（如 Nginx/Caddy 反代 + Node）。

### 2. 状态外置（至少语言 + 会话）

- **原因**：内存 Map 无法多实例共享，重启全丢；20 万 MAU 下 `userLanguage`、`chatStates` 等会持续增长。
- **做法**：
  - **Redis**：存 `userLanguage`、`chatLanguage`、可选会话标记；TTL 或按需淘汰不活跃用户。
  - **持久化**：若需“重启不丢”或审计，可为关键状态加 DB（如 PostgreSQL/MySQL），或 Redis + 定期/关键操作落库。

### 3. 游戏房间与计时器

- **现状**：各游戏用进程内 `Map` 存房间，`state.ts` 用 `setTimeout` 做倒计时。
- **问题**：多实例下房间状态不一致；进程重启房间与定时任务全丢。
- **建议**：
  - 短期：保持单实例 + Webhook + Redis 存“谁在哪个房间/语言”等轻量状态，至少先解决“多实例共享”和“重启可恢复语言”等。
  - 中期：房间与回合状态迁到 Redis（或 DB），定时任务用 Redis 过期/队列或独立 worker 触发，便于多实例或单实例重启后恢复。

### 4. 可扩展性与运维

- **单点**：目前单进程，故障即全挂。建议至少：
  - 进程守护（systemd / PM2）与健康检查；
  - 日志与监控（请求量、延迟、错误率、内存）。
- **多实例**：在状态外置（Redis/DB）后，可通过多实例 + 负载均衡（同一 webhook URL 或通过队列消费）扩展；需保证同一 chat 的 update 要么路由到同一实例，要么房间/状态在 Redis 中串行化，避免竞态。

---

## 可选优化（按需）

- **限流与降级**：对 callback_query / 命令做按 chat 或按 user 限流，防止单群/单用户刷爆。
- **消息队列**：若 update 峰值很高，可先入队列（如 Redis 或 RabbitMQ），再由 worker 消费并调 Telegraf 逻辑，便于削峰与多 worker。
- **只读从库 / 缓存**：若后续用 DB 存用户/群元数据，可加缓存或只读从库减轻 DB 压力。

---

## 实施优先级建议

1. **P0**：改为 **Webhook**，并加 **Redis** 存用户/群语言（及必要会话状态），替换当前内存 `userLanguage` / `getChatLanguage` 等，保证“重启不丢语言、为多实例做准备”。
2. **P1**：**房间与定时器** 迁到 Redis（或 DB + worker），避免重启丢房间、并为多实例或定时任务解耦。
3. **P2**：多实例部署、监控与限流、必要时引入队列。

按上述分步做，当前 bot 才有机会**可靠承受 20 万月活**；仅保持现状则更适合小规模或内部使用。
