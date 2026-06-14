// story.js (contenuti) - "Le Isole che si Allontanano"
// Testi con due varianti di lettura: { ragazzi, famiglia }. Stringa singola = uguale per entrambi.
// {nome} viene sostituito col nome dell'eroe.

export const NODES = {

  // ============================ ISOLA 1: IL FARO ============================
  faro_1: {
    mood: 'dawn', scene: '🌅🗼🌊',
    speaker: 'Bussola', speakerClass: 'bussola',
    text: [
      { famiglia: 'Sveglia, {nome}! Sono io, Bussola. Mi hai trovato ieri sulla spiaggia, ti ricordi?',
        ragazzi: 'Sveglia, {nome}! Sono io, Bussola, la tua bussola parlante. Mi hai raccolto ieri tra i sassi della spiaggia, ti ricordi?' },
      { famiglia: 'Guarda il mare... e\' diventato piu\' largo. Le altre isole sono lontanissime!',
        ragazzi: 'Guarda il mare laggiu\'. Stanotte si e\' allargato di nuovo: le altre isole sembrano scivolate via, sempre piu\' lontane.' },
    ],
    choices: [
      { label: { famiglia: 'Cosa sta succedendo?', ragazzi: 'Bussola, cosa sta succedendo al mare?' }, next: 'faro_2' },
    ],
  },

  faro_2: {
    mood: 'dawn', speaker: 'Nonna Vela', speakerClass: 'vela',
    text: [
      { famiglia: 'Ah, sei sveglio! Sono Nonna Vela, la guardiana del faro. Ma il mio faro... si e\' spento.',
        ragazzi: 'Ah, finalmente sveglio! Sono Nonna Vela, la guardiana del faro. Solo che il mio faro, dopo cent\'anni, stanotte si e\' spento.' },
      { famiglia: 'Senza la sua luce, le barche non trovano la strada e le isole si perdono di vista.',
        ragazzi: 'Senza la sua luce nessuna barca trova la rotta, e le isole smettono di guardarsi. E quando smetti di guardarti, ti allontani.' },
      'Mi aiuti a riaccenderlo? Ma prima devo aprirti il magazzino degli attrezzi.',
    ],
    choices: [
      { label: 'Certo, ti aiuto!', next: 'faro_3', set: { gentile: true } },
      { label: { famiglia: 'E come si apre?', ragazzi: 'Volentieri. Come si apre il magazzino?' }, next: 'faro_3' },
    ],
  },

  faro_3: {
    speaker: 'Nonna Vela', speakerClass: 'vela',
    text: 'La porta del magazzino si apre solo con la risposta giusta. E\' un vecchio indovinello, prova tu.',
    minigame: {
      type: 'logic',
      config: {
        title: 'L\'indovinello della porta',
        prompt: 'Piu\' me ne togli, piu\' divento grande. Cosa sono?',
        correct: 'Un buco',
        distractors: ['Una montagna', 'Il mare', 'Un sasso', 'L\'ombra', 'Il vento', 'Una nuvola', 'Una stella'],
        hint: 'Pensa a quando scavi una buca nella sabbia: piu\' sabbia togli...',
      },
      win: 'faro_4',
      winText: 'CLAC! La porta si apre. Nonna Vela applaude: "Sveglia quella testolina!"',
      loseText: 'La porta resta chiusa. Respira e riprova, ci sei quasi.',
    },
  },

  faro_4: {
    speaker: 'Bussola', speakerClass: 'bussola',
    text: [
      'Dentro c\'e\' la grande lente del faro... ma e\' rotta in tanti pezzi!',
      { famiglia: 'I pezzi sono rotolati giu\' sulla spiaggia, tra le onde. Dobbiamo raccoglierli, ma attento ai granchi!',
        ragazzi: 'I frammenti sono rotolati giu\' sulla spiaggia, in mezzo alla risacca. Bisogna recuperarli alla svelta, schivando i granchi dispettosi.' },
    ],
    choices: [
      { label: 'Corro a raccoglierli!', next: 'faro_5' },
      { label: { famiglia: 'Vado piano e attento.', ragazzi: 'Scendo con calma, un pezzo alla volta.' }, next: 'faro_5', set: { prudente: true } },
    ],
  },

  faro_5: {
    text: 'Sulla spiaggia i pezzi di vetro luccicano tra la sabbia. Muoviti a destra e sinistra!',
    minigame: {
      type: 'aim',
      config: {
        title: 'I pezzi della lente',
        prompt: 'Raccogli i pezzi 💎, evita i granchi 🦀',
        goal: 7, good: '💎', bad: '🦀', hero: '🧺',
      },
      win: 'faro_6',
      winText: 'Hai raccolto tutti i pezzi della lente! Brillano come gemme.',
      loseText: 'I granchi ti hanno fatto scappare. Riprova con piu\' calma!',
    },
  },

  faro_6: {
    speaker: 'Nonna Vela', speakerClass: 'vela',
    scene: '🦭',
    text: [
      { famiglia: 'Mentre risali, senti un pianto. Un cucciolo di foca e\' rimasto incastrato tra due scogli.',
        ragazzi: 'Mentre risali con il cesto pieno, un lamento ti ferma: un cucciolo di foca si e\' incastrato tra due scogli e non riesce a liberarsi.' },
      'Puoi fermarti ad aiutarlo, oppure correre al faro: la lente ti aspetta.',
    ],
    choices: [
      { label: { famiglia: 'Mi fermo e aiuto la foca.', ragazzi: 'Poso il cesto e libero il cucciolo.' }, next: 'faro_7a', set: { foca: true, gentile: true }, stars: 3 },
      { label: 'Corro al faro, non c\'e\' tempo.', next: 'faro_7b' },
    ],
  },

  faro_7a: {
    scene: '🦭💙', speaker: 'Bussola', speakerClass: 'bussola',
    text: [
      'Spingi piano gli scogli e la piccola foca scivola libera in mare. Ti fa un verso felice e sparisce tra le onde.',
      { famiglia: '"Hai un cuore grande, {nome}", dice Bussola. "Queste cose, il mare se le ricorda."',
        ragazzi: '"Hai un cuore grande, {nome}", mormora Bussola. "E il mare, vedrai, certe gentilezze se le ricorda a lungo."' },
    ],
    choices: [{ label: 'Ora accendiamo il faro!', next: 'faro_8' }],
  },

  faro_7b: {
    speaker: 'Bussola', speakerClass: 'bussola',
    text: 'Corri su per la scala col cesto stretto al petto. La foca dietro di te trovera\' la sua strada, speriamo. Arrivi in cima senza fiato.',
    choices: [{ label: 'Accendiamo il faro!', next: 'faro_8' }],
  },

  faro_8: {
    scene: '🗼🔥', speaker: 'Nonna Vela', speakerClass: 'vela',
    text: [
      'La lente e\' rimontata. Ora manca la fiamma. Lungo la miccia corre l\'acciarino: battilo proprio quando passa sopra lo stoppino della lampada.',
    ],
    minigame: {
      type: 'rhythm',
      config: { title: 'Accendi il faro!', tag: '🔥 Miccia', prompt: 'Batti l\'acciarino quando passa sullo stoppino 🕯️', rounds: 3, theme: 'fuse', zoneEmoji: '🕯️', cursorSprite: 'acciarino' },
      win: 'faro_9',
      winText: 'FIAMMA! La grande luce del faro torna ad accendersi e spazza il mare.',
      loseText: 'La scintilla non prende. Respira e riprova, e\' questione di tempismo.',
    },
  },

  faro_9: {
    mood: 'dawn', scene: '🗼✨🌊', speaker: 'Nonna Vela', speakerClass: 'vela',
    text: [
      { famiglia: 'Il faro brilla di nuovo! In lontananza, una luce risponde dall\'Isola del Mercato.',
        ragazzi: 'Il fascio di luce taglia la foschia e, lontano lontano, una piccola luce risponde dall\'Isola del Mercato. Qualcuno ti ha visto.' },
      { famiglia: 'Ma c\'e\' una cosa che devi sapere. Il mare non si allarga da solo...',
        ragazzi: 'Ma siediti un momento, perche\' c\'e\' una cosa che devi sapere. Il mare non si allarga per capriccio.' },
      { famiglia: 'Tanto tempo fa le isole cantavano insieme una canzone, e la canzone le teneva vicine. Poi qualcosa l\'ha spezzata.',
        ragazzi: 'Un tempo le isole cantavano tutte insieme la stessa canzone, e quel canto le teneva strette come amiche per mano. Poi il canto si e\' spezzato, e da allora si allontanano.' },
      'Segui le luci, {nome}. Ricuci le isole, una alla volta. Questo e\' il tuo primo ponte di luce.',
    ],
    bridge: true,
    onEnter: ({ setFlag }) => setFlag('faro_done'),
    choices: [
      { label: '🌉 Costruisci il ponte verso il Mercato', next: 'faro_end' },
    ],
  },

  faro_end: {
    toMap: true,
    onEnter: ({ setFlag }) => setFlag('island_faro_done'),
    text: '',
  },

  // ====================== ISOLA 2: MERCATO GALLEGGIANTE ======================
  mercato_1: {
    mood: 'day', scene: '⛵🏮⛵', speaker: 'Mastro Gancio', speakerClass: 'gancio',
    text: [
      { famiglia: 'Benvenuto al Mercato Galleggiante! Sono Mastro Gancio. Che disastro: la corrente ha sparpagliato la mia merce in mare!',
        ragazzi: 'Benvenuto al Mercato Galleggiante, ragazzo! Sono Mastro Gancio, mercante di barche. Guarda che disastro: la corrente che allontana le isole mi ha sparpagliato tutta la merce in acqua!' },
      'Aiutami a ripescare le casse buone, ma occhio alle meduse!',
    ],
    choices: [{ label: 'Ti do una mano!', next: 'mercato_2', set: { gentile: true } }],
  },

  mercato_2: {
    text: 'Le casse galleggiano qua e la\'. Manovra la barca e raccoglile, schivando le meduse!',
    minigame: {
      type: 'aim',
      config: { title: 'Ripesca la merce', prompt: 'Raccogli le casse 📦, evita le meduse 🪼', goal: 8, good: '📦', bad: '🪼', hero: '🚤' },
      win: 'mercato_3',
      winText: 'Recuperata tutta la merce! Mastro Gancio salta dalla gioia sul suo molo.',
      loseText: 'Le meduse pungono! Riprova, sei capace.',
    },
  },

  mercato_3: {
    speaker: 'Mastro Gancio', speakerClass: 'gancio',
    text: [
      'Grazie di cuore! Senti, anch\'io ho notato una cosa: di notte, dall\'Isola delle Nebbie, arriva un suono. Come una nota sola, triste, ripetuta.',
      { famiglia: 'Forse e\' un pezzo della canzone di cui parlava Nonna Vela. Ti porto la\' col mio ponte.',
        ragazzi: 'Scommetto che sia un frammento del canto di cui ti ha parlato Nonna Vela. Prendi questo legno buono: ci costruiamo il ponte verso le Nebbie.' },
    ],
    bridge: true,
    onEnter: ({ setFlag }) => setFlag('mercato_done'),
    choices: [{ label: '🌉 Costruisci il ponte verso le Nebbie', next: 'mercato_end' }],
  },

  mercato_end: { toMap: true, onEnter: ({ setFlag }) => setFlag('island_mercato_done'), text: '' },

  // ========================= ISOLA 3: LE NEBBIE =========================
  nebbie_1: {
    mood: 'fog', scene: '🌫️🎐🌫️', speaker: 'Bussola', speakerClass: 'bussola',
    text: [
      { famiglia: 'Che nebbia... Senti? Una campanella suona sempre la stessa nota. Din... din... din...',
        ragazzi: 'Qui la nebbia si taglia col coltello. Ascolta: una campanella, da qualche parte, ripete sempre la stessa identica nota. Din... din... din...' },
      'Forse, se rispondi alla nota al momento giusto, la nebbia si dirada. Proviamo a "suonarle" la risposta.',
    ],
    choices: [{ label: 'Rispondo alla campanella.', next: 'nebbie_2' }],
  },

  nebbie_2: {
    text: 'Aspetta che la nota passi nel punto giusto, e rispondi a tempo.',
    minigame: {
      type: 'rhythm',
      config: { title: 'Rispondi alla nebbia', prompt: 'Ferma il cursore sulla nota verde, a tempo.', rounds: 4 },
      win: 'nebbie_2b',
      winText: 'A ogni risposta giusta la nebbia si apre un po\'. Tra i banchi di foschia luccicano delle conchiglie.',
      loseText: 'La nota ti sfugge e la nebbia si richiude. Riprova, ascolta il ritmo.',
    },
  },

  nebbie_2b: {
    mood: 'fog', speaker: 'Bussola', speakerClass: 'bussola',
    text: [
      { famiglia: 'Le conchiglie suonano a coppie. Ricorda dove sono e abbinale: la nebbia si aprira\' del tutto.',
        ragazzi: 'Senti? Ogni conchiglia ha la sua gemella, che suona la stessa nota. Memorizza dove sono e ritrova le coppie: cosi\' la nebbia si diradera\' del tutto.' },
    ],
    minigame: {
      type: 'memory',
      config: { title: 'Le conchiglie gemelle', tag: '🐚 Memory', prompt: 'Gira le conchiglie e trova le coppie uguali.', emojis: ['🐚', '🐠', '⭐', '🌊', '🦀', '🐙', '🪸', '🐢'] },
      win: 'nebbie_3',
      winText: 'Tutte le coppie ritrovate! La nebbia si apre e davanti a te appare una bambina.',
      loseText: 'Ti sei confuso tra le conchiglie. Riprova, concentrati sulle posizioni.',
    },
  },

  nebbie_3: {
    mood: 'fog', speaker: 'Lina', speakerClass: 'lina',
    text: [
      { famiglia: 'Mi chiamo Lina. Suono la campanella da tanto, sperando che qualcuno mi sentisse. Mi sentivo cosi\' sola.',
        ragazzi: '"Mi chiamo Lina", dice la bambina. "Suono questa campanella da settimane, sperando che qualcuno, da un\'altra isola, mi sentisse. Mi ero convinta di essere rimasta sola al mondo."' },
      { famiglia: 'Tu mi hai risposto. Forse e\' cosi\' che si aggiusta la canzone: qualcuno suona, e qualcun altro risponde.',
        ragazzi: '"Ma tu mi hai risposto. Ecco, forse il canto si ripara cosi\': non da soli, ma quando una nota chiama e un\'altra le risponde."' },
      'Vieni, ti accompagno. Il Cuore del Mare e\' vicino, lo sento.',
    ],
    bridge: true,
    onEnter: ({ setFlag }) => { setFlag('nebbie_done'); setFlag('amici_lina'); },
    choices: [{ label: '🌉 Costruisci il ponte verso il Cuore del Mare', next: 'nebbie_end' }],
  },

  nebbie_end: { toMap: true, onEnter: ({ setFlag }) => setFlag('island_nebbie_done'), text: '' },

  // ========================= FINALE: CUORE DEL MARE =========================
  cuore_1: {
    mood: 'night', scene: '💙🌊✨', speaker: 'Bussola', speakerClass: 'bussola',
    text: [
      { famiglia: 'Eccolo. Una grande conchiglia azzurra in mezzo al mare. E\' il Cuore: una volta cantava, e teneva insieme tutte le isole.',
        ragazzi: 'Eccolo davanti a te: una conchiglia azzurra grande come una casa, sospesa al centro dell\'arcipelago. E\' il Cuore del Mare. Un tempo cantava da solo, e il suo canto teneva insieme ogni isola.' },
      { famiglia: 'Ma ora e\' incrinato e silenzioso. Come si fa a farlo cantare di nuovo?',
        ragazzi: 'Ora pero\' e\' incrinato, e tace. La domanda e\' una sola: come lo si convince a cantare di nuovo?' },
    ],
    choices: [
      { label: { famiglia: 'Chiamo tutti gli amici a cantare insieme.', ragazzi: 'Chiamo Nonna Vela, Mastro Gancio e Lina: cantiamo tutti insieme.' }, next: 'cuore_canto' },
      { label: { famiglia: 'Chiudo la crepa con delle assi.', ragazzi: 'Riparo la crepa in fretta, inchiodandoci sopra delle assi.' }, next: 'cuore_toppa' },
    ],
  },

  cuore_canto: {
    mood: 'night', speaker: 'Bussola', speakerClass: 'bussola',
    text: [
      'Bussola gira la sua lancetta verso il cielo: "Allora dai il tempo, {nome}. Falli partire tutti insieme, al momento giusto."',
    ],
    minigame: {
      type: 'rhythm',
      config: { title: 'Dirigi il coro', prompt: 'Dai il tempo: ferma sul verde e tutti cantano insieme.', rounds: 3 },
      win: 'finale_buono',
      winText: 'Una voce, poi due, poi tutte. Il Cuore del Mare riprende a cantare!',
      loseText: 'Il coro va fuori tempo e si ferma. Riprendi il tempo e riprova.',
      skipTo: 'cuore_toppa',
    },
  },

  finale_buono: {
    mood: 'dawn', scene: '🌅💙🎶🗼⛵🌫️', speaker: 'Bussola', speakerClass: 'bussola',
    ending: true,
    text: [
      { famiglia: 'Il canto si allarga sul mare come un abbraccio. Piano piano, le isole tornano a riavvicinarsi.',
        ragazzi: 'Il canto si allarga sull\'acqua come un abbraccio che si apre. E una alla volta, dolcemente, le isole smettono di scappare e tornano a stringersi.' },
      { famiglia: 'Nonna Vela, Mastro Gancio e Lina cantano con te. Nessuno e\' piu\' solo.',
        ragazzi: 'Nonna Vela batte le mani, Mastro Gancio canta stonato e felice, Lina ride. Nessuno, su nessuna isola, e\' piu\' solo.' },
      { famiglia: 'Hai capito il segreto, {nome}: le isole non si tengono insieme con le assi, ma rispondendosi.',
        ragazzi: 'Hai imparato il vero segreto, {nome}: un mondo non si tiene insieme inchiodandolo, ma facendo in modo che ognuno risponda alla voce dell\'altro.' },
      '🎉 FINE - "Il Canto Ritrovato" 🎉',
    ],
  },

  cuore_toppa: {
    mood: 'night', scene: '💙🔨', speaker: 'Bussola', speakerClass: 'bussola',
    ending: true,
    text: [
      { famiglia: 'Le assi tengono, e il mare smette di allargarsi. Le isole restano dove sono, ferme.',
        ragazzi: 'Le assi reggono e la crepa si chiude. Il mare smette di allargarsi: le isole restano dove sono, immobili, salve.' },
      { famiglia: 'Bussola ti guarda: "Va bene cosi\'. Ma non canta piu\'. Forse un giorno troveremo un modo migliore."',
        ragazzi: 'Bussola ti guarda con la sua lancetta storta: "Hai salvato tutto, e va bene cosi\'. Pero\' il Cuore non canta piu\'. Magari, un giorno, troveremo un modo piu\' bello."' },
      '🌙 FINE - "La Toppa" (prova a chiamare gli amici, la prossima volta!) 🌙',
    ],
  },
};
