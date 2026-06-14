// main.js - bootstrap, router schermate, pulsanti fissi (Salva / ? / audio), PWA
import { getState, newGame, load, hasSave, hasFlag, exportCode, importCode,
         DIFFICULTY, READING } from './state.js';
import { ISLANDS } from './content/islands.js';
import { initStory, goTo } from './story.js';
import { sfx, setSound, soundOn } from './audio.js';
import { createSpriteEl } from './sprites.js';

const app = document.getElementById('app');
initStory(app, { onMap: showMap, onTitle: showTitle });

function byId(id) { return document.getElementById(id); }

// icona floppy disk nel pulsante Salva
(function () { const b = byId('saveBtn'); if (b) b.appendChild(createSpriteEl('floppy', 3)); })();

// ===================== TITOLO =====================
function showTitle() {
  const canContinue = hasSave();
  app.innerHTML =
    '<div class="screen title-screen">'
    + '<img class="title-art" src="icons/icon-512.png" alt="Bussola" />'
    + '<h1 class="game-title">Oltre la Mappa</h1>'
    + '<p class="game-sub">Le Isole che si Allontanano</p>'
    + '<div class="menu">'
    + (canContinue ? '<button class="btn primary" id="t-continue">▶ CONTINUA</button>' : '')
    + '<button class="btn ' + (canContinue ? '' : 'primary') + '" id="t-new">✨ NUOVA PARTITA</button>'
    + '<button class="btn ghost" id="t-help">❔ COME SI GIOCA</button>'
    + '</div>'
    + '<p class="credit">Un gioco di Enrico,<br>per piccoli e grandi esploratori.</p>'
    + '</div>';
  if (canContinue) byId('t-continue').onclick = () => { sfx.click(); resume(); };
  byId('t-new').onclick = () => { sfx.click(); showSetup(); };
  byId('t-help').onclick = () => { sfx.click(); openHelp(); };
}

function resume() { load(); const st = getState(); if (st.node) goTo(st.node); else showMap(); }

// ===================== SETUP =====================
let setupChoice = { reading: 'famiglia', difficulty: 'medio', heroName: 'Marì' };

function showSetup() {
  app.innerHTML =
    '<div class="screen setup-screen">'
    + '<button class="mini-btn back" id="s-back">↩</button>'
    + '<h2>Prepariamo l\'avventura</h2>'
    + block('Come leggiamo la storia?', 'reading-row', Object.values(READING).map(r =>
        card('reading', r.id, r.icon, r.label, r.desc, setupChoice.reading === r.id)).join(''))
    + block('Quanto vuoi che sia difficile?', 'diff-row', Object.values(DIFFICULTY).map(d =>
        card('diff', d.id, d.icon, d.label, d.desc, setupChoice.difficulty === d.id)).join(''))
    + '<div class="setup-block"><h3>Come ti chiami, esploratore?</h3>'
    + '<input id="hero-name" class="name-input" maxlength="16" value="' + setupChoice.heroName + '" placeholder="Il tuo nome" /></div>'
    + '<button class="btn primary big" id="s-start">⛵ SALPA!</button>'
    + '</div>';
  byId('s-back').onclick = () => { sfx.click(); showTitle(); };
  app.querySelectorAll('[data-reading]').forEach(b => b.onclick = () => { sfx.click(); setupChoice.reading = b.dataset.reading; markSel('reading-row', b); });
  app.querySelectorAll('[data-diff]').forEach(b => b.onclick = () => { sfx.click(); setupChoice.difficulty = b.dataset.diff; markSel('diff-row', b); });
  byId('s-start').onclick = () => {
    sfx.good();
    newGame({ reading: setupChoice.reading, difficulty: setupChoice.difficulty, heroName: byId('hero-name').value });
    showIntro();
  };
}
function block(title, rowId, inner) { return '<div class="setup-block"><h3>' + title + '</h3><div class="opt-row" id="' + rowId + '">' + inner + '</div></div>'; }
function card(kind, id, icon, label, desc, sel) {
  return '<button class="opt-card ' + (sel ? 'sel' : '') + '" data-' + kind + '="' + id + '">'
    + '<span class="opt-icon">' + icon + '</span><span class="opt-label">' + label + '</span><span class="opt-desc">' + desc + '</span></button>';
}
function markSel(rowId, btn) { byId(rowId).querySelectorAll('.opt-card').forEach(c => c.classList.remove('sel')); btn.classList.add('sel'); }

function showIntro() {
  app.innerHTML =
    '<div class="screen story-screen">'
    + '<div class="story-scene">🌊🏝️🌊🏝️🌊</div>'
    + '<div class="story-card center"><div class="story-text">'
    + '<p>C\'era una volta un <span class="c-blue">mare</span> pieno di <span class="c-blue">isole</span> vicine, che si parlavano da una riva all\'altra.</p>'
    + '<p>Poi una mattina il mare comincio\' ad allargarsi, e le isole smisero di vedersi.</p>'
    + '<p>Tu sei <span class="c-hero">' + getState().heroName + '</span>, e hai appena trovato una <span class="c-blue">bussola</span> che sa parlare...</p>'
    + '</div></div>'
    + '<div class="story-choices"><button class="story-choice start" id="intro-go">Comincia ▶</button></div></div>';
  byId('intro-go').onclick = () => { sfx.click(); goTo('faro_1'); };
}

