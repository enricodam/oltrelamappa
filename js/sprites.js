// sprites.js - pixel art disegnata su canvas da griglie di caratteri.
// Stesso sistema di Piccoli Eroi 2: ogni sprite e' una griglia mappata sulla PALETTE.
export const PALETTE = {
  '.': 'transparent', '0': '#000', '1': '#4a3728', '2': '#8b6914', '3': '#f4a460',
  '4': '#e94560', '5': '#3b6dd4', '6': '#4ecca3', '7': '#fff', '8': '#888',
  '9': '#f5c542', 'A': '#c0c0c0', 'L': '#1565c0', 'T': '#996633', 'E': '#ff69b4',
  'F': '#2d6a27', 'K': '#b71c1c', 'D': '#00bcd4', 'J': '#e8dcc8',
};

export const SPRITES = {
  bussola: [
    '...9999...', '..999999..', '.99LLLL99.', '99L7LL7L99', '99LLL4LL99',
    '99LLL4LL99', '99LLL7LL99', '.99LLLL99.', '..999999..', '...9999...',
  ],
  vela: [
    '..AAAA....', '.A4444A...', '.A3333A...', '.A3003A...', '..3333....', '...33.....',
    '..66666...', '.6666666..', '.66A6A66..', '..66666...', '..66.66...', '..33.33...', '..11.11...',
  ],
  gancio: [
    '..5555....', '.555555...', '.L5555L...', '..3333....', '..3003....', '..2222....',
    '.T2222T...', '.5555555..', '.7777777..', '.5555555..', '..55.55...', '..33.33...', '..11.11...',
  ],
  lina: [
    '..2222....', '.222222...', 'T233332T..', 'TE3003ET..', '..3333....', '...33.....',
    '..99999...', '.9999999..', '.9999999..', '..99999...', '..99.99...', '..33.33...', '..99.99...',
  ],
  hero: [
    '..1111....', '.144441...', '.133331...', '.130031...', '..3333....', '...33.....',
    '..FFFFF...', '.FFFFFFF..', '.FF9FFFF..', '..FFFFF...', '..FF.FF...', '..33.33...', '..11.11...',
  ],
};

export function drawSprite(canvas, data, scale = 6) {
  const rows = data.length;
  const cols = Math.max(...data.map(r => r.length));
  canvas.width = cols * scale;
  canvas.height = rows * scale;
  canvas.style.width = (cols * scale) + 'px';
  canvas.style.height = (rows * scale) + 'px';
  canvas.classList.add('sprite-canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return; // ambiente senza canvas (es. test)
  ctx.imageSmoothingEnabled = false;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < data[y].length; x++) {
      const c = data[y][x];
      if (c !== '.' && PALETTE[c] && PALETTE[c] !== 'transparent') {
        ctx.fillStyle = PALETTE[c];
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }
}

export function createSpriteEl(name, scale = 6) {
  const c = document.createElement('canvas');
  if (SPRITES[name]) drawSprite(c, SPRITES[name], scale);
  return c;
}
