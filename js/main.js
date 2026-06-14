// main.js - bootstrap, router delle schermate, PWA
import { getState, newGame, load, hasSave, hasFlag, exportCode, importCode,
         DIFFICULTY, READING } from './state.js';
import { ISLANDS } from './content/islands.js';
import { initStory, goTo } from './story.js';
import { sfx, setSound, soundOn } from './audio.js';

const app = document.getElementById('app');
initStory(app, { onMap: showMap, onTitle: showTitle });

// ---------------------------------------------------------------- TITOLO
function showTitle() {
  const canContinue = hasSave();
  app.innerHTML = `
    <div class="screen title-screen">
      <div class="title-art">🗺️</div>
      <h1 class="game-title">Oltre la Mappa</h1>
      <p class="game-sub">Le Isole che si Allontanano</p>
      <div class="menu">
        ${canContinue ? `<button class="btn primary" id="t-continue">▶ Continua</button>` : ''}
        <button class="btn ${canContinue ? '' : 'primary'}" id="t-new">✨ Nuova partita</button>
        <button class="btn ghost" id="t-code">🔑 Codice partita</button>
        <button class="btn ghost" id="t-sound">${soundOn() ? '🔊 Audio: ON' : '🔇 Audio: OFF'}</button>
        <button class="btn ghost" id="t-install">📲 Installa come app</button>
      </div>
      <p class="credit">Un gioco di Enrico, per piccoli e grandi esploratori.</p>
    </div>
  `;
  if (canContinue) byId('t-continue').onclick = () => { sfx.click(); resume(); };
  byId('t-new').onclick = () => { sfx.click(); showSetup(); };
  byId('t-code').onclick = () => { sfx.click(); showCode(); };
  byId('t-sound').onclick = () => { setSound(!soundOn()); sfx.click(); showTitle(); };
  byId('t-install').onclick = () => { sfx.click(); showInstall(); };
}

function resume() {
  load();
  const st = getState();
  if (st.node && NODES_EXISTS(st.node)) goTo(st.node);
  else showMap();
}
function NODES_EXISTS(id) {
  // import dinamico evitato: controlliamo via story (goTo gestisce nodi mancanti)
  return !!id;
}

// ---------------------------------------------------------------- SETUP NUOVA PARTITA
let setupChoice = { reading: 'famiglia', difficulty: 'medio', heroName: 'Marì' };

function showSetup() {
  app.innerHTML = `
    <div class="screen setup-screen">
      <button class="mini-btn back" id="s-back">↩</button>
      <h2>Prepariamo l'avventura</h2>

      <div class="setup-block">
        <h3>Come leggiamo la storia?</h3>
        <div class="opt-row" id="reading-row">
          ${Object.values(READING).map(r => `
            <button class="opt-card ${setupChoice.reading === r.id ? 'sel' : ''}" data-reading="${r.id}">
              <span class="opt-icon">${r.icon}</span>
              <span class="opt-label">${r.label}</span>
              <span class="opt-desc">${r.desc}</span>
            </button>`).join('')}
        </div>
      </div>

      <div class="setup-block">
        <h3>Quanto vuoi che sia difficile?</h3>
        <div class="opt-row" id="diff-row">
          ${Object.values(DIFFICULTY).map(d => `
            <button class="opt-card ${setupChoice.difficulty === d.id ? 'sel' : ''}" data-diff="${d.id}">
              <span class="opt-icon">${d.icon}</span>
              <span class="opt-label">${d.label}</span>
              <span class="opt-desc">${d.desc}</span>
            </button>`).join('')}
        </div>
      </div>

      <div class="setup-block">
        <h3>Come ti chiami, esploratore?</h3>
        <input id="hero-name" class="name-input" maxlength="16" value="${setupChoice.heroName}" placeholder="Il tuo nome" />
      </div>

      <button class="btn primary big" id="s-start">⛵ Salpa!</button>
    </div>
  `;
  byId('s-back').onclick = () => { sfx.click(); showTitle(); };

  app.querySelectorAll('[data-reading]').forEach(b => b.onclick = () => {
    sfx.click(); setupChoice.reading = b.dataset.reading; markSel('reading-row', b);
  });
  app.querySelectorAll('[data-diff]').forEach(b => b.onclick = () => {
    sfx.click(); setupChoice.difficulty = b.dataset.diff; markSel('diff-row', b);
  });
  byId('s-start').onclick = () => {
    sfx.win();
    const name = byId('hero-name').value;
    newGame({ reading: setupChoice.reading, difficulty: setupChoice.difficulty, heroName: name });
    showIntro();
  };
}

function markSel(rowId, btn) {
  byId(rowId).querySelectorAll('.opt-card').forEach(c => c.classList.remove('sel'));
  btn.classList.add('sel');
}

