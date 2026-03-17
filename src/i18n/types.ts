export interface I18nTexts {
  i18n: {
    chooseLanguage: string;
    back: string;
  };
  mainMenu: {
    welcome: string;
    btnUndercover: string;
    btnLanguage: string;
    btnCancel: string;
    cancelAnswer: string;
    /** 旧菜单按键点击后的提示：请用 /playgg 打开最新菜单 */
    usePlayggForLatestMenu: string;
    /** 私聊发送 /playgg 时的提示：请拉入群组并发送 /playgg */
    privatePlayggHint: string;
    /** 群内发送 /start 时的提示：请用 /playgg */
    groupUsePlaygg: string;
  };
  errors: {
    generic: string;
  };
  common: {
    onlyGroups: string;
    otherGameRunning: string;
    btnStartGame: string;
    btnStartRecruit: string;
    roomFull: (used: number, max: number) => string;
    roomClosedOrNotFound: string;
    /** 通过链接加入时：游戏已开始，链接失效（适用于所有房间链接类游戏） */
    linkExpiredGameStarted: string;
    /** 房间标签，用于本场游戏所有群发消息前缀。N 由房间链接中的 roomId 决定 */
    roomLabel: (roomId: number) => string;
  };
  groupWelcome: {
    title: string;
    intro: string;
    separator: string;
    partners: string;
  };
  growth: {
    ctaText: string;
    ctaButton: string;
  };
  intro: {
    undercover: string;
  };
  wordTest?: {
    chooseRounds: string;
    finished: string;
    roundPrompt: (current: number, total: number, prefix: string, minLen: number) => string;
    hint10s: string;
    hint5s: string;
    timeoutNoWinner: string;
    winner: (user: string, word: string) => string;
    nextRoundIn10s: string;
    nextRoundIn5s: string;
    rankingTitle: string;
    rankingLine: (name: string, count: number) => string;
    rankingNobody: string;
  };
  wordBomb?: {
    chooseRounds: string;
    joinOpen: string;
    notEnoughPlayers: string;
    roundStart: (round: number, total: number, order: string, startWord: string) => string;
    mustStartWith: (letter: string) => string;
    turnPrompt: (name: string) => string;
    timeoutOut: (name: string) => string;
    gameOverWinner: (name: string) => string;
    gameOverNoWinner: string;
  };
  dice?: {
    chooseRounds: string;
    joinOpen: string;
    notEnoughPlayers: string;
    gameStart: string;
    roundBetPrompt: (current: number, total: number) => string;
    notInGame: string;
    notEnoughScore: string;
    gameFinishedRanking: (rankingLines: string) => string;
    rollResultRanking: (die: number, rankingLines: string) => string;
  };
  anonymous?: {
    chooseTopic: string;
    topicRel: string;
    topicJob: string;
    topicFriend: string;
    topicCustom: string;
    askCustomTopic: string;
    invalidLink: string;
    notActive: string;
    privateIntro: (topic: string) => string;
    groupTopicLink: (topic: string, link: string) => string;
    forwarded: (topic: string, text: string) => string;
  };
  undercover: {
    joinSuccess: string;
    /** 加入成功后带「返回群组」链接的完整文案（HTML） */
    joinSuccessWithReturnLink?: (groupLink: string) => string;
    countdown20s: string;
    countdown10s: string;
    countdown5s: string;
    yourWordCivilian: (word: string) => string;
    yourWordUndercover: (word: string) => string;
    /** 开局发词文案，所有人用同一套，不透露身份 */
    gameStartCivilian: (word: string) => string;
    gameStartUndercover: (word: string) => string;
    /** 空词时的展示文案（特殊局：卧底空白 / 仅卧底有词） */
    blankWord: string;
    /** 白板局整句提示（本局你没有词），所有人同一套，不透露身份 */
    blankCivilianMessage: string;
    blankUndercoverMessage: string;
    speakingOrder: (order: string) => string;
    speakingOrderSuffix: string;
    nowSpeaking: (name: string) => string;
    /** 结束发言按键下方的提示：非本人不要点击 */
    speakButtonHint: string;
    btnEndSpeak: string;
    btnEndRound: string;
    btnEndGame: string;
    freeTalk: string;
    speakTimeoutHint25?: string;
    speakTimeoutHint10?: string;
    freeTalkTimeoutHint45?: string;
    freeTalkTimeoutHint20?: string;
    freeTalkTimeoutHint10?: string;
    votePrompt: string;
    eliminated: (name: string) => string;
    civiliansWin: string;
    undercoverWins: string;
    nextRound: string;
    nextRoundIn5s?: string;
    joinStartText: (link: string, min: number, max: number, seconds: number) => string;
    joinClosed: string;
    linkExpiredGameStarted: string;
    linkExpiredRoomFull: (max: number) => string;
    maxPlayers: string;
    startCancelled: string;
    startCancelledWithCount?: (current: number, required: number) => string;
    startFailed?: string;
    startFailedNoRights?: string;
    startAnnounce: (count: number) => string;
    voteDone: (name: string) => string;
    votingEnded: string;
    notVotingNow: string;
    notInThisGame: string;
    invalidVoteTarget: string;
    noVotesRetry: string;
    /** 平票时：无人淘汰，直接下一轮。maxVotes 为最高票数 */
    tieNoElimination?: (maxVotes: number) => string;
    voteTimeoutHint12?: string;
    /** 投票结算标题行：🎪 【 📍 #N号房间 】 */
    tallyHeader?: (roomId: number) => string;
    /** 投票结算标题 */
    tallyTitle?: string;
    /** 结算每行：name  N票 <<< voter1, voter2 */
    tallyLine?: (name: string, count: number, voters: string) => string;
    /** 无人得票时结算区占位文案 */
    noVotesInTally?: string;
    roomFull: (used: number, max: number) => string;
    /** roomId 来自房间链接，格式如：🎪 N号房间玩家：count — names */
    currentRoomPlayers: (roomId: number, count: number, names: string) => string;
    roundEnded: string;
    alreadyEnded?: string;
    notYourTurn?: string;
    gameForceEnded?: string;
  };
  bunker?: {
    notEnoughToStart?: string;
    cardsSent?: string;
    debateTime?: string;
    votePrompt?: string;
    eliminated?: (name: string) => string;
    survivorsWin?: (names: string) => string;
    joinPrompt?: (link: string, min: number, max: number) => string;
    alreadyJoined?: string;
    roomFull?: string;
    linkExpiredRoomFull?: (max: number) => string;
    joinSuccess?: string;
    currentPlayers?: (roomId: number, count: number, names: string) => string;
    votingEnded?: string;
    notInGame?: string;
    voteDone?: (name: string) => string;
    game_start?: string;
    phase_debate?: string;
    phase_voting?: string;
    player_kicked?: string;
    game_over?: string;
    your_card?: string;
    disasters?: string[];
    professions?: string[];
    health?: string[];
    inventory?: string[];
    phobias?: string[];
    /** 辩论/投票：全局进度条。orderLine 为 "名1 > 名2 > ..." */
    orderHeader?: (roomId: number, orderLine: string) => string;
    /** 当前发言：📍 name + 非本人勿点提示 */
    currentSpeaker?: (name: string) => string;
    notYourTurn?: string;
    btnEndSpeak?: string;
    freetalkTitle?: string;
    btnEndRound?: string;
    votePromptTimer?: (seconds: number) => string;
    /** 投票面板每行：emoji - {voteEliminateLabel} 名字 */
    voteEliminateLabel?: string;
    /** 发送 Emoji 投票后私聊确认：voteUpdated(emoji, targetName) */
    voteUpdated?: (emoji: string, name: string) => string;
    btnEndGame?: string;
    tallyHeader?: (roomId: number) => string;
    tallyTitle?: string;
    tallyLine?: (name: string, count: number, voters: string) => string;
    noVotesInTally?: string;
    gameForceEnded?: string;
    /** Emoji 投票池耗尽时提示（与“按请求结束”区分） */
    emojiPoolExhausted?: string;
    alreadyEnded?: string;
  };
  alias?: {
    onlyGroups?: string;
    roomFull?: (used: number, max: number) => string;
    alreadyJoined?: string;
    linkExpiredRoomFull?: (max: number) => string;
    joinPrompt?: (link: string, min: number, max: number) => string;
    joinSuccess?: string;
    currentPlayers?: (roomId: number, count: number, names: string) => string;
    roomClosedOrNotFound?: string;
    turnAnnounce?: (roomLabel: string, explainerName: string, teamLabel: string, seconds: number) => string;
    correctGuess?: (username: string, word: string) => string;
    foulWordRoot?: string;
    roundOver?: string;
    gameOver?: (teamLabel: string, score: number) => string;
    notInGame?: string;
    turn_start?: string;
    correct_guess?: string;
    foul_warning?: string;
    round_end?: string;
    game_over?: string;
    your_word?: string;
    words?: string[];
  };
}

