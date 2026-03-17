export const idTexts = {
  i18n: {
    chooseLanguage: 'Pilih bahasa Anda',
    back: '🔙 Kembali',
  },
  mainMenu: {
    welcome: 'Selamat datang di @playplayggbot — ayo main!',
    btnUndercover: 'Undercover',
    btnWerewolf: 'Werewolf',
    btnAvalon: 'Avalon',
    btnWordTest: 'Tes Kata',
    btnWordBomb: 'Estafet Kata Bom',
    btnDiceGuess: 'Tebak Dadu',
    btnAnonymous: 'Surat Anonim',
    btnBunker: 'Bunker',
    btnAlias: 'Alias',
    btnCancel: 'Batal',
    cancelAnswer: 'Oke, aku di belakang saja. Mau main? Kirim /playgg!',
    usePlayggForLatestMenu: 'Ini menu lama. Kirim /playgg untuk buka menu terbaru.',
    privatePlayggHint: '🎮 Tambahkan saya ke grup Anda dan kirim /playgg di sana untuk mulai bermain!',
    groupUsePlaygg: '👉 Di grup kirim /playgg untuk membuka menu game.',
    btnLanguage: '🌐 Bahasa',
  },
  errors: {
    generic: '⚠️ Terjadi kesalahan. Coba lagi nanti.',
  },
  common: {
    onlyGroups: 'Game ini hanya tersedia di grup.',
    otherGameRunning: 'Sudah ada game lain yang berjalan di grup ini.',
    btnStartGame: '▶ Mulai game',
    btnStartRecruit: '🚀 Mulai rekrutmen di sini',
    roomFull: (used: number, max: number) => `Ruangan game penuh: ${used}/${max}. Coba lagi nanti.`,
    roomClosedOrNotFound: 'Ruangan ini ditutup atau tidak ada.',
    linkExpiredGameStarted: 'Game sudah mulai. Link ini tidak berlaku lagi.',
    roomLabel: (roomId: number) => `🎪 Ruangan ${roomId}`,
  },
  groupWelcome: {
    title: '🎮 Selamat datang di @playplayggbot',
    intro: 'Main Undercover, Kata Bom, Dadu, dan lainnya. Kirim /playgg untuk buka menu game.',
    separator: '—————————————',
    partners: 'Partner kami: Blink — lebih banyak chat dan game!',
  },
  growth: {
    ctaText: 'Coba app Blink — lebih banyak chat dan game!',
    ctaButton: 'Buka Blink',
  },
  intro: {
    undercover:
      '🕵️ Siapa Mata‑mata (Who is the Spy)\n' +
      'Permainan logika dan tebak‑tebakan yang bikin deg‑degan: siapa yang bohong?\n' +
      '👥 Pemain: 5–12\n' +
      '🕹 Alur permainan:\n' +
      '  1. Ambil kata: Tekan link untuk chat pribadi dengan bot dan dapatkan kata rahasiamu. Catatan: kata mata‑mata sedikit berbeda dari pemain lain. 🤫\n' +
      '  2. Giliran bicara: Ikuti urutan yang diberikan bot dan jelaskan katamu. Tiap pemain punya 25 detik — jangan sebut kata persisnya!\n' +
      '  3. Debat bebas: 📍 45 detik bicara bebas untuk mencari siapa yang paling mencurigakan.\n' +
      '  4. Voting bersama: Tekan tombol emoji khususmu / kirim emoji yang sesuai di chat untuk memilih tersangka, dalam 12 detik.\n' +
      '❌ Penting: kalau tidak ada satu pun suara, permainan langsung berakhir otomatis.\n' +
      '🎭 Pengaturan peran:\n' +
      '  - 5–6 pemain: 1 mata‑mata\n' +
      '  - 7–9 pemain: 2 mata‑mata\n' +
      '  - 10–12 pemain: 3 mata‑mata\n' +
      '🏆 Syarat kemenangan:\n' +
      '🟢 Warga menang: Berhasil menemukan dan mengeliminasi semua mata‑mata.\n' +
      '🔴 Mata‑mata menang: Menyamar sampai akhir! Ketika jumlah mata‑mata ≥ jumlah warga, pihak mata‑mata langsung menang.',
    word_test:
      '✍️ Jago Kosakata (Word Test)\n\n' +
      'Uji kosakata dan kecepatan: siapa yang ketik kata valid pertama?\n\n' +
      '👥 Pemain: semua di grup (tanpa daftar).\n\n' +
      '📖 Aturan\n' +
      '• Tiap ronde bot kasih prefiks (mis. re, co, in) dan panjang minimal (5–8 huruf).\n' +
      '• Kirim satu kata bahasa Inggris di chat: harus diawali prefiks itu, minimal segitu huruf, hanya a–z.\n' +
      '• Contoh: prefiks "re", min 6 huruf → "return", "really" ✅; "red" (terlalu pendek) atau "re-use" (simbol) ❌.\n' +
      '• Maksimal 30 detik per ronde; yang pertama jawab benar menang dan ronde selesai. Kalau tidak ada, ronde selesai di 30 detik.\n' +
      '• Setelah tiap ronde: "Ronde berikutnya dalam 10 detik"; 10 detik kemudian ronde berikutnya mulai otomatis. Soal bervariasi.\n\n' +
      '🏆 Tidak ada skor total; tiap ronde mandiri.',
    word_bomb:
      '💣 Estafet Kata Bom\n' +
      'Oper bom dengan rantai kata.\n\n' +
      'Pemain: sampai 8.\n\n' +
      'Aturan:\n' +
      '1) Bot kasih kata pertama.\n' +
      '2) Pemain berikut harus mulai dengan huruf terakhir kata sebelumnya.\n' +
      '3) Masing-masing 6 detik. Waktu habis = boom dan gugur.\n' +
      '4) Yang terakhir bertahan menang.',
    dice_guess:
      '🎲 Tebak Angka Dadu\n' +
      'Taruh poin pada hasil dadu.\n\n' +
      'Pemain: 2–10.\n\n' +
      'Aturan:\n' +
      '1) 20 detik untuk taruhan lewat tombol.\n' +
      '2) Jenis: ganjil/genap, pasangan, atau angka tepat.\n' +
      '3) Benar dapat poin, salah kurang poin.\n' +
      '4) Ranking ditampilkan tiap ronde.',
    anonymous:
      '💌 Surat Anonim\n' +
      'Bagikan pikiran tanpa mengungkap diri.\n\n' +
      'Alur:\n' +
      '1) Pilih topik atau buat sendiri.\n' +
      '2) Gabung lewat link dan kirim pesan di chat pribadi.\n' +
      '3) Bot meneruskan secara anonim ke grup.\n',
    werewolf:
      '🐺 Werewolf\n' +
      'Malam hari semua tutup mata — siapa serigala di desa?\n\n' +
      '👥 Direkomendasikan: 6–12 pemain\n' +
      '✅ Mesin lengkap di versi berikutnya.',
    avalon:
      '🛡️ Avalon\n\n' +
      'Baik vs jahat — logika murni, tanpa eliminasi!\n\n' +
      '👥 Pemain: 5–10\n\n' +
      '📖 Cara main\n' +
      '1. Peran rahasia: Bot kirim peran lewat DM. Baik (Merlin, Percival, setia) vs Jahat (Morgana, Assassin, antek). Merlin tahu siapa jahat tapi jangan ketahuan!\n' +
      '2. Bentuk tim: 📍 Pemimpin pilih siapa yang ikut misi (pemimpin ganti tiap ronde).\n' +
      '3. Voting tim: 📍 Semua voting [Setuju / Tolak] di grup.\n' +
      '4. Misi: 📍 Anggota tim voting [Sukses] atau [Gagal] lewat DM ke Bot. Satu suara gagal bisa gagalkan seluruh misi!\n\n' +
      '🏆 Kemenangan\n' +
      '• Sisi yang pertama selesaikan 3 misi dengan sukses menang.\n' +
      '• Tikungan Assassin: Meski Baik menang, Assassin bisa tebak siapa Merlin dan «bunuh» — Jahat menang! 🗡️',
    bunker:
      '🛡️ Bunker\n\n' +
      'Game deduksi sosial dan debat di setting pasca-apokaliptik. Tidak ada "baik" atau "jahat" tetap — hanya siapa yang bisa meyakinkan grup agar bisa bertahan.\n\n' +
      '📖 Latar belakang\n' +
      'Bumi dilanda bencana (zombie, perang nuklir, asteroid). Yang selamat menemukan bunker, tapi kapasitas terbatas (mis. 8 pemain, bunker 4).\n\n' +
      '🪪 Mekanik: kartu identitas\n' +
      'Di awal Bot mengirim ke masing-masing "profil" acak lewat DM. Rahasia dari yang lain.\n\n' +
      '🔄 Alur (per ronde)\n' +
      '1. Bencana: Bot mengumumkan jenis dan kapasitas (mis. "Kebocoran nuklir, bunker 4/8").\n' +
      '2. Ronde pertama: Semua mengungkap hanya "profesi" dan "usia/kelamin" di grup. Debat 3 menit.\n' +
      '3. Voting pertama: Bot buka voting; yang terbanyak keluar, kartunya dibuka.\n' +
      '4. Ronde berikut: Tiap ronde buka satu sifat lagi (kesehatan, barang). "Dokter" bisa punya "kanker stadium akhir" — suasana berbalik.\n' +
      '5. Kartu aksi: Pemain yang terancam bisa DM Bot untuk main aksi (mis. tukar penyakit dengan pemain 3); Bot umumkan di grup.\n' +
      '6. Akhir: Saat yang selamat sama dengan kapasitas bunker, game selesai. Yang tersisa menang.',
    alias:
      '🎩 Alias\n\n' +
      'Game tim cepat yang menguji ekspresi dan kerja sama. Siap-siap dapat deskripsi "jenius" dan rekan "bingung".\n\n' +
      '📖 Persiapan\n' +
      'Pemain tekan Siap di ruangan; Bot bagi jadi dua tim (🔴 Merah dan 🔵 Biru).\n\n' +
      '🔄 Alur (ronde ber waktu)\n' +
      'Mulai giliran: Bot umumkan "Giliran tim 🔴 Merah!" dan pilih pemain A sebagai Penjelas.\n' +
      'Kata lewat DM: Bot kirim kata ke Penjelas lewat DM (mis. "kulkas").\n' +
      '60 detik: Penjelas uraikan kata di grup; 🔴 Merah tebak di chat. 🔵 Biru hanya nonton dan tidak boleh jawab.\n' +
      'Contoh: pemain A di chat: "Di dapur! Besar! Dinginin!" — Merah 1: "AC!" Merah 2: "Freezer!" Merah 3: "Kulkas!"\n' +
      'Skor: Begitu pesan Merah cocok persis dengan kata, Bot hitung: ✅ Benar! Merah +1. Kata berikut dikirim! Bot kirim ke Penjelas kata berikut (mis. "astronot") dan ulang sampai waktu habis.\n' +
      'Ganti: Setelah 60 detik Bot hitung; giliran 🔵 Biru dengan Penjelas mereka. Alur sama.\n' +
      'Akhir: Tim pertama yang capai skor target (mis. 30) menang.\n\n' +
      '🚫 Aturan (anti-curang)\n' +
      'Jangan pakai akar kata: Kalau katanya "kulkas", jangan pakai "kulk" atau "kulkas" di deskripsi.\n' +
      'Jangan terjemahkan: Jangan kasih kata dalam bahasa lain (mis. jangan "Refrigerator" sebagai petunjuk).\n' +
      'Pelanggaran: Bot cek setiap pesan Penjelas. Kalau deteksi akar kata, kata batal dan Bot ingatkan di grup: ❌ Penjelas pakai akar kata! Kata batal, -1 poin. Kata berikut dikirim.',
  },
  wordTest: {
    chooseRounds: '🔤 Jago Kosakata: pilih jumlah ronde (5 / 8 / 10 / 12):',
    finished: '🎉 Jago Kosakata selesai! Terima kasih sudah main.',
    roundPrompt: (current: number, total: number, prefix: string, minLen: number) =>
      `Ronde ${current}/${total}\nKirim kata yang dimulai "${prefix}", minimal ${minLen} huruf, hanya a–z.\n⏱ Waktu: 30 detik`,
    hint10s: '⏰ Tinggal 10 detik!',
    hint5s: '⏰ Tinggal 5 detik!',
    timeoutNoWinner: '⏱ Waktu habis. Tidak ada yang jawab.',
    winner: (user: string, word: string) => `🥇 ${user} jawab duluan: "${word}"`,
    nextRoundIn10s: '⏱ Ronde berikutnya dalam 10 detik.',
    nextRoundIn5s: '⏱ Ronde berikutnya dalam 5 detik.',
    rankingTitle: '📊 Ranking (jawaban benar)',
    rankingLine: (name: string, count: number) => `• ${name} — ${count}`,
    rankingNobody: '(Tidak ada yang jawab benar)',
  },
  wordBomb: {
    chooseRounds: '💣 Estafet Kata Bom. Pilih jumlah ronde:',
    joinOpen:
      '💣 Pendaftaran dibuka! Kirim pesan untuk gabung (maks. 8). Game mulai dalam 25 detik.',
    notEnoughPlayers: 'Pemain tidak cukup. Game dibatalkan.',
    roundStart: (round: number, total: number, order: string, startWord: string) =>
      `Ronde ${round}/${total}\nUrutan: ${order}\nKata awal: 💣 ${startWord}`,
    mustStartWith: (letter: string) => `Kata kamu harus mulai dengan "${letter}".`,
    turnPrompt: (name: string) => `Giliran: 📍${name}. Kamu punya 6 detik untuk kirim kata.`,
    timeoutOut: (name: string) => `${name} 💣 boom! Kamu gugur.`,
    gameOverWinner: (name: string) => `Game over! Pemenang: ${name}`,
    gameOverNoWinner: 'Semua gugur. Tidak ada pemenang.',
  },
  dice: {
    chooseRounds: '🎲 Tebak Dadu. Pilih jumlah ronde:',
    joinOpen:
      '🎲 Pendaftaran dibuka! Kirim pesan untuk gabung (2–10). Mulai dalam 20 detik. Semua mulai dengan 20 poin.',
    notEnoughPlayers: 'Pemain tidak cukup. Game dibatalkan.',
    gameStart: 'Tebak Dadu dimulai!',
    roundBetPrompt: (current: number, total: number) => `Ronde ${current}/${total}\nPasang taruhan!`,
    notInGame: 'Kamu tidak ikut game ini.',
    notEnoughScore: 'Poin tidak cukup untuk taruhan itu.',
    gameFinishedRanking: (rankingLines: string) => `Game selesai! Ranking:\n${rankingLines}`,
    rollResultRanking: (die: number, rankingLines: string) =>
      `🎲 Dadu: ${die}\nRanking:\n${rankingLines}`,
  },
  anonymous: {
    chooseTopic: '✉️ Surat Anonim. Pilih topik atau buat sendiri:',
    topicRel: 'Hubungan',
    topicJob: 'Pekerjaan',
    topicFriend: 'Pertemanan',
    topicCustom: 'Topik custom',
    askCustomTopic: 'Kirim satu baris dengan topik custom kamu.',
    invalidLink: 'Link tidak valid.',
    notActive: 'Topik anonim itu tidak aktif di grup itu sekarang.',
    privateIntro: (topic: string) => `Kamu bisa kirim pesan anonim tentang: "${topic}". Ketik pesanmu.`,
    groupTopicLink: (topic: string, link: string) =>
      `Topik anonim: "${topic}".\nBuka link ini untuk kirim pesan anonim:\n${link}`,
    forwarded: (topic: string, text: string) => `✉️ Pesan anonim tentang "${topic}":\n${text}`,
  },
  undercover: {
    joinSuccess: 'Kamu sudah gabung. Menunggu game dimulai.',
    joinSuccessWithReturnLink: (groupLink: string) =>
      `Kamu sudah gabung. Menunggu game dimulai.\nKembali ke grup 👉 <a href="${groupLink}">Klik di sini</a>`,
    countdown20s: '⏱ Pendaftaran tutup dalam 20 detik',
    countdown10s: '⏱ Pendaftaran tutup dalam 10 detik',
    countdown5s: '⏱ Pendaftaran tutup dalam 5 detik',
    yourWordCivilian: (word: string) => `Kata kamu: ${word}`,
    yourWordUndercover: (word: string) => `Kamu undercover! Kata kamu (beda): ${word}`,
    gameStartCivilian: (word: string) => `Game mulai! Kata kamu: ${word}`,
    gameStartUndercover: (word: string) => `Game mulai! Kata kamu: ${word}`,
    blankWord: '(Kosong)',
    blankCivilianMessage: 'Game mulai! Ronde ini kamu tidak dapat kata (kosong).',
    blankUndercoverMessage: 'Game mulai! Ronde ini kamu tidak dapat kata (kosong).',
    speakingOrder: (order: string) => `Urutan bicara:\n${order}`,
    speakingOrderSuffix: ' > 45 dtk diskusi bebas > voting',
    nowSpeaking: (name: string) => `Giliran: 📍${name}`,
    speakButtonHint: '👇 Jangan tekan tombol kalau bukan giliran kamu❗️❗️❗️',
    btnEndSpeak: 'Akhiri giliran',
    btnEndRound: 'Akhiri ronde',
    btnEndGame: '🛑 Akhiri game',
    freeTalk: '45 detik diskusi bebas!',
    votePrompt: 'Vote yang mencurigakan:',
    eliminated: (name: string) => `💀 ${name} gugur!`,
    civiliansWin: '🏆 Warga menang! Semua mata-mata sudah dieliminasi, game ini berakhir.',
    undercoverWins: '🏆 Mata-mata menang! Jumlah mata-mata sekarang ≥ jumlah warga, game ini berakhir.',
    nextRound: 'Ronde berikutnya',
    joinStartText: (link: string, min: number, max: number, seconds: number) =>
      `🎭 Undercover mau mulai!\nKetuk untuk gabung (chat pribadi):\n${link}\n\nPemain: ${min}–${max}. Kamu punya ${seconds} detik.`,
    joinClosed: 'Pendaftaran sudah ditutup.',
    linkExpiredGameStarted: 'Game sudah mulai. Link ini tidak berlaku lagi.',
    linkExpiredRoomFull: (max) => `Ruangan game sudah penuh (maks ${max} pemain). Link tidak berlaku lagi.`,
    maxPlayers: 'Pemain sudah penuh.',
    startCancelled: 'Pemain tidak cukup. Game gagal mulai — ajak teman main!',
    startAnnounce: (count: number) => `Undercover mulai! Pemain: ${count}.`,
    voteDone: (name: string) => `Kamu vote ${name}`,
    votingEnded: 'Voting selesai.',
    notVotingNow: 'Bukan waktu voting.',
    notInThisGame: 'Kamu tidak ikut game ini.',
    invalidVoteTarget: 'Kamu tidak bisa vote pemain itu.',
    noVotesRetry: 'Tidak ada suara yang masuk. Game ini berakhir.',
    speakTimeoutHint25: '⏱ 25s lagi untuk selesai bicara',
    speakTimeoutHint10: '⏱ 10s lagi untuk selesai bicara',
    freeTalkTimeoutHint45: '⏱ 45s lagi untuk diskusi bebas',
    freeTalkTimeoutHint20: '⏱ 20s lagi untuk diskusi bebas',
    freeTalkTimeoutHint10: '⏱ 10s lagi untuk diskusi bebas',
    voteTimeoutHint12: '⏱ 12s lagi untuk selesai voting',
    tallyHeader: (roomId) => `🎪 Ruangan ${roomId}`,
    tallyTitle: '🗳 Hasil voting:',
    tallyLine: (name, count, voters) => `${name}  ${count} suara <<< ${voters}`,
    noVotesInTally: '(Tidak ada suara)',
    roomFull: (used: number, max: number) => `Ruangan Undercover penuh: ${used}/${max}. Coba lagi nanti.`,
    currentRoomPlayers: (roomId: number, count: number, names: string) => `🎪 Ruangan ${roomId} pemain: ${count} — ${names}`,
    roundEnded: 'Ronde ini sudah berakhir.',
  },
  bunker: {
    alreadyJoined: 'Kamu sudah bergabung.',
    roomFull: 'Ruangan penuh.',
    linkExpiredRoomFull: (max: number) => `Ruangan game sudah penuh (maks ${max} pemain). Link tidak berlaku lagi.`,
    joinSuccess: 'Kamu masuk Bunker. Tunggu mulai di grup.',
    currentPlayers: (roomId: number, count: number, names: string) => `🎪 Ruangan ${roomId} pemain: ${count} — ${names}`,
    game_start: '🚨 <b>Peringatan! Bencana Global!</b>\n\n%disaster%\n\nBunker hanya memuat <b>%capacity%</b> orang. Ronde 1 dimulai! Ungkap profesimu.',
    phase_debate: '🗣 <b>Fase Debat!</b> Ungkap sifatmu selanjutnya! Kamu punya 2 menit.',
    phase_voting: '🗳 <b>Waktu Memilih!</b> Siapa yang dikeluarkan? Pilih:',
    player_kicked: '💀 <b>%name%</b> dikeluarkan. Profil rahasia: %traits%',
    game_over: '🎉 <b>Permainan Selesai!</b> Pintu ditutup. Korban selamat: %winners%.',
    your_card: '🎫 <b>BERKASMU (Rahasiakan!):</b>\nProfesi: %profession%\nKesehatan: %health%\nBarang: %inventory%\nFobia: %phobia%',
    disasters: ['Kiamat Zombie.', 'Perang Nuklir.', 'Meteor jatuh.'],
    professions: ['Ahli Bedah', 'Komedian', 'Programmer', 'Tukang Ledeng', 'Politisi'],
    health: ['Sehat Sempurna', 'Asma', 'Alergi', 'Kanker'],
    inventory: ['P3K', 'Vodka', 'Gergaji Mesin', 'Gitar'],
    phobias: ['Klaustrofobia', 'Takut Gelap', 'Takut Laba-laba', 'Takut Darah'],
    orderHeader: (roomId, orderLine) => `🎪 【 📍 Ruangan #${roomId} 】\nUrutan:\n📍 ${orderLine} > 45s diskusi > voting`,
    currentSpeaker: (name) => `Giliran: 📍 ${name}\n❗️Hanya orang ini yang boleh menekan.`,
    notYourTurn: '🤡 Tertipu! Klik juga percuma! 😂 Wkwk 🤣!!!',
    btnEndSpeak: 'Akhiri giliran',
    freetalkTitle: '🗣 45 detik diskusi bebas!',
    btnEndRound: 'Akhiri ronde',
    votePromptTimer: (seconds) => `🗳 Vote untuk mengeliminasi (${seconds}detik):`,
    voteEliminateLabel: 'Eliminasi',
    voteUpdated: (emoji, name) => `✅ Vote diupdate! Kamu vote ${emoji} ${name}`,
    btnEndGame: '🛑 Akhiri game',
    tallyHeader: (roomId) => `🎪 【 📍 Ruangan #${roomId} 】`,
    tallyTitle: '🗳 Hasil voting:',
    tallyLine: (name, count, voters) => `${name}  ${count} suara <<< ${voters}`,
    noVotesInTally: '(Tidak ada suara)',
    gameForceEnded: 'Game diakhiri atas permintaan.',
    emojiPoolExhausted: 'Pool emoji habis. Permainan berakhir.',
    alreadyEnded: 'Selesai',
  },
  alias: {
    alreadyJoined: 'Kamu sudah bergabung.',
    linkExpiredRoomFull: (max: number) => `Ruangan game sudah penuh (maks ${max} pemain). Link tidak berlaku lagi.`,
    joinSuccess: 'Kamu bergabung. Tunggu mulai di grup.',
    currentPlayers: (roomId: number, count: number, names: string) => `🎪 Ruangan ${roomId} pemain: ${count} — ${names}`,
    turn_start: '🔥 <b>Giliran Tim %team%!</b>\n@%explainer% sedang menjelaskan. Tebak di chat!\n⏱ 60 detik!',
    correct_guess: '✅ <b>Benar!</b> @%guesser% menebaknya! Tim %team% +1 poin!\nKata selanjutnya dikirim.',
    foul_warning: '❌ <b>Pelanggaran!</b> @%explainer% menggunakan kata dasar! -1 poin.',
    round_end: '🛑 <b>Waktu habis!</b> Skor: Merah (%scoreA%) - Biru (%scoreB%).',
    game_over: '🏆 <b>Permainan Selesai!</b> Tim %winner% menang!',
    your_word: '🤫 Katamu: <b>%word%</b>. (Jangan gunakan kata dasar!)',
    words: ['Astronot', 'Kulkas', 'Alien', 'Dinosaurus', 'Gedung Pencakar Langit', 'Helikopter'],
  },
};
