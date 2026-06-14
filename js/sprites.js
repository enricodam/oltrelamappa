// sprites.js - pixel art "32 bit": griglie di caratteri con palette ricca (luci e ombre),
// disegnate su canvas come in Piccoli Eroi 2.
export const PALETTE = {
  '.': 'transparent', '0': '#1a1a2e',
  // pelle
  'h': '#ffdcb0', '3': '#f0b27f', 's': '#c98a55',
  // capelli castani
  'H': '#7a5430', '1': '#523a23', 'b': '#3a2917',
  // capelli grigi
  'A': '#d8d8e0', 'a': '#a9a9b8', 'g': '#7d7d8c',
  // rosso
  'R': '#ff6b5e', '4': '#e23b3b', 'r': '#a82828',
  // verde
  'G': '#6fe0a0', '6': '#3fb27a', 'e': '#2a7d54',
  // blu
  'B': '#6fa8ff', '5': '#3b6dd4', 'L': '#234e9e',
  // oro
  'Y': '#ffe27a', '9': '#f5c542', 'y': '#c79a2e',
  // bianco
  '7': '#ffffff', 'W': '#d8d8e0',
  // navy (vetro bussola)
  'N': '#1f3a66', 'n': '#14284a',
  // varie
  'E': '#ff9bb0', 'T': '#9a6a3a', 't': '#6e4a26', '8': '#8c8c90',
};

export const SPRITES = {
  hero: ['....0000....', '...0HHHH0...', '..0HH11HH0..', '..04444440..', '..0R4444R0..', '..0h3333h0..', '..0h3003h0..', '..0s3333s0..', '...0s33s0...', '....0ss0....', '..00000000..', '.0G666666G0.', '.0666GG6660.', '.0e666666e0.', '..0h0..0h0..', '..0t0..0t0..'],
  bussola: ['...000000...', '.009999900..', '.09YY99yy90.', '09YNNNNNNy90', '09NN7NN7NNy0', '09NNN44NNy90', '09NNN44NNy90', '09NNN77NNy90', '.09NNNNNy90.', '.009yyyy900.', '...000000...', '............'],
  vela: ['...0000.....', '..0AAAA0....', '.0AaaaaA0...', '.04444440...', '.0r4444r0...', '.0h3333h0...', '.0h3003h0...', '.0s3ss3s0...', '..0s33s0....', '...0ss0.....', '..00000000..', '.0G6666A6G0.', '.06A6666A60.', '.0e666666e0.', '..0h0..0h0..', '..0t0..0t0..'],
  gancio: ['...000000...', '..0BB55BB0..', '..05555550..', '..0L5555L0..', '..0h3333h0..', '..0h3003h0..', '..0st22ts0..', '..0t2222t0..', '...0t22t0...', '....0tt0....', '..00000000..', '.0B555555B0.', '.0577777750.', '.0L555555L0.', '..0h0..0h0..', '..0t0..0t0..'],
  lina: ['...0000.....', '..0HHHH0....', '.0H1111H0...', 'TH114411HT..', '.0h3333h0...', '.0hE00Eh0...', '.0s3333s0...', '..0s33s0....', '...0ss0.....', '..00000000..', '.0Y999999Y0.', '.0999999900.', '.0y999999y0.', '..0h0..0h0..', '..099999900.'],
  floppy: ['000000000000', '0LL55555LL50', '0L577775L550', '0L5777755550', '055555555550', '057777777550', '050000007550', '050000007550', '057777777550', '055555555550', '000000000000', '............'],
  acciarino: ['............', '...88888....', '..8a...8....', '..8..ttt.99.', '.8..tTTt.9Y9', '..8..ttt.99.', '..8a...8....', '...88888....', '............'],
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
