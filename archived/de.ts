export const deTexts = {
  i18n: {
    chooseLanguage: 'Sprache wählen',
    back: '🔙 Zurück',
  },
  mainMenu: {
    welcome: 'Willkommen bei @playplayggbot — lass uns spielen!',
    btnUndercover: 'Undercover',
    btnWerewolf: 'Werwolf',
    btnAvalon: 'Avalon',
    btnWordTest: 'Wörter-Test',
    btnWordBomb: 'Wörter-Bomben-Staffel',
    btnDiceGuess: 'Würfel-Raten',
    btnAnonymous: 'Anonymer Brief',
    btnBunker: 'Bunker',
    btnAlias: 'Alias',
    btnCancel: 'Abbrechen',
    cancelAnswer: 'Alles klar, ich bleib im Hintergrund. Lust auf ein Spiel? Einfach /playgg senden!',
    usePlayggForLatestMenu: 'Dieses Menü ist veraltet. Sende /playgg für das aktuelle Menü.',
    privatePlayggHint: '🎮 Füge mich deiner Gruppe hinzu und sende dort /playgg zum Spielen!',
    groupUsePlaygg: '👉 In der Gruppe /playgg senden, um das Spielmenü zu öffnen.',
    btnLanguage: '🌐 Sprache',
  },
  errors: {
    generic: '⚠️ Etwas ist schiefgelaufen. Bitte später erneut versuchen.',
  },
  common: {
    onlyGroups: 'Dieses Spiel ist nur in Gruppen verfügbar.',
    otherGameRunning: 'In dieser Gruppe läuft bereits ein anderes Spiel.',
    btnStartGame: '▶ Spiel starten',
    btnStartRecruit: '🚀 Rekrutierung hier starten',
    roomFull: (used: number, max: number) => `Spielräume voll: ${used}/${max}. Später erneut versuchen.`,
    roomClosedOrNotFound: 'Dieser Raum ist geschlossen oder existiert nicht.',
    linkExpiredGameStarted: 'Das Spiel hat bereits begonnen. Dieser Link ist nicht mehr gültig.',
    roomLabel: (roomId: number) => `🎪 Raum ${roomId}`,
  },
  groupWelcome: {
    title: '🎮 Willkommen bei @playplayggbot',
    intro: 'Spiele Undercover, Wörter-Bombe, Würfel und mehr. Sende /playgg für das Spielmenü.',
    separator: '—————————————',
    partners: 'Unsere Partner: Blink — mehr Chat und Spiele!',
  },
  growth: {
    ctaText: 'Probier die App Blink — mehr Chat und mehr Spiele!',
    ctaButton: 'Blink öffnen',
  },
  intro: {
    undercover:
      '🕵️ Wer ist der Spion (Who is the Spy)\n' +
      'Nervenaufreibendes Logik‑ und Bluffspiel: Wer lügt?\n' +
      '👥 Spieler: 5–12\n' +
      '🕹 Spielablauf:\n' +
      '  1. Wort erhalten: Klicke auf den Link, schreibe dem Bot privat und bekomme dein geheimes Wort. Achtung: Die Spione bekommen ein leicht anderes Wort als die Zivilisten. 🤫\n' +
      '  2. Reihum sprechen: In der Reihenfolge des Bots beschreibt jeder sein Wort. Jede Person hat 25 Sekunden – das Wort selbst darfst du nicht direkt sagen!\n' +
      '  3. Freie Diskussion: 📍 45 Sekunden, um zu diskutieren und den Spieler mit der wackeligsten Story zu finden.\n' +
      '  4. Öffentliches Voting: Drücke auf dein persönliches Emoji‑Button / sende das passende Emoji im Chat und stimme innerhalb von 12 Sekunden für den Verdächtigsten.\n' +
      '❌ Wichtig: Wenn niemand abstimmt, endet das Spiel automatisch!\n' +
      '🎭 Rollen‑Setup:\n' +
      '  - 5–6 Spieler: 1 Spion\n' +
      '  - 7–9 Spieler: 2 Spione\n' +
      '  - 10–12 Spieler: 3 Spione\n' +
      '🏆 Siegbedingungen:\n' +
      '🟢 Sieg der Zivilisten: Alle Spione werden enttarnt und eliminiert.\n' +
      '🔴 Sieg der Spione: Die Tarnung hält! Sobald die Anzahl der Spione größer oder gleich der Anzahl der Zivilisten ist, gewinnen die Spione.',
    word_test:
      '✍️ Vokabel-Meister (Word Test)\n\n' +
      'Vokabular und Schnelligkeit: Wer tippt zuerst ein gültiges Wort?\n\n' +
      '👥 Spieler: alle in der Gruppe (ohne Anmeldung).\n\n' +
      '📖 Regeln\n' +
      '• Jede Runde gibt der Bot ein Präfix (z. B. re, co, in) und eine Mindestlänge (5–8 Buchstaben).\n' +
      '• Schreibe ein englisches Wort in den Chat: muss mit dem Präfix beginnen, mindestens so viele Buchstaben haben, nur a–z.\n' +
      '• Beispiel: Präfix "re", min. 6 Buchstaben → "return", "really" ✅; "red" (zu kurz) oder "re-use" (Symbol) ❌.\n' +
      '• Bis zu 30 Sekunden pro Runde; erste richtige Antwort gewinnt und beendet die Runde sofort. Wenn niemand antwortet, endet die Runde nach 30 s.\n' +
      '• Nach jeder Runde: „Nächste Runde in 10 s“; nach 10 Sekunden startet die nächste automatisch. Fragen wechseln.\n\n' +
      '🏆 Kein Gesamtstand; jede Runde zählt für sich.',
    word_bomb:
      '💣 Wörter-Bomben-Staffel\n' +
      'Gib die Bombe mit Wortketten weiter.\n\n' +
      'Spieler: bis 8.\n\n' +
      'Regeln:\n' +
      '1) Bot gibt das erste Wort.\n' +
      '2) Nächster Spieler muss mit dem letzten Buchstaben des vorherigen Wortes anfangen.\n' +
      '3) Jeder hat 6 Sekunden. Zeit abgelaufen = Boom und raus.\n' +
      '4) Letzter Überlebender gewinnt.',
    dice_guess:
      '🎲 Wie viele Punkte\n' +
      'Setze Punkte auf das Würfelergebnis.\n\n' +
      'Spieler: 2–10.\n\n' +
      'Regeln:\n' +
      '1) 20 Sekunden zum Setzen per Buttons.\n' +
      '2) Verschiedene Wettarten: gerade/ungerade, Paare oder exakte Zahl.\n' +
      '3) Richtig = Punkte gewinnen, falsch = Punkte verlieren.\n' +
      '4) Ranking nach jeder Runde.',
    anonymous:
      '💌 Anonymer Brief\n' +
      'Teile deine Gedanken ohne dich zu zeigen.\n\n' +
      'Ablauf:\n' +
      '1) Thema wählen oder eigenes erstellen.\n' +
      '2) Per Link beitreten und Nachricht im Privatchat senden.\n' +
      '3) Bot leitet sie anonym in die Gruppe weiter.\n',
    werewolf:
      '🐺 Werwolf (Werewolf)\n' +
      'Nachts alle Augen zu — wer ist der Wolf im Dorf?\n\n' +
      '👥 Empfohlen: 6–12 Spieler\n' +
      '✅ Vollständige Engine in einer späteren Version.',
    avalon:
      '🛡️ Avalon\n\n' +
      'Gut gegen Böse — reine Logik, niemand scheidet aus!\n\n' +
      '👥 Spieler: 5–10\n\n' +
      '📖 Ablauf\n' +
      '1. Geheime Rollen: Der Bot schickt die Rollen per DM. Gut (Merlin, Percival, Getreue) vs Böse (Morgana, Assassine, Schergen). Merlin kennt die Bösen, darf sich aber nicht verraten!\n' +
      '2. Team bilden: 📍 Der Anführer wählt die Missionsteilnehmer (Anführer wechselt jede Runde).\n' +
      '3. Team-Abstimmung: 📍 Alle stimmen in der Gruppe [Zustimmung / Ablehnung] ab.\n' +
      '4. Mission: 📍 Teammitglieder stimmen per DM beim Bot [Erfolg] oder [Fehlschlag] ab. Eine Fehlstimme kann die Mission zunichtemachen!\n\n' +
      '🏆 Sieg\n' +
      '• Die Seite, die zuerst 3 Missionen erfolgreich abschließt, gewinnt.\n' +
      '• Assassinen-Streich: Selbst wenn Gut gewinnt, kann der Assassine Merlin erraten und „ermorden“ — das Böse dreht den Sieg! 🗡️',
    bunker:
      '🛡️ Bunker\n\n' +
      'Soziales Deduktions- und Debattenspiel im Postapokalypse-Setting. Es gibt keine festen "Guten" oder "Bösen" — nur wer die Gruppe überzeugt, ihn überleben zu lassen.\n\n' +
      '📖 Hintergrund\n' +
      'Die Erde wurde von einer Katastrophe getroffen (z. B. Zombies, Atomkrieg, Asteroid). Überlebende finden einen Bunker, aber der hat begrenzte Kapazität (z. B. 8 Spieler, Bunker 4).\n\n' +
      '🪪 Mechanik: Identitätskarten\n' +
      'Zu Beginn schickt der Bot jedem per DM ein zufälliges "Profil". Für andere geheim.\n\n' +
      '🔄 Ablauf (rundenbasiert)\n' +
      '1. Katastrophe: Der Bot kündigt Typ und Kapazität an (z. B. "Atomleck, Bunker 4/8").\n' +
      '2. Erste Runde: Alle offenbaren nur "Beruf" und "Alter/Geschlecht" in der Gruppe. 3 Min. freie Debatte ("Ich bin Arzt!", "Ich bin Bauarbeiter, ich repariere den Bunker!").\n' +
      '3. Erste Abstimmung: Der Bot startet die Abstimmung; der mit den meisten Stimmen fliegt raus, seine Karten werden aufgedeckt.\n' +
      '4. Weitere Runden: Jede Runde wird ein weiteres Merkmal offengelegt (Gesundheit, Gepäck). Der "Arzt" kann "unheilbar krank" sein — die Stimmung kippt.\n' +
      '5. Aktionskarten: Ein Spieler in Gefahr kann dem Bot per DM eine Aktion spielen (z. B. "Ich tausche meine Krankheit mit Spieler 3"); der Bot kündigt es in der Gruppe an.\n' +
      '6. Ende: Wenn die Überlebenden der Bunker-Kapazität entsprechen, endet das Spiel. Die Übrigen gewinnen.',
    alias:
      '🎩 Alias\n\n' +
      'Schnelles Teamspiel, das Ausdruck und Zusammenspiel prüft. Erwarte "geniale" Beschreibungen und "ahnungslose" Teammitglieder.\n\n' +
      '📖 Vorbereitung\n' +
      'Spieler tippen in der Raum auf Bereit; der Bot teilt in zwei Teams (🔴 Rot und 🔵 Blau).\n\n' +
      '🔄 Ablauf (Zeitrunden)\n' +
      'Rundenstart: Der Bot kündigt "🔴 Rotes Team ist dran!" an und bestimmt Spieler A als Erklärer.\n' +
      'Wort per DM: Der Bot schickt dem Erklärer ein Wort per DM (z. B. "Kühlschrank").\n' +
      '60 Sekunden: Der Erklärer beschreibt das Wort in der Gruppe; 🔴 Rote raten im Chat. 🔵 Blau schaut nur zu und darf nicht antworten.\n' +
      'Beispiel: Spieler A im Chat: "In der Küche! Groß! Kühlt!" — Rot 1: "Klimaanlage!" Rot 2: "Gefrierfach!" Rot 3: "Kühlschrank!"\n' +
      'Punkte: Sobald eine Nachricht von Rot exakt dem Wort entspricht, zählt der Bot: ✅ Richtig! Rot +1. Nächstes Wort gesendet! Der Bot schickt dem Erklärer das nächste (z. B. "Astronaut") und so weiter bis die Zeit um ist.\n' +
      'Wechsel: Nach 60 s wertet der Bot aus; Zug von 🔵 Blau mit ihrem Erklärer. Gleicher Ablauf.\n' +
      'Ende: Das erste Team, das die Zielpunktzahl (z. B. 30) erreicht, gewinnt.\n\n' +
      '🚫 Regeln (Anticheat)\n' +
      'Kein Wortstamm: Bei "Kühlschrank" darf "Kühl" oder "Schrank" nicht in der Beschreibung vorkommen.\n' +
      'Keine Übersetzung: Das Wort nicht in einer anderen Sprache nennen (z. B. nicht "Refrigerator").\n' +
      'Foul: Der Bot prüft jede Nachricht des Erklärers. Erkennt er den Stamm, wird das Wort ungültig, Warnung in der Gruppe: ❌ Erklärer hat Wortstamm benutzt! Wort ungültig, -1 Punkt. Nächstes Wort gesendet.',
  },
  wordTest: {
    chooseRounds: '🔤 Vokabel-Meister: Runden wählen (5 / 8 / 10 / 12):',
    finished: '🎉 Vokabel-Meister beendet! Danke fürs Mitspielen.',
    roundPrompt: (current: number, total: number, prefix: string, minLen: number) =>
      `Runde ${current}/${total}\nSchreibe ein Wort, das mit "${prefix}" beginnt, mind. ${minLen} Buchstaben, nur a–z.\n⏱ Zeit: 30 Sekunden`,
    hint10s: '⏰ Noch 10 Sekunden!',
    hint5s: '⏰ Noch 5 Sekunden!',
    timeoutNoWinner: '⏱ Zeit abgelaufen. Niemand hat geantwortet.',
    winner: (user: string, word: string) => `🥇 ${user} war zuerst: "${word}"`,
    nextRoundIn10s: '⏱ Nächste Runde in 10 Sekunden.',
    nextRoundIn5s: '⏱ Nächste Runde in 5 Sekunden.',
    rankingTitle: '📊 Rangliste (richtige Antworten)',
    rankingLine: (name: string, count: number) => `• ${name} — ${count}`,
    rankingNobody: '(Niemand hat geantwortet)',
  },
  wordBomb: {
    chooseRounds: '💣 Wörter-Bomben-Staffel. Anzahl der Runden wählen:',
    joinOpen:
      '💣 Anmeldung offen! Sende eine Nachricht zum Mitmachen (max. 8). Start in 25 Sekunden.',
    notEnoughPlayers: 'Nicht genug Spieler. Spiel abgebrochen.',
    roundStart: (round: number, total: number, order: string, startWord: string) =>
      `Runde ${round}/${total}\nReihenfolge: ${order}\nStartwort: 💣 ${startWord}`,
    mustStartWith: (letter: string) => `Dein Wort muss mit "${letter}" beginnen.`,
    turnPrompt: (name: string) => `Dran: 📍${name}. Du hast 6 Sekunden für ein Wort.`,
    timeoutOut: (name: string) => `${name} 💣 boom! Du bist raus.`,
    gameOverWinner: (name: string) => `Spiel vorbei! Gewinner: ${name}`,
    gameOverNoWinner: 'Alle raus. Kein Gewinner.',
  },
  dice: {
    chooseRounds: '🎲 Würfel-Raten. Anzahl der Runden wählen:',
    joinOpen:
      '🎲 Anmeldung offen! Sende eine Nachricht zum Mitmachen (2–10). Start in 20 Sekunden. Alle starten mit 20 Punkten.',
    notEnoughPlayers: 'Nicht genug Spieler. Spiel abgebrochen.',
    gameStart: 'Würfel-Raten startet!',
    roundBetPrompt: (current: number, total: number) => `Runde ${current}/${total}\nSetzt eure Wetten!`,
    notInGame: 'Du bist nicht im aktuellen Spiel.',
    notEnoughScore: 'Nicht genug Punkte für diese Wette.',
    gameFinishedRanking: (rankingLines: string) => `Spiel beendet! Aktuelles Ranking:\n${rankingLines}`,
    rollResultRanking: (die: number, rankingLines: string) =>
      `🎲 Gewürfelt: ${die}\nRanking:\n${rankingLines}`,
  },
  anonymous: {
    chooseTopic: '✉️ Anonymer Brief. Thema wählen oder eigenes erstellen:',
    topicRel: 'Beziehungen',
    topicJob: 'Arbeit',
    topicFriend: 'Freundschaft',
    topicCustom: 'Eigenes Thema',
    askCustomTopic: 'Sende eine Zeile mit deinem Thema.',
    invalidLink: 'Ungültiger Link.',
    notActive: 'Dieses anonyme Thema ist in der Gruppe gerade nicht aktiv.',
    privateIntro: (topic: string) => `Du kannst eine anonyme Nachricht zu senden: "${topic}". Schreibe einfach deine Nachricht.`,
    groupTopicLink: (topic: string, link: string) =>
      `Anonymes Thema: "${topic}".\nLink zum Senden einer anonymen Nachricht:\n${link}`,
    forwarded: (topic: string, text: string) => `✉️ Anonyme Nachricht zu "${topic}":\n${text}`,
  },
  undercover: {
    joinSuccess: 'Du bist dabei. Warte auf Spielstart.',
    joinSuccessWithReturnLink: (groupLink: string) =>
      `Du bist dabei. Warte auf Spielstart.\nZurück zur Gruppe 👉 <a href="${groupLink}">Hier klicken</a>`,
    countdown20s: '⏱ Anmeldung schließt in 20 Sek',
    countdown10s: '⏱ Anmeldung schließt in 10 Sek',
    countdown5s: '⏱ Anmeldung schließt in 5 Sek',
    yourWordCivilian: (word: string) => `Dein Wort: ${word}`,
    yourWordUndercover: (word: string) => `Du bist Undercover! Dein (anderes) Wort: ${word}`,
    gameStartCivilian: (word: string) => `Spiel startet! Dein Wort: ${word}`,
    gameStartUndercover: (word: string) => `Spiel startet! Dein Wort: ${word}`,
    blankWord: '(Leer)',
    blankCivilianMessage: 'Spiel startet! Diese Runde hast du kein Wort (leer).',
    blankUndercoverMessage: 'Spiel startet! Diese Runde hast du kein Wort (leer).',
    speakingOrder: (order: string) => `Reihenfolge:\n${order}`,
    speakingOrderSuffix: ' > 45 s freie Diskussion > Abstimmung',
    nowSpeaking: (name: string) => `Jetzt dran: 📍${name}`,
    speakButtonHint: '👇 Nur der aktuelle Redner darf die Taste drücken❗️❗️❗️',
    btnEndSpeak: 'Beenden',
    btnEndRound: 'Runde beenden',
    btnEndGame: '🛑 Spiel beenden',
    freeTalk: '45 Sekunden freie Diskussion!',
    votePrompt: 'Abstimmung: Wen verdächtigst du?',
    eliminated: (name: string) => `💀 ${name} ist raus!`,
    civiliansWin: '🏆 Sieg der Zivilisten! Alle Undercover wurden enttarnt, diese Partie ist beendet.',
    undercoverWins: '🏆 Sieg der Undercover! Die Zahl der Undercover ist jetzt größer oder gleich der Zivilisten, diese Partie ist beendet.',
    nextRound: 'Nächste Runde',
    joinStartText: (link: string, min: number, max: number, seconds: number) =>
      `🎭 Undercover startet!\nZum Beitreten (Privatchat):\n${link}\n\nSpieler: ${min}–${max}. Du hast ${seconds} Sekunden.`,
    joinClosed: 'Es werden keine Spieler mehr angenommen.',
    linkExpiredGameStarted: 'Das Spiel hat bereits begonnen. Dieser Link ist nicht mehr gültig.',
    linkExpiredRoomFull: (max) => `Das Spielzimmer ist voll (max. ${max} Spieler). Der Link ist nicht mehr gültig.`,
    maxPlayers: 'Maximale Spielerzahl erreicht.',
    startCancelled: 'Nicht genug Spieler. Spiel konnte nicht starten — lad Freunde ein!',
    startAnnounce: (count: number) => `Undercover gestartet! Spieler: ${count}.`,
    voteDone: (name: string) => `Du hast für ${name} gestimmt`,
    votingEnded: 'Abstimmung beendet.',
    notVotingNow: 'Jetzt wird nicht abgestimmt.',
    notInThisGame: 'Du bist nicht in diesem Spiel.',
    invalidVoteTarget: 'Diesen Spieler kannst du nicht wählen.',
    noVotesRetry: 'Keine Stimme wurde abgegeben. Diese Partie ist beendet.',
    speakTimeoutHint25: '⏱ 25s bis zum Ende der Rede',
    speakTimeoutHint10: '⏱ 10s bis zum Ende der Rede',
    freeTalkTimeoutHint45: '⏱ 45s bis zum Ende der freien Diskussion',
    freeTalkTimeoutHint20: '⏱ 20s bis zum Ende der freien Diskussion',
    freeTalkTimeoutHint10: '⏱ 10s bis zum Ende der freien Diskussion',
    voteTimeoutHint12: '⏱ 12s bis zum Ende der Abstimmung',
    tallyHeader: (roomId) => `🎪 Raum ${roomId}`,
    tallyTitle: '🗳 Abstimmung:',
    tallyLine: (name, count, voters) => `${name}  ${count} Stimme(n) <<< ${voters}`,
    noVotesInTally: '(Keine Stimmen)',
    roomFull: (used: number, max: number) => `Undercover-Räume voll: ${used}/${max}. Später erneut versuchen.`,
    currentRoomPlayers: (roomId: number, count: number, names: string) => `🎪 Raum ${roomId} Spieler: ${count} — ${names}`,
    roundEnded: 'Diese Runde ist beendet.',
  },
  bunker: {
    alreadyJoined: 'Du bist schon dabei.',
    roomFull: 'Das Zimmer ist voll.',
    linkExpiredRoomFull: (max: number) => `Das Spielzimmer ist voll (max. ${max} Spieler). Der Link ist nicht mehr gültig.`,
    joinSuccess: 'Du bist im Bunker. Warte auf den Start in der Gruppe.',
    currentPlayers: (roomId: number, count: number, names: string) => `🎪 Raum ${roomId} Spieler: ${count} — ${names}`,
    game_start: '🚨 <b>Achtung! Globale Katastrophe!</b>\n\n%disaster%\n\nDer Bunker hat nur Platz für <b>%capacity%</b>. Runde 1! Verrate deinen Beruf.',
    phase_debate: '🗣 <b>Debatten-Phase!</b> Zeige deine nächste Eigenschaft! 2 Minuten.',
    phase_voting: '🗳 <b>Abstimmung!</b> Wer fliegt raus? Wähle:',
    player_kicked: '💀 <b>%name%</b> wurde rausgeworfen. Geheimes Profil: %traits%',
    game_over: '🎉 <b>Spiel vorbei!</b> Bunker ist verriegelt. Überlebende: %winners%.',
    your_card: '🎫 <b>DEINE AKTE (Geheim halten!):</b>\nBeruf: %profession%\nGesundheit: %health%\nInventar: %inventory%\nPhobie: %phobia%',
    disasters: ['Zombie-Apokalypse.', 'Atomkrieg.', 'Meteoriteneinschlag.'],
    professions: ['Chirurg', 'Komiker', 'Programmierer', 'Klempner', 'Politiker'],
    health: ['Perfekt', 'Asthma', 'Allergie', 'Krebs'],
    inventory: ['Erste-Hilfe-Kasten', 'Wodka', 'Kettensäge', 'Gitarre'],
    phobias: ['Klaustrophobie', 'Angst vor der Dunkelheit', 'Arachnophobie', 'Hämophobie'],
    orderHeader: (roomId, orderLine) => `🎪 【 📍 Raum #${roomId} 】\nReihenfolge:\n📍 ${orderLine} > 45s Diskussion > Abstimmung`,
    currentSpeaker: (name) => `Dran: 📍 ${name}\n❗️Nur diese Person darf tippen.`,
    notYourTurn: '🤡 Verarscht! Klicken bringt nix! 😂 Haha 🤣!!!',
    btnEndSpeak: 'Beenden',
    freetalkTitle: '🗣 45 Sekunden freie Diskussion!',
    btnEndRound: 'Runde beenden',
    votePromptTimer: (seconds) => `🗳 Einen eliminieren (${seconds}s):`,
    voteEliminateLabel: 'Eliminieren',
    voteUpdated: (emoji, name) => `✅ Stimme aktualisiert! Du hast für ${emoji} ${name} gestimmt`,
    btnEndGame: '🛑 Spiel beenden',
    tallyHeader: (roomId) => `🎪 【 📍 Raum #${roomId} 】`,
    tallyTitle: '🗳 Abstimmung:',
    tallyLine: (name, count, voters) => `${name}  ${count} Stimme(n) <<< ${voters}`,
    noVotesInTally: '(Keine Stimmen)',
    gameForceEnded: 'Spiel auf Wunsch beendet.',
    emojiPoolExhausted: 'Emoji-Pool erschöpft. Spiel beendet.',
    alreadyEnded: 'Beendet',
  },
  alias: {
    alreadyJoined: 'Du bist schon dabei.',
    linkExpiredRoomFull: (max: number) => `Das Spielzimmer ist voll (max. ${max} Spieler). Der Link ist nicht mehr gültig.`,
    joinSuccess: 'Du bist dabei. Warte auf den Start in der Gruppe.',
    currentPlayers: (roomId: number, count: number, names: string) => `🎪 Raum ${roomId} Spieler: ${count} — ${names}`,
    turn_start: '🔥 <b>Team %team% ist dran!</b>\n@%explainer% erklärt. Ratet im Chat!\n⏱ 60 Sekunden!',
    correct_guess: '✅ <b>Richtig!</b> @%guesser% hat es erraten! Team %team% +1 Punkt!\nNächstes Wort gesendet.',
    foul_warning: '❌ <b>Foul!</b> @%explainer% hat den Wortstamm benutzt! -1 Punkt.',
    round_end: '🛑 <b>Zeit abgelaufen!</b> Stand: Rot (%scoreA%) - Blau (%scoreB%).',
    game_over: '🏆 <b>Spiel vorbei!</b> Team %winner% gewinnt!',
    your_word: '🤫 Dein Wort: <b>%word%</b>. (Keine Wortstämme benutzen!)',
    words: ['Astronaut', 'Kühlschrank', 'Alien', 'Dinosaurier', 'Wolkenkratzer', 'Hubschrauber'],
  },
};
