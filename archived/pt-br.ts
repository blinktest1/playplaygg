export const ptBrTexts = {
  i18n: {
    chooseLanguage: 'Escolha seu idioma',
    back: '🔙 Voltar',
  },
  mainMenu: {
    welcome: 'Bem-vindo ao @playplayggbot — bora jogar!',
    btnUndercover: 'Infiltrado',
    btnWerewolf: 'Lobisomem',
    btnAvalon: 'Avalon',
    btnWordTest: 'Teste de Palavras',
    btnWordBomb: 'Revezamento Palavra Bomba',
    btnDiceGuess: 'Adivinha o Dado',
    btnAnonymous: 'Carta Anônima',
    btnBunker: 'Bunker',
    btnAlias: 'Alias',
    btnCancel: 'Cancelar',
    cancelAnswer: 'Beleza, fico em segundo plano. Quer jogar? Envie /playgg.',
    usePlayggForLatestMenu: 'Este menu está desatualizado. Envie /playgg para abrir o menu atual.',
    privatePlayggHint: '🎮 Adicione-me ao seu grupo e envie /playgg lá para começar a jogar!',
    groupUsePlaygg: '👉 No grupo use /playgg para abrir o menu de jogos.',
    btnLanguage: '🌐 Idioma',
  },
  errors: {
    generic: '⚠️ Algo deu errado. Tente de novo mais tarde.',
  },
  common: {
    onlyGroups: 'Este jogo está disponível apenas em grupos.',
    otherGameRunning: 'Já tem outro jogo rolando neste grupo.',
    btnStartGame: '▶ Iniciar jogo',
    btnStartRecruit: '🚀 Iniciar recrutamento aqui',
    roomFull: (used: number, max: number) => `Salas cheias: ${used}/${max}. Tente mais tarde.`,
    roomClosedOrNotFound: 'Esta sala está fechada ou não existe.',
    linkExpiredGameStarted: 'O jogo já começou. Este link não é mais válido.',
    roomLabel: (roomId: number) => `🎪 Sala ${roomId}`,
  },
  groupWelcome: {
    title: '🎮 Bem-vindo ao @playplayggbot',
    intro: 'Jogue Infiltrado, Palavra Bomba, Dado e mais. Envie /playgg para abrir o menu.',
    separator: '—————————————',
    partners: 'Nossos parceiros: Blink — mais chat e jogos!',
  },
  growth: {
    ctaText: 'Conheça o app Blink — mais chat e mais jogos!',
    ctaButton: 'Abrir Blink',
  },
  intro: {
    undercover:
      '🕵️ Quem é o Infiltrado (Who is the Spy)\n' +
      'Jogo de lógica e blefe de tirar o fôlego: quem está mentindo?\n' +
      '👥 Jogadores: 5–12\n' +
      '🕹 Fluxo do jogo:\n' +
      '  1. Receber a palavra: Toque no link para falar com o bot no privado e ganhar sua palavra secreta. Atenção: a palavra do infiltrado é um pouco diferente da dos demais. 🤫\n' +
      '  2. Fala por vez: Siga a ordem que o bot indicar e descreva sua palavra. Cada jogador tem 25 segundos — não pode falar a palavra exata!\n' +
      '  3. Debate livre: 📍 45 segundos de discussão para encontrar quem está se enrolando.\n' +
      '  4. Votação geral: Toque no seu emoji exclusivo / envie o emoji correspondente no chat para votar em quem você desconfia — em até 12 segundos.\n' +
      '❌ Importante: se ninguém votar, a partida termina automaticamente!\n' +
      '🎭 Configuração de papéis:\n' +
      '  - 5–6 jogadores: 1 infiltrado\n' +
      '  - 7–9 jogadores: 2 infiltrados\n' +
      '  - 10–12 jogadores: 3 infiltrados\n' +
      '🏆 Condições de vitória:\n' +
      '🟢 Civis vencem: Conseguem encontrar e eliminar todos os infiltrados.\n' +
      '🔴 Infiltrados vencem: Mantêm o disfarce até o fim! Quando o número de infiltrados é maior ou igual ao número de civis, os infiltrados vencem.',
    word_test:
      '✍️ Mestre do Vocabulário (Word Test)\n\n' +
      'Teste vocabulário e velocidade: quem digita primeiro uma palavra válida?\n\n' +
      '👥 Jogadores: todos no grupo (sem inscrição).\n\n' +
      '📖 Regras\n' +
      '• A cada rodada o bot dá um prefixo (ex.: re, co, in) e um tamanho mínimo (5–8 letras).\n' +
      '• Envie no chat uma palavra em inglês: deve começar com esse prefixo, ter pelo menos esse número de letras e só a–z.\n' +
      '• Exemplo: prefixo "re", mín. 6 letras → "return", "really" ✅; "red" (curta) ou "re-use" (símbolo) ❌.\n' +
      '• Até 30 s por rodada; o primeiro a acertar ganha e encerra a rodada na hora. Se ninguém acertar, a rodada termina aos 30 s.\n' +
      '• Após cada rodada: «Próxima em 10 s»; 10 segundos depois a próxima começa automaticamente. As perguntas variam.\n\n' +
      '🏆 Sem pontuação total; cada rodada é independente.',
    word_bomb:
      '💣 Revezamento Palavra Bomba\n' +
      'Passe a bomba com cadeias de palavras.\n\n' +
      'Jogadores: até 8.\n\n' +
      'Regras:\n' +
      '1) O bot dá a primeira palavra.\n' +
      '2) O próximo deve começar com a última letra da anterior.\n' +
      '3) Cada um tem 6 segundos. Tempo esgotado = boom e eliminação.\n' +
      '4) O último sobrevivente ganha.',
    dice_guess:
      '🎲 Quantos Pontos\n' +
      'Aposte pontos no resultado do dado.\n\n' +
      'Jogadores: 2–10.\n\n' +
      'Regras:\n' +
      '1) 20 segundos para apostar pelos botões.\n' +
      '2) Tipos: ímpar/par, pares ou número exato.\n' +
      '3) Acerto ganha pontos, erro perde.\n' +
      '4) Ranking após cada rodada.',
    anonymous:
      '💌 Carta Anônima\n' +
      'Compartilhe sem se revelar.\n\n' +
      'Fluxo:\n' +
      '1) Escolha um tema ou crie o seu.\n' +
      '2) Entre pelo link e envie sua mensagem no privado.\n' +
      '3) O bot repassa anonimamente ao grupo.\n',
    werewolf:
      '🐺 Lobisomem (Werewolf)\n' +
      'À noite todos fecham os olhos — quem é o lobo na vila?\n\n' +
      '👥 Recomendado: 6–12 jogadores\n' +
      '✅ Motor completo em versão futura.',
    avalon:
      '🛡️ Avalon\n\n' +
      'Bem contra o mal em uma batalha de pura lógica — ninguém é eliminado!\n\n' +
      '👥 Jogadores: 5–10\n\n' +
      '📖 Como jogar\n' +
      '1. Papéis secretos: o Bot envia os papéis por DM. Bem (Merlin, Percival, leais) vs Mal (Morgana, Assassino, lacaios). Merlin sabe quem é do mal mas não pode se revelar!\n' +
      '2. Montar a equipe: 📍 O líder escolhe quem vai à missão (o líder roda a cada rodada).\n' +
      '3. Votação da equipe: 📍 Todos votam [Aprovar / Rejeitar] no grupo.\n' +
      '4. Missão: 📍 Os da equipe votam [Sucesso] ou [Falha] no privado com o Bot. Um voto falha pode afundar a missão!\n\n' +
      '🏆 Vitória\n' +
      '• Vence o lado que completar 3 missões com sucesso primeiro.\n' +
      '• Reviravolta do Assassino: mesmo que o Bem vença, o Assassino pode adivinhar quem é Merlin e «assassiná-lo» — o Mal rouba a vitória! 🗡️',
    bunker:
      '🛡️ Bunker\n\n' +
      'Jogo de dedução social e debate em cenário pós-apocalíptico. Não há "bons" ou "maus" fixos — só quem convence o grupo a deixá-lo sobreviver.\n\n' +
      '📖 Contexto\n' +
      'A Terra sofre uma catástrofe (zumbis, guerra nuclear, asteroide). Os sobreviventes encontram um bunker, mas a capacidade é limitada (ex.: 8 jogadores, bunker 4).\n\n' +
      '🪪 Mecânica: cartas de identidade\n' +
      'No início o Bot envia por DM a cada um um "perfil" aleatório. São secretos para os outros.\n\n' +
      '🔄 Fluxo (por rodadas)\n' +
      '1. Catástrofe: o Bot anuncia o tipo e a capacidade (ex.: "Vazamento nuclear, bunker 4/8").\n' +
      '2. Primeira rodada: todos revelam só "profissão" e "idade/sexo" no grupo. 3 min de debate ("Sou médico!", "Sou pedreiro, conserto o bunker!").\n' +
      '3. Primeira votação: o Bot abre votação; o mais votado é expulso e as cartas dele são reveladas.\n' +
      '4. Rodadas seguintes: a cada rodada revela-se mais um traço (saúde, bagagem). O "médico" pode ter "câncer terminal" e a mesa vira.\n' +
      '5. Cartas de ação: um jogador em risco pode mandar DM ao Bot para jogar uma ação (ex. "Troco meu câncer pela saúde do 3"); o Bot anuncia no grupo.\n' +
      '6. Fim: quando os sobreviventes igualam a capacidade do bunker, o jogo termina. Quem sobrou ganha.',
    alias:
      '🎩 Alias\n\n' +
      'Jogo de equipe rápido que testa expressão e sintonia. Espere descrições "geniais" e colegas "perdidos".\n\n' +
      '📖 Preparação\n' +
      'Jogadores clicam em Pronto na sala; o Bot divide em duas equipes (🔴 Vermelho e 🔵 Azul).\n\n' +
      '🔄 Fluxo (rodadas cronometradas)\n' +
      'Início do turno: o Bot anuncia "Turno da equipe 🔴 Vermelho!" e escolhe o jogador A como Explicador.\n' +
      'Palavra por DM: o Bot manda ao Explicador uma palavra por DM (ex.: "geladeira").\n' +
      '60 segundos: o Explicador descreve a palavra no grupo; 🔴 Vermelho adivinha no chat. 🔵 Azul só assiste e não pode responder.\n' +
      'Exemplo: jogador A no chat: "Na cozinha! Grande! Esfria!" — Vermelho 1: "Ar-condicionado!" Vermelho 2: "Freezer!" Vermelho 3: "Geladeira!"\n' +
      'Pontuação: assim que uma mensagem de Vermelho bater com a palavra, o Bot soma: ✅ Correto! Vermelho +1. Próxima palavra enviada! O Bot manda ao Explicador a próxima (ex. "astronauta") e repete até o tempo acabar.\n' +
      'Troca: aos 60 s o Bot faz a contagem; turno de 🔵 Azul com seu Explicador. Mesmo fluxo.\n' +
      'Fim: vence a primeira equipe a atingir a pontuação alvo (ex. 30).\n\n' +
      '🚫 Regras (anticheat)\n' +
      'Não usar a raiz: se a palavra for "geladeira", não pode usar "gel" ou "geladeira" na descrição.\n' +
      'Não traduzir: não dar a palavra em outro idioma (ex. não "Refrigerator" como dica).\n' +
      'Falta: o Bot verifica cada mensagem do Explicador. Se detectar a raiz, anula a palavra e avisa no grupo: ❌ Explicador usou a raiz! Palavra anulada, -1 ponto. Próxima palavra enviada.',
  },
  wordTest: {
    chooseRounds: '🔤 Mestre do Vocabulário: escolha o número de rodadas (5 / 8 / 10 / 12):',
    finished: '🎉 Mestre do Vocabulário encerrado! Obrigado por jogar.',
    roundPrompt: (current: number, total: number, prefix: string, minLen: number) =>
      `Rodada ${current}/${total}\nEnvie uma palavra que comece com "${prefix}", pelo menos ${minLen} letras, só a–z.\n⏱ Tempo: 30 segundos`,
    hint10s: '⏰ Faltam 10 segundos!',
    hint5s: '⏰ Faltam 5 segundos!',
    timeoutNoWinner: '⏱ Tempo. Ninguém acertou.',
    winner: (user: string, word: string) => `🥇 ${user} respondeu primeiro: "${word}"`,
    nextRoundIn10s: '⏱ Próxima rodada em 10 segundos.',
    nextRoundIn5s: '⏱ Próxima rodada em 5 segundos.',
    rankingTitle: '📊 Ranking (acertos)',
    rankingLine: (name: string, count: number) => `• ${name} — ${count}`,
    rankingNobody: '(Ninguém acertou)',
  },
  wordBomb: {
    chooseRounds: '💣 Revezamento Palavra Bomba. Escolha o número de rodadas:',
    joinOpen:
      '💣 Inscrições abertas! Envie qualquer mensagem para entrar (máx. 8). O jogo começa em 25 segundos.',
    notEnoughPlayers: 'Jogadores insuficientes. Jogo cancelado.',
    roundStart: (round: number, total: number, order: string, startWord: string) =>
      `Rodada ${round}/${total}\nOrdem: ${order}\nPalavra inicial: 💣 ${startWord}`,
    mustStartWith: (letter: string) => `Sua palavra deve começar com "${letter}".`,
    turnPrompt: (name: string) => `Vez: 📍${name}. Você tem 6 segundos para enviar uma palavra.`,
    timeoutOut: (name: string) => `${name} 💣 boom! Você está fora.`,
    gameOverWinner: (name: string) => `Fim! Vencedor: ${name}`,
    gameOverNoWinner: 'Todos eliminados. Sem vencedor.',
  },
  dice: {
    chooseRounds: '🎲 Adivinha o Dado. Escolha o número de rodadas:',
    joinOpen:
      '🎲 Inscrições abertas! Envie qualquer mensagem para entrar (2–10). Começa em 20 segundos. Todos começam com 20 pontos.',
    notEnoughPlayers: 'Jogadores insuficientes. Jogo cancelado.',
    gameStart: 'Adivinha o Dado começou!',
    roundBetPrompt: (current: number, total: number) => `Rodada ${current}/${total}\nFaça suas apostas!`,
    notInGame: 'Você não está no jogo atual.',
    notEnoughScore: 'Pontos insuficientes para essa aposta.',
    gameFinishedRanking: (rankingLines: string) => `Jogo encerrado! Ranking:\n${rankingLines}`,
    rollResultRanking: (die: number, rankingLines: string) =>
      `🎲 Dado: ${die}\nRanking:\n${rankingLines}`,
  },
  anonymous: {
    chooseTopic: '✉️ Carta Anônima. Escolha um tema ou crie o seu:',
    topicRel: 'Relacionamentos',
    topicJob: 'Trabalho',
    topicFriend: 'Amizade',
    topicCustom: 'Tema personalizado',
    askCustomTopic: 'Envie uma linha com seu tema.',
    invalidLink: 'Link inválido.',
    notActive: 'Esse tema anônimo não está ativo no grupo agora.',
    privateIntro: (topic: string) => `Você pode enviar uma mensagem anônima sobre: "${topic}". Digite sua mensagem.`,
    groupTopicLink: (topic: string, link: string) =>
      `Tema anônimo: "${topic}".\nAbra este link para enviar uma mensagem anônima:\n${link}`,
    forwarded: (topic: string, text: string) => `✉️ Mensagem anônima sobre "${topic}":\n${text}`,
  },
  undercover: {
    joinSuccess: 'Você entrou. Aguardando o início do jogo.',
    joinSuccessWithReturnLink: (groupLink: string) =>
      `Você entrou. Aguardando o início do jogo.\nVoltar ao grupo 👉 <a href="${groupLink}">Clique aqui</a>`,
    countdown20s: '⏱ Inscrições fecham em 20 s',
    countdown10s: '⏱ Inscrições fecham em 10 s',
    countdown5s: '⏱ Inscrições fecham em 5 s',
    yourWordCivilian: (word: string) => `Sua palavra: ${word}`,
    yourWordUndercover: (word: string) => `Você é o infiltrado! Sua palavra (diferente): ${word}`,
    gameStartCivilian: (word: string) => `Jogo começou! Sua palavra: ${word}`,
    gameStartUndercover: (word: string) => `Jogo começou! Sua palavra: ${word}`,
    blankWord: '(Em branco)',
    blankCivilianMessage: 'Jogo começou! Nesta rodada você não tem palavra (em branco).',
    blankUndercoverMessage: 'Jogo começou! Nesta rodada você não tem palavra (em branco).',
    speakingOrder: (order: string) => `Ordem de fala:\n${order}`,
    speakingOrderSuffix: ' > 45 s discussão livre > votação',
    nowSpeaking: (name: string) => `Falando agora: 📍${name}`,
    speakButtonHint: '👇 Não toque no botão se não for sua vez❗️❗️❗️',
    btnEndSpeak: 'Encerrar',
    btnEndRound: 'Encerrar rodada',
    btnEndGame: '🛑 Encerrar jogo',
    freeTalk: '45 segundos de discussão livre!',
    votePrompt: 'Vote no suspeito:',
    eliminated: (name: string) => `💀 ${name} foi eliminado!`,
    civiliansWin: '🏆 Vitória dos civis! Todos os infiltrados foram eliminados, esta partida terminou.',
    undercoverWins: '🏆 Vitória dos infiltrados! O número de infiltrados agora é maior ou igual ao de civis, esta partida terminou.',
    nextRound: 'Próxima rodada',
    joinStartText: (link: string, min: number, max: number, seconds: number) =>
      `🎭 Infiltrado vai começar!\nToque para entrar (chat privado):\n${link}\n\nJogadores: ${min}–${max}. Você tem ${seconds} segundos.`,
    joinClosed: 'Não estamos mais aceitando jogadores.',
    linkExpiredGameStarted: 'O jogo já começou. Este link não é mais válido.',
    linkExpiredRoomFull: (max) => `A sala está cheia (máx. ${max} jogadores). Este link não é mais válido.`,
    maxPlayers: 'Máximo de jogadores atingido.',
    startCancelled: 'Jogadores insuficientes. Jogo não começou — chame amigos!',
    startAnnounce: (count: number) => `Infiltrado começou! Jogadores: ${count}.`,
    voteDone: (name: string) => `Você votou em ${name}`,
    votingEnded: 'Votação encerrada.',
    notVotingNow: 'Não é hora de votar.',
    notInThisGame: 'Você não está neste jogo.',
    invalidVoteTarget: 'Você não pode votar nesse jogador.',
    noVotesRetry: 'Nenhum voto foi registrado. Esta partida terminou.',
    speakTimeoutHint25: '⏱ 25s para terminar de falar',
    speakTimeoutHint10: '⏱ 10s para terminar de falar',
    freeTalkTimeoutHint45: '⏱ 45s para terminar a discussão livre',
    freeTalkTimeoutHint20: '⏱ 20s para terminar a discussão livre',
    freeTalkTimeoutHint10: '⏱ 10s para terminar a discussão livre',
    voteTimeoutHint12: '⏱ 12s para terminar a votação',
    tallyHeader: (roomId) => `🎪 Sala ${roomId}`,
    tallyTitle: '🗳 Resultado da votação:',
    tallyLine: (name, count, voters) => `${name}  ${count} voto(s) <<< ${voters}`,
    noVotesInTally: '(Sem votos)',
    roomFull: (used: number, max: number) => `Salas de Infiltrado cheias: ${used}/${max}. Tente mais tarde.`,
    currentRoomPlayers: (roomId: number, count: number, names: string) => `🎪 Sala ${roomId} jogadores: ${count} — ${names}`,
    roundEnded: 'Esta rodada já terminou.',
  },
  bunker: {
    alreadyJoined: 'Você já entrou.',
    roomFull: 'A sala está cheia.',
    linkExpiredRoomFull: (max: number) => `A sala está cheia (máx. ${max} jogadores). Este link não é mais válido.`,
    joinSuccess: 'Você entrou no Bunker. Aguarde o início no grupo.',
    currentPlayers: (roomId: number, count: number, names: string) => `🎪 Sala ${roomId} jogadores: ${count} — ${names}`,
    game_start: '🚨 <b>Aviso! Desastre Global!</b>\n\n%disaster%\n\nO bunker só suporta <b>%capacity%</b> pessoas. Rodada 1! Revele sua profissão.',
    phase_debate: '🗣 <b>Fase de Debate!</b> Revele sua próxima característica! 2 minutos.',
    phase_voting: '🗳 <b>Votação!</b> Quem será expulso? Escolha:',
    player_kicked: '💀 <b>%name%</b> foi expulso. Perfil secreto: %traits%',
    game_over: '🎉 <b>Fim de Jogo!</b> Portas trancadas. Sobreviventes: %winners%.',
    your_card: '🎫 <b>SEU DOSSIÊ (Segredo!):</b>\nProfissão: %profession%\nSaúde: %health%\nInventário: %inventory%\nFobia: %phobia%',
    disasters: ['Apocalipse Zumbi.', 'Guerra Nuclear.', 'Meteoro gigante.'],
    professions: ['Cirurgião', 'Comediante', 'Programador', 'Encanador', 'Político'],
    health: ['Saúde Perfeita', 'Asma', 'Alergia', 'Câncer Terminal'],
    inventory: ['Kit de Primeiros Socorros', 'Vodka', 'Motosserra', 'Violão'],
    phobias: ['Claustrofobia', 'Medo do Escuro', 'Aracnofobia', 'Hemofobia'],
    orderHeader: (roomId, orderLine) => `🎪 【 📍 Sala #${roomId} 】\nOrdem:\n📍 ${orderLine} > 45s debate > votação`,
    currentSpeaker: (name) => `Falando: 📍 ${name}\n❗️Só esta pessoa pode tocar.`,
    notYourTurn: '🤡 Te enganei, clicar não adianta! 😂 Haha 🤣!!!',
    btnEndSpeak: 'Encerrar',
    freetalkTitle: '🗣 45 segundos de debate livre!',
    btnEndRound: 'Encerrar rodada',
    votePromptTimer: (seconds) => `🗳 Vote para eliminar (${seconds}s):`,
    voteEliminateLabel: 'Eliminar',
    voteUpdated: (emoji, name) => `✅ Voto atualizado! Você votou em ${emoji} ${name}`,
    btnEndGame: '🛑 Encerrar jogo',
    tallyHeader: (roomId) => `🎪 【 📍 Sala #${roomId} 】`,
    tallyTitle: '🗳 Resultado:',
    tallyLine: (name, count, voters) => `${name}  ${count} voto(s) <<< ${voters}`,
    noVotesInTally: '(Sem votos)',
    gameForceEnded: 'Jogo encerrado a pedido.',
    emojiPoolExhausted: 'Pool de emojis esgotado. Jogo encerrado.',
    alreadyEnded: 'Encerrado',
  },
  alias: {
    alreadyJoined: 'Você já entrou.',
    linkExpiredRoomFull: (max: number) => `A sala está cheia (máx. ${max} jogadores). Este link não é mais válido.`,
    joinSuccess: 'Você entrou. Aguarde o início no grupo.',
    currentPlayers: (roomId: number, count: number, names: string) => `🎪 Sala ${roomId} jogadores: ${count} — ${names}`,
    turn_start: '🔥 <b>Turno da Equipe %team%!</b>\n@%explainer% está explicando. Adivinhem no chat!\n⏱ 60 segundos!',
    correct_guess: '✅ <b>Bingo!</b> @%guesser% acertou! Equipe %team% +1 ponto!\nNova palavra enviada.',
    foul_warning: '❌ <b>Falta!</b> @%explainer% usou a palavra raiz! -1 ponto.',
    round_end: '🛑 <b>Tempo esgotado!</b> Placar: Vermelho (%scoreA%) - Azul (%scoreB%).',
    game_over: '🏆 <b>Fim de Jogo!</b> Equipe %winner% venceu!',
    your_word: '🤫 Sua palavra: <b>%word%</b>. (Não use a palavra raiz!)',
    words: ['Astronauta', 'Geladeira', 'Alienígena', 'Dinossauro', 'Arranha-céu', 'Helicóptero'],
  },
};
