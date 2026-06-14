// index.js - registro dei minigiochi. Aggiungere qui un nuovo tipo lo rende
// disponibile a tutta la storia tramite { minigame: { type: 'xxx', config: {...} } }
import { play as rhythm } from './rhythm.js';
import { play as aim } from './aim.js';
import { play as logic } from './logic.js';
import { diff as getDiff, diffByKey } from '../state.js';

const REGISTRY = { rhythm, aim, logic };

// runMinigame(type, container, config, diffKey?) -> Promise<{won, stars}>
// diffKey opzionale: difficolta scelta al volo per QUESTA prova (override del globale)
export function runMinigame(type, container, config = {}, diffKey = null) {
  const fn = REGISTRY[type];
  if (!fn) return Promise.resolve({ won: true, stars: 0 });
  const diff = diffKey ? diffByKey(diffKey) : getDiff();
  return fn(container, { diff, config });
}

export const MINIGAME_TYPES = Object.keys(REGISTRY);
