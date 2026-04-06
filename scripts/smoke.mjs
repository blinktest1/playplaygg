import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const dist = path.resolve(process.cwd(), 'dist');
if (!fs.existsSync(dist)) {
  console.error('dist/ missing — run npm run build first');
  process.exit(1);
}

const { clampAnonMessage, generateAnonCard } = await import('../dist/games/anonCard.js');
const state = await import('../dist/state.js');
const anonSessions = await import('../dist/state/anonSessions.js');
const redisClient = await import('../dist/state/redisClient.js');
const gameGate = await import('../dist/gameGate.js');

async function testAnonClampAndCard() {
  const input = 'a'.repeat(900);
  const trimmed = clampAnonMessage(input);
  assert.ok(trimmed.length < input.length, 'anonymous text should be trimmed');

  const shortPng = await generateAnonCard('这是一条匿名消息测试，应该被渲染到图片内部，而不是作为 caption。', '💌 表白墙');
  assert.ok(Buffer.isBuffer(shortPng), 'generated card should be a Buffer');
  assert.ok(shortPng.length > 10000, 'generated card should look non-trivial');

  const longText = '这是更长一点的匿名消息。'.repeat(30);
  const longPng = await generateAnonCard(longText, '🌙 暗恋 / 心事');
  assert.ok(longPng.length > shortPng.length, 'longer content should usually generate a larger image payload');
  console.log('✓ anon card generation');
}

async function testReplaceChatState() {
  const chatId = 991234321;
  await state.replaceChatState({
    chatId,
    currentGame: 'anonymous',
    phase: 'in_game',
    data: { lang: 'en', anonTopic: 'x', stale: true },
  });

  await state.replaceChatState({
    chatId,
    currentGame: 'anonymous',
    phase: 'in_game',
    data: { lang: 'en', anonTopic: 'fresh' },
  });

  const got = await state.getOrCreateChatState(chatId);
  assert.equal(got.data.anonTopic, 'fresh');
  assert.equal(Object.prototype.hasOwnProperty.call(got.data, 'stale'), false, 'replaceChatState should drop stale keys');
  await state.resetChatState(chatId);
  console.log('✓ replaceChatState resets stale data');
}

async function testAnonSessionPersistence() {
  const userId = 987654321;
  await anonSessions.setAnonSession(userId, { chatId: -100123, topic: '💌 Confessions' });
  const got = await anonSessions.getAnonSession(userId);
  assert.deepEqual(got, { chatId: -100123, topic: '💌 Confessions' });
  await anonSessions.delAnonSession(userId);
  const missing = await anonSessions.getAnonSession(userId);
  assert.equal(missing, undefined);
  console.log('✓ anon DM session persistence');
}

async function testGameGate() {
  const chatId = 991234322;
  await state.replaceChatState({
    chatId,
    currentGame: 'anonymous',
    phase: 'in_game',
    data: { lang: 'en', anonTopic: 'x' },
  });
  assert.equal(await gameGate.getRunningGame(chatId), 'anonymous');
  assert.equal(await gameGate.canStartGame(chatId, 'truthordare'), false);
  assert.equal(await gameGate.canStartGame(chatId, 'anonymous'), false);
  await state.resetChatState(chatId);
  console.log('✓ game gate blocks overlapping games');
}

async function main() {
  try {
    await redisClient.connectRedis().catch(() => {});
    await testAnonClampAndCard();
    await testReplaceChatState();
    await testAnonSessionPersistence();
    await testGameGate();
    console.log('SMOKE_OK');
  } finally {
    await redisClient.closeRedis().catch(() => {});
  }
}

main().catch((err) => {
  console.error('SMOKE_FAIL', err);
  process.exit(1);
});