// piccola intro prima della mappa
function showIntro() {
  app.innerHTML = `
    <div class="screen story-screen dawn">
      <div class="story-scene">🌊🏝️🌊🏝️🌊</div>
      <div class="story-card center">
        <div class="story-text">
          <p>C'era una volta un mare pieno di isole vicine, che si parlavano da una riva all'altra.</p>
          <p>Poi, una mattina, il mare comincio' ad allargarsi. E le isole, piano piano, smisero di vedersi.</p>
          <p>Tu sei <strong>${getState().heroName}</strong>. E hai appena trovato una bussola che sa parlare...</p>
        </div>
      </div>
      <div class="story-choices"><button class="story-choice" id="intro-go">Comincia ▶</button></div>
    </div>
  `;
  byId('intro-go').onclick = () => { sfx.click(); goTo('faro_1'); };
}

// ---------------------------------------------------------------- MAPPA
function showMap() {
  const st = getState();
  const islandHtml = ISLANDS.map(isl => {
    const unlocked = st.bridges >= isl.needBridges;
    const done = hasFlag(`island_${isl.id}_done`);
    const cls = !unlocked ? 'locked' : (done ? 'done' : 'open');
    return `
      <button class="map-island ${cls}" style="left:${isl.x}%; top:${isl.y}%"
              data-island="${isl.id}" ${!unlocked ? 'disabled' : ''}>
        <span class="isl-emoji">${unlocked ? isl.emoji : '🔒'}</span>
        <span class="isl-name">${isl.name}</span>
        ${done ? '<span class="isl-badge">✓</span>' : ''}
      </button>`;
  }).join('');

  // linee-ponte tra isole consecutive sbloccate
  app.innerHTML = `
    <div class="screen map-screen">
      <div class="map-top">
        <button class="mini-btn" id="m-title">🏠</button>
        <span class="map-stat">🌉 Ponti: ${st.bridges} &nbsp; ⭐ ${st.stars}</span>
      </div>
      <div class="map-canvas">
        <div class="sea"></div>
        ${islandHtml}
      </div>
      <p class="map-hint" id="map-hint">Tocca un'isola illuminata per continuare l'avventura.</p>
    </div>
  `;
  byId('m-title').onclick = () => { sfx.click(); showTitle(); };
  app.querySelectorAll('.map-island:not(.locked)').forEach(b => {
    b.onclick = () => {
      sfx.click();
      const isl = ISLANDS.find(i => i.id === b.dataset.island);
      const done = hasFlag(`island_${isl.id}_done`);
      if (done) {
        byId('map-hint').textContent = `${isl.name}: gia' completata! Le altre ti aspettano.`;
        return;
      }
      goTo(isl.start);
    };
  });
}

// ---------------------------------------------------------------- CODICE PARTITA
function showCode() {
  const code = hasSave() ? exportCode() : '';
  app.innerHTML = `
    <div class="screen setup-screen">
      <button class="mini-btn back" id="c-back">↩</button>
      <h2>🔑 Codice partita</h2>
      <p class="muted">Copia questo codice per salvare i progressi altrove, o incollane uno per ripartire.</p>
      <textarea class="code-area" id="code-area" rows="4" placeholder="Incolla qui un codice...">${code}</textarea>
      <div class="menu">
        <button class="btn" id="c-copy">📋 Copia</button>
        <button class="btn primary" id="c-load">📥 Carica codice</button>
      </div>
      <p class="muted" id="c-msg"></p>
    </div>
  `;
  byId('c-back').onclick = () => { sfx.click(); showTitle(); };
  byId('c-copy').onclick = () => {
    sfx.click();
    byId('code-area').select();
    try { navigator.clipboard.writeText(byId('code-area').value); byId('c-msg').textContent = 'Copiato!'; }
    catch (e) { byId('c-msg').textContent = 'Seleziona e copia a mano.'; }
  };
  byId('c-load').onclick = () => {
    const ok = importCode(byId('code-area').value);
    if (ok) { sfx.win(); showMap(); } else { sfx.bad(); byId('c-msg').textContent = 'Codice non valido.'; }
  };
}

// ---------------------------------------------------------------- INSTALLA (PWA)
function showInstall() {
  app.innerHTML = `
    <div class="screen setup-screen">
      <button class="mini-btn back" id="i-back">↩</button>
      <h2>📲 Installa come app</h2>
      <div class="story-card">
        <div class="story-text">
          <p><strong>iPhone/iPad (Safari):</strong> tocca Condividi, poi "Aggiungi a Home".</p>
          <p><strong>Android (Chrome):</strong> menu tre puntini, poi "Installa app".</p>
          <p><strong>Computer (Chrome/Edge):</strong> icona "Installa" nella barra degli indirizzi.</p>
          <p class="muted">Una volta installato, il gioco funziona anche senza internet.</p>
        </div>
      </div>
      <button class="btn primary" id="i-prompt" hidden>Installa ora</button>
    </div>
  `;
  byId('i-back').onclick = () => { sfx.click(); showTitle(); };
  if (deferredPrompt) {
    const b = byId('i-prompt'); b.hidden = false;
    b.onclick = async () => { deferredPrompt.prompt(); deferredPrompt = null; };
  }
}

// ---------------------------------------------------------------- util + PWA
function byId(id) { return document.getElementById(id); }

let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; });

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(reg => {
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        nw && nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            const btn = byId('update-btn');
            btn.hidden = false;
            btn.onclick = () => { nw.postMessage('skipWaiting'); location.reload(); };
          }
        });
      });
    }).catch(() => {});
  });
}

// avvio
showTitle();
