export const esTexts = {
  i18n: {
    chooseLanguage: 'Elige tu idioma',
    back: '🔙 Atrás',
  },
  mainMenu: {
    welcome: 'Bienvenido a @playplayggbot — ¡a jugar!',
    btnUndercover: 'Infiltrado',
    btnWerewolf: 'Hombre Lobo',
    btnAvalon: 'Avalon',
    btnWordTest: 'Test de Palabras',
    btnWordBomb: 'Relevo Palabra Bomba',
    btnDiceGuess: 'Adivina el Dado',
    btnAnonymous: 'Carta Anónima',
    btnBunker: 'Búnker',
    btnAlias: 'Alias',
    btnCancel: 'Cancelar',
    cancelAnswer: 'Vale, me quedo en segundo plano. ¿Quieres jugar? Envía /playgg.',
    usePlayggForLatestMenu: 'Este menú está desactualizado. Envía /playgg para abrir el menú actual.',
    privatePlayggHint: '🎮 Añádeme a tu grupo y envía /playgg allí para empezar a jugar.',
    groupUsePlaygg: '👉 En el grupo usa /playgg para abrir el menú de juegos.',
    btnLanguage: '🌐 Idioma',
  },
  errors: {
    generic: '⚠️ Algo salió mal. Inténtalo más tarde.',
  },
  common: {
    onlyGroups: 'Este juego está disponible solo en grupos.',
    otherGameRunning: 'Ya hay otro juego en marcha en este grupo.',
    btnStartGame: '▶ Iniciar juego',
    btnStartRecruit: '🚀 Iniciar reclutamiento aquí',
    roomFull: (used: number, max: number) => `Salas llenas: ${used}/${max}. Intenta más tarde.`,
    roomClosedOrNotFound: 'Esta sala está cerrada o no existe.',
    linkExpiredGameStarted: 'La partida ya ha empezado. Este enlace ya no es válido.',
    roomLabel: (roomId: number) => `🎪 Sala ${roomId}`,
  },
  groupWelcome: {
    title: '🎮 Bienvenido a @playplayggbot',
    intro: 'Juega Infiltrado, Palabra Bomba, Dados y más. Envía /playgg para abrir el menú.',
    separator: '—————————————',
    partners: 'Nuestros socios: Blink — ¡más chat y juegos!',
  },
  growth: {
    ctaText: 'Prueba nuestra app Blink — ¡más chat y más juegos!',
    ctaButton: 'Abrir Blink',
  },
  intro: {
    undercover:
      '🕵️ ¿Quién es el Espía (Who is the Spy)\n' +
      'Un juego de lógica y nervios a tope: ¿quién está mintiendo?\n' +
      '👥 Jugadores: 5–12\n' +
      '🕹 Flujo de juego:\n' +
      '  1. Recibir palabra: Toca el enlace para hablar en privado con el bot y conseguir tu palabra secreta. Ojo: la palabra del espía es ligeramente diferente a la de los demás. 🤫\n' +
      '  2. Turnos de palabra: Según el orden que marca el bot, describe tu palabra. Cada jugador tiene 25 segundos; ¡no digas la palabra directamente!\n' +
      '  3. Debate libre: 📍 45 segundos de discusión libre para cazar al que tiene la coartada más débil.\n' +
      '  4. Votación pública: Pulsa tu emoji exclusivo / envía el emoji correspondiente en el chat para votar al sospechoso, tienes 12 segundos.\n' +
      '❌ Importante: si nadie vota, la partida termina automáticamente.\n' +
      '🎭 Configuración de roles:\n' +
      '  - 5–6 jugadores: 1 espía\n' +
      '  - 7–9 jugadores: 2 espías\n' +
      '  - 10–12 jugadores: 3 espías\n' +
      '🏆 Condiciones de victoria:\n' +
      '🟢 Victoria de los civiles: descubrir y eliminar a todos los espías.\n' +
      '🔴 Victoria de los espías: mantener el disfraz hasta el final; cuando el número de espías es mayor o igual que el de civiles, ganan los espías.',
    word_test:
      '✍️ Maestro del Vocabulario (Word Test)\n\n' +
      'Pon a prueba vocabulario y velocidad: ¿quién escribe antes una palabra válida?\n\n' +
      '👥 Jugadores: todos en el grupo (sin inscripción).\n\n' +
      '📖 Reglas\n' +
      '• Cada ronda el bot da un prefijo (ej. re, co, in) y longitud mínima (5–8 letras).\n' +
      '• Escribe en el chat una palabra en inglés: debe empezar por ese prefijo, tener al menos esas letras y solo a–z.\n' +
      '• Ejemplo: prefijo "re", mín. 6 letras → "return", "really" ✅; "red" (corta) o "re-use" (símbolo) ❌.\n' +
      '• Hasta 30 s por ronda; el primero en acertar gana y termina la ronda al instante. Si nadie acierta, la ronda termina a los 30 s.\n' +
      '• Tras cada ronda: «Siguiente ronda en 10 s»; a los 10 segundos empieza la siguiente automáticamente. Las preguntas varían.\n\n' +
      '🏆 No hay puntuación total; cada ronda es independiente.',
    word_bomb:
      '💣 Relevo Palabra Bomba\n' +
      'Pasa la bomba con cadenas de palabras.\n\n' +
      'Jugadores: hasta 8.\n\n' +
      'Reglas:\n' +
      '1) El bot da la primera palabra.\n' +
      '2) El siguiente debe empezar su palabra con la última letra de la anterior.\n' +
      '3) Cada jugador tiene 6 segundos. Tiempo = boom y eliminación.\n' +
      '4) El último superviviente gana.',
    dice_guess:
      '🎲 Cuántos Puntos\n' +
      'Apuesta puntos en el resultado del dado.\n\n' +
      'Jugadores: 2–10.\n\n' +
      'Reglas:\n' +
      '1) 20 segundos para apostar con los botones.\n' +
      '2) Tipos: par/impar, parejas o número exacto.\n' +
      '3) Acierto suma puntos, fallo resta.\n' +
      '4) Se muestra la clasificación tras cada ronda.',
    anonymous:
      '💌 Carta Anónima\n' +
      'Comparte tus ideas sin revelarte.\n\n' +
      'Flujo:\n' +
      '1) Elige un tema o crea el tuyo.\n' +
      '2) Únete por enlace y envía tu mensaje en privado.\n' +
      '3) El bot lo reenvía anónimamente al grupo.\n',
    werewolf:
      '🐺 Hombre Lobo (Werewolf)\n' +
      'De noche todos cierran los ojos — ¿quién es el lobo en la aldea?\n\n' +
      '👥 Recomendado: 6–12 jugadores\n' +
      '✅ Motor completo en una versión futura.',
    avalon:
      '🛡️ Avalon\n\n' +
      '¡El bien contra el mal en una batalla de pura lógica, sin eliminaciones!\n\n' +
      '👥 Jugadores: 5–10\n\n' +
      '📖 Cómo se juega\n' +
      '1. Roles ocultos: el Bot asigna roles por DM. Bien (Merlín, Percival, leales) vs Mal (Morgana, Asesino, esbirros). Merlín sabe quién es malo pero no puede delatarse.\n' +
      '2. Formar equipo: 📍 El líder elige quiénes van a la misión (el líder rota cada ronda).\n' +
      '3. Votación del equipo: 📍 Todos votan [Aprobar / Rechazar] en el grupo.\n' +
      '4. Misión: 📍 Los del equipo votan [Éxito] o [Fallo] en privado con el Bot. ¡Un voto fallo hunde la misión!\n\n' +
      '🏆 Victoria\n' +
      '• Gana el bando que complete 3 misiones con éxito primero.\n' +
      '• Golpe del Asesino: aunque gane el Bien, el Asesino puede adivinar quién es Merlín y «asesinarlo» — ¡el Mal se lleva la victoria! 🗡️',
    bunker:
      '🛡️ Búnker\n\n' +
      'Juego de deducción social y debate en un escenario apocalíptico. No hay "buenos" o "malos" fijos, solo quién convence al grupo para sobrevivir.\n\n' +
      '📖 Contexto\n' +
      'La Tierra sufre una catástrofe (virus zombi, guerra nuclear, asteroide). Los supervivientes encuentran un búnker, pero tiene plazas limitadas (ej.: 8 jugadores, búnker 4).\n\n' +
      '🪪 Mecánica: cartas de identidad\n' +
      'Al inicio el Bot envía por DM a cada uno un "perfil" aleatorio. Son secretos para el resto.\n\n' +
      '🔄 Flujo (por rondas)\n' +
      '1. Catástrofe: el Bot anuncia el tipo y la capacidad (ej.: "Fuga nuclear, búnker 4/8").\n' +
      '2. Primera ronda: todos revelan solo "profesión" y "edad/sexo" en el grupo. 3 min de debate ("¡Soy médico!", "¡Soy constructor, arreglo el búnker!").\n' +
      '3. Primera votación: el Bot abre votación; el más votado sale y se revelan sus cartas.\n' +
      '4. Rondas siguientes: en cada ronda se revela un rasgo más (salud, equipaje). El "médico" puede tener "cáncer terminal" y la mesa se vuelve contra él.\n' +
      '5. Cartas de acción: un jugador en riesgo puede escribir al Bot por DM para jugar una acción (ej. "Intercambio mi cáncer con la salud del 3"); el Bot lo anuncia en el grupo.\n' +
      '6. Fin: cuando los supervivientes igualan la capacidad del búnker, el juego termina. Los que quedan ganan.',
    alias:
      '🎩 Alias\n\n' +
      'Juego de equipo rápido que prueba expresión y coordinación. Espera descripciones "geniales" y compañeros "despistados".\n\n' +
      '📖 Preparación\n' +
      'Los jugadores pulsan Listo en la sala; el Bot los divide en dos equipos (🔴 Rojo y 🔵 Azul).\n\n' +
      '🔄 Flujo (rondas con tiempo)\n' +
      'Inicio de turno: el Bot anuncia "¡Turno del equipo 🔴 Rojo!" y elige al jugador A como Explicador.\n' +
      'Palabra por DM: el Bot manda al Explicador una palabra por DM (ej.: "nevera").\n' +
      '60 segundos: el Explicador describe la palabra en el grupo; 🔴 Rojo adivina en el chat. 🔵 Azul solo observa y no puede responder.\n' +
      'Ejemplo: jugador A en el chat: "¡En la cocina! ¡Grande! ¡Enfría!" — Rojo 1: "¡Aire acondicionado!" Rojo 2: "¡Congelador!" Rojo 3: "¡Nevera!"\n' +
      'Puntuación: en cuanto un mensaje de Rojo coincida con la palabra, el Bot suma: ✅ ¡Correcto! Rojo +1. ¡Siguiente palabra enviada! El Bot manda al Explicador la siguiente (ej. "astronauta") y así hasta que se acaba el tiempo.\n' +
      'Cambio: a los 60 s el Bot hace el recuento; turno de 🔵 Azul con su Explicador. Mismo flujo.\n' +
      'Fin: gana el primer equipo que llegue a la puntuación objetivo (ej. 30).\n\n' +
      '🚫 Reglas (anticheat)\n' +
      'No usar la raíz: si la palabra es "nevera", no se puede usar "never" ni "nevera" en la descripción.\n' +
      'No traducir: no dar la palabra en otro idioma (ej. no "Refrigerator" como pista).\n' +
      'Falta: el Bot comprueba cada mensaje del Explicador. Si detecta la raíz, anula la palabra y avisa en el grupo: ❌ ¡El Explicador usó la raíz! Palabra anulada, -1 punto. Siguiente palabra enviada.',
  },
  wordTest: {
    chooseRounds: '🔤 Maestro del Vocabulario: elige rondas (5 / 8 / 10 / 12):',
    finished: '🎉 ¡Maestro del Vocabulario terminado! Gracias por jugar.',
    roundPrompt: (current: number, total: number, prefix: string, minLen: number) =>
      `Ronda ${current}/${total}\nEscribe una palabra que empiece por "${prefix}", al menos ${minLen} letras, solo a–z.\n⏱ Tiempo: 30 segundos`,
    hint10s: '⏰ ¡Quedan 10 segundos!',
    hint5s: '⏰ ¡Quedan 5 segundos!',
    timeoutNoWinner: '⏱ Tiempo. Nadie acertó.',
    winner: (user: string, word: string) => `🥇 ${user} acertó primero: "${word}"`,
    nextRoundIn10s: '⏱ Siguiente ronda en 10 segundos.',
    nextRoundIn5s: '⏱ Siguiente ronda en 5 segundos.',
    rankingTitle: '📊 Ranking (aciertos)',
    rankingLine: (name: string, count: number) => `• ${name} — ${count}`,
    rankingNobody: '(Nadie acertó)',
  },
  wordBomb: {
    chooseRounds: '💣 Relevo Palabra Bomba. Elige número de rondas:',
    joinOpen:
      '💣 ¡Inscripción abierta! Envía cualquier mensaje para unirte (máx. 8). El juego empieza en 25 segundos.',
    notEnoughPlayers: 'No hay suficientes jugadores. Partida cancelada.',
    roundStart: (round: number, total: number, order: string, startWord: string) =>
      `Ronda ${round}/${total}\nOrden: ${order}\nPalabra inicial: 💣 ${startWord}`,
    mustStartWith: (letter: string) => `Tu palabra debe empezar por "${letter}".`,
    turnPrompt: (name: string) => `Turno: 📍${name}. Tienes 6 segundos para enviar una palabra.`,
    timeoutOut: (name: string) => `${name} 💣 ¡boom! Estás fuera.`,
    gameOverWinner: (name: string) => `¡Fin! Ganador: ${name}`,
    gameOverNoWinner: 'Todos eliminados. Sin ganador.',
  },
  dice: {
    chooseRounds: '🎲 Adivina el Dado. Elige número de rondas:',
    joinOpen:
      '🎲 ¡Inscripción abierta! Envía cualquier mensaje para unirte (2–10). Empieza en 20 segundos. Todos empiezan con 20 puntos.',
    notEnoughPlayers: 'No hay suficientes jugadores. Partida cancelada.',
    gameStart: '¡Adivina el Dado ha empezado!',
    roundBetPrompt: (current: number, total: number) => `Ronda ${current}/${total}\n¡Coloca tus apuestas!`,
    notInGame: 'No estás en la partida actual.',
    notEnoughScore: 'No tienes suficientes puntos para esa apuesta.',
    gameFinishedRanking: (rankingLines: string) => `¡Partida terminada! Clasificación:\n${rankingLines}`,
    rollResultRanking: (die: number, rankingLines: string) =>
      `🎲 Tirada: ${die}\nClasificación:\n${rankingLines}`,
  },
  anonymous: {
    chooseTopic: '✉️ Carta Anónima. Elige un tema o crea el tuyo:',
    topicRel: 'Relaciones',
    topicJob: 'Trabajo',
    topicFriend: 'Amistad',
    topicCustom: 'Tema personalizado',
    askCustomTopic: 'Envía una línea con tu tema.',
    invalidLink: 'Enlace no válido.',
    notActive: 'Ese tema anónimo no está activo en el grupo ahora.',
    privateIntro: (topic: string) => `Puedes enviar un mensaje anónimo sobre: "${topic}". Escribe tu mensaje.`,
    groupTopicLink: (topic: string, link: string) =>
      `Tema anónimo: "${topic}".\nAbre este enlace para enviar un mensaje anónimo:\n${link}`,
    forwarded: (topic: string, text: string) => `✉️ Mensaje anónimo sobre "${topic}":\n${text}`,
  },
  undercover: {
    joinSuccess: 'Te has unido. Espera a que empiece la partida.',
    joinSuccessWithReturnLink: (groupLink: string) =>
      `Te has unido. Espera a que empiece la partida.\nVolver al grupo 👉 <a href="${groupLink}">Haz clic aquí</a>`,
    countdown20s: '⏱ Cierre de inscripción en 20 s',
    countdown10s: '⏱ Cierre de inscripción en 10 s',
    countdown5s: '⏱ Cierre de inscripción en 5 s',
    yourWordCivilian: (word: string) => `Tu palabra: ${word}`,
    yourWordUndercover: (word: string) => `¡Eres el infiltrado! Tu palabra (distinta): ${word}`,
    gameStartCivilian: (word: string) => `¡Partida empezada! Tu palabra: ${word}`,
    gameStartUndercover: (word: string) => `¡Partida empezada! Tu palabra: ${word}`,
    blankWord: '(En blanco)',
    blankCivilianMessage: '¡Partida empezada! Esta ronda no tienes palabra (en blanco).',
    blankUndercoverMessage: '¡Partida empezada! Esta ronda no tienes palabra (en blanco).',
    speakingOrder: (order: string) => `Orden de turnos:\n${order}`,
    speakingOrderSuffix: ' > 45 s debate libre > votación',
    nowSpeaking: (name: string) => `Ahora habla: 📍${name}`,
    speakButtonHint: '👇 No pulses el botón si no es tu turno❗️❗️❗️',
    btnEndSpeak: 'Terminar turno',
    btnEndRound: 'Terminar ronda',
    btnEndGame: '🛑 Terminar partida',
    freeTalk: '¡45 segundos de discusión libre!',
    votePrompt: 'Vota al sospechoso:',
    eliminated: (name: string) => `💀 ${name} ha sido eliminado.`,
    civiliansWin: '🏆 ¡Victoria de los civiles! Todos los infiltrados han sido eliminados. Esta partida ha terminado.',
    undercoverWins: '🏆 ¡Victoria del infiltrado! El número de infiltrados es mayor o igual que el de civiles. Esta partida ha terminado.',
    nextRound: 'Siguiente ronda',
    joinStartText: (link: string, min: number, max: number, seconds: number) =>
      `🎭 ¡Infiltrado va a empezar!\nToca para unirte (chat privado):\n${link}\n\nJugadores: ${min}–${max}. Tienes ${seconds} segundos.`,
    joinClosed: 'Ya no se aceptan jugadores.',
    linkExpiredGameStarted: 'La partida ya ha empezado. Este enlace ya no es válido.',
    linkExpiredRoomFull: (max) => `La sala está llena (máx. ${max} jugadores). Este enlace ya no es válido.`,
    maxPlayers: 'Máximo de jugadores alcanzado.',
    startCancelled: 'No hay suficientes jugadores. Partida no empezó — ¡invita a amigos!',
    startAnnounce: (count: number) => `¡Infiltrado empezado! Jugadores: ${count}.`,
    voteDone: (name: string) => `Has votado a ${name}`,
    votingEnded: 'La votación ha terminado.',
    notVotingNow: 'No es el momento de votar.',
    notInThisGame: 'No estás en esta partida.',
    invalidVoteTarget: 'No puedes votar a ese jugador.',
    noVotesRetry: 'No se registró ningún voto. Esta partida ha terminado.',
    speakTimeoutHint25: '⏱ 25s para terminar de hablar',
    speakTimeoutHint10: '⏱ 10s para terminar de hablar',
    freeTalkTimeoutHint45: '⏱ 45s para terminar la discusión libre',
    freeTalkTimeoutHint20: '⏱ 20s para terminar la discusión libre',
    freeTalkTimeoutHint10: '⏱ 10s para terminar la discusión libre',
    voteTimeoutHint12: '⏱ 12s para terminar la votación',
    tallyHeader: (roomId) => `🎪 Sala ${roomId}`,
    tallyTitle: '🗳 Resultado de la votación:',
    tallyLine: (name, count, voters) => `${name}  ${count} voto(s) <<< ${voters}`,
    noVotesInTally: '(Sin votos)',
    roomFull: (used: number, max: number) => `Salas de Infiltrado llenas: ${used}/${max}. Intenta más tarde.`,
    currentRoomPlayers: (roomId: number, count: number, names: string) => `🎪 Sala ${roomId} jugadores: ${count} — ${names}`,
    roundEnded: 'Esta ronda ha terminado.',
  },
  bunker: {
    alreadyJoined: 'Ya te has unido.',
    roomFull: 'La sala está llena.',
    linkExpiredRoomFull: (max: number) => `La sala está llena (máx. ${max} jugadores). Este enlace ya no es válido.`,
    joinSuccess: 'Te uniste al Búnker. Espera el inicio en el grupo.',
    currentPlayers: (roomId: number, count: number, names: string) => `🎪 Sala ${roomId} jugadores: ${count} — ${names}`,
    game_start: '🚨 <b>¡Atención! ¡Catástrofe global!</b>\n\n%disaster%\n\nEl búnker solo tiene capacidad para <b>%capacity%</b>. ¡Empieza la ronda 1! Revela tu profesión.',
    phase_debate: '🗣 <b>¡Fase de debate!</b> ¡Revela tu siguiente rasgo y demuestra tu valía! Tienes 2 min.',
    phase_voting: '🗳 <b>¡Hora de votar!</b> ¿A quién echamos? Elige un jugador:',
    player_kicked: '💀 <b>%name%</b> ha sido expulsado. Perfil secreto: %traits%',
    game_over: '🎉 <b>¡Fin del juego!</b> Puertas selladas. Supervivientes: %winners%.',
    your_card: '🎫 <b>TU DOSSIER (¡Mantenlo en secreto!):</b>\nProfesión: %profession%\nSalud: %health%\nInventario: %inventory%\nFobia: %phobia%',
    disasters: ['Apocalipsis zombi.', 'Guerra nuclear.', 'Impacto de meteorito.'],
    professions: ['Cirujano', 'Comediante', 'Programador', 'Fontanero', 'Político'],
    health: ['Salud perfecta', 'Asma severo', 'Alergia al polvo', 'Cáncer terminal'],
    inventory: ['Botiquín', 'Caja de vodka', 'Motosierra', 'Una guitarra'],
    phobias: ['Claustrofobia', 'Miedo a la oscuridad', 'Aracnofobia', 'Hemofobia'],
    orderHeader: (roomId, orderLine) => `🎪 【 📍 Sala #${roomId} 】\nOrden:\n📍 ${orderLine} > 45s debate > votación`,
    currentSpeaker: (name) => `Habla: 📍 ${name}\n❗️Solo esta persona puede pulsar.`,
    notYourTurn: '🤡 ¡Te engañé, pulsar no sirve! 😂 ¡Jaja! 🤣!!!',
    btnEndSpeak: 'Terminar turno',
    freetalkTitle: '🗣 ¡45 segundos de debate libre!',
    btnEndRound: 'Terminar ronda',
    votePromptTimer: (seconds) => `🗳 Votad para eliminar (${seconds}s):`,
    voteEliminateLabel: 'Eliminar',
    voteUpdated: (emoji, name) => `✅ Voto actualizado. Has votado por ${emoji} ${name}`,
    btnEndGame: '🛑 Terminar partida',
    tallyHeader: (roomId) => `🎪 【 📍 Sala #${roomId} 】`,
    tallyTitle: '🗳 Resultado:',
    tallyLine: (name, count, voters) => `${name}  ${count} voto(s) <<< ${voters}`,
    noVotesInTally: '(Sin votos)',
    gameForceEnded: 'Partida terminada a petición.',
    emojiPoolExhausted: 'Pool de emojis agotado. Partida terminada.',
    alreadyEnded: 'Terminado',
  },
  alias: {
    alreadyJoined: 'Ya te has unido.',
    linkExpiredRoomFull: (max: number) => `La sala está llena (máx. ${max} jugadores). Este enlace ya no es válido.`,
    joinSuccess: 'Te uniste. Espera el inicio en el grupo.',
    currentPlayers: (roomId: number, count: number, names: string) => `🎪 Sala ${roomId} jugadores: ${count} — ${names}`,
    turn_start: '🔥 <b>¡Turno del Equipo %team%!</b>\n@%explainer% explica. ¡Adivinad en el chat!\n⏱ ¡60 segundos!',
    correct_guess: '✅ <b>¡Bingo!</b> ¡@%guesser% acertó! Equipo %team% +1 punto!\nSiguiente palabra enviada.',
    foul_warning: '❌ <b>¡Falta!</b> ¡@%explainer% usó la palabra raíz! -1 punto.',
    round_end: '🛑 <b>¡Tiempo!</b> Puntuación: Rojo (%scoreA%) - Azul (%scoreB%).',
    game_over: '🏆 <b>¡Fin del juego!</b> ¡Gana el Equipo %winner%!',
    your_word: '🤫 Tu palabra: <b>%word%</b>. (¡No uses la palabra raíz!)',
    words: ['Astronauta', 'Refrigerador', 'Extraterrestre', 'Dinosaurio', 'Rascacielos', 'Helicóptero'],
  },
};
