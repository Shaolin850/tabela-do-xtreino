/* poster.js — Pôster com proporção 9:16, imagem de fundo personalizada e slots retangulares ajustáveis */

// ========== CONFIGURAÇÕES DOS SLOTS (para canvas 1080x1920 - 9:16) ==========
let slotConfigs = [
  { x: 370, y: 880, w: 280, h: 350 }, // 1º lugar
  { x: 20, y: 1150, w: 280, h: 350 },  // 2º lugar
  { x: 720, y: 1150, w: 280, h: 350 }  // 3º lugar
];

let posterImageDataURL = null;

// ========== CRIAR CONTROLES NA UI ==========
function criarControlesPoster() {
  const posterCard = document.querySelector('.poster.card');
  if (!posterCard) return;

  // Input file para upload da imagem
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.id = 'posterImageInput';
  fileInput.style.marginBottom = '10px';
  fileInput.style.width = '100%';
  fileInput.style.padding = '8px';
  fileInput.style.background = 'var(--c-bg-light)';
  fileInput.style.border = '1px solid #333';
  fileInput.style.borderRadius = '6px';
  fileInput.style.color = '#fff';
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        posterImageDataURL = ev.target.result;
        gerarPosterTop3();
      };
      reader.readAsDataURL(file);
    }
  });

  // Container dos controles de posição
  const controlsContainer = document.createElement('div');
  controlsContainer.style.display = 'grid';
  controlsContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
  controlsContainer.style.gap = '10px';
  controlsContainer.style.marginTop = '10px';

  const labels = ['1º Lugar', '2º Lugar', '3º Lugar'];

  slotConfigs.forEach((cfg, idx) => {
    const group = document.createElement('div');
    group.style.border = '1px solid #333';
    group.style.padding = '8px';
    group.style.borderRadius = '6px';
    group.style.background = 'rgba(0,0,0,0.3)';

    const title = document.createElement('div');
    title.textContent = labels[idx];
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '5px';
    title.style.color = 'var(--c-primary)';
    group.appendChild(title);

    // X
    const xLabel = document.createElement('label');
    xLabel.textContent = 'X: ';
    xLabel.style.fontSize = '12px';
    const xInput = document.createElement('input');
    xInput.type = 'number';
    xInput.value = cfg.x;
    xInput.style.width = '55px';
    xInput.style.marginRight = '8px';
    xInput.style.background = '#222';
    xInput.style.border = '1px solid #444';
    xInput.style.color = '#fff';
    xInput.style.borderRadius = '4px';
    xInput.style.padding = '2px 4px';
    xInput.addEventListener('input', () => {
      slotConfigs[idx].x = parseInt(xInput.value) || 0;
      gerarPosterTop3();
    });
    group.appendChild(xLabel);
    group.appendChild(xInput);

    // Y
    const yLabel = document.createElement('label');
    yLabel.textContent = 'Y: ';
    yLabel.style.fontSize = '12px';
    const yInput = document.createElement('input');
    yInput.type = 'number';
    yInput.value = cfg.y;
    yInput.style.width = '55px';
    yInput.style.marginRight = '8px';
    yInput.style.background = '#222';
    yInput.style.border = '1px solid #444';
    yInput.style.color = '#fff';
    yInput.style.borderRadius = '4px';
    yInput.style.padding = '2px 4px';
    yInput.addEventListener('input', () => {
      slotConfigs[idx].y = parseInt(yInput.value) || 0;
      gerarPosterTop3();
    });
    group.appendChild(yLabel);
    group.appendChild(yInput);

    // Largura
    const wLabel = document.createElement('label');
    wLabel.textContent = 'Larg: ';
    wLabel.style.fontSize = '12px';
    const wInput = document.createElement('input');
    wInput.type = 'number';
    wInput.value = cfg.w;
    wInput.style.width = '55px';
    wInput.style.marginRight = '8px';
    wInput.style.background = '#222';
    wInput.style.border = '1px solid #444';
    wInput.style.color = '#fff';
    wInput.style.borderRadius = '4px';
    wInput.style.padding = '2px 4px';
    wInput.addEventListener('input', () => {
      slotConfigs[idx].w = parseInt(wInput.value) || 50;
      gerarPosterTop3();
    });
    group.appendChild(wLabel);
    group.appendChild(wInput);

    // Altura
    const hLabel = document.createElement('label');
    hLabel.textContent = 'Alt: ';
    hLabel.style.fontSize = '12px';
    const hInput = document.createElement('input');
    hInput.type = 'number';
    hInput.value = cfg.h;
    hInput.style.width = '55px';
    hInput.style.background = '#222';
    hInput.style.border = '1px solid #444';
    hInput.style.color = '#fff';
    hInput.style.borderRadius = '4px';
    hInput.style.padding = '2px 4px';
    hInput.addEventListener('input', () => {
      slotConfigs[idx].h = parseInt(hInput.value) || 50;
      gerarPosterTop3();
    });
    group.appendChild(hLabel);
    group.appendChild(hInput);

    controlsContainer.appendChild(group);
  });

  const posterWrapper = posterCard.querySelector('.poster-wrapper');
  posterCard.insertBefore(fileInput, posterWrapper);
  posterCard.insertBefore(controlsContainer, posterWrapper);
}

