/**
 * undercover.ts — 入口 shim
 *
 * 原 993 行已拆分为：
 *   src/games/undercover/handler.ts  — Telegraf 事件注册
 *   src/games/undercover/engine.ts   — 游戏流程
 *   src/games/undercover/messages.ts — 消息/格式化工具
 *
 * 此文件仅做统一 re-export，保持 index.ts 中的 import 路径不变。
 */
export { registerUndercover } from './undercover/handler';
