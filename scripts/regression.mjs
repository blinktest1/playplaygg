import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve(process.cwd(), 'dist');
if (!fs.existsSync(dist)) {
  console.error('dist/ missing — run npm run build first');
  process.exit(1);
}

const state = await import('../dist/state.js');
const gameGate = await import('../dist/gameGate.js');
const anonSessions = await import('../dist/state/anonSessions.js');
const redisClient = await import('../dist/state/redisClient.js');
const { generateAnonCard, clampAnonMessage } = await import('../dist/games/anonCard.js');
const { getActiveRooms, createRoom, endRoom } = await import('../dist/games/undercover/redisRooms.js');
const { releaseRoom, tryAcquireRoom } = await import('../dist/roomQuota.js');

async function testExclusiveGameGate() {
  const chatId = 771001;

  await state.resetChatState(chatId);
  assert.equal(await gameGate.canStartGame(chatId, 'anonymous'), true);

  await state.replaceChatState({
    chatId,
    currentGame: 'anonymous',
    phase: 'in_game',
    data: { lang: 'en', anonTopic: 'x' },
  });
  assert.equal(await gameGate.canStartGame(chatId, 'anonymous'), false);
  assert.equal(await gameGate.canStartGame(chatId, 'truthordare'), false);
  assert.equal(await gameGate.canStartGame(chatId, 'undercover'), false);

  await state.resetChatState(chatId);
  console.log('✓ exclusive game gate');
}

async function testAnonSessionLifecycle() {
  const userId = 771002;
  await anonSessions.setAnonSession(userId, { chatId: -100200, topic: '💌 Confessions' });
  assert.deepEqual(await anonSessions.getAnonSession(userId), { chatId: -100200, topic: '💌 Confessions' });
  await anonSessions.delAnonSession(userId);
  assert.equal(await anonSessions.getAnonSession(userId), undefined);
  console.log('✓ anon session lifecycle');
}

async function testCardBoundaries() {
  const short = await generateAnonCard('short text', '💌 Confessions');
  const long = await generateAnonCard('long text '.repeat(120), '⚡ Rant');
  assert.ok(long.length > short.length, 'long card should generally be larger than short card');

  const trimmed = clampAnonMessage('x'.repeat(2000));
  assert.ok(trimmed.length < 2000, 'clamp should trim oversized text');
  assert.ok(trimmed.endsWith('…'), 'trimmed text should end with ellipsis');
  console.log('✓ card boundaries');
}

async function testUndercoverRoomLifecycle() {
  const chatId = 771003;
  const acquired = await tryAcquireRoom(chatId, 'undercover');
  assert.equal(acquired, true);
  const room = await createRoom(chatId);
  assert.ok(room, 'room should be created');
  const active = await getActiveRooms(chatId);
  assert.ok(active.length >= 1, 'should have active room');
  await endRoom(room);
  await releaseRoom(chatId, 'undercover');
  console.log('✓ undercover room lifecycle');
}

async function main() {
  try {
    await redisClient.connectRedis().catch(() => {});
    await testExclusiveGameGate();
    await testAnonSessionLifecycle();
    await testCardBoundaries();
    await testUndercoverRoomLifecycle();
    console.log('REGRESSION_OK');
  } finally {
    await redisClient.closeRedis().catch(() => {});
  }
}

main().catch((err) => {
  console.error('REGRESSION_FAIL', err);
  process.exit(1);
});
