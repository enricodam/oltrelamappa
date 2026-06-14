// story.js - motore narrativo data-driven (nodi, scelte, minigiochi)
// Struttura "a collana di perle": i nodi si diramano in scelte ma si riuniscono.
import { getState, visit, setFlag, hasFlag, isFamiglia, addStars, addBridge } from './state.js';
import { runMinigame } from './minigames/index.js';
import { sfx } from './audio.js';
import { NODES } from './content/story.js';

let appEl = null;
let hooks = {};

export function initStory(app, callbacks) {
  appEl = app;
  hooks = callbacks || {};
}

// scegli la variante di testo in base alla modalita lettura
function pick(text) {
  if (text == null) return '';
  if (typeof text === 'string') return text;
  return isFamiglia() ? (text.famiglia || text.ragazzi || '') : (text.ragazzi || text.famiglia || '');
}

function nameSub(s) {
  return s.replace(/\{nome\}/g, getState().heroName);
}

export function goTo(nodeId) {
  const node = NODES[nodeId];
  if (!node) { console.warn('Nodo mancante:', nodeId); if (hooks.onMap) hooks.onMap(); return; }
  visit(nodeId);

  // effetti all'ingresso del nodo
  if (node.onEnter) node.onEnter({ setFlag, hasFlag, addBridge, addStars });
  if (node.setFlags) node.setFlags.forEach(f => setFlag(f));
  if (node.bridge) addBridge();
  if (node.toMap) { if (hooks.onMap) hooks.onMap(); return; }

  if (node.minigame) return renderMinigameNode(node);
  return renderNarrative(node);
}

function renderNarrative(node) {
  sfx.page();
  const st = getState();
  const speaker = node.speaker ? `<div class="story-speaker ${node.speakerClass || ''}">${node.speaker}</div>` : '';
  const scene = node.scene ? `<div class="story-scene">${node.scene}</div>` : '';
  const paras = (Array.isArray(node.text) ? node.text : [node.text])
    .map(t => `<p>${nameSub(pick(t))}</p>`).join('');

  // filtra scelte per requires/hideIf
  const choices = (node.choices || []).filter(c => {
    if (c.requires && !hasFlag(c.requires)) return false;
    if (c.hideIf && hasFlag(c.hideIf)) return false;
    return true;
  });

  let choicesHtml = '';
  if (node.ending) {
    choicesHtml = `<button class="story-choice end" data-act="title">↩ Torna all'inizio</button>`;
  } else if (choices.length) {
    choicesHtml = choices.map((c, i) =>
      `<button class="story-choice" data-i="${i}">${nameSub(pick(c.label))}</button>`).join('');
  } else if (node.next) {
    choicesHtml = `<button class="story-choice" data-next="${node.next}">${pick(node.continueLabel) || 'Avanti ▶'}</button>`;
  }

  appEl.innerHTML = `
    <div class="screen story-screen ${node.mood || ''}">
      <div class="story-topbar">
        <button class="mini-btn" data-act="map">🗺️ Mappa</button>
        <span class="story-bridges">🌉 ${st.bridges} · ⭐ ${st.stars}</span>
      </div>
      ${scene}
      <div class="story-card">
        ${speaker}
        <div class="story-text">${paras}</div>
      </div>
      <div class="story-choices">${choicesHtml}</div>
    </div>
  `;

  appEl.querySelector('[data-act="map"]').addEventListener('click', () => { sfx.click(); if (hooks.onMap) hooks.onMap(); });
  const titleBtn = appEl.querySelector('[data-act="title"]');
  if (titleBtn) titleBtn.addEventListener('click', () => { sfx.click(); if (hooks.onTitle) hooks.onTitle(); });

  appEl.querySelectorAll('.story-choice[data-i]').forEach(btn => {
    btn.addEventListener('click', () => {
      sfx.click();
      const c = choices[parseInt(btn.dataset.i, 10)];
      if (c.set) Object.entries(c.set).forEach(([k, v]) => setFlag(k, v));
      if (c.stars) addStars(c.stars);
      goTo(c.next);
    });
  });
  const nextBtn = appEl.querySelector('.story-choice[data-next]');
  if (nextBtn) nextBtn.addEventListener('click', () => { sfx.click(); goTo(nextBtn.dataset.next); });
}

function renderMinigameNode(node) {
  const intro = node.text ? `<div class="story-text">${(Array.isArray(node.text) ? node.text : [node.text]).map(t => `<p>${nameSub(pick(t))}</p>`).join('')}</div>` : '';
  appEl.innerHTML = `
    <div class="screen story-screen ${node.mood || ''}">
      <div class="story-topbar">
        <button class="mini-btn" data-act="map">🗺️ Mappa</button>
        <span class="story-bridges">Prova in arrivo</span>
      </div>
      <div class="story-card">
        ${node.speaker ? `<div class="story-speaker ${node.speakerClass || ''}">${node.speaker}</div>` : ''}
        ${intro}
      </div>
      <div class="story-choices"><button class="story-choice start" id="mg-start">▶ Inizia la prova</button></div>
    </div>
  `;
  appEl.querySelector('[data-act="map"]').addEventListener('click', () => { sfx.click(); if (hooks.onMap) hooks.onMap(); });
  appEl.querySelector('#mg-start').addEventListener('click', async () => {
    sfx.click();
    appEl.innerHTML = `<div class="screen mg-screen"><div id="mg-host"></div></div>`;
    const host = appEl.querySelector('#mg-host');
    const result = await runMinigame(node.minigame.type, host, node.minigame.config || {});
    if (result.stars) addStars(result.stars);
    showResult(node, result);
  });
}

function showResult(node, result) {
  const won = result.won;
  const msg = won
    ? pick(node.minigame.winText) || 'Ce l\'hai fatta!'
    : pick(node.minigame.loseText) || 'Non e\' andata, ma puoi riprovare.';
  appEl.innerHTML = `
    <div class="screen story-screen">
      <div class="story-card center">
        <div class="result-emoji">${won ? '🎉' : '💪'}</div>
        <div class="story-text"><p>${nameSub(msg)}</p></div>
        ${result.stars ? `<p class="result-stars">+${result.stars} ⭐</p>` : ''}
      </div>
      <div class="story-choices">
        ${won
          ? `<button class="story-choice" id="r-next">Avanti ▶</button>`
          : `<button class="story-choice" id="r-retry">🔄 Riprova</button>
             ${node.minigame.skipTo ? `<button class="story-choice ghost" id="r-skip">Salta (prosegui)</button>` : ''}`}
      </div>
    </div>
  `;
  const next = appEl.querySelector('#r-next');
  if (next) next.addEventListener('click', () => { sfx.click(); goTo(node.minigame.win); });
  const retry = appEl.querySelector('#r-retry');
  if (retry) retry.addEventListener('click', () => { sfx.click(); renderMinigameNode(node); });
  const skip = appEl.querySelector('#r-skip');
  if (skip) skip.addEventListener('click', () => { sfx.click(); goTo(node.minigame.skipTo); });
}
