/* poster.js — Geração do pôster TOP 3 com +50 efeitos de fundo e temas infinitos */

// ========== COROA (desenho) ==========
function drawCrown(ctx, x, y, size, color = '#FFD700') {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#FFA500';
  ctx.lineWidth = 4;

  ctx.beginPath();
  const spikeHeight = size * 0.55;
  const baseWidth = size * 1.1;

  ctx.moveTo(-baseWidth / 2, spikeHeight / 2);
  for (let i = 0; i < 5; i++) {
    ctx.lineTo(-baseWidth / 2 + (baseWidth / 4) * i, -spikeHeight / 2);
    if (i < 4) ctx.lineTo(-baseWidth / 2 + (baseWidth / 4) * (i + 0.5), spikeHeight / 4);
  }
  ctx.lineTo(baseWidth / 2, spikeHeight / 2);
  ctx.lineTo(-baseWidth / 2, spikeHeight / 2);
  ctx.closePath();

  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FF4444';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    const jewelX = -baseWidth / 2 + (baseWidth / 4) * i;
    const jewelY = -spikeHeight / 3;
    ctx.arc(jewelX, jewelY, size * 0.14, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#FFFF99';
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.arc(0, -spikeHeight / 5, size * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}

// ========== GERADOR DE TEMA ÚNICO PARA O PÔSTER ==========
function gerarTemaPosterUnico() {
  let tentativas = 0;
  let tema;

  do {
    const h1 = randomInt(0, 359);
    const esquema = randomInt(1, 5);

    let h2, h3;
    switch (esquema) {
      case 1: // Complementar
        h2 = (h1 + 180) % 360;
        h3 = (h1 + 60) % 360;
        break;
      case 2: // Triádico
        h2 = (h1 + 120) % 360;
        h3 = (h1 + 240) % 360;
        break;
      case 3: // Análogo
        h2 = (h1 + 30) % 360;
        h3 = (h1 + 60) % 360;
        break;
      case 4: // Complementar dividido
        h2 = (h1 + 150) % 360;
        h3 = (h1 + 210) % 360;
        break;
      default: // Quadrático
        h2 = (h1 + 90) % 360;
        h3 = (h1 + 270) % 360;
    }

    const efeitosFundo = [
      'estrelas', 'estrelasCadentes', 'constelacoes', 'nebulosa', 'galaxia',
      'viaLactea', 'planetas', 'satelites', 'cometas', 'meteoros',
      'buracoNegro', 'supernova', 'eclipse', 'auroraBoreal', 'arcoIris',
      'floresta', 'montanhas', 'oceano', 'deserto', 'selva',
      'campo', 'cachoeira', 'rio', 'lago', 'geiser',
      'vulcao', 'neve', 'chuva', 'nevoa', 'aurora',
      'fogo', 'agua', 'terra', 'ar', 'lava',
      'gelo', 'raio', 'tempestade', 'vento', 'furacao',
      'tsunami', 'terremoto', 'incendio', 'inundacao', 'neblina',
      'metropole', 'skyline', 'noiteCidade', 'ponte', 'arranhaCeus',
      'tunel', 'estrada', 'rodovia', 'viaduto', 'ferrovia',
      'porto', 'aeroporto', 'estacao', 'terminal', 'rotatoria',
      'circuitos', 'neon', 'matrix', 'cyberpunk', 'holograma',
      'led', 'rgb', 'glitch', 'pixel', 'digital',
      'binario', 'codigo', 'dados', 'rede', 'wiFi',
      'geometria', 'fractais', 'mandala', 'espiral', 'vortex',
      'turbilhao', 'remoinho', 'espuma', 'bolhas', 'ondas',
      'textura', 'padrao', 'gradiente', 'degrade', 'arcoIris',
      'pintura', 'aquarela', 'oleo', 'grafite', 'spray',
      'stencil', 'colagem', 'mosaico', 'vitral', 'vitrais',
      'origami', 'kirigami', 'origamiModular', 'escultura', 'ceramica',
      'ondasSonoras', 'notasMusicais', 'partitura', 'equalizador', 'vinil',
      'cd', 'fitaCassete', 'radio', 'amplificador', 'palco',
      'show', 'concerto', 'festival', 'rave', 'disco'
    ];

    tema = {
      bg1: hslToHex(h1, randomInt(15, 40), randomInt(5, 15)),
      bg2: hslToHex(h2, randomInt(20, 50), randomInt(8, 20)),
      accent1: hslToHex(h1, randomInt(75, 95), randomInt(50, 75)),
      accent2: hslToHex(h2, randomInt(75, 95), randomInt(45, 70)),
      glow: hslToHex(h3, randomInt(85, 100), randomInt(55, 80)),
      text: '#ffffff',
      efeito: randomFrom(efeitosFundo),
      id: `${h1}-${h2}-${h3}-${Date.now()}`
    };

    tentativas++;

    const temaSimilar = ESTADO.temasUsados.some(temaUsado => {
      return Math.abs(parseInt(temaUsado.bg1) - parseInt(tema.bg1)) < 20 &&
             Math.abs(parseInt(temaUsado.bg2) - parseInt(tema.bg2)) < 20;
    });

    if (!temaSimilar || tentativas > 15) break;
  } while (true);

  ESTADO.temasUsados.push(tema);
  ESTADO.ultimoTemaPoster = tema;
  if (ESTADO.temasUsados.length > 20) ESTADO.temasUsados.shift();

  return tema;
}

// ========== BIBLIOTECA DE EFEITOS (50+) ==========
function desenharEstrelas(ctx, w, h, tema) {
  const count = randomInt(120, 200);
  for (let i = 0; i < count; i++) {
    ctx.beginPath();
    const px = randomBetween(0, w);
    const py = randomBetween(0, h);
    const pr = randomBetween(0.5, 3);
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(tema.glow, randomBetween(0.2, 0.8));
    ctx.fill();
  }
}

function desenharEstrelasCadentes(ctx, w, h, tema) {
  const count = randomInt(8, 15);
  for (let i = 0; i < count; i++) {
    const startX = randomBetween(w * 0.3, w * 0.7);
    const startY = randomBetween(0, h * 0.5);
    const length = randomBetween(50, 150);
    const angle = randomBetween(-Math.PI / 4, Math.PI / 4);

    const gradient = ctx.createLinearGradient(startX, startY,
      startX + Math.cos(angle) * length,
      startY + Math.sin(angle) * length);
    gradient.addColorStop(0, hexToRgba(tema.accent1, 0.8));
    gradient.addColorStop(1, hexToRgba(tema.accent1, 0));

    ctx.strokeStyle = gradient;
    ctx.lineWidth = randomBetween(2, 4);
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + Math.cos(angle) * length, startY + Math.sin(angle) * length);
    ctx.stroke();

    ctx.fillStyle = tema.accent1;
    ctx.beginPath();
    ctx.arc(startX, startY, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function desenharConstelacoes(ctx, w, h, tema) {
  desenharEstrelas(ctx, w, h, tema);
  ctx.strokeStyle = hexToRgba(tema.accent2, 0.4);
  ctx.lineWidth = 1;
  const constellations = randomInt(3, 6);
  for (let c = 0; c < constellations; c++) {
    const stars = randomInt(4, 8);
    const points = [];
    for (let s = 0; s < stars; s++) points.push([randomBetween(0, w), randomBetween(0, h * 0.8)]);
    ctx.beginPath();
    for (let i = 0; i < stars - 1; i++) {
      if (Math.random() > 0.3) {
        ctx.moveTo(points[i][0], points[i][1]);
        ctx.lineTo(points[i + 1][0], points[i + 1][1]);
      }
    }
    ctx.stroke();
  }
}

function desenharNebulosa(ctx, w, h, tema) {
  const layers = randomInt(3, 6);
  for (let layer = 0; layer < layers; layer++) {
    const centerX = randomBetween(w * 0.3, w * 0.7);
    const centerY = randomBetween(h * 0.3, h * 0.7);
    const radius = randomBetween(150, 300);
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, hexToRgba(tema.accent1, 0.2));
    gradient.addColorStop(1, hexToRgba(tema.accent1, 0));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function desenharGalaxia(ctx, w, h, tema) {
  const centerX = w / 2;
  const centerY = h / 2;
  const stars = randomInt(300, 500);
  for (let i = 0; i < stars; i++) {
    const angle = randomBetween(0, Math.PI * 2);
    const distance = randomBetween(0, 400);
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    ctx.fillStyle = hexToRgba(tema.glow, randomBetween(0.1, 0.6));
    ctx.beginPath();
    ctx.arc(x, y, randomBetween(0.5, 2.5), 0, Math.PI * 2);
    ctx.fill();
  }
  const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 80);
  coreGradient.addColorStop(0, hexToRgba(tema.accent1, 0.8));
  coreGradient.addColorStop(1, hexToRgba(tema.accent1, 0));
  ctx.fillStyle = coreGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
  ctx.fill();
}

function desenharViaLactea(ctx, w, h, tema) {
  for (let i = 0; i < 5; i++) {
    const offsetY = randomBetween(-50, 50);
    const height = randomBetween(100, 200);
    const gradient = ctx.createLinearGradient(0, h / 2 + offsetY, w, h / 2 + offsetY);
    gradient.addColorStop(0, hexToRgba(tema.accent1, 0));
    gradient.addColorStop(0.3, hexToRgba(tema.glow, 0.1));
    gradient.addColorStop(0.7, hexToRgba(tema.glow, 0.15));
    gradient.addColorStop(1, hexToRgba(tema.accent1, 0));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, h / 2 + offsetY - height / 2, w, height);
  }
}

function desenharPlanetas(ctx, w, h, tema) {
  const planetCount = randomInt(3, 6);
  for (let p = 0; p < planetCount; p++) {
    const x = randomBetween(50, w - 50);
    const y = randomBetween(50, h - 50);
    const radius = randomBetween(20, 80);
    const planetHue = randomInt(0, 359);
    const planetGradient = ctx.createRadialGradient(x - radius / 3, y - radius / 3, 0, x, y, radius);
    planetGradient.addColorStop(0, hslToHex(planetHue, 80, 70));
    planetGradient.addColorStop(1, hslToHex((planetHue + 30) % 360, 90, 40));
    ctx.fillStyle = planetGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function desenharSatelites(ctx, w, h, tema) {
  const satCount = randomInt(5, 10);
  for (let s = 0; s < satCount; s++) {
    const x = randomBetween(0, w);
    const y = randomBetween(0, h);
    const size = randomBetween(10, 25);
    const rotation = randomBetween(0, Math.PI * 2);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = hexToRgba(tema.accent2, 0.8);
    ctx.fillRect(-size / 2, -size / 3, size, size * 0.66);
    ctx.fillStyle = hexToRgba(tema.glow, 0.7);
    ctx.fillRect(-size / 2 - size * 0.4, -size / 6, size * 0.3, size * 0.33);
    ctx.fillRect(size / 2 + size * 0.1, -size / 6, size * 0.3, size * 0.33);
    ctx.restore();
  }
}

function desenharCometas(ctx, w, h, tema) {
  const cometCount = randomInt(3, 6);
  for (let c = 0; c < cometCount; c++) {
    const startX = randomBetween(w * 0.7, w);
    const startY = randomBetween(0, h);
    const length = randomBetween(100, 200);
    const angle = randomBetween(Math.PI * 0.75, Math.PI * 1.25);
    ctx.fillStyle = tema.accent1;
    ctx.beginPath();
    ctx.arc(startX, startY, randomBetween(4, 8), 0, Math.PI * 2);
    ctx.fill();
    const gradient = ctx.createLinearGradient(startX, startY,
      startX - Math.cos(angle) * length,
      startY - Math.sin(angle) * length);
    gradient.addColorStop(0, hexToRgba(tema.accent1, 0.8));
    gradient.addColorStop(0.5, hexToRgba(tema.glow, 0.4));
    gradient.addColorStop(1, hexToRgba(tema.glow, 0));
    ctx.strokeStyle = gradient;
    ctx.lineWidth = randomBetween(3, 6);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX - Math.cos(angle) * length, startY - Math.sin(angle) * length);
    ctx.stroke();
  }
}

function desenharMeteoros(ctx, w, h, tema) {
  const meteorCount = randomInt(10, 20);
  for (let m = 0; m < meteorCount; m++) {
    const x = randomBetween(0, w);
    const y = randomBetween(0, h);
    const size = randomBetween(2, 5);
    ctx.fillStyle = tema.accent1;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function desenharBuracoNegro(ctx, w, h, tema) {
  const centerX = w / 2;
  const centerY = h / 2;
  const radius = randomBetween(100, 200);
  const accretionGradient = ctx.createRadialGradient(centerX, centerY, radius * 0.7, centerX, centerY, radius * 1.5);
  accretionGradient.addColorStop(0, hexToRgba(tema.accent1, 0));
  accretionGradient.addColorStop(0.5, hexToRgba(tema.accent1, 0.6));
  accretionGradient.addColorStop(1, hexToRgba(tema.accent1, 0));
  ctx.fillStyle = accretionGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
  ctx.fill();
  const horizonGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.7);
  horizonGradient.addColorStop(0, '#000000');
  horizonGradient.addColorStop(1, hexToRgba(tema.accent1, 0.3));
  ctx.fillStyle = horizonGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.7, 0, Math.PI * 2);
  ctx.fill();
}

function desenharSupernova(ctx, w, h, tema) {
  const centerX = randomBetween(w * 0.3, w * 0.7);
  const centerY = randomBetween(h * 0.3, h * 0.7);
  const radius = randomBetween(100, 200);
  const explosionGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
  explosionGradient.addColorStop(0, hexToRgba('#ffffff', 0.9));
  explosionGradient.addColorStop(0.5, hexToRgba(tema.accent1, 0.7));
  explosionGradient.addColorStop(1, hexToRgba(tema.accent1, 0));
  ctx.fillStyle = explosionGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 1; i <= 3; i++) {
    const shockRadius = radius * (1 + i * 0.5);
    ctx.strokeStyle = hexToRgba(tema.glow, 0.3 / i);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, shockRadius, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function desenharEclipse(ctx, w, h, tema) {
  const centerX = w / 2;
  const centerY = h / 2;
  const sunRadius = randomBetween(80, 120);
  const moonRadius = sunRadius * randomBetween(0.9, 1.1);
  const offset = randomBetween(20, 50);
  const sunGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, sunRadius);
  sunGradient.addColorStop(0, '#FFFF00');
  sunGradient.addColorStop(1, '#FFA500');
  ctx.fillStyle = sunGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, sunRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(centerX + offset, centerY, moonRadius, 0, Math.PI * 2);
  ctx.fill();
  const coronaGradient = ctx.createRadialGradient(centerX, centerY, sunRadius, centerX, centerY, sunRadius * 1.5);
  coronaGradient.addColorStop(0, hexToRgba('#FFA500', 0.5));
  coronaGradient.addColorStop(1, hexToRgba('#FFA500', 0));
  ctx.fillStyle = coronaGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, sunRadius * 1.5, 0, Math.PI * 2);
  ctx.fill();
}

function desenharAuroraBoreal(ctx, w, h, tema) {
  const layers = randomInt(4, 7);
  for (let l = 0; l < layers; l++) {
    const y = h * 0.2 + l * 20;
    const height = randomBetween(30, 60);
    const waveAmplitude = randomBetween(20, 50);
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= w; x += 5) {
      const waveY = y + Math.sin(x * 0.01 + l) * waveAmplitude;
      ctx.lineTo(x, waveY);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    const gradient = ctx.createLinearGradient(0, y, 0, y + height * 2);
    gradient.addColorStop(0, hexToRgba(tema.accent1, 0.3));
    gradient.addColorStop(0.5, hexToRgba(tema.glow, 0.2));
    gradient.addColorStop(1, hexToRgba(tema.accent2, 0.1));
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}

function desenharArcoIris(ctx, w, h, tema) {
  const centerX = w / 2;
  const centerY = h * 1.5;
  const startRadius = 200;
  const arcWidth = 30;
  const rainbowColors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8B00FF'];
  for (let i = 0; i < rainbowColors.length; i++) {
    const radius = startRadius + i * arcWidth;
    ctx.strokeStyle = rainbowColors[i];
    ctx.lineWidth = arcWidth;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, Math.PI * 2, false);
    ctx.stroke();
  }
}

function desenharFloresta(ctx, w, h, tema) {
  const treeCount = randomInt(20, 40);
  for (let t = 0; t < treeCount; t++) {
    const x = randomBetween(0, w);
    const baseY = randomBetween(h * 0.7, h);
    const height = randomBetween(50, 150);
    const width = randomBetween(30, 60);
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x - width / 4, baseY - height / 3, width / 2, height / 3);
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.arc(x, baseY - height / 3, width / 2, 0, Math.PI * 2);
    ctx.arc(x - width / 3, baseY - height / 2, width / 2, 0, Math.PI * 2);
    ctx.arc(x + width / 3, baseY - height / 2, width / 2, 0, Math.PI * 2);
    ctx.arc(x, baseY - height, width / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function desenharMontanhas(ctx, w, h, tema) {
  const mountainCount = randomInt(5, 10);
  const mountainHeight = h * 0.4;
  for (let m = 0; m < mountainCount; m++) {
    const startX = (w / mountainCount) * m - 50;
    const peakX = (w / mountainCount) * (m + 0.5);
    const endX = (w / mountainCount) * (m + 1) + 50;
    ctx.fillStyle = hexToRgba('#8B7355', randomBetween(0.7, 0.9));
    ctx.beginPath();
    ctx.moveTo(startX, h);
    ctx.lineTo(peakX, h - mountainHeight);
    ctx.lineTo(endX, h);
    ctx.closePath();
    ctx.fill();
    if (Math.random() > 0.5) {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(peakX - 30, h - mountainHeight + 20);
      ctx.lineTo(peakX, h - mountainHeight - 10);
      ctx.lineTo(peakX + 30, h - mountainHeight + 20);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function desenharOceano(ctx, w, h, tema) {
  const oceanGradient = ctx.createLinearGradient(0, h * 0.6, 0, h);
  oceanGradient.addColorStop(0, '#1E90FF');
  oceanGradient.addColorStop(1, '#000080');
  ctx.fillStyle = oceanGradient;
  ctx.fillRect(0, h * 0.6, w, h * 0.4);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  for (let i = 0; i < 10; i++) {
    const y = h * 0.6 + i * 15;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < w; x += 20) ctx.lineTo(x, y + Math.sin(x * 0.05 + i) * 10);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  for (let i = 0; i < 30; i++) {
    const x = randomBetween(0, w);
    const y = randomBetween(h * 0.6, h);
    const size = randomBetween(2, 8);
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function desenharDeserto(ctx, w, h, tema) {
  const sandGradient = ctx.createLinearGradient(0, 0, 0, h);
  sandGradient.addColorStop(0, '#F4A460');
  sandGradient.addColorStop(1, '#D2691E');
  ctx.fillStyle = sandGradient;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#DEB887';
  for (let i = 0; i < 15; i++) {
    const duneHeight = randomBetween(30, 80);
    const duneWidth = randomBetween(100, 300);
    const duneX = randomBetween(-50, w + 50);
    const duneY = randomBetween(h * 0.5, h);
    ctx.beginPath();
    ctx.moveTo(duneX - duneWidth / 2, duneY);
    ctx.quadraticCurveTo(duneX, duneY - duneHeight, duneX + duneWidth / 2, duneY);
    ctx.closePath();
    ctx.fill();
  }
  const cactusCount = randomInt(10, 20);
  for (let c = 0; c < cactusCount; c++) {
    const x = randomBetween(0, w);
    const y = randomBetween(h * 0.7, h);
    const height = randomBetween(40, 100);
    const width = randomBetween(10, 20);
    ctx.fillStyle = '#228B22';
    ctx.fillRect(x - width / 2, y - height, width, height);
    const arms = randomInt(1, 3);
    for (let a = 0; a < arms; a++) {
      const armHeight = height * randomBetween(0.3, 0.6);
      const armWidth = width * randomBetween(1.5, 2);
      const armY = y - height + (height / (arms + 1)) * (a + 1);
      if (Math.random() > 0.5) ctx.fillRect(x - width / 2 - armWidth, armY - armHeight / 2, armWidth, armHeight);
      else ctx.fillRect(x + width / 2, armY - armHeight / 2, armWidth, armHeight);
    }
  }
}

function desenharSelva(ctx, w, h, tema) {
  const jungleGradient = ctx.createLinearGradient(0, 0, 0, h);
  jungleGradient.addColorStop(0, '#006400');
  jungleGradient.addColorStop(0.5, '#228B22');
  jungleGradient.addColorStop(1, '#32CD32');
  ctx.fillStyle = jungleGradient;
  ctx.fillRect(0, 0, w, h);
  const leafCount = randomInt(100, 200);
  for (let i = 0; i < leafCount; i++) {
    const x = randomBetween(0, w);
    const y = randomBetween(0, h);
    const size = randomBetween(10, 30);
    ctx.fillStyle = randomFrom(['#006400', '#228B22', '#32CD32', '#3CB371']);
    ctx.beginPath();
    for (let j = 0; j < 3; j++) {
      const angle = (Math.PI * 2 / 3) * j;
      const leafX = x + Math.cos(angle) * size;
      const leafY = y + Math.sin(angle) * size;
      if (j === 0) ctx.moveTo(leafX, leafY);
      else ctx.lineTo(leafX, leafY);
    }
    ctx.closePath();
    ctx.fill();
  }
  const vineCount = randomInt(5, 10);
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 3;
  for (let v = 0; v < vineCount; v++) {
    const startX = randomBetween(0, w);
    const startY = 0;
    const endY = randomBetween(h * 0.5, h);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    for (let y = startY; y <= endY; y += 20) {
      const offsetX = Math.sin(y * 0.05 + v) * 30;
      ctx.lineTo(startX + offsetX, y);
    }
    ctx.stroke();
  }
}

function desenharCampo(ctx, w, h, tema) {
  const fieldGradient = ctx.createLinearGradient(0, 0, 0, h);
  fieldGradient.addColorStop(0, '#7CFC00');
  fieldGradient.addColorStop(1, '#32CD32');
  ctx.fillStyle = fieldGradient;
  ctx.fillRect(0, 0, w, h);
  const flowerCount = randomInt(50, 100);
  for (let f = 0; f < flowerCount; f++) {
    const x = randomBetween(0, w);
    const y = randomBetween(0, h);
    const size = randomBetween(5, 15);
    ctx.strokeStyle = '#006400';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + size * 3);
    ctx.stroke();
    const petalCount = randomInt(5, 8);
    const petalColor = randomFrom(['#FF69B4', '#FF0000', '#FFA500', '#FFFF00', '#FF00FF']);
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = petalColor;
    for (let p = 0; p < petalCount; p++) {
      const angle = (Math.PI * 2 / petalCount) * p;
      const petalX = x + Math.cos(angle) * size;
      const petalY = y + Math.sin(angle) * size;
      ctx.beginPath();
      ctx.arc(petalX, petalY, size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const hillCount = randomInt(3, 6);
  for (let hc = 0; hc < hillCount; hc++) {
    const hillX = randomBetween(-100, w + 100);
    const hillY = randomBetween(h * 0.5, h);
    const hillWidth = randomBetween(200, 400);
    const hillHeight = randomBetween(50, 150);
    ctx.fillStyle = '#32CD32';
    ctx.beginPath();
    ctx.moveTo(hillX - hillWidth / 2, hillY);
    ctx.quadraticCurveTo(hillX, hillY - hillHeight, hillX + hillWidth / 2, hillY);
    ctx.closePath();
    ctx.fill();
  }
}

function desenharCachoeira(ctx, w, h, tema) {
  const waterfallX = w / 2;
  const waterfallWidth = randomBetween(80, 150);
  const startY = 0;
  const endY = h;
  const waterGradient = ctx.createLinearGradient(waterfallX - waterfallWidth / 2, 0, waterfallX + waterfallWidth / 2, 0);
  waterGradient.addColorStop(0, hexToRgba('#1E90FF', 0.7));
  waterGradient.addColorStop(0.5, hexToRgba('#87CEEB', 0.9));
  waterGradient.addColorStop(1, hexToRgba('#1E90FF', 0.7));
  ctx.fillStyle = waterGradient;
  ctx.fillRect(waterfallX - waterfallWidth / 2, startY, waterfallWidth, endY);
  for (let i = 0; i < 50; i++) {
    const x = randomBetween(waterfallX - waterfallWidth / 2, waterfallX + waterfallWidth / 2);
    const y = randomBetween(startY, endY);
    const size = randomBetween(2, 10);
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  const rockCount = randomInt(10, 20);
  for (let r = 0; r < rockCount; r++) {
    const x = randomBetween(waterfallX - waterfallWidth, waterfallX + waterfallWidth);
    const y = randomBetween(startY, endY);
    const size = randomBetween(10, 30);
    ctx.fillStyle = '#696969';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function desenharRio(ctx, w, h, tema) {
  const riverWidth = randomBetween(100, 200);
  const riverY = h / 2;
  const riverGradient = ctx.createLinearGradient(0, riverY - riverWidth / 2, 0, riverY + riverWidth / 2);
  riverGradient.addColorStop(0, '#1E90FF');
  riverGradient.addColorStop(0.5, '#87CEEB');
  riverGradient.addColorStop(1, '#1E90FF');
  ctx.fillStyle = riverGradient;
  ctx.fillRect(0, riverY - riverWidth / 2, w, riverWidth);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  for (let i = 0; i < 20; i++) {
    const y = riverY + randomBetween(-riverWidth / 3, riverWidth / 3);
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < w; x += 30) ctx.lineTo(x, y + Math.sin(x * 0.1 + i) * 10);
    ctx.stroke();
  }
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(0, 0, w, riverY - riverWidth / 2);
  ctx.fillRect(0, riverY + riverWidth / 2, w, h - (riverY + riverWidth / 2));
}

function desenharLago(ctx, w, h, tema) {
  const lakeX = w / 2;
  const lakeY = h / 2;
  const lakeWidth = randomBetween(300, 500);
  const lakeHeight = randomBetween(200, 300);
  const lakeGradient = ctx.createRadialGradient(lakeX, lakeY, 0, lakeX, lakeY, Math.max(lakeWidth, lakeHeight) / 2);
  lakeGradient.addColorStop(0, '#1E90FF');
  lakeGradient.addColorStop(0.7, '#87CEEB');
  lakeGradient.addColorStop(1, '#4682B4');
  ctx.fillStyle = lakeGradient;
  ctx.beginPath();
  ctx.ellipse(lakeX, lakeY, lakeWidth / 2, lakeHeight / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = hexToRgba('#FFFFFF', 0.2);
  ctx.beginPath();
  ctx.ellipse(lakeX, lakeY, lakeWidth / 2 - 20, lakeHeight / 2 - 20, 0, 0, Math.PI * 2);
  ctx.fill();
  const lilyCount = randomInt(10, 20);
  for (let l = 0; l < lilyCount; l++) {
    const angle = randomBetween(0, Math.PI * 2);
    const distance = randomBetween(0, Math.min(lakeWidth, lakeHeight) / 2 - 30);
    const x = lakeX + Math.cos(angle) * distance;
    const y = lakeY + Math.sin(angle) * distance;
    const size = randomBetween(20, 40);
    ctx.fillStyle = '#32CD32';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    if (Math.random() > 0.7) {
      const petalCount = randomInt(5, 8);
      const petalColor = randomFrom(['#FFFFFF', '#FFB6C1', '#FF69B4']);
      ctx.fillStyle = '#FFFF00';
      ctx.beginPath();
      ctx.arc(x, y, size / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = petalColor;
      for (let p = 0; p < petalCount; p++) {
        const petalAngle = (Math.PI * 2 / petalCount) * p;
        const petalX = x + Math.cos(petalAngle) * size / 2;
        const petalY = y + Math.sin(petalAngle) * size / 2;
        ctx.beginPath();
        ctx.arc(petalX, petalY, size / 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function desenharGeiser(ctx, w, h, tema) {
  const geyserX = w / 2;
  const geyserY = h * 0.7;
  const geyserWidth = randomBetween(30, 60);
  ctx.fillStyle = '#696969';
  ctx.beginPath();
  ctx.arc(geyserX, geyserY, geyserWidth, 0, Math.PI * 2);
  ctx.fill();
  const jetHeight = randomBetween(100, 200);
  const jetGradient = ctx.createLinearGradient(geyserX, geyserY, geyserX, geyserY - jetHeight);
  jetGradient.addColorStop(0, hexToRgba('#87CEEB', 0.9));
  jetGradient.addColorStop(0.5, hexToRgba('#FFFFFF', 0.7));
  jetGradient.addColorStop(1, hexToRgba('#87CEEB', 0.3));
  ctx.fillStyle = jetGradient;
  ctx.beginPath();
  ctx.moveTo(geyserX - geyserWidth / 2, geyserY);
  ctx.quadraticCurveTo(geyserX, geyserY - jetHeight, geyserX + geyserWidth / 2, geyserY);
  ctx.closePath();
  ctx.fill();
  const dropCount = randomInt(20, 40);
  for (let d = 0; d < dropCount; d++) {
    const x = randomBetween(geyserX - geyserWidth, geyserX + geyserWidth);
    const y = randomBetween(geyserY - jetHeight / 2, geyserY);
    const size = randomBetween(2, 6);
    ctx.fillStyle = '#87CEEB';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function desenharVulcao(ctx, w, h, tema) {
  const volcanoX = w / 2;
  const volcanoY = h * 0.7;
  const volcanoWidth = randomBetween(200, 300);
  const volcanoHeight = randomBetween(150, 250);
  ctx.fillStyle = '#8B4513';
  ctx.beginPath();
  ctx.moveTo(volcanoX - volcanoWidth / 2, volcanoY);
  ctx.lineTo(volcanoX, volcanoY - volcanoHeight);
  ctx.lineTo(volcanoX + volcanoWidth / 2, volcanoY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#696969';
  ctx.beginPath();
  ctx.arc(volcanoX, volcanoY - volcanoHeight + 30, volcanoWidth / 4, 0, Math.PI * 2);
  ctx.fill();
  const lavaGradient = ctx.createRadialGradient(volcanoX, volcanoY - volcanoHeight + 30, 0, volcanoX, volcanoY - volcanoHeight + 30, volcanoWidth / 4);
  lavaGradient.addColorStop(0, '#FF4500');
  lavaGradient.addColorStop(0.7, '#FF8C00');
  lavaGradient.addColorStop(1, '#FFD700');
  ctx.fillStyle = lavaGradient;
  ctx.beginPath();
  ctx.arc(volcanoX, volcanoY - volcanoHeight + 30, volcanoWidth / 4 - 10, 0, Math.PI * 2);
  ctx.fill();
  const smokeCount = randomInt(5, 10);
  for (let s = 0; s < smokeCount; s++) {
    const smokeX = volcanoX + randomBetween(-volcanoWidth / 4, volcanoWidth / 4);
    const smokeY = volcanoY - volcanoHeight + randomBetween(0, 50);
    const smokeSize = randomBetween(30, 80);
    ctx.fillStyle = hexToRgba('#696969', randomBetween(0.3, 0.7));
    ctx.beginPath();
    ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

function desenharNeve(ctx, w, h, tema) {
  const snowGradient = ctx.createLinearGradient(0, h * 0.7, 0, h);
  snowGradient.addColorStop(0, '#FFFFFF');
  snowGradient.addColorStop(1, '#F0F8FF');
  ctx.fillStyle = snowGradient;
  ctx.fillRect(0, h * 0.7, w, h * 0.3);
  const flakeCount = randomInt(100, 200);
  for (let f = 0; f < flakeCount; f++) {
    const x = randomBetween(0, w);
    const y = randomBetween(0, h);
    const size = randomBetween(1, 4);
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    if (size > 2.5) {
      ctx.strokeStyle = '#F0F8FF';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 / 6) * i;
        const branchX = x + Math.cos(angle) * size * 2;
        const branchY = y + Math.sin(angle) * size * 2;
        ctx.moveTo(x, y);
        ctx.lineTo(branchX, branchY);
      }
      ctx.stroke();
    }
  }
  const treeCount = randomInt(10, 20);
  for (let t = 0; t < treeCount; t++) {
    const x = randomBetween(0, w);
    const baseY = randomBetween(h * 0.7, h);
    const height = randomBetween(60, 120);
    const width = randomBetween(20, 40);
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x - width / 4, baseY - height / 3, width / 2, height / 3);
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.arc(x, baseY - height / 3, width / 2, 0, Math.PI * 2);
    ctx.arc(x - width / 3, baseY - height / 2, width / 2, 0, Math.PI * 2);
    ctx.arc(x + width / 3, baseY - height / 2, width / 2, 0, Math.PI * 2);
    ctx.arc(x, baseY - height, width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, baseY - height, width / 2, 0, Math.PI * 2);
    ctx.arc(x - width / 3, baseY - height / 2, width / 2, 0, Math.PI);
    ctx.arc(x + width / 3, baseY - height / 2, width / 2, 0, Math.PI);
    ctx.fill();
  }
}

function desenharChuva(ctx, w, h, tema) {
  const rainCount = randomInt(200, 400);
  ctx.strokeStyle = hexToRgba('#87CEEB', 0.6);
  ctx.lineWidth = 1;
  ctx.lineCap = 'round';
  for (let i = 0; i < rainCount; i++) {
    const x = randomBetween(0, w);
    const y = randomBetween(0, h);
    const length = randomBetween(20, 40);
    const angle = Math.PI * 0.75;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    ctx.stroke();
  }
  const puddleCount = randomInt(5, 15);
  for (let p = 0; p < puddleCount; p++) {
    const x = randomBetween(0, w);
    const y = randomBetween(h * 0.8, h);
    const size = randomBetween(20, 50);
    ctx.fillStyle = hexToRgba('#1E90FF', 0.3);
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function desenharNevoa(ctx, w, h, tema) {
  const fogLayers = randomInt(3, 5);
  for (let l = 0; l < fogLayers; l++) {
    const alpha = randomBetween(0.05, 0.15);
    const blur = randomBetween(20, 50);
    ctx.save();
    ctx.fillStyle = hexToRgba(tema.text, alpha);
    ctx.filter = `blur(${blur}px)`;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

function desenharAurora(ctx, w, h, tema) {
  desenharAuroraBoreal(ctx, w, h, tema);
  const colorLayers = randomInt(2, 4);
  for (let l = 0; l < colorLayers; l++) {
    const y = h * 0.2 + l * 15;
    const height = randomBetween(20, 40);
    const waveAmplitude = randomBetween(15, 35);
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= w; x += 5) {
      const waveY = y + Math.sin(x * 0.015 + l) * waveAmplitude;
      ctx.lineTo(x, waveY);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    const colors = ['#FF00FF', '#00FFFF', '#FFFF00', '#FF0000'];
    const color = colors[l % colors.length];
    const gradient = ctx.createLinearGradient(0, y, 0, y + height * 2);
    gradient.addColorStop(0, hexToRgba(color, 0.4));
    gradient.addColorStop(0.5, hexToRgba(color, 0.2));
    gradient.addColorStop(1, hexToRgba(color, 0.1));
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}

function desenharFogo(ctx, w, h, tema) {
  const fireCount = randomInt(5, 10);
  for (let f = 0; f < fireCount; f++) {
    const x = randomBetween(0, w);
    const baseY = randomBetween(h * 0.7, h);
    const width = randomBetween(40, 80);
    const height = randomBetween(60, 120);
    for (let i = 0; i < 3; i++) {
      const flameHeight = height * randomBetween(0.7, 1.0);
      const flameWidth = width * randomBetween(0.8, 1.2);
      ctx.beginPath();
      ctx.moveTo(x - flameWidth / 2, baseY);
      ctx.bezierCurveTo(
        x - flameWidth / 4, baseY - flameHeight / 2,
        x + flameWidth / 4, baseY - flameHeight / 2,
        x + flameWidth / 2, baseY
      );
      ctx.lineTo(x + flameWidth / 2, baseY + 10);
      ctx.bezierCurveTo(
        x + flameWidth / 4, baseY - flameHeight / 4,
        x - flameWidth / 4, baseY - flameHeight / 4,
        x - flameWidth / 2, baseY + 10
      );
      ctx.closePath();
      const fireGradient = ctx.createLinearGradient(x, baseY, x, baseY - flameHeight);
      fireGradient.addColorStop(0, hexToRgba('#FF0000', 0.8));
      fireGradient.addColorStop(0.5, hexToRgba('#FF8800', 0.9));
      fireGradient.addColorStop(1, hexToRgba('#FFFF00', 0.7));
      ctx.fillStyle = fireGradient;
      ctx.fill();
    }
  }
}

function desenharAgua(ctx, w, h, tema) { desenharOceano(ctx, w, h, tema); }
function desenharTerra(ctx, w, h, tema) {
  const earthGradient = ctx.createLinearGradient(0, 0, 0, h);
  earthGradient.addColorStop(0, '#8B4513');
  earthGradient.addColorStop(0.5, '#A0522D');
  earthGradient.addColorStop(1, '#D2691E');
  ctx.fillStyle = earthGradient;
  ctx.fillRect(0, 0, w, h);
  const rockCount = randomInt(30, 60);
  for (let r = 0; r < rockCount; r++) {
    const x = randomBetween(0, w);
    const y = randomBetween(0, h);
    const size = randomBetween(10, 40);
    ctx.fillStyle = '#696969';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = randomBetween(0, Math.PI * 2);
      const length = size * randomBetween(0.3, 0.7);
      const endX = x + Math.cos(angle) * length;
      const endY = y + Math.sin(angle) * length;
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
    }
    ctx.stroke();
  }
}
function desenharAr(ctx, w, h, tema) {
  const windCount = randomInt(10, 20);
  ctx.strokeStyle = hexToRgba('#87CEEB', 0.3);
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  for (let wd = 0; wd < windCount; wd++) {
    const startX = randomBetween(0, w * 0.3);
    const startY = randomBetween(0, h);
    const length = randomBetween(100, 200);
    const angle = randomBetween(-Math.PI / 6, Math.PI / 6);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + Math.cos(angle) * length, startY + Math.sin(angle) * length);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  const cloudCount = randomInt(10, 20);
  for (let c = 0; c < cloudCount; c++) {
    const x = randomBetween(0, w);
    const y = randomBetween(0, h);
    const size = randomBetween(30, 80);
    ctx.fillStyle = hexToRgba('#FFFFFF', randomBetween(0.1, 0.3));
    ctx.beginPath();
    ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
    ctx.arc(x + size * 0.2, y - size * 0.1, size * 0.4, 0, Math.PI * 2);
    ctx.arc(x + size * 0.4, y, size * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }
}
function desenharLava(ctx, w, h, tema) { desenharVulcao(ctx, w, h, tema); }
function desenharGelo(ctx, w, h, tema) {
  const iceGradient = ctx.createLinearGradient(0, 0, 0, h);
  iceGradient.addColorStop(0, '#ADD8E6');
  iceGradient.addColorStop(0.5, '#87CEEB');
  iceGradient.addColorStop(1, '#4682B4');
  ctx.fillStyle = iceGradient;
  ctx.fillRect(0, 0, w, h);
  const glacierCount = randomInt(5, 10);
  for (let g = 0; g < glacierCount; g++) {
    const x = randomBetween(0, w);
    const y = randomBetween(h * 0.5, h);
    const width = randomBetween(100, 200);
    const height = randomBetween(80, 150);
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(x - width / 2, y);
    ctx.lineTo(x, y - height);
    ctx.lineTo(x + width / 2, y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#4682B4';
    ctx.lineWidth = 2;
    const cracks = randomInt(3, 6);
    for (let c = 0; c < cracks; c++) {
      const startX = x - width / 2 + (width / cracks) * c;
      const startY = y;
      const endX = x;
      const endY = y - height + randomBetween(0, height / 2);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      for (let i = 0; i < 3; i++) {
        const midX = startX + (endX - startX) * (i + 1) / 3;
        const midY = startY + (endY - startY) * (i + 1) / 3 + randomBetween(-10, 10);
        ctx.lineTo(midX, midY);
      }
      ctx.stroke();
    }
  }
}
function desenharRaio(ctx, w, h, tema) {
  ctx.save();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  const lightningCount = randomInt(3, 6);
  for (let i = 0; i < lightningCount; i++) {
    const startX = randomBetween(w * 0.3, w * 0.7);
    const startY = randomBetween(0, h * 0.3);
    const segments = randomInt(4, 8);
    let currentX = startX;
    let currentY = startY;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    for (let s = 0; s < segments; s++) {
      const angle = randomBetween(-Math.PI / 3, Math.PI / 3);
      const segmentLength = randomBetween(30, 80);
      currentX += Math.cos(angle) * segmentLength;
      currentY += Math.sin(angle) * segmentLength;
      ctx.lineTo(currentX, currentY);
    }
    ctx.stroke();
  }
  ctx.strokeStyle = hexToRgba('#FFFF00', 0.6);
  ctx.lineWidth = 6;
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < lightningCount / 2; i++) {
    const startX = randomBetween(w * 0.3, w * 0.7);
    const startY = randomBetween(0, h * 0.3);
    const segments = randomInt(3, 6);
    let currentX = startX;
    let currentY = startY;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    for (let s = 0; s < segments; s++) {
      const angle = randomBetween(-Math.PI / 3, Math.PI / 3);
      const segmentLength = randomBetween(30, 60);
      currentX += Math.cos(angle) * segmentLength;
      currentY += Math.sin(angle) * segmentLength;
      ctx.lineTo(currentX, currentY);
    }
    ctx.stroke();
  }
  ctx.restore();
}
function desenharTempestade(ctx, w, h, tema) {
  const skyGradient = ctx.createLinearGradient(0, 0, 0, h);
  skyGradient.addColorStop(0, hexToRgba('#333333', 0.8));
  skyGradient.addColorStop(0.5, hexToRgba('#222222', 0.9));
  skyGradient.addColorStop(1, hexToRgba('#111111', 1));
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = hexToRgba('#000000', 0.7);
  for (let c = 0; c < 8; c++) {
    const x = randomBetween(-100, w + 100);
    const y = randomBetween(0, h * 0.4);
    const size = randomBetween(100, 200);
    ctx.beginPath();
    ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
    ctx.arc(x + size * 0.25, y - size * 0.1, size * 0.4, 0, Math.PI * 2);
    ctx.arc(x + size * 0.5, y, size * 0.35, 0, Math.PI * 2);
    ctx.arc(x + size * 0.3, y + size * 0.15, size * 0.3, 0, Math.PI * 2);
    ctx.arc(x - size * 0.2, y + size * 0.1, size * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }
  desenharChuva(ctx, w, h, tema);
  desenharRaio(ctx, w, h, tema);
}
function desenharVento(ctx, w, h, tema) { desenharAr(ctx, w, h, tema); }
function desenharFuracao(ctx, w, h, tema) {
  const centerX = w / 2;
  const centerY = h / 2;
  const radius = Math.min(w, h) * 0.3;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#87CEEB';
  ctx.lineWidth = 3;
  for (let i = 0; i < 3; i++) {
    const spiralRadius = radius * (0.3 + i * 0.2);
    const turns = 2;
    ctx.beginPath();
    for (let angle = 0; angle < Math.PI * 2 * turns; angle += 0.1) {
      const currentRadius = (angle / (Math.PI * 2 * turns)) * spiralRadius;
      const x = centerX + Math.cos(angle) * currentRadius;
      const y = centerY + Math.sin(angle) * currentRadius;
      if (angle === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  const cloudCount = randomInt(20, 40);
  for (let c = 0; c < cloudCount; c++) {
    const angle = randomBetween(0, Math.PI * 2);
    const distance = randomBetween(radius * 0.3, radius);
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    const size = randomBetween(20, 50);
    ctx.fillStyle = hexToRgba('#696969', randomBetween(0.5, 0.8));
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}
function desenharTsunami(ctx, w, h, tema) {
  const waveHeight = h * 0.4;
  const waveY = h * 0.6;
  const waveGradient = ctx.createLinearGradient(0, waveY - waveHeight, 0, waveY);
  waveGradient.addColorStop(0, hexToRgba('#1E90FF', 0.9));
  waveGradient.addColorStop(0.7, hexToRgba('#87CEEB', 0.7));
  waveGradient.addColorStop(1, hexToRgba('#4682B4', 0.9));
  ctx.fillStyle = waveGradient;
  ctx.beginPath();
  ctx.moveTo(0, waveY);
  for (let x = 0; x <= w; x += 10) {
    const y = waveY - Math.sin(x * 0.02) * waveHeight;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, waveY - waveHeight * 0.8);
  for (let x = 0; x <= w; x += 10) {
    const y = waveY - Math.sin(x * 0.02) * waveHeight * 0.9;
    ctx.lineTo(x, y);
  }
  ctx.stroke();
  const foamCount = randomInt(50, 100);
  for (let f = 0; f < foamCount; f++) {
    const x = randomBetween(0, w);
    const y = randomBetween(waveY - waveHeight, waveY);
    const size = randomBetween(2, 10);
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}
function desenharTerremoto(ctx, w, h, tema) {
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 3;
  const crackCount = randomInt(10, 20);
  for (let c = 0; c < crackCount; c++) {
    const startX = randomBetween(0, w);
    const startY = randomBetween(h * 0.7, h);
    const length = randomBetween(50, 150);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    for (let i = 0; i < 5; i++) {
      const segmentLength = length / 5;
      const angle = randomBetween(-Math.PI / 4, Math.PI / 4);
      const endX = startX + Math.cos(angle) * segmentLength * (i + 1);
      const endY = startY + Math.sin(angle) * segmentLength * (i + 1);
      ctx.lineTo(endX, endY);
    }
    ctx.stroke();
  }
  const rockCount = randomInt(20, 40);
  for (let r = 0; r < rockCount; r++) {
    const x = randomBetween(0, w);
    const y = randomBetween(h * 0.7, h);
    const size = randomBetween(10, 30);
    const rotation = randomBetween(-Math.PI / 6, Math.PI / 6);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = '#696969';
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  const dustCount = randomInt(30, 60);
  for (let d = 0; d < dustCount; d++) {
    const x = randomBetween(0, w);
    const y = randomBetween(h * 0.5, h);
    const size = randomBetween(5, 15);
    ctx.fillStyle = hexToRgba('#8B4513', randomBetween(0.3, 0.7));
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}
function desenharIncendio(ctx, w, h, tema) {
  desenharFogo(ctx, w, h, tema);
  const smokeCount = randomInt(10, 20);
  for (let s = 0; s < smokeCount; s++) {
    const x = randomBetween(w * 0.3, w * 0.7);
    const y = randomBetween(h * 0.5, h * 0.8);
    const size = randomBetween(40, 100);
    ctx.fillStyle = hexToRgba('#696969', randomBetween(0.3, 0.7));
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.arc(x + size * 0.3, y - size * 0.2, size * 0.8, 0, Math.PI * 2);
    ctx.arc(x - size * 0.2, y - size * 0.3, size * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  const treeCount = randomInt(10, 20);
  for (let t = 0; t < treeCount; t++) {
    const x = randomBetween(0, w);
    const baseY = randomBetween(h * 0.7, h);
    const height = randomBetween(60, 120);
    const width = randomBetween(20, 40);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x - width / 4, baseY - height / 3, width / 2, height / 3);
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 3;
    const branches = randomInt(3, 6);
    for (let b = 0; b < branches; b++) {
      const branchY = baseY - height / 3 + (height / 3 / (branches + 1)) * (b + 1);
      const branchLength = randomBetween(20, 40);
      const branchAngle = Math.random() > 0.5 ? Math.PI / 4 : -Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(x, branchY);
      ctx.lineTo(x + Math.cos(branchAngle) * branchLength, branchY + Math.sin(branchAngle) * branchLength);
      ctx.stroke();
    }
  }
}
function desenharInundacao(ctx, w, h, tema) {
  const waterHeight = h * 0.4;
  const waterGradient = ctx.createLinearGradient(0, h - waterHeight, 0, h);
  waterGradient.addColorStop(0, '#1E90FF');
  waterGradient.addColorStop(1, '#4682B4');
  ctx.fillStyle = waterGradient;
  ctx.fillRect(0, h - waterHeight, w, waterHeight);
  const objectCount = randomInt(10, 20);
  for (let o = 0; o < objectCount; o++) {
    const x = randomBetween(0, w);
    const y = randomBetween(h - waterHeight, h);
    const type = randomFrom(['tree', 'house', 'car']);
    if (type === 'tree') {
      const size = randomBetween(20, 40);
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(x - size / 6, y - size, size / 3, size);
      ctx.fillStyle = '#228B22';
      ctx.beginPath();
      ctx.arc(x, y - size, size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'house') {
      const size = randomBetween(30, 50);
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(x - size / 2, y - size, size, size);
      ctx.fillStyle = '#A52A2A';
      ctx.beginPath();
      ctx.moveTo(x - size / 2, y - size);
      ctx.lineTo(x, y - size * 1.5);
      ctx.lineTo(x + size / 2, y - size);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'car') {
      const size = randomBetween(25, 40);
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(x - size / 2, y - size / 3, size, size / 3);
      ctx.fillRect(x - size / 3, y - size / 2, size * 0.66, size / 3);
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(x - size / 4, y, size / 8, 0, Math.PI * 2);
      ctx.arc(x + size / 4, y, size / 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  for (let i = 0; i < 10; i++) {
    const waveY = h - waterHeight + i * 10;
    ctx.beginPath();
    ctx.moveTo(0, waveY);
    for (let x = 0; x < w; x += 20) ctx.lineTo(x, waveY + Math.sin(x * 0.05 + i) * 5);
    ctx.stroke();
  }
}
function desenharNeblina(ctx, w, h, tema) { desenharNevoa(ctx, w, h, tema); }

// ========== MAPA DE EFEITOS ==========
const efeitosMap = {
  estrelas: desenharEstrelas,
  estrelasCadentes: desenharEstrelasCadentes,
  constelacoes: desenharConstelacoes,
  nebulosa: desenharNebulosa,
  galaxia: desenharGalaxia,
  viaLactea: desenharViaLactea,
  planetas: desenharPlanetas,
  satelites: desenharSatelites,
  cometas: desenharCometas,
  meteoros: desenharMeteoros,
  buracoNegro: desenharBuracoNegro,
  supernova: desenharSupernova,
  eclipse: desenharEclipse,
  auroraBoreal: desenharAuroraBoreal,
  arcoIris: desenharArcoIris,
  floresta: desenharFloresta,
  montanhas: desenharMontanhas,
  oceano: desenharOceano,
  deserto: desenharDeserto,
  selva: desenharSelva,
  campo: desenharCampo,
  cachoeira: desenharCachoeira,
  rio: desenharRio,
  lago: desenharLago,
  geiser: desenharGeiser,
  vulcao: desenharVulcao,
  neve: desenharNeve,
  chuva: desenharChuva,
  nevoa: desenharNevoa,
  aurora: desenharAurora,
  fogo: desenharFogo,
  agua: desenharAgua,
  terra: desenharTerra,
  ar: desenharAr,
  lava: desenharLava,
  gelo: desenharGelo,
  raio: desenharRaio,
  tempestade: desenharTempestade,
  vento: desenharVento,
  furacao: desenharFuracao,
  tsunami: desenharTsunami,
  terremoto: desenharTerremoto,
  incendio: desenharIncendio,
  inundacao: desenharInundacao,
  neblina: desenharNeblina,
  default: desenharEstrelas
};

// ========== GARANTIR CANVAS ==========
function ensurePosterCanvas() {
  let canvas = porId('posterCanvas');
  if (canvas && canvas instanceof HTMLCanvasElement && canvas.getContext) {
    if (canvas.width < 1800) canvas.width = 2000;
    if (canvas.height < 1200) canvas.height = 1400;
    return canvas;
  }
  canvas = document.createElement('canvas');
  canvas.id = 'posterCanvas';
  canvas.width = 2000;
  canvas.height = 1400;
  canvas.style.display = 'block';
  canvas.style.maxWidth = '95vw';
  canvas.style.maxHeight = '85vh';
  canvas.style.margin = '20px auto';
  canvas.style.boxShadow = '0 15px 40px rgba(0,0,0,0.6)';
  canvas.style.borderRadius = '16px';
  canvas.style.border = '4px solid var(--c-primary, #00e7ff)';
  canvas.style.background = '#000';
  canvas.style.cursor = 'pointer';
  canvas.addEventListener('click', baixarPoster);
  const posterContainer = porId('posterContainer');
  if (posterContainer) {
    posterContainer.innerHTML = '';
    posterContainer.appendChild(canvas);
  } else {
    const container = document.createElement('div');
    container.id = 'posterContainer';
    container.style.textAlign = 'center';
    container.style.margin = '30px 0';
    container.style.padding = '20px';
    container.style.background = 'var(--c-bg)';
    container.style.borderRadius = '12px';
    container.style.border = '2px solid var(--c-primary)';
    const title = document.createElement('h3');
    title.textContent = '🎯 PÔSTER TOP 3 - XTREINO TOMAN';
    title.style.color = 'var(--c-primary)';
    title.style.marginBottom = '15px';
    title.style.fontSize = '1.8rem';
    title.style.textShadow = '0 2px 8px rgba(0,0,0,0.5)';
    container.appendChild(title);
    const subtitle = document.createElement('p');
    subtitle.textContent = 'Clique na imagem para baixar | Tema aleatório a cada geração';
    subtitle.style.color = 'var(--muted)';
    subtitle.style.marginBottom = '20px';
    subtitle.style.fontSize = '0.9rem';
    container.appendChild(subtitle);
    container.appendChild(canvas);
    const scoreboard = porId('scoreboard');
    if (scoreboard && scoreboard.parentNode) {
      scoreboard.parentNode.insertBefore(container, scoreboard.nextSibling);
    } else {
      document.body.appendChild(container);
    }
  }
  return canvas;
}

// ========== GERAR PÔSTER ==========
async function gerarPosterTop3() {
  console.log('Gerando pôster TOP 3 com efeito de fundo variado...');
  const canvas = ensurePosterCanvas();
  if (!canvas) {
    console.error('Não foi possível criar o canvas para o pôster');
    return false;
  }
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const sorted = [...ESTADO.times].sort((a, b) => {
    const scoreDiff = b.score - a.score;
    if (scoreDiff !== 0) return scoreDiff;
    const killsDiff = b.totalKills - a.totalKills;
    if (killsDiff !== 0) return killsDiff;
    return b.booyas - a.booyas;
  });
  const top = [sorted[0] || null, sorted[1] || null, sorted[2] || null];
  const tema = gerarTemaPosterUnico();
  ctx.clearRect(0, 0, w, h);
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, tema.bg1);
  grad.addColorStop(0.5, tema.bg2);
  grad.addColorStop(1, tema.bg1);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  console.log(`Aplicando efeito de fundo: ${tema.efeito}`);
  const efeitoFunc = efeitosMap[tema.efeito] || efeitosMap.default;
  efeitoFunc(ctx, w, h, tema);
  const glowCount = randomInt(8, 15);
  for (let i = 0; i < glowCount; i++) {
    ctx.beginPath();
    const px = randomBetween(-w * 0.1, w * 1.1);
    const py = randomBetween(-h * 0.1, h * 1.1);
    const pr = randomBetween(80, 300);
    const gradient = ctx.createRadialGradient(px, py, 0, px, py, pr);
    gradient.addColorStop(0, hexToRgba(tema.accent1, randomBetween(0.05, 0.12)));
    gradient.addColorStop(1, hexToRgba(tema.accent1, 0));
    ctx.fillStyle = gradient;
    ctx.fillRect(px - pr, py - pr, pr * 2, pr * 2);
  }
  ctx.textAlign = 'center';
  ctx.shadowColor = hexToRgba(tema.accent1, 0.6);
  ctx.shadowBlur = 30;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = tema.text;
  ctx.font = 'bold 110px "Arial Black", Impact, sans-serif';
  ctx.fillText('TOP 3', w / 2, 180);
  ctx.shadowBlur = 20;
  ctx.font = 'italic 50px "Arial", sans-serif';
  ctx.fillStyle = hexToRgba(tema.accent1, 0.95);
  ctx.fillText('CAMPEÕES DO XTREINO', w / 2, 250);
  ctx.font = 'bold 65px "Arial", sans-serif';
  ctx.fillStyle = tema.text;
  ctx.fillText('TOMAN ☯️', w / 2, 330);
  ctx.shadowBlur = 0;
  const slots = [
    { rank: 1, x: w / 2, y: 600, size: 450, elevation: 0, platformHeight: 20 },
    { rank: 2, x: w * 0.25, y: 750, size: 320, elevation: 60, platformHeight: 40 },
    { rank: 3, x: w * 0.75, y: 750, size: 320, elevation: 60, platformHeight: 40 }
  ];
  const loadImage = (src) => {
    return new Promise((resolve) => {
      if (!src || src.trim() === '') { resolve(null); return; }
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  };
  for (let i = 0; i < slots.length; i++) {
    const s = slots[i];
    const t = top[i];
    ctx.save();
    ctx.fillStyle = hexToRgba(tema.accent2, 0.3);
    ctx.beginPath();
    ctx.roundRect(s.x - s.size / 2 - 20, s.y + s.size / 2, s.size + 40, s.platformHeight, 8);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.fillStyle = hexToRgba('#000000', 0.3);
    ctx.beginPath();
    ctx.roundRect(s.x - s.size / 2 - 15, s.y + s.size / 2 + s.platformHeight, s.size + 30, 15, 5);
    ctx.fill();
    ctx.restore();
    const gradient = ctx.createRadialGradient(s.x, s.y, s.size / 2, s.x, s.y, s.size / 2 + 50);
    gradient.addColorStop(0, hexToRgba(tema.accent1, 0.25));
    gradient.addColorStop(1, hexToRgba(tema.accent2, 0.05));
    ctx.save();
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size / 2 + 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = hexToRgba(tema.accent1, 0.4);
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size / 2 + 36, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    if (!t) {
      ctx.save();
      ctx.fillStyle = hexToRgba('#ffffff', 0.1);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = 'bold 50px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('VAGO', s.x, s.y);
      ctx.restore();
      continue;
    }
    let img = null;
    if (t.logoDataUrl) img = await loadImage(t.logoDataUrl);
    if (img) {
      ctx.save();
      ctx.shadowColor = hexToRgba(tema.accent1, 0.5);
      ctx.shadowBlur = 30;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size / 2, 0, Math.PI * 2);
      ctx.clip();
      const scale = Math.min(s.size / img.width, s.size / img.height) * 0.9;
      const newWidth = img.width * scale;
      const newHeight = img.height * scale;
      ctx.drawImage(img, s.x - newWidth / 2, s.y - newHeight / 2, newWidth, newHeight);
      ctx.shadowBlur = 0;
      ctx.restore();
    } else {
      ctx.save();
      const placeholderGradient = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size / 2);
      placeholderGradient.addColorStop(0, hexToRgba(tema.accent1, 0.3));
      placeholderGradient.addColorStop(1, hexToRgba(tema.accent2, 0.1));
      ctx.fillStyle = placeholderGradient;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = hexToRgba(tema.accent1, 0.8);
      ctx.font = 'bold 80px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const initials = t.nome ? t.nome.split(' ').map(w => w[0]).join('').toUpperCase() : 'T';
      ctx.fillText(initials, s.x, s.y);
      ctx.restore();
    }
    if (s.rank === 1) {
      drawCrown(ctx, s.x, s.y - s.size / 2 - 80, 200, tema.accent1);
      ctx.save();
      ctx.fillStyle = hexToRgba(tema.accent1, 0.2);
      ctx.beginPath();
      ctx.arc(s.x, s.y - s.size / 2 - 80, 120, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.save();
    ctx.fillStyle = hexToRgba(tema.accent1, 0.9);
    ctx.font = `bold ${s.rank === 1 ? '80' : '70'}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`#${s.rank}`, s.x, s.y - s.size / 2 - (s.rank === 1 ? 180 : 160));
    ctx.restore();
    ctx.fillStyle = tema.text;
    ctx.font = s.rank === 1 ? 'bold 70px Arial, sans-serif' : 'bold 55px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText((t.nome || `LINE ${t.id}`).toUpperCase(), s.x, s.y + s.size / 2 + 120);
    ctx.font = s.rank === 1 ? '42px Arial, sans-serif' : '38px Arial, sans-serif';
    ctx.fillStyle = hexToRgba(tema.accent2, 0.95);
    const statsY = s.y + s.size / 2 + (s.rank === 1 ? 180 : 170);
    ctx.fillText(`${t.score || 0} PONTOS`, s.x, statsY);
    ctx.font = s.rank === 1 ? '36px Arial, sans-serif' : '32px Arial, sans-serif';
    ctx.fillStyle = hexToRgba(tema.glow, 0.9);
    ctx.fillText(`${t.totalKills || 0} KILLS • ${t.booyas || 0} BOOYAS`, s.x, statsY + (s.rank === 1 ? 50 : 45));
  }
  const footerHeight = 160;
  ctx.fillStyle = hexToRgba('#000000', 0.75);
  ctx.fillRect(0, h - footerHeight, w, footerHeight);
  const footerGrad = ctx.createLinearGradient(0, h - footerHeight, 0, h);
  footerGrad.addColorStop(0, hexToRgba(tema.accent1, 0.3));
  footerGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = footerGrad;
  ctx.fillRect(0, h - footerHeight, w, footerHeight);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 38px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PARABÉNS AOS CAMPEÕES DO XTREINO DA TOMAN!', w / 2, h - 80);
  ctx.font = '26px Arial, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  ctx.fillText(`Gerado em ${dateStr.toUpperCase()} • Efeito: ${tema.efeito.toUpperCase()}`, w / 2, h - 30);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = tema.glow;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  console.log(`Pôster TOP 3 gerado com efeito: ${tema.efeito}`);
  return true;
}

// ========== BAIXAR POSTER ==========
function baixarPoster() {
  const canvas = porId('posterCanvas');
  if (!canvas) {
    gerarPosterTop3().then(() => {
      setTimeout(() => {
        const newCanvas = porId('posterCanvas');
        if (newCanvas) downloadCanvas(newCanvas);
      }, 500);
    });
    return;
  }
  downloadCanvas(canvas);
}

function downloadCanvas(canvas) {
  const link = document.createElement('a');
  link.download = `poster_top3_toman_${new Date().toISOString().slice(0, 10)}.png`;
  link.href = canvas.toDataURL('image/png', 1.0);
  const originalTitle = canvas.title;
  canvas.title = '✓ Baixando...';
  canvas.style.borderColor = '#00ff00';
  canvas.style.boxShadow = '0 0 20px #00ff00';
  setTimeout(() => {
    canvas.title = originalTitle;
    canvas.style.borderColor = '';
    canvas.style.boxShadow = '';
  }, 1000);
  link.click();
}

// ========== EVENTOS DO POSTER ==========
document.addEventListener('DOMContentLoaded', () => {
  [porId('btnPosterTop3'), porId('btnGeneratePoster')].forEach(btn => {
    btn?.addEventListener('click', () => {
      gerarPosterTop3().then(() => {
        const originalText = btn.textContent;
        btn.textContent = '✓ Pôster Gerado!';
        btn.style.backgroundColor = 'var(--c-primary)';
        btn.style.color = '#000';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.backgroundColor = '';
          btn.style.color = '';
        }, 1500);
      });
    });
  });
  porId('btnDownloadPoster')?.addEventListener('click', baixarPoster);
});

// Tornar funções globais necessárias
window.gerarPosterTop3 = gerarPosterTop3;
window.baixarPoster = baixarPoster;