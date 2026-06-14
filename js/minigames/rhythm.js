// rhythm.js - Minigioco TEMPISMO/RITMO
// Un cursore scorre avanti e indietro su una barra: ferma il cursore nella zona verde.
// config: { title, prompt, rounds }
// Restituisce Promise<{won, stars}>
import { sfx } from '../audio.js';

export function play(container, { diff, config }) {
  return new Promise((resolve) => {
    const roundsNeeded = config.rounds || 3;
    let hits = 0;
    let lives = diff.lives;
    let pos = 0;            // 0..1
    let dir = 1;
    const speed = 0.012 * diff.speed; // incremento per frame
    let zoneCenter = 0.5;
    const zoneHalf = 0.11 * diff.targetScale; // meta larghezza zona
    let running = true;
    let rafId = null;

    const root = document.createElement('div');
    root.className = 'mg mg-rhythm';
    root.innerHTML = `
      <div class="mg-head">
        <span class="mg-tag">🎯 Tempismo</span>
        <span class="mg-lives" id="mg-lives"></span>
      </div>
      <h2 class="mg-title">${config.title || 'Ferma al momento giusto!'}</h2>
      <p class="mg-prompt">${config.prompt || 'Tocca quando il cursore e\' nella zona verde.'}</p>
      <div class="mg-progress" id="mg-prog"></div>
      <div class="mg-bar" id="mg-bar">
        <div class="mg-zone" id="mg-zone"></div>
        <div class="mg-cursor" id="mg-cursor"></div>
      </div>
      <button class="mg-action" id="mg-stop">FERMA!</button>
      <p class="mg-status" id="mg-status"></p>
    `;
    container.innerHTML = '';
    container.appendChild(root);

    const cursorEl = root.querySelector('#mg-cursor');
    const zoneEl = root.querySelector('#mg-zone');
    const livesEl = root.querySelector('#mg-lives');
    const statusEl = root.querySelector('#mg-status');
    const progEl = root.querySelector('#mg-prog');
    const btn = root.querySelector('#mg-stop');

    const drawLives = () => { livesEl.textContent = '❤️'.repeat(lives) + '🖤'.repeat(Math.max(0, diff.lives - lives)); };
    const drawProg = () => { progEl.textContent = '⭐'.repeat(hits) + '○'.repeat(Math.max(0, roundsNeeded - hits)); };

    function placeZone() {
      zoneCenter = 0.2 + Math.random() * 0.6;
      zoneEl.style.left = ((zoneCenter - zoneHalf) * 100) + '%';
      zoneEl.style.width = (zoneHalf * 2 * 100) + '%';
    }

    drawLives(); drawProg(); placeZone();

    function loop() {
      if (!running) return;
      pos += dir * speed;
      if (pos >= 1) { pos = 1; dir = -1; }
      if (pos <= 0) { pos = 0; dir = 1; }
      cursorEl.style.left = (pos * 100) + '%';
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);

    function end(won) {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', keyH);
      btn.disabled = true;
      if (won) { sfx.win(); resolve({ won: true, stars: hits }); }
      else { sfx.lose(); resolve({ won: false, stars: hits }); }
    }

    function stop() {
      if (!running) return;
      const inZone = Math.abs(pos - zoneCenter) <= zoneHalf;
      if (inZone) {
        hits++;
        sfx.star();
        drawProg();
        statusEl.textContent = hits >= roundsNeeded ? 'Perfetto!' : 'Colpito! ⭐';
        if (hits >= roundsNeeded) { end(true); return; }
        placeZone();
      } else {
        lives--;
        sfx.bad();
        drawLives();
        statusEl.textContent = 'Mancato!';
        if (lives <= 0) { end(false); return; }
      }
    }

    btn.addEventListener('click', stop);
    const keyH = (e) => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); stop(); } };
    window.addEventListener('keydown', keyH);
    // pulizia listener quando il container viene svuotato dal prossimo render
    const cleanup = () => window.removeEventListener('keydown', keyH);
    root._cleanup = cleanup;
  });
}
