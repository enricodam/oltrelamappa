// index.js - registro dei minigiochi. Aggiungere qui un nuovo tipo lo rende
// disponibile a tutta la storia tramite { minigame: { type: 'xxx', config: {...} } }
import { play as rhythm } from './rhythm.js';
import { play as aim } from './aim.js';
import { play as logic } from './logic.js';
import { diff as getDiff } from '../state.js';

const REGISTRY = { rhythm, aim, logic };

// runMinigame(type, container, config) -> Promise<{won, stars}>
export function runMinigame(type, container, config = {}) {
  const fn = REGISTRY[type];
  if (!fn) return Promise.resolve({ won: true, stars: 0 });
  return fn(container, { diff: getDiff(), config });
}

export const MINIGAME_TYPES = Object.keys(REGISTRY);
