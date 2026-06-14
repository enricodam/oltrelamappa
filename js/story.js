// story.js - motore narrativo. Dialoghi RPG: ritratto pixel art (canvas) + nuvoletta,
// testo con parole colorate e grassetti per renderlo gradevole e leggibile.
import { getState, visit, setFlag, hasFlag, isFamiglia, addStars, addBridge } from './state.js';
import { runMinigame } from './minigames/index.js';
import { sfx } from './audio.js';
import { NODES } from './content/story.js';
import { createSpriteEl } from './sprites.js';

let appEl = null;
let hooks = {};
let mgDiff = null;

export function initStory(app, callbacks) { appEl = app; hooks = callbacks || {}; }

const SPRITE = { bussola: 'bussola', vela: 'vela', gancio: 'gancio', lina: 'lina' };
function spriteName(node) { return SPRITE[node.speakerClass] || 'hero'; }
function speakerName(node) { return node.speaker || getState().heroName; }

const DIFF_CHIPS = [['facile', 'Facile', '🌱'], ['medio', 'Medio', '⚓'], ['difficile', 'Difficile', '🔥']];

function pick(text) {
  if (text == null) return '';
  if (typeof text === 'string') return text;
  return isFamiglia() ? (text.famiglia || text.ragazzi || '') : (text.ragazzi || text.famiglia || '');
}
function nameSub(s) { return s.replace(/\{nome\}/g, getState().heroName); }
function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// colora i nomi e le parole chiave, gestisce **grassetto**
function format(text) {
  const hero = getState().heroName;
  const rules = [
    [/Nonna Vela/g, 'c-green'], [/Mastro Gancio/g, 'c-gold'], [/Cuore del Mare/g, 'c-blue'],
    [/ponte di luce/gi, 'c-green'],
  ];
  if (hero && hero.length >= 2) rules.push([new RegExp(esc(hero), 'g'), 'c-hero']);
  rules.push(
    [/\bBussola\b/g, 'c-blue'], [/\bVela\b/g, 'c-green'], [/\bGancio\b/g, 'c-gold'], [/\bLina\b/g, 'c-purple'],
    [/\bfar[oi]\b/gi, 'c-gold'], [/\bmare\b/gi, 'c-blue'],
    [/\bcant[oi]\b/gi, 'c-purple'], [/\bcanzone\b/gi, 'c-purple'],
    [/\bpont[ei]\b/gi, 'c-green'], [/\bisol[ae]\b/gi, 'c-blue'],
  );
  const store = [];
  let html = text;
  for (const [re, cls] of rules) {
    html = html.replace(re, (m) => { const id = '~|' + store.length + '|~'; store.push('<span class="' + cls + '">' + m + '</span>'); return id; });
  }
  html = html.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  html = html.replace(/~\|(\d+)\|~/g, (_, i) => store[i]);
  return html;
}

function topbar(label) {
  const st = getState();
  return '<div class="story-topbar">'
    + '<button class="mini-btn" data-act="map">🗺 MAPPA</button>'
    + '<span class="story-bridges">' + (label != null ? label : ('🌉 ' + st.bridges + ' · ⭐ ' + st.stars)) + '</span>'
    + '</div>';
}

export function goTo(nodeId) {
  const node = NODES[nodeId];
  if (!node) { console.warn('Nodo mancante:', nodeId); if (hooks.onMap) hooks.onMap(); return; }
  visit(nodeId);
  if (node.onEnter) node.onEnter({ setFlag, hasFlag, addBridge, addStars });
  if (node.setFlags) node.setFlags.forEach(f => setFlag(f));
  if (node.bridge) addBridge();
  if (node.toMap) { if (hooks.onMap) hooks.onMap(); return; }
  if (node.minigame) return renderMinigameNode(node);
  return renderNarrative(node);
}

function dialogueBlock(node) {
  const paras = (Array.isArray(node.text) ? node.text : [node.text])
    .map(t => '<p>' + format(nameSub(pick(t))) + '</p>').join('');
  return '<div class="dialogue">'
    + '<div class="portrait" data-sprite="' + spriteName(node) + '"></div>'
    + '<div class="bubble"><div class="nameplate">' + speakerName(node) + '</div>'
    + '<div class="bubble-text">' + paras + '</div></div>'
    + '</div>';
}

function mountSprites() {
  appEl.querySelectorAll('.portrait[data-sprite]').forEach(el => {
    if (el.dataset.mounted) return;
    el.appendChild(createSpriteEl(el.dataset.sprite, 6));
    el.dataset.mounted = '1';
  });
}

