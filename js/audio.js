// audio.js - piccoli effetti sonori chiptune via Web Audio (niente file esterni)
let ctx = null;
let enabled = true;

function ac() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { enabled = false; }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function setSound(on) { enabled = on; }
export function soundOn() { return enabled; }

function blip(freq, dur = 0.09, type = 'square', vol = 0.12) {
  if (!enabled) return;
  const c = ac();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = vol;
  o.connect(g); g.connect(c.destination);
  const t = c.currentTime;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.start(t); o.stop(t + dur);
}

export const sfx = {
  click() { blip(440, 0.05, 'square', 0.08); },
  good()  { blip(660, 0.08); setTimeout(() => blip(880, 0.09), 70); },
  bad()   { blip(160, 0.16, 'sawtooth', 0.10); },
  win()   { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => blip(f, 0.12, 'triangle', 0.12), i * 110)); },
  lose()  { [392, 330, 262].forEach((f, i) => setTimeout(() => blip(f, 0.16, 'sawtooth', 0.10), i * 130)); },
  star()  { blip(1320, 0.06, 'triangle', 0.1); },
  page()  { blip(330, 0.04, 'sine', 0.06); },
};
