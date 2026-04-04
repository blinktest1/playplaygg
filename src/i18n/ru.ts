import type { I18nTexts } from './types';

export const ruTexts: I18nTexts = {
  i18n: {
    chooseLanguage: 'Выберите язык',
    back: '🔙 Назад',
  },
  mainMenu: {
    welcome: '🎮 Spy Me — выбирай игру!',
    btnUndercover: 'Кто шпион',
    btnCancel: 'Отмена',
    cancelAnswer: 'Ок, я в фоне. Нужна игра — /play!',
    usePlayggForLatestMenu: 'Старое меню. Отправьте /play.',
    privatePlayggHint: '🎮 Добавьте меня в группу и отправьте /play!',
    groupUsePlaygg: '👉 В группе: /play для меню игр.',
    btnTruthOrDare: '🎯 Правда или Действие',
    btnAnonymous: '📝 Анонимная стена',
    btnAddToGroup: '➕ Добавить в группу',
    btnLanguage: '🌐 Язык',
    helpText:
      '🎮 <b>Spy Me — Как играть</b>\n\n' +
      '🕵️ <b>Кто шпион</b>\n' +
      'Каждый получает слово — у шпионов оно чуть другое. Описывай своё слово, вычисляй обманщика, голосуй!\n' +
      '👥 5–12 игроков\n\n' +
      '🎯 <b>Правда или Действие</b>\n' +
      'Выбери режим, по очереди отвечай на вопросы или выполняй задания. Можно пропустить, если страшно 🐔\n' +
      '👥 2–20 игроков\n\n' +
      '📝 <b>Анонимная стена</b>\n' +
      'Пиши анонимные сообщения в группу. Скажи то, что думаешь на самом деле 👀\n\n' +
      '➡️ В группе отправь /play, чтобы начать!',
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
    title: '🎮 Добро пожаловать в Spy Me!',
    intro: 'Играйте в «Кто шпион» и другие игры. Отправьте /play!',
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
      '  2. По очереди описывайте слово за 40 сек — не называйте напрямую!\n' +
      '  3. 120 сек свободной дискуссии — ловите шпиона!\n' +
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
    countdown10s: '⏱ До конца набора 10 секунд',
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
    freeTalk: '🗣 Свободное обсуждение!',
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
    invalidVoteTarget: 'Недопустимая цель голосования.',
    cannotVoteSelf: 'Нельзя голосовать за себя!',
    returnToGroup: 'Вернуться в группу',
    btnPlayAgain: '🔄 Ещё раз',
    civiliansLabel: 'Мирные',
    undercoverLabel: 'Шпионы',
    civiliansWinSubtitle: 'Все шпионы раскрыты!',
    undercoverWinSubtitle: 'Мирных больше не осталось...',
    reportGameOver: '🚩 Игра окончена!',
    reportSpyLabel: '🕵️‍♂️ Шпионы',
    reportCivLabel: '👨‍🌾 Мирные',
    reportBlankWord: '🚫 Пусто',
    reportNone: '(нет)',
    reportWinLine: (winnerLabel: string) => `🏆 [ ${winnerLabel} ] Победа!`,
  },
  truthOrDare: {
    chooseTier: '🎯 <b>Правда или Действие</b>\n\nВыберите режим:',
    tierIcebreaker: '❄️ Лайт',
    tierAdvanced: '🔮 Без фильтров',
    tierSpicy: '🌙 После полуночи (18+)',
    recruitText: (min: number, max: number, tierLabel: string) =>
      `🎯 <b>Правда или Действие</b>  ${tierLabel}\n\nНажмите, чтобы присоединиться! ${min}–${max} игроков.`,
    recruitTextWithPlayers: (min: number, max: number, count: number, names: string, tierLabel: string) =>
      `🎯 <b>Правда или Действие</b>  ${tierLabel}\n\nУже ${count}: ${names}\n\n${min}–${max} игроков, присоединяйтесь!`,
    btnJoin: '✋ Вступить',
    btnStart: '▶ Начать',
    btnTruth: '💬 Правда',
    btnDare: '🔥 Действие',
    btnSkip: '⏭ Пропустить',
    btnNext: '👉 Далее',
    btnEndGame: '🛑 Закончить',
    yourTurn: (name: string) => `Очередь <b>${name}</b> — выбирайте:`,
    truthLabel: '💬 Правда',
    dareLabel: '🔥 Действие',
    questionFor: (name: string, label: string, question: string) =>
      `${label} → <b>${name}</b>\n\n${question}`,
    joined: 'Вы вступили!',
    alreadyJoined: 'Вы уже в игре',
    alreadyRunning: 'Игра уже идёт. Сначала завершите текущую.',
    alreadyStarted: 'Игра уже началась',
    sessionEnded: 'Игра завершена',
    notYourTurn: 'Сейчас не ваша очередь',
    notInGame: 'Вы не в этой игре',
    notEnough: (current: number, required: number) => `Мало игроков (${current}/${required})`,
    full: 'Игра заполнена',
    gameStarted: (count: number, tierLabel: string) => `🎯 Правда или Действие! Игроков: ${count}. Режим: ${tierLabel}`,
    gameEnded: '🎯 Правда или Действие завершена. До следующего раза!',
    timeoutSkipped: (name: string) => `⏱ ${name} — время вышло, пропуск`,
  },
  anonymous: {
    chooseTopic: '📝 <b>Анонимная стена</b>\n\nВыберите тему ниже. После этого я пришлю ссылку для лички — анонимные сообщения нужно отправлять мне в DM, а не в группу.',
    topicConfess: '💌 Признания',
    topicRoast: '🔥 Жёсткий юмор',
    topicSecret: '🤫 Секреты',
    topicCompliment: '🌸 Комплименты',
    topicRant: '⚡ Наболело',
    topicDream: '🌙 Симпатия / Краш',
    wallActive: (topic: string) =>
      `📝 <b>Анонимная стена открыта!</b> — <i>${topic}</i>\n\n` +
      `Нажмите кнопку ниже → напишите мне в личку → я опубликую анонимно.\n\n` +
      `⚠️ Сообщения в группе <b>НЕ</b> анонимны. Используйте кнопку!\nОтправьте /quit, чтобы закрыть.`,
    btnOpenDM: '✉️ Написать анонимно',
    privateIntro: (topic: string) =>
      `📝 Тема: <b>${topic}</b>\n\nТеперь отправьте сообщение, которое хотите опубликовать анонимно. Я перешлю его в группу без вашего имени 🤫`,
    forwarded: (topic: string, text: string) =>
      `📝 <b>Анонимная стена</b> — <i>${topic}</i>\n\n🗣 <i>${text}</i>`,
    sent: '✅ Отправлено анонимно!',
    notActive: 'Анонимная стена сейчас не активна.',
    ended: '📝 Анонимная стена закрыта. Спасибо за участие! 🙌',
  },
};
