export const frTexts = {
  i18n: {
    chooseLanguage: 'Choisis ta langue',
    back: '🔙 Retour',
  },
  mainMenu: {
    welcome: 'Bienvenue sur @playplayggbot — c’est parti !',
    btnUndercover: 'Undercover',
    btnWerewolf: 'Loup-Garou',
    btnAvalon: 'Avalon',
    btnWordTest: 'Test de Mots',
    btnWordBomb: 'Relais Mot Bombe',
    btnDiceGuess: 'Devine le Dé',
    btnAnonymous: 'Lettre Anonyme',
    btnBunker: 'Bunker',
    btnAlias: 'Alias',
    btnCancel: 'Annuler',
    cancelAnswer: 'D’accord, je reste en arrière-plan. Tu veux jouer ? Envoie /playgg !',
    usePlayggForLatestMenu: 'Ce menu est obsolète. Envoie /playgg pour ouvrir le menu actuel.',
    privatePlayggHint: '🎮 Ajoute-moi à ton groupe et envoie /playgg pour lancer les jeux !',
    groupUsePlaygg: '👉 Dans le groupe, envoie /playgg pour ouvrir le menu des jeux.',
    btnLanguage: '🌐 Langue',
  },
  errors: {
    generic: '⚠️ Une erreur s’est produite. Réessaie plus tard.',
  },
  common: {
    onlyGroups: 'Ce jeu est disponible uniquement en groupe.',
    otherGameRunning: 'Une autre partie est déjà en cours dans ce groupe.',
    btnStartGame: '▶ Démarrer la partie',
    btnStartRecruit: '🚀 Lancer le recrutement ici',
    roomFull: (used: number, max: number) => `Salles pleines: ${used}/${max}. Réessaie plus tard.`,
    roomClosedOrNotFound: 'Cette salle est fermée ou n’existe pas.',
    linkExpiredGameStarted: 'La partie a déjà commencé. Ce lien n\'est plus valide.',
    roomLabel: (roomId: number) => `🎪 Salle ${roomId}`,
  },
  groupWelcome: {
    title: '🎮 Bienvenue sur @playplayggbot',
    intro: 'Joue à Undercover, Mot Bombe, Dé et plus. Envoie /playgg pour ouvrir le menu.',
    separator: '—————————————',
    partners: 'Nos partenaires : Blink — plus de chat et de jeux !',
  },
  growth: {
    ctaText: 'Découvre l’app Blink — plus de chat et de jeux !',
    ctaButton: 'Ouvrir Blink',
  },
  intro: {
    undercover:
      '🕵️ Qui est l’Espion (Who is the Spy)\n' +
      'Un jeu de bluff et de logique qui fait monter le rythme cardiaque : qui ment ?\n' +
      '👥 Joueurs : 5 à 12\n' +
      '🕹 Déroulement du jeu :\n' +
      '  1. Recevoir ton mot : Clique sur le lien pour ouvrir une conversation privée avec le bot et obtenir ton mot secret. Attention : les espions reçoivent un mot légèrement différent des autres. 🤫\n' +
      '  2. Tour de parole : Suis l’ordre donné par le bot et décris ton mot. Chaque joueur a 25 secondes — ne prononce surtout pas le mot exact !\n' +
      '  3. Débat libre : 📍 45 secondes de discussion libre pour traquer celui dont le discours ne tient pas la route.\n' +
      '  4. Vote général : Utilise ton bouton emoji dédié / envoie l’emoji correspondant dans le chat pour voter pour le joueur que tu soupçonnes, en 12 secondes.\n' +
      '❌ Important : si personne ne vote, la partie se termine automatiquement.\n' +
      '🎭 Configuration des rôles :\n' +
      '  - 5–6 joueurs : 1 espion\n' +
      '  - 7–9 joueurs : 2 espions\n' +
      '  - 10–12 joueurs : 3 espions\n' +
      '🏆 Conditions de victoire :\n' +
      '🟢 Victoire des civils : Réussir à démasquer et éliminer tous les espions.\n' +
      '🔴 Victoire des espions : Rester sous couverture jusqu’au bout ! Dès que le nombre d’espions est supérieur ou égal au nombre de civils, les espions gagnent.',
    word_test:
      '✍️ Maître du Vocabulaire (Word Test)\n\n' +
      'Teste vocabulaire et rapidité : qui tape le premier un mot valide ?\n\n' +
      '👥 Joueurs : tout le groupe (sans inscription).\n\n' +
      '📖 Règles\n' +
      '• Chaque manche le bot donne un préfixe (ex. re, co, in) et une longueur min. (5–8 lettres).\n' +
      '• Envoie un mot en anglais dans le chat : il doit commencer par ce préfixe, avoir au moins ce nombre de lettres, uniquement a–z.\n' +
      '• Exemple : préfixe "re", min. 6 lettres → "return", "really" ✅ ; "red" (trop court) ou "re-use" (symbole) ❌.\n' +
      '• Jusqu’à 30 s par manche ; le premier à répondre correctement gagne et termine la manche tout de suite. Sinon, la manche s’arrête à 30 s.\n' +
      '• Après chaque manche : « Manche suivante dans 10 s » ; 10 secondes plus tard, la suivante démarre automatiquement. Les questions varient.\n\n' +
      '🏆 Pas de score global ; chaque manche est indépendante.',
    word_bomb:
      '💣 Relais Mot Bombe\n' +
      'Passe la bombe avec des chaînes de mots.\n\n' +
      'Joueurs : jusqu’à 8.\n\n' +
      'Règles :\n' +
      '1) Le bot donne le premier mot.\n' +
      '2) Le suivant doit commencer par la dernière lettre du mot précédent.\n' +
      '3) Chacun a 6 secondes. Timeout = boom et élimination.\n' +
      '4) Le dernier survivant gagne.',
    dice_guess:
      '🎲 Combien de Points\n' +
      'Parie des points sur le résultat du dé.\n\n' +
      'Joueurs : 2–10.\n\n' +
      'Règles :\n' +
      '1) 20 secondes pour parier via les boutons.\n' +
      '2) Types : pair/impair, paires ou nombre exact.\n' +
      '3) Bonne réponse = points gagnés, mauvaise = points perdus.\n' +
      '4) Classement après chaque manche.',
    anonymous:
      '💌 Lettre Anonyme\n' +
      'Partage tes idées sans te révéler.\n\n' +
      'Déroulement :\n' +
      '1) Choisis un thème ou crée le tien.\n' +
      '2) Rejoins par le lien et envoie ton message en privé.\n' +
      '3) Le bot le transmet anonymement au groupe.\n',
    werewolf:
      '🐺 Loup-Garou (Werewolf)\n' +
      'La nuit tout le monde ferme les yeux — qui est le loup dans le village ?\n\n' +
      '👥 Recommandé : 6–12 joueurs\n' +
      '✅ Moteur complet dans une version ultérieure.',
    avalon:
      '🛡️ Avalon\n\n' +
      'Le bien contre le mal : logique pure, pas d\'élimination !\n\n' +
      '👥 Joueurs : 5–10\n\n' +
      '📖 Règles\n' +
      '1. Rôles secrets : le bot envoie les rôles en MP. Bien (Merlin, Percival, loyaux) vs Mal (Morgana, Assassin, sbires). Merlin sait qui est maléfique mais ne doit pas se révéler !\n' +
      '2. Former l\'équipe : 📍 Le chef choisit qui part en mission (le chef change à chaque manche).\n' +
      '3. Vote sur l\'équipe : 📍 Tout le monde vote [Approuver / Rejeter] dans le groupe.\n' +
      '4. Mission : 📍 Les membres votent [Succès] ou [Échec] en MP avec le bot. Un vote échec peut faire échouer la mission !\n\n' +
      '🏆 Victoire\n' +
      '• La première faction à réussir 3 missions gagne.\n' +
      '• Coup de l\'Assassin : même si le Bien gagne, l\'Assassin peut deviner Merlin et le « tuer » — le Mal renverse la victoire ! 🗡️',
    bunker:
      '🛡️ Bunker\n\n' +
      'Jeu de déduction sociale et de débat en monde post-apocalyptique. Pas de "bons" ou "méchants" fixes — seulement qui convainc le groupe de le laisser survivre.\n\n' +
      '📖 Contexte\n' +
      'La Terre subit une catastrophe (zombies, guerre nucléaire, astéroïde). Les survivants trouvent un bunker, mais la capacité est limitée (ex. : 8 joueurs, bunker 4).\n\n' +
      '🪪 Mécanique : cartes d\'identité\n' +
      'Au début le bot envoie en MP à chacun un "profil" aléatoire. Secret pour les autres.\n\n' +
      '🔄 Déroulement (par manches)\n' +
      '1. Catastrophe : le bot annonce le type et la capacité (ex. : "Fuite nucléaire, bunker 4/8").\n' +
      '2. Première manche : tout le monde révèle uniquement "profession" et "âge/sexe" dans le groupe. 3 min de débat ("Je suis médecin !", "Je suis ouvrier, je répare le bunker !").\n' +
      '3. Premier vote : le bot lance le vote ; le plus voté est exclu, ses cartes sont révélées.\n' +
      '4. Manches suivantes : à chaque manche on révèle un trait de plus (santé, bagage). Le "médecin" peut avoir un "cancer en phase terminale" — la table se retourne.\n' +
      '5. Cartes d\'action : un joueur en danger peut envoyer un MP au bot pour jouer une action (ex. "J\'échange mon cancer avec la santé du 3") ; le bot l\'annonce dans le groupe.\n' +
      '6. Fin : quand les survivants égalent la capacité du bunker, la partie se termine. Les restants gagnent.',
    alias:
      '🎩 Alias\n\n' +
      'Jeu d\'équipe rapide qui teste l\'expression et la coordination. Attendez-vous à des descriptions "géniales" et des coéquipiers "à côté de la plaque".\n\n' +
      '📖 Préparation\n' +
      'Les joueurs appuient sur Prêt dans la salle ; le bot les divise en deux équipes (🔴 Rouge et 🔵 Bleu).\n\n' +
      '🔄 Déroulement (manches chronométrées)\n' +
      'Début du tour : le bot annonce "Tour de l\'équipe 🔴 Rouge !" et choisit le joueur A comme Expliqueur.\n' +
      'Mot en MP : le bot envoie à l\'Expliqueur un mot en MP (ex. : "réfrigérateur").\n' +
      '60 secondes : l\'Expliqueur décrit le mot dans le groupe ; 🔴 Rouge devine dans le chat. 🔵 Bleu ne fait que regarder et ne peut pas répondre.\n' +
      'Exemple : joueur A dans le chat : "Dans la cuisine ! Gros ! Ça refroidit !" — Rouge 1 : "Climatiseur !" Rouge 2 : "Congélateur !" Rouge 3 : "Frigo !"\n' +
      'Score : dès qu\'un message de Rouge correspond exactement au mot, le bot compte : ✅ Correct ! Rouge +1. Mot suivant envoyé ! Le bot envoie à l\'Expliqueur le suivant (ex. "astronaute") et ainsi de suite jusqu\'à la fin du temps.\n' +
      'Changement : à 60 s le bot fait le décompte ; tour de 🔵 Bleu avec leur Expliqueur. Même déroulement.\n' +
      'Fin : la première équipe à atteindre le score cible (ex. 30) gagne.\n\n' +
      '🚫 Règles (anti-triche)\n' +
      'Pas de racine du mot : si le mot est "réfrigérateur", ne pas utiliser "réfrig" ou "frigo" dans la description.\n' +
      'Pas de traduction : ne pas donner le mot dans une autre langue (ex. pas "Refrigerator" comme indice).\n' +
      'Faute : le bot vérifie chaque message de l\'Expliqueur. S\'il détecte la racine, le mot est annulé et le bot prévient dans le groupe : ❌ L\'Expliqueur a utilisé la racine ! Mot annulé, -1 point. Mot suivant envoyé.',
  },
  wordTest: {
    chooseRounds: '🔤 Maître du Vocabulaire : choisis le nombre de manches (5 / 8 / 10 / 12) :',
    finished: '🎉 Maître du Vocabulaire terminé ! Merci d’avoir joué.',
    roundPrompt: (current: number, total: number, prefix: string, minLen: number) =>
      `Manche ${current}/${total}\nEnvoie un mot qui commence par "${prefix}", au moins ${minLen} lettres, uniquement a–z.\n⏱ Limite : 30 secondes`,
    hint10s: '⏰ Plus que 10 secondes !',
    hint5s: '⏰ Plus que 5 secondes !',
    timeoutNoWinner: '⏱ Temps écoulé. Personne n’a répondu.',
    winner: (user: string, word: string) => `🥇 ${user} a répondu en premier : "${word}"`,
    nextRoundIn10s: '⏱ Manche suivante dans 10 secondes.',
    nextRoundIn5s: '⏱ Manche suivante dans 5 secondes.',
    rankingTitle: '📊 Classement (bonnes réponses)',
    rankingLine: (name: string, count: number) => `• ${name} — ${count}`,
    rankingNobody: '(Personne n’a répondu)',
  },
  wordBomb: {
    chooseRounds: '💣 Relais Mot Bombe. Choisis le nombre de manches :',
    joinOpen:
      '💣 Inscriptions ouvertes ! Envoie un message pour rejoindre (max. 8). La partie commence dans 25 secondes.',
    notEnoughPlayers: 'Pas assez de joueurs. Partie annulée.',
    roundStart: (round: number, total: number, order: string, startWord: string) =>
      `Manche ${round}/${total}\nOrdre : ${order}\nMot de départ : 💣 ${startWord}`,
    mustStartWith: (letter: string) => `Ton mot doit commencer par "${letter}".`,
    turnPrompt: (name: string) => `À toi : 📍${name}. Tu as 6 secondes pour envoyer un mot.`,
    timeoutOut: (name: string) => `${name} 💣 boom ! Tu es éliminé.`,
    gameOverWinner: (name: string) => `Partie terminée ! Gagnant : ${name}`,
    gameOverNoWinner: 'Tous éliminés. Pas de gagnant.',
  },
  dice: {
    chooseRounds: '🎲 Devine le Dé. Choisis le nombre de manches :',
    joinOpen:
      '🎲 Inscriptions ouvertes ! Envoie un message pour rejoindre (2–10). Début dans 20 secondes. Tout le monde commence avec 20 points.',
    notEnoughPlayers: 'Pas assez de joueurs. Partie annulée.',
    gameStart: 'Devine le Dé commence !',
    roundBetPrompt: (current: number, total: number) => `Manche ${current}/${total}\nPlace tes paris !`,
    notInGame: 'Tu n’es pas dans la partie en cours.',
    notEnoughScore: 'Pas assez de points pour ce pari.',
    gameFinishedRanking: (rankingLines: string) => `Partie terminée ! Classement :\n${rankingLines}`,
    rollResultRanking: (die: number, rankingLines: string) =>
      `🎲 Dé : ${die}\nClassement :\n${rankingLines}`,
  },
  anonymous: {
    chooseTopic: '✉️ Lettre Anonyme. Choisis un thème ou crée le tien :',
    topicRel: 'Relations',
    topicJob: 'Travail',
    topicFriend: 'Amitié',
    topicCustom: 'Thème personnalisé',
    askCustomTopic: 'Envoie une ligne avec ton thème.',
    invalidLink: 'Lien invalide.',
    notActive: 'Ce thème anonyme n’est pas actif dans ce groupe pour l’instant.',
    privateIntro: (topic: string) => `Tu peux envoyer un message anonyme sur : "${topic}". Écris ton message.`,
    groupTopicLink: (topic: string, link: string) =>
      `Thème anonyme : "${topic}".\nOuvre ce lien pour envoyer un message anonyme :\n${link}`,
    forwarded: (topic: string, text: string) => `✉️ Message anonyme sur "${topic}" :\n${text}`,
  },
  undercover: {
    joinSuccess: 'Tu as rejoint. En attente du début de la partie.',
    joinSuccessWithReturnLink: (groupLink: string) =>
      `Tu as rejoint. En attente du début de la partie.\nRetourner au groupe 👉 <a href="${groupLink}">Cliquer ici</a>`,
    countdown20s: '⏱ Inscriptions ferment dans 20 s',
    countdown10s: '⏱ Inscriptions ferment dans 10 s',
    countdown5s: '⏱ Inscriptions ferment dans 5 s',
    yourWordCivilian: (word: string) => `Ton mot : ${word}`,
    yourWordUndercover: (word: string) => `Tu es l’undercover ! Ton mot (différent) : ${word}`,
    gameStartCivilian: (word: string) => `Partie lancée ! Ton mot : ${word}`,
    gameStartUndercover: (word: string) => `Partie lancée ! Ton mot : ${word}`,
    blankWord: '(Vide)',
    blankCivilianMessage: 'Partie lancée ! Ce round tu n’as pas de mot (vide).',
    blankUndercoverMessage: 'Partie lancée ! Ce round tu n’as pas de mot (vide).',
    speakingOrder: (order: string) => `Ordre de parole :\n${order}`,
    speakingOrderSuffix: ' > 45 s discussion libre > vote',
    nowSpeaking: (name: string) => `À toi de parler : 📍${name}`,
    speakButtonHint: '👇 Ne touche pas le bouton si ce n\'est pas ton tour❗️❗️❗️',
    btnEndSpeak: 'Terminer',
    btnEndRound: 'Terminer le tour',
    btnEndGame: '🛑 Fin de partie',
    freeTalk: '45 secondes de discussion libre !',
    votePrompt: 'Vote pour le suspect :',
    eliminated: (name: string) => `💀 ${name} est éliminé !`,
    civiliansWin: '🏆 Victoire des civils ! Tous les espions ont été éliminés, cette partie est terminée.',
    undercoverWins: '🏆 Victoire des espions ! Le nombre d’espions est désormais supérieur ou égal à celui des civils, cette partie est terminée.',
    nextRound: 'Manche suivante',
    joinStartText: (link: string, min: number, max: number, seconds: number) =>
      `🎭 Undercover va commencer !\nClique pour rejoindre (chat privé) :\n${link}\n\nJoueurs : ${min}–${max}. Tu as ${seconds} secondes.`,
    joinClosed: 'On n’accepte plus de joueurs.',
    linkExpiredGameStarted: 'La partie a déjà commencé. Ce lien n\'est plus valide.',
    linkExpiredRoomFull: (max) => `La salle est pleine (max ${max} joueurs). Ce lien n'est plus valide.`,
    maxPlayers: 'Nombre max de joueurs atteint.',
    startCancelled: 'Pas assez de joueurs. Partie annulée — invite des amis !',
    startAnnounce: (count: number) => `Undercover a commencé ! Joueurs : ${count}.`,
    voteDone: (name: string) => `Tu as voté pour ${name}`,
    votingEnded: 'Le vote est terminé.',
    notVotingNow: 'Ce n’est pas le moment de voter.',
    notInThisGame: 'Tu n’es pas dans cette partie.',
    invalidVoteTarget: 'Tu ne peux pas voter pour ce joueur.',
    noVotesRetry: 'Aucun vote n’a été enregistré. Cette partie est terminée.',
    speakTimeoutHint25: '⏱ 25s avant la fin de la prise de parole',
    speakTimeoutHint10: '⏱ 10s avant la fin de la prise de parole',
    freeTalkTimeoutHint45: '⏱ 45s avant la fin de la discussion libre',
    freeTalkTimeoutHint20: '⏱ 20s avant la fin de la discussion libre',
    freeTalkTimeoutHint10: '⏱ 10s avant la fin de la discussion libre',
    voteTimeoutHint12: '⏱ 12s avant la fin du vote',
    tallyHeader: (roomId) => `🎪 Salle ${roomId}`,
    tallyTitle: '🗳 Résultat du vote :',
    tallyLine: (name, count, voters) => `${name}  ${count} vote(s) <<< ${voters}`,
    noVotesInTally: '(Aucun vote)',
    roomFull: (used: number, max: number) => `Salles Undercover pleines: ${used}/${max}. Réessaie plus tard.`,
    currentRoomPlayers: (roomId: number, count: number, names: string) => `🎪 Salle ${roomId} joueurs: ${count} — ${names}`,
    roundEnded: 'Cette manche est terminée.',
  },
  bunker: {
    alreadyJoined: 'Tu as déjà rejoint.',
    roomFull: 'La salle est pleine.',
    linkExpiredRoomFull: (max: number) => `La salle est pleine (max ${max} joueurs). Ce lien n'est plus valide.`,
    joinSuccess: 'Tu as rejoint le Bunker. Attends le début dans le groupe.',
    currentPlayers: (roomId: number, count: number, names: string) => `🎪 Salle ${roomId} joueurs: ${count} — ${names}`,
    game_start: '🚨 <b>Alerte ! Catastrophe mondiale !</b>\n\n%disaster%\n\nLe bunker ne peut contenir que <b>%capacity%</b> personnes. Round 1 ! Révélez votre profession.',
    phase_debate: '🗣 <b>Phase de débat !</b> Révélez votre prochain trait ! 2 minutes.',
    phase_voting: '🗳 <b>Vote !</b> Qui est expulsé ? Choisissez :',
    player_kicked: '💀 <b>%name%</b> a été expulsé. Profil : %traits%',
    game_over: '🎉 <b>Fin du jeu !</b> Portes scellées. Survivants : %winners%.',
    your_card: '🎫 <b>VOTRE DOSSIER (Secret !) :</b>\nProfession : %profession%\nSanté : %health%\nInventaire : %inventory%\nPhobie : %phobia%',
    disasters: ['Apocalypse Zombie.', 'Guerre nucléaire.', 'Météorite.'],
    professions: ['Chirurgien', 'Comédien', 'Programmeur', 'Plombier', 'Politicien'],
    health: ['Parfaite', 'Asthme', 'Allergie', 'Cancer terminal'],
    inventory: ['Trousse de secours', 'Vodka', 'Tronçonneuse', 'Guitare'],
    phobias: ['Claustrophobie', 'Peur du noir', 'Arachnophobie', 'Hémophobie'],
    orderHeader: (roomId, orderLine) => `🎪 【 📍 Salle #${roomId} 】\nOrdre:\n📍 ${orderLine} > 45s débat > vote`,
    currentSpeaker: (name) => `À la parole: 📍 ${name}\n❗️Seule cette personne peut appuyer.`,
    notYourTurn: '🤡 Tu t\'es fait avoir, cliquer ne sert à rien ! 😂 Mdr 🤣!!!',
    btnEndSpeak: 'Terminer',
    freetalkTitle: '🗣 45 secondes de débat libre !',
    btnEndRound: 'Terminer le tour',
    votePromptTimer: (seconds) => `🗳 Votez pour éliminer (${seconds}s):`,
    voteEliminateLabel: 'Éliminer',
    voteUpdated: (emoji, name) => `✅ Vote enregistré ! Vous avez voté pour ${emoji} ${name}`,
    btnEndGame: '🛑 Fin de partie',
    tallyHeader: (roomId) => `🎪 【 📍 Salle #${roomId} 】`,
    tallyTitle: '🗳 Résultat:',
    tallyLine: (name, count, voters) => `${name}  ${count} vote(s) <<< ${voters}`,
    noVotesInTally: '(Aucun vote)',
    gameForceEnded: 'Partie terminée à la demande.',
    emojiPoolExhausted: "Pool d'emojis épuisé. Partie terminée.",
    alreadyEnded: 'Terminé',
  },
  alias: {
    alreadyJoined: 'Tu as déjà rejoint.',
    linkExpiredRoomFull: (max: number) => `La salle est pleine (max ${max} joueurs). Ce lien n'est plus valide.`,
    joinSuccess: 'Tu as rejoint. Attends le début dans le groupe.',
    currentPlayers: (roomId: number, count: number, names: string) => `🎪 Salle ${roomId} joueurs: ${count} — ${names}`,
    turn_start: '🔥 <b>Au tour de l\'équipe %team% !</b>\n@%explainer% explique. Devinez dans le chat !\n⏱ 60 secondes !',
    correct_guess: '✅ <b>Bingo !</b> @%guesser% a trouvé ! Équipe %team% +1 point !\nMot suivant envoyé.',
    foul_warning: '❌ <b>Faute !</b> @%explainer% a utilisé la racine du mot ! -1 point.',
    round_end: '🛑 <b>Temps écoulé !</b> Score : Rouge (%scoreA%) - Bleu (%scoreB%).',
    game_over: '🏆 <b>Fin du jeu !</b> L\'équipe %winner% gagne !',
    your_word: '🤫 Votre mot : <b>%word%</b>. (N\'utilisez pas de mots de la même famille !)',
    words: ['Astronaute', 'Réfrigérateur', 'Extraterrestre', 'Dinosaure', 'Gratte-ciel', 'Hélicoptère'],
  },
};
