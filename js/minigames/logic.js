// logic.js - Minigioco LOGICA a scelta multipla (indovinelli/enigmi)
// config: { title, prompt, correct: "testo giusto", distractors: ["...","..."], hint }
// Restituisce Promise<{won, stars}>
import { sfx } from '../audio.js';

function shuffle(a) {
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function play(container, { diff, config }) {
  return new Promise((resolve) => {
    const nOpts = Math.max(2, Math.min(diff.logicOptions, config.distractors.length + 1));
    const distract = shuffle(config.distractors).slice(0, nOpts - 1);
    const options = shuffle([config.correct, ...distract]);

    let lives = diff.lives;
    let timeLeft = diff.logicTimer; // 0 = nessun timer
    let timerId = null;

    const root = document.createElement('div');
    root.className = 'mg mg-logic';
    root.innerHTML = `
      <div class="mg-head">
        <span class="mg-tag">🧩 Indovinello</span>
        <span class="mg-lives" id="mg-lives"></span>
      </div>
      <h2 class="mg-title">${config.title || 'Risolvi l\'enigma'}</h2>
      <p class="mg-prompt">${config.prompt}</p>
      ${diff.logicTimer ? '<div class="mg-timer"><div class="mg-timer-bar" id="mg-tbar"></div></div>' : ''}
      <div class="mg-options" id="mg-options"></div>
      ${diff.hints && config.hint ? `<button class="mg-hint-btn" id="mg-hint">💡 Suggerimento</button><p class="mg-hint" id="mg-hint-text" hidden>${config.hint}</p>` : ''}
      <p class="mg-status" id="mg-status"></p>
    `;
    container.innerHTML = '';
    container.appendChild(root);

    const livesEl = root.querySelector('#mg-lives');
    const statusEl = root.querySelector('#mg-status');
    const optsEl = root.querySelector('#mg-options');
    const drawLives = () => { livesEl.textContent = '❤️'.repeat(lives) + '🖤'.repeat(Math.max(0, diff.lives - lives)); };
    drawLives();

    const hintBtn = root.querySelector('#mg-hint');
    if (hintBtn) hintBtn.addEventListener('click', () => {
      sfx.click();
      root.querySelector('#mg-hint-text').hidden = false;
      hintBtn.hidden = true;
    });

    function finish(won) {
      if (timerId) clearInterval(timerId);
      optsEl.querySelectorAll('button').forEach(b => b.disabled = true);
      if (won) { sfx.win(); resolve({ won: true, stars: 2 }); }
      else { sfx.lose(); resolve({ won: false, stars: 0 }); }
    }

    options.forEach((text) => {
      const b = document.createElement('button');
      b.className = 'mg-opt';
      b.textContent = text;
      b.addEventListener('click', () => {
        if (b.disabled) return;
        if (text === config.correct) {
          b.classList.add('right');
          sfx.good();
          statusEl.textContent = 'Esatto! 🎉';
          setTimeout(() => finish(true), 650);
        } else {
          b.classList.add('wrong');
          b.disabled = true;
          lives--;
          drawLives();
          sfx.bad();
          if (lives <= 0) { statusEl.textContent = 'Niente, riproviamo!'; setTimeout(() => finish(false), 650); }
          else { statusEl.textContent = 'Non e\' quella... riprova!'; }
        }
      });
      optsEl.appendChild(b);
    });

    if (diff.logicTimer) {
      const tbar = root.querySelector('#mg-tbar');
      const total = diff.logicTimer;
      timerId = setInterval(() => {
        timeLeft -= 0.1;
        const pct = Math.max(0, timeLeft / total) * 100;
        tbar.style.width = pct + '%';
        if (timeLeft <= 0) { statusEl.textContent = 'Tempo scaduto!'; finish(false); }
      }, 100);
    }
  });
}