// ========== GARANTIR CANVAS (PROPORÇÃO FIXA 2:3) ==========
function ensurePosterCanvas() {
  let canvas = porId('posterCanvas');
  if (canvas && canvas instanceof HTMLCanvasElement && canvas.getContext) {
    // Força a proporção 2:3 (1024x1536) para evitar distorção
    if (canvas.width !== 1024 || canvas.height !== 1536) {
      canvas.width = 1024;
      canvas.height = 1536;
    }
    return canvas;
  }
  canvas = document.createElement('canvas');
  canvas.id = 'posterCanvas';
  canvas.width = 1024;  // 2:3
  canvas.height = 1536; // 2:3
  canvas.style.display = 'block';
  canvas.style.maxWidth = '95vw';
  canvas.style.maxHeight = '85vh';
  canvas.style.margin = '20px auto';
  canvas.style.boxShadow = '0 15px 40px rgba(0,0,0,0.6)';
  canvas.style.borderRadius = '16px';
  canvas.style.border = '4px solid var(--c-primary, #ff0000)';
  canvas.style.background = '#000';
  canvas.style.cursor = 'pointer';
  canvas.style.aspectRatio = '9 / 16'; /* dica visual para o navegador */
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
    subtitle.textContent = 'Clique na imagem para baixar | Ajuste a posição dos slots abaixo';
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
  const canvas = ensurePosterCanvas();
  if (!canvas) return false;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;  // 1080
  const h = canvas.height; // 1920

  ctx.clearRect(0, 0, w, h);

  // Desenhar imagem de fundo se carregada
  if (posterImageDataURL) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = posterImageDataURL;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      // Preencher todo o canvas com a imagem (cortando para caber 2:3)
      const imgRatio = img.width / img.height;
      const canvasRatio = w / h; // 0.6667 (2/3)
      let sx, sy, sw, sh;
      if (imgRatio > canvasRatio) {
        // Imagem mais larga -> cortar laterais
        sh = img.height;
        sw = img.height * canvasRatio;
        sx = (img.width - sw) / 2;
        sy = 0;
      } else {
        // Imagem mais alta -> cortar topo/baixo
        sw = img.width;
        sh = img.width / canvasRatio;
        sx = 0;
        sy = (img.height - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    } catch (error) {
      console.error('Erro ao carregar imagem de fundo:', error);
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, w, h);
    }
  } else {
    // Fundo padrão preto com mensagem
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📸 Carregue uma imagem de fundo', w/2, h/2 - 30);
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '28px Arial';
    ctx.fillText('(use o seletor de arquivo acima)', w/2, h/2 + 40);
  }

  // Obter top 3
  const sorted = [...ESTADO.times].sort((a, b) => b.score - a.score || b.totalKills - a.totalKills || b.booyas - a.booyas);
  const top = [sorted[0] || null, sorted[1] || null, sorted[2] || null];
  const cores = ['#FFD700', '#C0C0C0', '#CD7F32'];

  // Desenhar cada slot retangular
  for (let i = 0; i < 3; i++) {
    const cfg = slotConfigs[i];
    const t = top[i];
    const x = cfg.x;
    const y = cfg.y;
    const sw = cfg.w;
    const sh = cfg.h;

    ctx.save();

    // Fundo do slot com gradiente e transparência
    const grad = ctx.createLinearGradient(x, y, x, y + sh);
    grad.addColorStop(0, 'rgba(10, 10, 20, 0.88)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.92)');
    grad.addColorStop(1, 'rgba(10, 10, 20, 0.88)');
    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 6;
    ctx.fillRect(x, y, sw, sh);
    ctx.shadowBlur = 0;

    // Borda com cor do rank
    ctx.strokeStyle = cores[i] || '#ff0000';
    ctx.lineWidth = 5;
    ctx.shadowColor = `rgba(255, 0, 0, 0.3)`;
    ctx.shadowBlur = 12;
    ctx.strokeRect(x, y, sw, sh);
    ctx.shadowBlur = 0;

    // --- DENTRO DO RETÂNGULO (APENAS RANK, LOGO E PONTUAÇÃO) ---

    // 1. Número do rank (canto superior esquerdo)
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = cores[i] || '#ffffff';
    ctx.font = `bold ${Math.min(sw, sh) * 0.15}px Arial`;
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 8;
    ctx.fillText(`#${i+1}`, x + 20, y + 15);
    ctx.shadowBlur = 0;

    // 2. Logo da LINE (centralizado)
    if (t && t.logoDataUrl) {
      const img = new Image();
      img.src = t.logoDataUrl;
      await new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
      // Tamanho do logo: 50% do menor lado do slot
      const logoSize = Math.min(sw, sh) * 0.80;
      const logoX = x + (sw - logoSize) / 2;
      const logoY = y + (sh - logoSize) / 2 - 10; // levemente acima do centro para dar espaço à pontuação
      ctx.save();
      ctx.beginPath();
      ctx.rect(logoX, logoY, logoSize, logoSize);
      ctx.clip();
      ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
      ctx.restore();
    } else {
      // Se não houver logo, desenha um placeholder
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.font = `${Math.min(sw, sh) * 0.12}px Arial`;
      ctx.fillText('SEM LOGO', x + sw/2, y + sh/2 - 10);
    }

    // 3. Pontuação (centralizado na parte inferior)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = cores[i] || '#ff0000';
    ctx.font = `bold ${Math.min(sw, sh) * 0.15}px Arial`;
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 10;
    const score = t ? `${t.score} pts` : '0 pts';
    ctx.fillText(score, x + sw/2, y + sh - 20);
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  // Coroa no primeiro lugar (acima do slot)
  if (top[0]) {
    const cfg = slotConfigs[0];
    const crownSize = Math.min(cfg.w, cfg.h) * 0.18;
    drawCrown(ctx, cfg.x + cfg.w/2, cfg.y - crownSize*0.4, crownSize);
  }

  return true;
}

// ========== COROA ==========
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

// ========== BAIXAR PÔSTER ==========
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
  link.download = `poster_top3_toman_${new Date().toISOString().slice(0,10)}.png`;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
}

// ========== EVENTOS ==========
document.addEventListener('DOMContentLoaded', () => {
  criarControlesPoster();

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

  // Gera automaticamente ao carregar
  gerarPosterTop3();
});

window.gerarPosterTop3 = gerarPosterTop3;
window.baixarPoster = baixarPoster;