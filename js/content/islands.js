// islands.js - dati della mappa del mare di Sottoonda.
// Aggiungere un'isola = aggiungere una voce qui + i suoi nodi in story.js.
export const ISLANDS = [
  {
    id: 'faro',
    name: 'Isola del Faro',
    emoji: '🗼',
    x: 22, y: 64,
    needBridges: 0,            // sbloccata da subito
    start: 'faro_1',
    blurb: 'Dove tutto comincia. Il vecchio faro non si accende piu\'.',
  },
  {
    id: 'mercato',
    name: 'Isola del Mercato Galleggiante',
    emoji: '⛵',
    x: 52, y: 40,
    needBridges: 1,
    start: 'mercato_1',
    blurb: 'Barche-bottega legate insieme. Ci si arriva col primo ponte.',
  },
  {
    id: 'nebbie',
    name: 'Isola delle Nebbie',
    emoji: '🌫️',
    x: 78, y: 66,
    needBridges: 2,
    start: 'nebbie_1',
    blurb: 'Avvolta nella foschia. Qualcosa la tiene lontana da tutte le altre.',
  },
  {
    id: 'cuore',
    name: 'Cuore del Mare',
    emoji: '💙',
    x: 50, y: 18,
    needBridges: 3,
    start: 'cuore_1',
    blurb: 'Il centro dell\'arcipelago. La risposta e\' qui.',
  },
];

export function islandById(id) { return ISLANDS.find(i => i.id === id); }
