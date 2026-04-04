import type { I18nTexts } from './types';

export const zhTexts: I18nTexts = {
  i18n: {
    chooseLanguage: '请选择语言',
    back: '🔙 返回',
  },
  mainMenu: {
    welcome: '🎮 Spy Me — 选个游戏开玩！',
    btnUndercover: '谁是卧底',
    btnCancel: '取消',
    cancelAnswer: '好的，后台待命。发送 /play 开始游戏！',
    usePlayggForLatestMenu: '旧版菜单，请发送 /play。',
    privatePlayggHint: '🎮 请将我拉入群组，在群内发送 /play 开始游戏！',
    groupUsePlaygg: '👉 群里请用 /play 唤出菜单。',
    btnTruthOrDare: '🎯 真心话大冒险',
    btnAddToGroup: '➕ 拉进群聊',
    btnLanguage: '🌐 语言',
    helpText:
      '🎮 <b>Spy Me — 玩法说明</b>\n\n' +
      '🕵️ <b>谁是卧底</b>\n' +
      '每人领一个词，卧底的词略有不同。描述你的词，找出说谎者，投票淘汰！\n' +
      '👥 5–12 人\n\n' +
      '🎯 <b>真心话大冒险</b>\n' +
      '选个模式，轮流选真心话或大冒险。怂了可以跳过 🐔\n' +
      '👥 2–20 人\n\n' +
      '📝 <b>匿名大字报</b>\n' +
      '在群里匿名发言，说出你的真实想法 👀\n\n' +
      '➡️ 在群里发 /play 开始！',
  },
  errors: {
    generic: '⚠️ 出现错误，请稍后再试。',
  },
  common: {
    onlyGroups: '这个游戏只能在群里玩。',
    btnStartGame: '▶ 开始游戏',
    roomFull: (used: number, max: number) => `房间已满：${used}/${max}，请稍后再试。`,
    roomClosedOrNotFound: '房间已关闭或不存在。',
    linkExpiredGameStarted: '游戏已开始，链接失效。',
    roomLabel: (roomId: number) => `🎪 ${roomId}号房`,
  },
  groupWelcome: {
    title: '🎮 欢迎加入 Spy Me!',
    intro: '玩谁是卧底等群游戏。发送 /play 开始！',
    separator: '—————————————',
    partners: '合作伙伴：Blink — 更多社交与游戏！',
  },
  growth: {
    ctaText: '试试 Blink：更多社交与游戏！',
    ctaButton: '打开 Blink',
  },
  intro: {
    undercover:
      '🕵️ 谁是卧底\n' +
      '心跳加速的逻辑博弈，谁在说谎？\n' +
      '👥 5–12 人\n' +
      '🕹 流程：\n' +
      '  1. 点链接私聊 Bot 领词。卧底的词略有不同 🤫\n' +
      '  2. 轮流描述，每人 40 秒，别说出原词！\n' +
      '  3. 120 秒自由讨论，抓漏洞！\n' +
      '  4. Emoji 投票 20 秒，投出嫌疑人。\n' +
      '❌ 无人投票则自动结束！\n' +
      '🎭 配置：5–6人→1卧底 | 7–9→2 | 10–12→3\n' +
      '🟢 平民胜：揪出所有卧底\n' +
      '🔴 卧底胜：卧底 ≥ 平民',
  },
  undercover: {
    joinSuccess: '已加入，等待开始。',
    joinSuccessWithReturnLink: (groupLink: string) =>
      `已加入，等待开始。\n返回群组 👉 <a href="${groupLink}">点击返回</a>`,
    countdown10s: '⏱ 10 秒后关闭报名',
    gameStartCivilian: (word: string) => `游戏开始！你的词：${word}`,
    blankWord: '(无词)',
    blankCivilianMessage: '游戏开始！本局你没有词（白板）。',
    speakingOrder: (order: string) => `发言顺序：\n${order}`,
    speakingOrderSuffix: ' > 45秒讨论 > 投票',
    nowSpeaking: (name: string) => `当前发言：📍 @${name}`,
    speakButtonHint: '👇 非本人不要点❗️',
    btnEndSpeak: '结束发言',
    btnEndRound: '结束回合',
    btnEndGame: '🛑 结束游戏',
    freeTalk: '🗣 自由讨论！',
    votePrompt: '投票选出嫌疑人：',
    eliminated: (name: string) => `💀 ${name} 被淘汰！`,
    civiliansWin: '🏆 平民胜利！所有卧底已被淘汰。',
    undercoverWins: '🏆 卧底胜利！卧底 ≥ 平民。',
    nextRound: '下一轮',
    joinStartText: (link: string, min: number, max: number, seconds: number) =>
      `🎭 谁是卧底开始报名！\n点击加入：\n${link}\n\n${min}–${max}人，${seconds}秒倒计时。`,
    linkExpiredGameStarted: '游戏已开始，链接失效。',
    linkExpiredRoomFull: (max: number) => `房间已满（最多${max}人），链接失效。`,
    startCancelled: '人数不足，快邀请朋友！',
    startCancelledWithCount: (current: number, required: number) =>
      `人数不足（${current}/${required}），快邀请朋友！`,
    startFailed: '启动异常，请重试。',
    startFailedNoRights: '启动失败：请确保 Bot 有发言权限。',
    startAnnounce: (count: number) => `谁是卧底开始！${count}人。`,
    voteDone: (name: string) => `投票给了 ${name}`,
    votingEnded: '投票结束。',
    notInThisGame: '你不在本局游戏中。',
    noVotesRetry: '无人投票，本局结束。',
    tieNoElimination: (maxVotes: number) => `⚖️ 平票（${maxVotes}票）！无人淘汰，继续。`,
    nextRoundIn5s: '⏱ 5秒后下一轮。',
    tallyTitle: '🗳 投票结算：',
    tallyLine: (name: string, count: number, voters: string) => `${name}  ${count}票 <<< ${voters}`,
    noVotesInTally: '（无人投票）',
    roomFull: (used: number, max: number) => `房间已满：${used}/${max}，请稍后再试。`,
    currentRoomPlayers: (roomId: number, count: number, names: string) => `🎪 ${roomId}号房：${count} — ${names}`,
    roundEnded: '该局已结束。',
    alreadyEnded: '已结束。',
    notYourTurn: '非本人不可点击！',
    gameForceEnded: '游戏已强制结束。',
    invalidVoteTarget: '无效的投票目标。',
    cannotVoteSelf: '不能投自己！',
    returnToGroup: '返回群组',
    btnPlayAgain: '🔄 再来一局',
    civiliansLabel: '平民阵营',
    undercoverLabel: '卧底阵营',
    civiliansWinSubtitle: '卧底无处遁形！',
    undercoverWinSubtitle: '平民已无力回天...',
    reportGameOver: '🚩 游戏结束！',
    reportSpyLabel: '🕵️‍♂️ 卧底',
    reportCivLabel: '👨‍🌾 平民',
    reportBlankWord: '🚫 白板',
    reportNone: '（无）',
    reportWinLine: (winnerLabel: string) => `🏆 [ ${winnerLabel} ] 完胜！`,
  },
  truthOrDare: {
    chooseTier: '🎯 <b>真心话大冒险</b>\n\n选择模式：',
    tierIcebreaker: '❄️ 轻松局',
    tierAdvanced: '🔮 真话局',
    tierSpicy: '🌙 夜间局 (18+)',
    recruitText: (min: number, max: number, tierLabel: string) =>
      `🎯 <b>真心话大冒险</b>  ${tierLabel}\n\n点击加入，${min}–${max} 人即可开始！`,
    recruitTextWithPlayers: (min: number, max: number, count: number, names: string, tierLabel: string) =>
      `🎯 <b>真心话大冒险</b>  ${tierLabel}\n\n已加入 ${count} 人：${names}\n\n${min}–${max} 人，点击加入！`,
    btnJoin: '✋ 加入',
    btnStart: '▶ 开始游戏',
    btnTruth: '💬 真心话',
    btnDare: '🔥 大冒险',
    btnSkip: '⏭ 跳过',
    btnNext: '👉 下一位',
    btnEndGame: '🛑 结束游戏',
    yourTurn: (name: string) => `轮到 <b>${name}</b>，请选择：`,
    truthLabel: '💬 真心话',
    dareLabel: '🔥 大冒险',
    questionFor: (name: string, label: string, question: string) =>
      `${label} → <b>${name}</b>\n\n${question}`,
    joined: '已加入！',
    alreadyJoined: '你已经加入了',
    alreadyRunning: '已有一局正在进行，请先结束当前游戏。',
    alreadyStarted: '游戏已经开始了',
    sessionEnded: '游戏已结束',
    notYourTurn: '现在不是你的回合',
    notInGame: '你不在本局游戏中',
    notEnough: (current: number, required: number) => `人数不足（${current}/${required}）`,
    full: '人数已满',
    gameStarted: (count: number, tierLabel: string) => `🎯 真心话大冒险开始！${count} 人参加。模式：${tierLabel}`,
    gameEnded: '🎯 真心话大冒险结束，下次再玩！',
    timeoutSkipped: (name: string) => `⏱ ${name} 超时，自动跳过`,
  },
};
