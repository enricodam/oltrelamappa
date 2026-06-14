// state.js - stato di gioco, impostazioni, salvataggio
// "Oltre la Mappa" - Le Isole che si Allontanano

const SAVE_KEY = 'oltrelamappa_save_v1';

// Profili di difficolta. Regolano velocita minigiochi, tolleranza, opzioni enigmi.
export const DIFFICULTY = {
  facile: {
    id: 'facile',
    label: 'Facile',
    desc: 'Per chi vuole godersi la storia. Minigiochi lenti e perdonanti, molti aiuti.',
    icon: '🌱',
    speed: 0.65,        // moltiplicatore velocita (piu basso = piu lento/facile)
    lives: 5,           // tentativi nei minigiochi
    targetScale: 1.6,   // zone bersaglio piu grandi
    logicOptions: 3,    // numero opzioni negli enigmi
    logicTimer: 0,      // 0 = nessun timer
    hints: true,        // mostra suggerimenti
  },
  medio: {
    id: 'medio',
    label: 'Medio',
    desc: 'L\'equilibrio giusto. Un po\' di sfida, ma sempre alla portata.',
    icon: '⚓',
    speed: 1.0,
    lives: 3,
    targetScale: 1.0,
    logicOptions: 5,
    logicTimer: 0,
    hints: false,
  },
  difficile: {
    id: 'difficile',
    label: 'Difficile',
    desc: 'Per veri esploratori. Minigiochi rapidi, pochi tentativi, enigmi tosti a tempo.',
    icon: '🔥',
    speed: 1.4,
    lives: 2,
    targetScale: 0.7,
    logicOptions: 7,
    logicTimer: 12,
    hints: false,
  },
};

// Modalita di lettura: cambia complessita dei testi e dimensione font.
export const READING = {
  ragazzi: { id: 'ragazzi', label: '8-12 anni', icon: '📖', desc: 'Testi piu ricchi, scelte con qualche sfumatura.' },
  famiglia: { id: 'famiglia', label: 'Famiglia / tutti', icon: '👨‍👩‍👧', desc: 'Testi piu semplici e diretti, tono dolce.' },
};

const defaultState = () => ({
  version: 1,
  difficulty: 'medio',
  reading: 'famiglia',
  heroName: 'Marì',
  node: null,          // id del nodo corrente nella storia
  island: null,        // id isola corrente
  visited: [],         // nodi gia visti
  flags: {},           // interruttori narrativi (chiavi raccolte, scelte fatte)
  islandsDone: [],     // isole completate
  bridges: 0,          // "ponti" ricostruiti tra le isole = progresso principale
  stars: 0,            // stelline raccolte nei minigiochi (punteggio gentile)
});

let state = defaultState();

export function getState() { return state; }

export function resetState() {
  state = defaultState();
  save();
  return state;
}

export function newGame({ difficulty, reading, heroName }) {
  const fresh = defaultState();
  fresh.difficulty = difficulty || 'medio';
  fresh.reading = reading || 'famiglia';
  if (heroName && heroName.trim()) fresh.heroName = heroName.trim().slice(0, 16);
  state = fresh;
  save();
  return state;
}

export function diff() { return DIFFICULTY[state.difficulty] || DIFFICULTY.medio; }
export function diffByKey(key) { return DIFFICULTY[key] || diff(); }
export function isFamiglia() { return state.reading === 'famiglia'; }

export function setFlag(key, value = true) { state.flags[key] = value; save(); }
export function hasFlag(key) { return !!state.flags[key]; }

export function addStars(n) { state.stars += n; save(); }
export function addBridge() { state.bridges += 1; save(); }

export function visit(nodeId) {
  if (!state.visited.includes(nodeId)) state.visited.push(nodeId);
  state.node = nodeId;
  save();
}

export function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* storage pieno o bloccato */ }
}

export function hasSave() {
  try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
}

export function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data && data.version === 1) { state = { ...defaultState(), ...data }; return state; }
  } catch (e) { /* salvataggio corrotto */ }
  return null;
}

// Codice partita (backup copia-incolla, come nel gioco d20)
export function exportCode() {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(state)))); } catch (e) { return ''; }
}
export function importCode(code) {
  try {
    const data = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
    if (data && data.version === 1) { state = { ...defaultState(), ...data }; save(); return true; }
  } catch (e) { /* codice non valido */ }
  return false;
}