function wireTop() {
  const m = appEl.querySelector('[data-act="map"]');
  if (m) m.addEventListener('click', () => { sfx.click(); if (hooks.onMap) hooks.onMap(); });
}

function renderNarrative(node) {
  sfx.page();
  const scene = node.scene ? '<div class="story-scene">' + node.scene + '</div>' : '';
  const choices = (node.choices || []).filter(c => {
    if (c.requires && !hasFlag(c.requires)) return false;
    if (c.hideIf && hasFlag(c.hideIf)) return false;
    return true;
  });
  let choicesHtml = '';
  if (node.ending) {
    choicesHtml = '<button class="story-choice end" data-act="title">↩ TORNA ALL\'INIZIO</button>';
  } else if (choices.length) {
    choicesHtml = choices.map((c, i) => '<button class="story-choice" data-i="' + i + '">' + format(nameSub(pick(c.label))) + '</button>').join('');
  } else if (node.next) {
    choicesHtml = '<button class="story-choice" data-next="' + node.next + '">' + (pick(node.continueLabel) || 'Avanti ▶') + '</button>';
  }
  appEl.innerHTML = '<div class="screen story-screen ' + (node.mood || '') + '">'
    + topbar() + scene + dialogueBlock(node)
    + '<div class="story-choices">' + choicesHtml + '</div></div>';
  mountSprites(); wireTop();
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
  if (mgDiff == null) mgDiff = getState().difficulty;
  const chips = DIFF_CHIPS.map(([k, lbl, ic]) => '<button class="chip ' + (k === mgDiff ? 'sel' : '') + '" data-d="' + k + '">' + ic + ' ' + lbl + '</button>').join('');
  appEl.innerHTML = '<div class="screen story-screen ' + (node.mood || '') + '">'
    + topbar('Prova in arrivo') + dialogueBlock(node)
    + '<div class="diff-pick"><span class="diff-label">Difficolta di questa prova:</span>'
    + '<div class="chips">' + chips + '</div></div>'
    + '<div class="story-choices"><button class="story-choice start" id="mg-start">▶ INIZIA LA PROVA</button></div></div>';
  mountSprites(); wireTop();
  appEl.querySelectorAll('.chip').forEach(ch => ch.addEventListener('click', () => {
    sfx.click(); mgDiff = ch.dataset.d;
    appEl.querySelectorAll('.chip').forEach(c => c.classList.remove('sel'));
    ch.classList.add('sel');
  }));
  appEl.querySelector('#mg-start').addEventListener('click', async () => {
    sfx.click();
    appEl.innerHTML = '<div class="screen mg-screen"><div id="mg-host"></div></div>';
    const host = appEl.querySelector('#mg-host');
    const result = await runMinigame(node.minigame.type, host, node.minigame.config || {}, mgDiff);
    if (result.stars) addStars(result.stars);
    showResult(node, result);
  });
}

function showResult(node, result) {
  const won = result.won;
  const msg = won ? (pick(node.minigame.winText) || 'Ce l\'hai fatta!') : (pick(node.minigame.loseText) || 'Non e\' andata, ma puoi riprovare.');
  appEl.innerHTML = '<div class="screen story-screen">'
    + '<div class="result-card ' + (won ? 'win' : 'lose') + '">'
    + '<div class="result-emoji">' + (won ? '🎉' : '💪') + '</div>'
    + '<p class="result-msg">' + format(nameSub(msg)) + '</p>'
    + (result.stars ? '<p class="result-stars">+' + result.stars + ' ⭐</p>' : '')
    + '</div><div class="story-choices">'
    + (won ? '<button class="story-choice" id="r-next">Avanti ▶</button>'
           : '<button class="story-choice" id="r-retry">🔄 RIPROVA</button>'
             + (node.minigame.skipTo ? '<button class="story-choice ghost" id="r-skip">Salta e prosegui</button>' : ''))
    + '</div></div>';
  const next = appEl.querySelector('#r-next');
  if (next) next.addEventListener('click', () => { sfx.click(); mgDiff = null; goTo(node.minigame.win); });
  const retry = appEl.querySelector('#r-retry');
  if (retry) retry.addEventListener('click', () => { sfx.click(); renderMinigameNode(node); });
  const skip = appEl.querySelector('#r-skip');
  if (skip) skip.addEventListener('click', () => { sfx.click(); mgDiff = null; goTo(node.minigame.skipTo); });
}
