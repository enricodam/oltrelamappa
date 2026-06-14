// aim.js - Minigioco MIRA/MOVIMENTO
// Muovi il personaggio a destra/sinistra: raccogli gli oggetti buoni, evita quelli cattivi.
// config: { title, prompt, goal, good, bad }  (good/bad = emoji)
// Controlli: frecce, A/D, trascinamento/tocco, pulsanti a schermo. Restituisce Promise<{won, stars}>
import { sfx } from '../audio.js';

export function play(container, { diff, config }) {
  return new Promise((resolve) => {
    const goal = config.goal || 6;
    const goodEmoji = config.good || '⭐';
    const badEmoji = config.bad || '🪨';
    let collected = 0;
    let lives = diff.lives;
    let heroX = 0.5;          // 0..1
    let running = true;
    let rafId = null;
    let items = [];          // {x, y, good, el}
    let spawnTimer = 0;
    const baseFall = 0.011 * diff.speed;     // velocita base (piu' reattiva di prima)
    const baseSpawn = Math.max(22, 46 / diff.speed); // frame tra spawn
    // ritmo crescente: piu' oggetti raccogli, piu' diventa veloce e fitto
    const fallNow = () => baseFall * (1 + collected * 0.14);
    const spawnNow = () => Math.max(12, baseSpawn - collected * 1.6);
    let moveDir = 0;         // -1, 0, 1 per pulsanti/tasti

    const root = document.createElement('div');
    root.className = 'mg mg-aim';
    root.innerHTML = `
      <div class="mg-head">
        <span class="mg-tag">🕹️ Movimento</span>
        <span class="mg-lives" id="mg-lives"></span>
      </div>
      <h2 class="mg-title">${config.title || 'Raccogli e schiva!'}</h2>
      <p class="mg-prompt">${config.prompt || `Raccogli ${goal} ${goodEmoji}, evita ${badEmoji}.`}</p>
      <div class="mg-progress" id="mg-prog"></div>
      <div class="mg-field" id="mg-field">
        <div class="mg-hero" id="mg-hero">${config.hero || '🚣'}</div>
      </div>
      <div class="mg-pad">
        <button class="mg-padbtn" id="mg-left" aria-label="sinistra">◀</button>
        <button class="mg-padbtn" id="mg-right" aria-label="destra">▶</button>
      </div>
      <p class="mg-status" id="mg-status"></p>
    `;
    container.innerHTML = '';
    container.appendChild(root);

    const field = root.querySelector('#mg-field');
    const hero = root.querySelector('#mg-hero');
    const livesEl = root.querySelector('#mg-lives');
    const progEl = root.querySelector('#mg-prog');
    const statusEl = root.querySelector('#mg-status');

    const drawLives = () => { livesEl.textContent = '❤️'.repeat(lives) + '🖤'.repeat(Math.max(0, diff.lives - lives)); };
    const drawProg = () => { progEl.textContent = `${goodEmoji} ${collected}/${goal}`; };
    drawLives(); drawProg();

    function setHero(x) {
      heroX = Math.max(0.05, Math.min(0.95, x));
      hero.style.left = (heroX * 100) + '%';
    }
    setHero(0.5);

    // --- controlli ---
    const keyDown = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') { moveDir = -1; e.preventDefault(); }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') { moveDir = 1; e.preventDefault(); }
    };
    const keyUp = (e) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code) && moveDir === -1) moveDir = 0;
      if (['ArrowRight', 'KeyD'].includes(e.code) && moveDir === 1) moveDir = 0;
    };
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);

    const pointerMove = (clientX) => {
      const r = field.getBoundingClientRect();
      setHero((clientX - r.left) / r.width);
    };
    let dragging = false;
    field.addEventListener('pointerdown', (e) => { dragging = true; pointerMove(e.clientX); });
    field.addEventListener('pointermove', (e) => { if (dragging) pointerMove(e.clientX); });
    window.addEventListener('pointerup', () => { dragging = false; });

    const bindHold = (el, d) => {
      const on = (e) => { e.preventDefault(); moveDir = d; };
      const off = () => { if (moveDir === d) moveDir = 0; };
      el.addEventListener('pointerdown', on);
      el.addEventListener('pointerup', off);
      el.addEventListener('pointerleave', off);
    };
    bindHold(root.querySelector('#mg-left'), -1);
    bindHold(root.querySelector('#mg-right'), 1);

    function cleanup() {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
    }

    function spawn() {
      const good = Math.random() > 0.42;
      const el = document.createElement('div');
      el.className = 'mg-item';
      el.textContent = good ? goodEmoji : badEmoji;
      const x = 0.08 + Math.random() * 0.84;
      el.style.left = (x * 100) + '%';
      el.style.top = '-8%';
      field.appendChild(el);
      items.push({ x, y: -0.08, good, el });
    }

    function end(won) {
      running = false;
      cancelAnimationFrame(rafId);
      cleanup();
      if (won) { sfx.win(); resolve({ won: true, stars: collected }); }
      else { sfx.lose(); resolve({ won: false, stars: collected }); }
    }

    function loop() {
      if (!running) return;
      if (moveDir !== 0) setHero(heroX + moveDir * 0.03);  // movimento sempre reattivo

      spawnTimer++;
      if (spawnTimer >= spawnNow()) { spawnTimer = 0; spawn(); }

      const step = fallNow();
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        it.y += step;
        it.el.style.top = (it.y * 100) + '%';
        // collisione vicino al fondo
        if (it.y >= 0.82 && it.y <= 0.96 && Math.abs(it.x - heroX) < 0.12) {
          if (it.good) { collected++; sfx.star(); drawProg(); }
          else { lives--; sfx.bad(); drawLives(); statusEl.textContent = 'Ahia!'; }
          it.el.remove(); items.splice(i, 1);
          if (collected >= goal) { statusEl.textContent = 'Fatto! 🎉'; return end(true); }
          if (lives <= 0) { return end(false); }
          continue;
        }
        if (it.y > 1.05) { it.el.remove(); items.splice(i, 1); }
      }
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);
  });
}
