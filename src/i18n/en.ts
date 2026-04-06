import type { I18nTexts } from './types';

export const enTexts: I18nTexts = {
  i18n: {
    chooseLanguage: 'Choose your language',
    back: '🔙 Back',
  },
  mainMenu: {
    welcome: "🎮 Spy Me — pick a game!",
    btnUndercover: 'Undercover',
    btnCancel: 'Cancel',
    cancelAnswer: "Okay, I'll stay in the background. Need a game? Just send /play!",
    usePlayggForLatestMenu: 'This menu is outdated. Send /play to open the latest menu.',
    privatePlayggHint: '🎮 Please add me to your group and send /play there to start playing!',
    groupUsePlaygg: '👉 In the group, use /play to open the game menu.',
    btnTruthOrDare: '🎯 Truth or Dare',
    btnAnonymous: '📝 Anonymous Wall',
    btnAddToGroup: '➕ Add to Group',
    btnLanguage: '🌐 Language',
    helpText:
      '🎮 <b>Spy Me — How to Play</b>\n\n' +
      '🕵️ <b>Undercover</b>\n' +
      'Everyone gets a secret word — spies get a slightly different one. Describe your word, find the liar, vote them out!\n' +
      '👥 5–12 players\n\n' +
      '🎯 <b>Truth or Dare</b>\n' +
      'Pick a mode, take turns choosing truth or dare. Skip if you chicken out 🐔\n' +
      '👥 2–20 players\n\n' +
      '📝 <b>Anonymous Wall</b>\n' +
      'Post anonymous messages to the group. Say what you really think 👀\n\n' +
      '➡️ In a group, send /play to start!',
  },
  errors: {
    generic: '⚠️ Something went wrong. Please try again later.',
  },
  common: {
    onlyGroups: 'This game is available in groups only.',
    btnStartGame: '▶ Start game',
    roomFull: (used: number, max: number) => `Game rooms are full: ${used}/${max}. Try again later.`,
    roomClosedOrNotFound: 'This room is closed or does not exist.',
    busyWithAnotherGame: 'Another game is already running in this group. Finish it first.',
    linkExpiredGameStarted: 'The game has already started. This link is no longer valid.',
    roomLabel: (roomId: number) => `🎪 Room ${roomId}`,
  },
  groupWelcome: {
    title: '🎮 Welcome to Spy Me!',
    intro: 'Play Undercover and more group games. Send /play to open the game menu.',
    separator: '—————————————',
    partners: 'Our partners: Blink — more chat and games!',
  },
  growth: {
    ctaText: 'Try our new app Blink — more chat and more games!',
    ctaButton: 'Open Blink',
  },
  intro: {
    undercover:
      '🕵️ Who is the Spy\n' +
      'Heart‑racing logic and bluffing — who is lying?\n' +
      '👥 Players: 5–12\n' +
      '🕹 Game flow:\n' +
      '  1. Get your word: Tap the link to DM the Bot and receive your secret word. The spies get a slightly different word. 🤫\n' +
      '  2. Speak in turn: Describe your word in 40 seconds — don\'t say it directly!\n' +
      '  3. Free debate: 120 seconds to catch the liar!\n' +
      '  4. Vote: Tap your emoji to vote for the suspect — 20 seconds.\n' +
      '❌ If nobody votes, the game ends!\n' +
      '🎭 Roles: 5–6p → 1 spy | 7–9p → 2 spies | 10–12p → 3 spies\n' +
      '🟢 Civilians win: eliminate all spies.\n' +
      '🔴 Spies win: spies ≥ civilians.',
  },
  undercover: {
    joinSuccess: 'You joined successfully. Waiting for the game to start.',
    joinSuccessWithReturnLink: (groupLink: string) =>
      `You joined successfully.\nReturn to group 👉 <a href="${groupLink}">Click here</a>`,
    countdown10s: '⏱ Sign-up closes in 10 seconds',
    gameStartCivilian: (word: string) => `Game on! Your word: ${word}`,
    blankWord: '(Blank)',
    blankCivilianMessage: 'Game on! This round you have no word (blank).',
    speakingOrder: (order: string) => `Turn order:\n${order}`,
    speakingOrderSuffix: ' > 45s free discussion > voting',
    nowSpeaking: (name: string) => `Now speaking: 📍 @${name}`,
    speakButtonHint: '👇 Only the current speaker may tap❗️',
    btnEndSpeak: 'End turn',
    btnEndRound: 'End round',
    btnEndGame: '🛑 End game',
    freeTalk: '🗣 Free discussion!',
    votePrompt: 'Vote for the suspect:',
    eliminated: (name: string) => `💀 ${name} is eliminated!`,
    civiliansWin: '🏆 Civilians win! All spies eliminated.',
    undercoverWins: '🏆 Spies win! Spies ≥ civilians.',
    nextRound: 'Next round',
    joinStartText: (link: string, min: number, max: number, seconds: number) =>
      `🎭 Undercover starting!\nTap to join:\n${link}\n\n${min}–${max} players, ${seconds}s countdown.`,
    linkExpiredGameStarted: 'Game already started. Link expired.',
    linkExpiredRoomFull: (max: number) => `Room full (max ${max}). Link expired.`,
    startCancelled: 'Not enough players. Invite friends!',
    startCancelledWithCount: (current: number, required: number) =>
      `Not enough (${current}/${required}). Invite friends!`,
    startFailed: 'Game failed to start. Try again.',
    startFailedNoRights: 'Failed: bot needs send-message permission (add as admin if group is restricted).',
    startAnnounce: (count: number) => `Undercover started! ${count} players.`,
    voteDone: (name: string) => `Voted for ${name}`,
    votingEnded: 'Voting ended.',
    notInThisGame: 'You are not in this game.',
    noVotesRetry: 'No votes. Game ended.',
    tieNoElimination: (maxVotes: number) => `⚖️ Tie (${maxVotes} votes each)! No one eliminated, game continues.`,
    nextRoundIn5s: '⏱ Next round in 5s.',
    tallyTitle: '🗳 Vote tally:',
    tallyLine: (name: string, count: number, voters: string) => `${name}  ${count} vote(s) <<< ${voters}`,
    noVotesInTally: '(No votes)',
    roomFull: (used: number, max: number) => `Rooms full: ${used}/${max}. Try later.`,
    currentRoomPlayers: (roomId: number, count: number, names: string) => `🎪 Room ${roomId}: ${count} — ${names}`,
    roundEnded: 'Round ended.',
    alreadyEnded: 'Already ended.',
    notYourTurn: 'Not your turn!',
    gameForceEnded: 'Game force-ended.',
    invalidVoteTarget: 'Invalid vote target.',
    cannotVoteSelf: 'You cannot vote for yourself!',
    returnToGroup: 'Return to group',
    btnPlayAgain: '🔄 Play again',
    civiliansLabel: 'Civilians',
    undercoverLabel: 'Spies',
    civiliansWinSubtitle: 'All spies exposed!',
    undercoverWinSubtitle: 'Civilians outnumbered...',
    reportGameOver: '🚩 Game Over!',
    reportSpyLabel: '🕵️‍♂️ Spies',
    reportCivLabel: '👨‍🌾 Civilians',
    reportBlankWord: '🚫 Blank',
    reportNone: '(none)',
    reportWinLine: (winnerLabel: string) => `🏆 [ ${winnerLabel} ] Victory!`,
  },
  truthOrDare: {
    chooseTier: '🎯 <b>Truth or Dare</b>\n\nPick a mode:',
    tierIcebreaker: '❄️ Chill',
    tierAdvanced: '🔮 No Filter',
    tierSpicy: '🌙 After Dark (18+)',
    recruitText: (min: number, max: number, tierLabel: string) =>
      `🎯 <b>Truth or Dare</b>  ${tierLabel}\n\nTap to join! ${min}–${max} players to start.`,
    recruitTextWithPlayers: (min: number, max: number, count: number, names: string, tierLabel: string) =>
      `🎯 <b>Truth or Dare</b>  ${tierLabel}\n\n${count} joined: ${names}\n\n${min}–${max} players, tap to join!`,
    btnJoin: '✋ Join',
    btnStart: '▶ Start',
    btnTruth: '💬 Truth',
    btnDare: '🔥 Dare',
    btnSkip: '⏭ Skip',
    btnNext: '👉 Next',
    btnEndGame: '🛑 End game',
    yourTurn: (name: string) => `It's <b>${name}</b>'s turn — choose:`,
    truthLabel: '💬 Truth',
    dareLabel: '🔥 Dare',
    questionFor: (name: string, label: string, question: string) =>
      `${label} → <b>${name}</b>\n\n${question}`,
    joined: 'Joined!',
    alreadyJoined: 'You already joined',
    alreadyRunning: 'A game is already running. End it first.',
    alreadyStarted: 'Game already started',
    sessionEnded: 'Game ended',
    notYourTurn: "It's not your turn",
    notInGame: "You're not in this game",
    notEnough: (current: number, required: number) => `Not enough players (${current}/${required})`,
    full: 'Game is full',
    gameStarted: (count: number, tierLabel: string) => `🎯 Truth or Dare started! ${count} players. Mode: ${tierLabel}`,
    gameEnded: '🎯 Truth or Dare ended. Play again next time!',
    timeoutSkipped: (name: string) => `⏱ ${name} timed out, skipping`,
  },
  anonymous: {
    chooseTopic: '📝 <b>Anonymous Wall</b>\n\nPick a topic below. Then I will send a private link — anonymous messages must be sent to me in DM, not in the group.',
    topicConfess: '💌 Confessions',
    topicRoast: '🔥 Roast',
    topicSecret: '🤫 Secrets',
    topicCompliment: '🌸 Compliments',
    topicRant: '⚡ Rant',
    topicDream: '🌙 Dream / Crush',
    wallActive: (topic: string) =>
      `📝 <b>Anonymous Wall is live!</b> — <i>${topic}</i>\n\n` +
      `Tap the button below → DM me your message → I post it here anonymously.\n\n` +
      `⚠️ Messages in the group are <b>NOT</b> anonymous. Use the button!\nSend /quit to close.`,
    btnOpenDM: '✉️ Send Anonymous Message',
    privateIntro: (topic: string) =>
      `📝 Topic: <b>${topic}</b>\n\nNow send me the message you want to post anonymously. I will forward it to the group without your name 🤫`,
    forwarded: (topic: string, text: string) =>
      `📝 <b>Anonymous Wall</b> — <i>${topic}</i>\n\n🗣 <i>${text}</i>`,
    sent: '✅ Sent anonymously!',
    sentTrimmed: '✅ Sent anonymously! Your message was a bit long, so I trimmed it to fit the card.',
    notActive: 'The anonymous wall is not active right now.',
    ended: '📝 Anonymous Wall closed. Thanks for sharing! 🙌',
  },
};
