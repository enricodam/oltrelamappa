// memory.js - Minigioco MEMORY: trova le coppie uguali.
// config: { title, prompt, tag, emojis: [...] }
// La difficolta regola: numero di coppie, sbirciata iniziale, errori concessi.
import { sfx } from '../audio.js';

const PAIRS = { facile: 3, medio: 4, difficile: 6 };
const PEEK = { facile: 2600, medio: 1300, difficile: 0 };

function shuffle(a) {
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
}

export function play(container, { diff, config }) {
  return new Promise((resolve) => {
    const pairs = PAIRS[diff.id] || 4;
    const peekMs = PEEK[diff.id] != null ? PEEK[diff.id] : 1300;
    let lives = Math.max(3, diff.lives + 2); // errori concessi
    const pool = (config.emojis && config.emojis.length >= pairs) ? config.emojis : ['🐚', '🐠', '⭐', '🌊', '🦀', '⚓', '🐙', '🪸', '🏝️', '🐢'];
    const chosen = shuffle(pool).slice(0, pairs);
    const deck = shuffle([...chosen, ...chosen]);
    const cols = deck.length <= 6 ? 3 : 4;

    let matched = 0, lock = true, first = null;

    const root = document.createElement('div');
    root.className = 'mg mg-memory';
    root.innerHTML = `
      <div class="mg-head">
        <span class="mg-tag">${config.tag || '🧠 Memory'}</span>
        <span class="mg-lives" id="mg-lives"></span>
      </div>
      <h2 class="mg-title">${config.title || 'Trova le coppie!'}</h2>
      <p class="mg-prompt">${config.prompt || 'Gira le carte e abbina le coppie uguali.'}</p>
      <div class="mg-progress" id="mg-prog"></div>
      <div class="mg-mem-grid" id="mg-grid" style="grid-template-columns:repeat(${cols},1fr)"></div>
      <p class="mg-status" id="mg-status"></p>
    `;
    container.innerHTML = '';
    container.appendChild(root);

    const grid = root.querySelector('#mg-grid');
    const livesEl = root.querySelector('#mg-lives');
    const progEl = root.querySelector('#mg-prog');
    const statusEl = root.querySelector('#mg-status');
    const drawLives = () => { livesEl.textContent = '❤️'.repeat(Math.max(0, lives)); };
    const drawProg = () => { progEl.textContent = `${matched}/${pairs} coppie`; };
    drawLives(); drawProg();

    const cards = deck.map((emoji) => {
      const c = document.createElement('button');
      c.className = 'mem-card show';
      c.innerHTML = `<span class="mem-face">${emoji}</span>`;
      c.dataset.emoji = emoji;
      grid.appendChild(c);
      c.addEventListener('click', () => onPick(c));
      return c;
    });

    function setFace(c, on) { c.classList.toggle('show', on); }

    function finish(won) {
      cards.forEach(c => c.disabled = true);
      if (won) { sfx.win(); resolve({ won: true, stars: pairs }); }
      else { sfx.lose(); resolve({ won: false, stars: matched }); }
    }

    function onPick(c) {
      if (lock || c.classList.contains('matched') || c === first || c.classList.contains('show')) return;
      sfx.click();
      setFace(c, true);
      if (!first) { first = c; return; }
      lock = true;
      if (first.dataset.emoji === c.dataset.emoji) {
        first.classList.add('matched'); c.classList.add('matched');
        matched++; drawProg(); sfx.good(); first = null; lock = false;
        statusEl.textContent = 'Coppia! ⭐';
        if (matched >= pairs) { statusEl.textContent = 'Tutte trovate! 🎉'; finish(true); }
      } else {
        lives--; drawLives(); sfx.bad(); statusEl.textContent = 'Non uguali...';
        const a = first; first = null;
        setTimeout(() => {
          setFace(a, false); setFace(c, false); lock = false;
          if (lives <= 0) { statusEl.textContent = 'Finiti i tentativi!'; finish(false); }
        }, 850);
      }
    }

    // sbirciata iniziale poi copri le carte
    if (peekMs > 0) {
      statusEl.textContent = 'Memorizza...';
      setTimeout(() => { cards.forEach(c => setFace(c, false)); lock = false; statusEl.textContent = ''; }, peekMs);
    } else {
      cards.forEach(c => setFace(c, false)); lock = false;
    }
  });
}
