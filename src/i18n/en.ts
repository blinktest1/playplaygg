export const enTexts: any = {
  i18n: {
    chooseLanguage: 'Choose your language',
    back: '🔙 Back',
  },
  mainMenu: {
    welcome: "Welcome to @playplayggbot — let's play!",
    btnUndercover: 'Undercover',
    btnCancel: 'Cancel',
    cancelAnswer: "Okay, I'll stay in the background. Need a game? Just send /playgg!",
    usePlayggForLatestMenu: 'This menu is outdated. Send /playgg to open the latest menu.',
    privatePlayggHint: '🎮 Please add me to your group and send /playgg there to start playing!',
    groupUsePlaygg: '👉 In the group, use /playgg to open the game menu.',
    btnLanguage: '🌐 Language',
  },
  errors: {
    generic: '⚠️ Something went wrong. Please try again later.',
  },
  common: {
    onlyGroups: 'This game is available in groups only.',
    btnStartGame: '▶ Start game',
    roomFull: (used: number, max: number) => `Game rooms are full: ${used}/${max}. Try again later.`,
    roomClosedOrNotFound: 'This room is closed or does not exist.',
    linkExpiredGameStarted: 'The game has already started. This link is no longer valid.',
    roomLabel: (roomId: number) => `🎪 Room ${roomId}`,
  },
  groupWelcome: {
    title: '🎮 Welcome to @playplayggbot',
    intro: 'Play Undercover and more group games. Send /playgg to open the game menu.',
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
      '  2. Speak in turn: Describe your word in 25 seconds — don\'t say it directly!\n' +
      '  3. Free debate: 45 seconds to catch the liar!\n' +
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
  },
};

export type EnTexts = typeof enTexts;
