export const ruTexts: any = {
  i18n: {
    chooseLanguage: 'Выберите язык',
    back: '🔙 Назад',
  },
  mainMenu: {
    welcome: 'Добро пожаловать в @Blink_AIgames_bot — давайте играть!',
    btnUndercover: 'Кто шпион',
    btnCancel: 'Отмена',
    cancelAnswer: 'Ок, я в фоне. Нужна игра — /playgg!',
    usePlayggForLatestMenu: 'Старое меню. Отправьте /playgg.',
    privatePlayggHint: '🎮 Добавьте меня в группу и отправьте /playgg!',
    groupUsePlaygg: '👉 В группе: /playgg для меню игр.',
    btnLanguage: '🌐 Язык',
  },
  errors: {
    generic: '⚠️ Произошла ошибка. Попробуйте позже.',
  },
  common: {
    onlyGroups: 'Эта игра только в группах.',
    btnStartGame: '▶ Начать игру',
    roomFull: (used: number, max: number) => `Комнаты заполнены: ${used}/${max}. Попробуйте позже.`,
    roomClosedOrNotFound: 'Комната закрыта или не существует.',
    linkExpiredGameStarted: 'Игра уже началась. Ссылка недействительна.',
    roomLabel: (roomId: number) => `🎪 Комната ${roomId}`,
  },
  groupWelcome: {
    title: '🎮 Добро пожаловать в @Blink_AIgames_bot!',
    intro: 'Играйте в «Кто шпион» и другие игры. Отправьте /playgg!',
    separator: '─────── ✦ ───────',
    partners: 'Партнёры: Blink — больше общения и игр!',
  },
  growth: {
    ctaText: 'Попробуйте Blink — больше общения и игр!',
    ctaButton: 'Открыть Blink',
  },
  intro: {
    undercover:
      '🕵️ Кто шпион\n' +
      'Напряжённая логическая игра: кто врёт?\n' +
      '👥 Игроки: 5–12\n' +
      '🕹 Ход игры:\n' +
      '  1. Получите слово в личке бота. У шпионов слово немного другое! 🤫\n' +
      '  2. По очереди описывайте слово за 25 сек — не называйте напрямую!\n' +
      '  3. 45 сек свободной дискуссии — ловите шпиона!\n' +
      '  4. Голосование: нажмите эмодзи-кнопку за 20 сек.\n' +
      '❌ Если никто не голосует — игра завершается!\n' +
      '🎭 Роли: 5–6 → 1 шпион | 7–9 → 2 | 10–12 → 3\n' +
      '🟢 Мирные: вычислить всех шпионов.\n' +
      '🔴 Шпионы: шпионов ≥ мирных.',
  },
  undercover: {
    joinSuccess: 'Вы присоединились. Ожидайте начала.',
    joinSuccessWithReturnLink: (groupLink: string) =>
      `Вы присоединились.\nВернуться 👉 <a href="${groupLink}">Назад</a>`,
    countdown10s: '⏱ Регистрация через 10 сек',
    gameStartCivilian: (word: string) => `Игра началась! Ваше слово: ${word}`,
    blankWord: '(Пусто)',
    blankCivilianMessage: 'Игра началась! У вас нет слова (пусто).',
    speakingOrder: (order: string) => `Порядок:\n${order}`,
    speakingOrderSuffix: ' > 45с обсуждение > голосование',
    nowSpeaking: (name: string) => `Говорит: 📍 @${name}`,
    speakButtonHint: '👇 Кнопка только для говорящего❗️',
    btnEndSpeak: 'Завершить ход',
    btnEndRound: 'Завершить раунд',
    btnEndGame: '🛑 Завершить игру',
    freeTalk: '🗣 Свободная дискуссия!',
    votePrompt: 'Голосуйте за подозреваемого:',
    eliminated: (name: string) => `💀 ${name} выбыл!`,
    civiliansWin: '🏆 Мирные победили! Все шпионы раскрыты.',
    undercoverWins: '🏆 Шпионы победили! Шпионов ≥ мирных.',
    nextRound: 'Следующий раунд',
    joinStartText: (link: string, min: number, max: number, seconds: number) =>
      `🎭 «Кто шпион» начинается!\nПрисоединиться:\n${link}\n\n${min}–${max} игроков, ${seconds}с.`,
    linkExpiredGameStarted: 'Игра началась. Ссылка недействительна.',
    linkExpiredRoomFull: (max: number) => `Комната полна (макс ${max}). Ссылка недействительна.`,
    startCancelled: 'Недостаточно игроков. Зовите друзей!',
    startCancelledWithCount: (current: number, required: number) =>
      `Мало игроков (${current}/${required}). Зовите друзей!`,
    startFailed: 'Не удалось начать. Попробуйте снова.',
    startFailedNoRights: 'Не удалось: боту нужно право отправлять сообщения.',
    startAnnounce: (count: number) => `«Кто шпион» началась! Игроков: ${count}.`,
    voteDone: (name: string) => `Голос за ${name}`,
    votingEnded: 'Голосование завершено.',
    notInThisGame: 'Вы не в этой игре.',
    noVotesRetry: 'Нет голосов. Игра завершена.',
    tieNoElimination: (maxVotes: number) => `⚖️ Ничья (${maxVotes} голосов)! Никто не выбывает.`,
    nextRoundIn5s: '⏱ Следующий раунд через 5с.',
    tallyTitle: '🗳 Итоги:',
    tallyLine: (name: string, count: number, voters: string) => `${name}  ${count} гол. <<< ${voters}`,
    noVotesInTally: '(Нет голосов)',
    roomFull: (used: number, max: number) => `Комнаты полны: ${used}/${max}. Позже.`,
    currentRoomPlayers: (roomId: number, count: number, names: string) => `🎪 Комната ${roomId}: ${count} — ${names}`,
    roundEnded: 'Раунд завершён.',
    alreadyEnded: 'Уже завершено.',
    notYourTurn: 'Не ваш ход!',
    gameForceEnded: 'Игра принудительно завершена.',
  },
};

export type RuTexts = typeof ruTexts;
