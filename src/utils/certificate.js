// Draw a level-completion certificate on a canvas and download it as a PNG.
const W = 1600;
const H = 1130;
const C = { bg: '#F8F6F2', ink: '#111111', gray: '#57534e', gold: '#9A6700', yellow: '#FDC52B', purple: '#C4B5FD' };

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Render the certificate. Returns the canvas.
 *   { name, level: { id, name, nameAr }, topicsCount, date }
 */
export async function drawCertificate({ name, level, topicsCount, date }) {
  // Make sure the brand fonts are ready before drawing text
  try {
    await Promise.all([
      document.fonts.load('800 80px "Plus Jakarta Sans"'),
      document.fonts.load('500 30px Inter'),
      document.fonts.load('600 34px Cairo'),
    ]);
  } catch {
    /* fall back to system fonts */
  }

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background + soft brand glows
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
  let g = ctx.createRadialGradient(150, 120, 0, 150, 120, 600);
  g.addColorStop(0, 'rgba(196,181,253,0.55)');
  g.addColorStop(1, 'rgba(196,181,253,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  g = ctx.createRadialGradient(W - 120, H - 140, 0, W - 120, H - 140, 650);
  g.addColorStop(0, 'rgba(253,197,43,0.35)');
  g.addColorStop(1, 'rgba(253,197,43,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Subtle grid
  ctx.strokeStyle = 'rgba(17,17,17,0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Frame
  ctx.lineWidth = 6;
  ctx.strokeStyle = C.yellow;
  roundRect(ctx, 50, 50, W - 100, H - 100, 40);
  ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(154,103,0,0.45)';
  roundRect(ctx, 72, 72, W - 144, H - 144, 30);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // Brand
  ctx.font = '800 44px "Plus Jakarta Sans", Arial, sans-serif';
  const left = 'Yasmina ';
  const right = 'Khaled';
  const lw = ctx.measureText(left).width;
  const rw = ctx.measureText(right).width;
  const bx = W / 2 - (lw + rw) / 2;
  ctx.textAlign = 'left';
  ctx.fillStyle = C.ink;
  ctx.fillText(left, bx, 175);
  ctx.fillStyle = C.gold;
  ctx.fillText(right, bx + lw, 175);
  ctx.textAlign = 'center';

  // Title
  ctx.fillStyle = C.gold;
  ctx.font = '600 26px Inter, Arial, sans-serif';
  ctx.fillText('C E R T I F I C A T E   O F   C O M P L E T I O N', W / 2, 260);
  ctx.fillStyle = C.yellow;
  ctx.fillRect(W / 2 - 40, 285, 80, 5);

  ctx.fillStyle = C.gray;
  ctx.font = '500 32px Inter, Arial, sans-serif';
  ctx.fillText('This certifies that', W / 2, 380);

  // Name (shrink to fit)
  let size = 96;
  ctx.fillStyle = C.ink;
  do {
    ctx.font = `800 ${size}px "Plus Jakarta Sans", Arial, sans-serif`;
    size -= 4;
  } while (ctx.measureText(name).width > W - 320 && size > 40);
  ctx.fillText(name, W / 2, 500);

  ctx.fillStyle = C.gray;
  ctx.font = '500 32px Inter, Arial, sans-serif';
  ctx.fillText(`has completed all ${topicsCount} situations of level`, W / 2, 590);

  ctx.fillStyle = C.gold;
  ctx.font = '800 76px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText(`${level.id} · ${level.name}`, W / 2, 690);

  ctx.direction = 'rtl';
  ctx.fillStyle = C.ink;
  ctx.font = '600 34px Cairo, Arial, sans-serif';
  ctx.fillText(`أتمّ بنجاح جميع مواقف المستوى ${level.id} (${level.nameAr})`, W / 2, 770);
  ctx.direction = 'ltr';

  // Footer: date + signature
  ctx.font = '500 26px Inter, Arial, sans-serif';
  ctx.fillStyle = C.gray;
  ctx.textAlign = 'left';
  ctx.fillText(date, 180, 960);
  ctx.fillRect(180, 975, 300, 2);
  ctx.fillText('Date', 180, 1010);

  ctx.textAlign = 'right';
  ctx.font = 'italic 600 34px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillStyle = C.ink;
  ctx.fillText('Ahmed Khaled', W - 180, 955);
  ctx.fillStyle = C.gray;
  ctx.fillRect(W - 480, 975, 300, 2);
  ctx.font = '500 26px Inter, Arial, sans-serif';
  ctx.fillText('Yasmina Khaled · English', W - 180, 1010);

  return canvas;
}

export async function downloadCertificate(options) {
  const canvas = await drawCertificate(options);
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = `certificate-${options.level.id}-${options.name.replace(/\s+/g, '-')}.png`;
  a.click();
  return canvas;
}