// ===================== MAPPA =====================
function showMap() {
  const st = getState();
  const islandHtml = ISLANDS.map(isl => {
    const unlocked = st.bridges >= isl.needBridges;
    const done = hasFlag('island_' + isl.id + '_done');
    const cls = !unlocked ? 'locked' : (done ? 'done' : 'open');
    return '<button class="map-island ' + cls + '" style="left:' + isl.x + '%; top:' + isl.y + '%" data-island="' + isl.id + '" ' + (!unlocked ? 'disabled' : '') + '>'
      + '<span class="isl-emoji">' + (unlocked ? isl.emoji : '🔒') + '</span>'
      + '<span class="isl-name">' + isl.name + '</span>'
      + (done ? '<span class="isl-badge">✓</span>' : '') + '</button>';
  }).join('');
  app.innerHTML =
    '<div class="screen map-screen">'
    + '<div class="map-top"><button class="mini-btn" id="m-title">🏠 HOME</button>'
    + '<span class="map-stat">🌉 ' + st.bridges + ' · ⭐ ' + st.stars + '</span></div>'
    + '<div class="map-canvas"><div class="sea"></div>' + islandHtml + '</div>'
    + '<p class="map-hint" id="map-hint">Tocca un\'isola illuminata per continuare l\'avventura.</p></div>';
  byId('m-title').onclick = () => { sfx.click(); showTitle(); };
  app.querySelectorAll('.map-island:not(.locked)').forEach(b => b.onclick = () => {
    sfx.click();
    const isl = ISLANDS.find(i => i.id === b.dataset.island);
    if (hasFlag('island_' + isl.id + '_done')) { byId('map-hint').textContent = isl.name + ': gia\' completata! Esplora le altre.'; return; }
    goTo(isl.start);
  });
}

// ===================== PULSANTI FISSI: SALVA / ? / AUDIO =====================
function overlay(inner) {
  closeOverlay();
  const o = document.createElement('div');
  o.className = 'help-overlay'; o.id = 'overlay';
  o.innerHTML = '<div class="help-panel">' + inner + '</div>';
  o.addEventListener('click', (e) => { if (e.target === o) closeOverlay(); });
  document.body.appendChild(o);
  return o;
}
function closeOverlay() { const o = byId('overlay'); if (o) o.remove(); }

function openSave() {
  const code = hasSave() ? exportCode() : '';
  overlay(
    '<h2>&#128190; Salva la partita</h2>'
    + '<div class="help-section"><span class="hl">La partita si salva da sola</span>'
    + '<p>Ogni tua mossa viene gia\' salvata su questo dispositivo. Ma per non perdere mai i progressi (se cambi telefono o pulisci il browser), copia il codice qui sotto e tienilo da parte.</p></div>'
    + '<textarea class="code-area" id="code-area" rows="4" placeholder="Qui appare il tuo codice...">' + code + '</textarea>'
    + '<div class="menu" style="max-width:none">'
    + '<button class="btn primary" id="o-copy">📋 Copia codice</button>'
    + '<button class="btn" id="o-load">📥 Carica un codice incollato</button>'
    + '<button class="btn ghost" id="o-close">Chiudi</button></div>'
    + '<p class="muted" id="o-msg"></p>');
  byId('o-copy').onclick = () => {
    byId('code-area').select();
    try { navigator.clipboard.writeText(byId('code-area').value); byId('o-msg').textContent = 'Codice copiato!'; }
    catch (e) { byId('o-msg').textContent = 'Seleziona il testo e copialo a mano.'; }
    sfx.good();
  };
  byId('o-load').onclick = () => {
    if (importCode(byId('code-area').value)) { sfx.good(); closeOverlay(); showMap(); }
    else { sfx.bad(); byId('o-msg').textContent = 'Codice non valido.'; }
  };
  byId('o-close').onclick = () => { sfx.click(); closeOverlay(); };
}

function openHelp() {
  overlay(
    '<h2>❔ Come si gioca</h2>'
    + '<div class="help-section"><span class="hl">L\'avventura</span><p>Naviga la mappa del mare e visita le isole. Leggi la storia, fai le tue <span class="c-green">scelte</span> e supera le prove con i <span class="c-gold">minigiochi</span>. Completare un\'isola costruisce un <span class="c-green">ponte</span> verso la successiva.</p></div>'
    + '<div class="help-section"><span class="hl">I minigiochi</span><p>Prima di ogni prova puoi scegliere la difficolta (Facile/Medio/Difficile). Se sbagli non perdi mai: riprovi e basta. Diventano un po\' piu\' veloci man mano che vai bene.</p></div>'
    + '<div class="help-section"><span class="hl">Salvataggio</span><p>Il gioco si salva da solo. Col pulsante <span class="c-green">💾 Salva</span> in alto puoi copiare un codice di backup.</p></div>'
    + '<div class="help-section"><span class="hl">Installa come app</span><p>iPhone (Safari): Condividi &rarr; "Aggiungi a Home". Android (Chrome): menu &rarr; "Installa app". Computer: icona "Installa" nella barra degli indirizzi.</p></div>'
    + '<div class="menu" style="max-width:none"><button class="btn ghost" id="h-close">Chiudi</button></div>');
  byId('h-close').onclick = () => { sfx.click(); closeOverlay(); };
}

function refreshSoundBtn() {
  const b = byId('soundToggle');
  if (!b) return;
  b.classList.toggle('muted', !soundOn());
  b.innerHTML = soundOn() ? '&#9835;' : '&#9834;';
}

byId('saveBtn').addEventListener('click', () => { sfx.click(); openSave(); });
byId('helpBtn').addEventListener('click', () => { sfx.click(); openHelp(); });
byId('soundToggle').addEventListener('click', () => { setSound(!soundOn()); refreshSoundBtn(); if (soundOn()) sfx.click(); });
refreshSoundBtn();
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeOverlay(); });

// ===================== PWA =====================
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; });
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(reg => {
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        nw && nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            const btn = byId('update-btn'); btn.hidden = false;
            btn.onclick = () => { nw.postMessage('skipWaiting'); location.reload(); };
          }
        });
      });
    }).catch(() => {});
  });
}

showTitle();
