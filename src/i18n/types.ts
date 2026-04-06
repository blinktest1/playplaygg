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
    /** 旧菜单按键点击后的提示：请用 /play 打开最新菜单 */
    usePlayggForLatestMenu: string;
    /** 私聊发送 /play 时的提示：请拉入群组并发送 /play */
    privatePlayggHint: string;
    /** 群内发送 /start 时的提示：请用 /play */
    groupUsePlaygg: string;
    /** 真心话大冒险主菜单按钮 */
    btnTruthOrDare?: string;
    /** 匿名大字报主菜单按钮 */
    btnAnonymous?: string;
    /** 添加到群组按钮 */
    btnAddToGroup: string;
    /** /help 命令回复 */
    helpText: string;
  };
  errors: {
    generic: string;
  };
  common: {
    onlyGroups: string;
    btnStartGame: string;
    roomFull: (used: number, max: number) => string;
    roomClosedOrNotFound: string;
    busyWithAnotherGame: string;
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

  undercover: {
    joinSuccess: string;
    /** 加入成功后带「返回群组」链接的完整文案（HTML） */
    joinSuccessWithReturnLink?: (groupLink: string) => string;
    /** @deprecated Not used in current code */
    countdown20s?: string;
    countdown10s: string;
    /** @deprecated Not used in current code */
    countdown5s?: string;
    /** @deprecated Not used — gameStartCivilian is used instead */
    yourWordCivilian?: (word: string) => string;
    /** @deprecated Not used — gameStartCivilian is used instead */
    yourWordUndercover?: (word: string) => string;
    /** 开局发词文案，所有人用同一套，不透露身份 */
    gameStartCivilian: (word: string) => string;
    /** @deprecated Not used — gameStartCivilian handles both roles */
    gameStartUndercover?: (word: string) => string;
    /** 空词时的展示文案（特殊局：卧底空白 / 仅卧底有词） */
    blankWord: string;
    /** 白板局整句提示（本局你没有词），所有人同一套，不透露身份 */
    blankCivilianMessage: string;
    blankUndercoverMessage?: string;
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
    /** @deprecated Not used in current code */
    joinClosed?: string;
    linkExpiredGameStarted: string;
    linkExpiredRoomFull: (max: number) => string;
    /** @deprecated Not used in current code */
    maxPlayers?: string;
    startCancelled: string;
    startCancelledWithCount?: (current: number, required: number) => string;
    startFailed?: string;
    startFailedNoRights?: string;
    startAnnounce: (count: number) => string;
    voteDone: (name: string) => string;
    /** @deprecated Not used in current code */
    votingEnded?: string;
    /** @deprecated Not used in current code */
    notVotingNow?: string;
    notInThisGame: string;
    invalidVoteTarget: string;
    cannotVoteSelf?: string;
    /** 私聊发词后「返回群组」链接文案 */
    returnToGroup?: string;
    /** 游戏结束「再来一局」按钮 */
    btnPlayAgain?: string;
    /** 游戏结束报告：平民阵营 / 卧底阵营 标签 */
    civiliansLabel?: string;
    undercoverLabel?: string;
    /** 游戏结束报告副标题 */
    civiliansWinSubtitle?: string;
    undercoverWinSubtitle?: string;
    /** 游戏结束报告 */
    reportGameOver?: string;
    reportSpyLabel?: string;
    reportCivLabel?: string;
    reportBlankWord?: string;
    reportNone?: string;
    reportWinLine?: (winnerLabel: string) => string;
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

  truthOrDare: {
    chooseTier: string;
    tierIcebreaker: string;
    tierAdvanced: string;
    tierSpicy: string;
    recruitText: (min: number, max: number, tierLabel: string) => string;
    recruitTextWithPlayers: (min: number, max: number, count: number, names: string, tierLabel: string) => string;
    btnJoin: string;
    btnStart: string;
    btnTruth: string;
    btnDare: string;
    btnSkip: string;
    btnNext: string;
    btnEndGame: string;
    yourTurn: (name: string) => string;
    truthLabel: string;
    dareLabel: string;
    questionFor: (name: string, label: string, question: string) => string;
    joined: string;
    alreadyJoined: string;
    alreadyRunning: string;
    alreadyStarted: string;
    sessionEnded: string;
    notYourTurn: string;
    notInGame: string;
    notEnough: (current: number, required: number) => string;
    full: string;
    gameStarted: (count: number, tierLabel: string) => string;
    gameEnded: string;
    timeoutSkipped: (name: string) => string;
  };

  anonymous: {
    chooseTopic: string;
    topicConfess: string;
    topicRoast: string;
    topicSecret: string;
    topicCompliment: string;
    topicRant: string;
    topicDream: string;
    wallActive: (topic: string) => string;
    btnOpenDM: string;
    privateIntro: (topic: string) => string;
    forwarded: (topic: string, text: string) => string;
    sent: string;
    sentTrimmed?: string;
    notActive: string;
    ended: string;
  };
}
