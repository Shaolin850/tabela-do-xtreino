/* poster.js — Pôster com proporção 2:3 e imagem de fundo FIXA (CARREGAMENTO INSTANTÂNEO) */
// Versão com logos em alta qualidade

// ========== CONFIGURAÇÕES DOS SLOTS (SUAS POSIÇÕES) ==========
const slotConfigs = [
  { x: 370, y: 880, w: 280, h: 350 }, // 1º lugar
  { x: 20, y: 1150, w: 280, h: 350 },  // 2º lugar
  { x: 720, y: 1150, w: 280, h: 350 }  // 3º lugar
];

// ========== IMAGEM FIXA DO PÔSTER ==========
const POSTER_IMAGEM_FIXA = 'poster_fundo.png';

// Cache da imagem em base64 (carregado uma única vez)
let posterImageDataURL = null;
let imagemCarregada = false;

// ========== PRÉ-CARREGAR IMAGEM ==========
function preCarregarImagem() {
  console.log('🚀 Pré-carregando imagem do pôster...');
  
  try {
    const salva = localStorage.getItem('xtreino_poster_image_cache');
    if (salva) {
      posterImageDataURL = salva;
      imagemCarregada = true;
      console.log('✅ Imagem carregada do cache (instantâneo)!');
      gerarPosterTop3();
      return;
    }
  } catch (e) {}

  if (!POSTER_IMAGEM_FIXA) {
    console.warn('⚠️ Nenhuma imagem fixa definida');
    gerarPosterTop3();
    return;
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  
  img.onload = () => {
    console.log('📸 Imagem carregada, convertendo para base64...');
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    posterImageDataURL = canvas.toDataURL('image/png');
    imagemCarregada = true;
    
    try {
      localStorage.setItem('xtreino_poster_image_cache', posterImageDataURL);
      console.log('💾 Imagem salva em cache para próximo uso');
    } catch (e) {
      console.warn('⚠️ Não foi possível salvar em cache (tamanho muito grande)');
    }
    
    gerarPosterTop3();
  };
  
  img.onerror = () => {
    console.error('❌ Erro ao carregar imagem, usando fallback');
    imagemCarregada = true;
    gerarPosterTop3();
  };
  
  img.src = POSTER_IMAGEM_FIXA;
}

// ========== CARREGAR IMAGEM DO LOCALSTORAGE ==========
function carregarImagemCache() {
  try {
    const salva = localStorage.getItem('xtreino_poster_image_cache');
    if (salva) {
      posterImageDataURL = salva;
      imagemCarregada = true;
      console.log('✅ Imagem carregada do cache local');
      return true;
    }
  } catch (e) {}
  return false;
}

// ========== CRIAR CONTROLES ==========
function criarControlesPoster() {
  const posterCard = document.querySelector('.poster.card');
  if (!posterCard) return;

  const uploadContainer = document.createElement('div');
  uploadContainer.style.marginBottom = '10px';
  uploadContainer.style.display = 'flex';
  uploadContainer.style.gap = '10px';
  uploadContainer.style.alignItems = 'center';
  uploadContainer.style.flexWrap = 'wrap';

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.id = 'posterImageInput';
  fileInput.style.display = 'none';
  
  const label = document.createElement('label');
  label.htmlFor = 'posterImageInput';
  label.textContent = '📸 Trocar Imagem';
  label.style.cssText = `
    display: inline-block;
    padding: 8px 16px;
    background: var(--c-primary, #ff0000);
    color: #fff;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
    transition: all 0.3s ease;
    font-family: inherit;
  `;
  label.addEventListener('mouseenter', () => {
    label.style.transform = 'scale(1.02)';
    label.style.boxShadow = '0 4px 15px rgba(255,0,0,0.3)';
  });
  label.addEventListener('mouseleave', () => {
    label.style.transform = 'scale(1)';
    label.style.boxShadow = 'none';
  });

  const status = document.createElement('span');
  status.id = 'posterImageStatus';
  status.textContent = posterImageDataURL ? '✅ Imagem carregada' : '⏳ Carregando...';
  status.style.cssText = `
    font-size: 13px;
    color: ${posterImageDataURL ? '#00ff88' : '#ffcc00'};
    font-weight: 500;
  `;

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        posterImageDataURL = ev.target.result;
        try {
          localStorage.setItem('xtreino_poster_image_cache', posterImageDataURL);
        } catch (e) {}
        label.textContent = '📸 Trocar Imagem';
        status.textContent = '✅ Imagem atualizada!';
        status.style.color = '#00ff88';
        gerarPosterTop3();
        mostrarNotificacao('📸 Imagem de fundo atualizada!', 'success');
      };
      reader.readAsDataURL(file);
    }
  });

  const btnRestaurar = document.createElement('button');
  btnRestaurar.textContent = '🔄 Restaurar Padrão';
  btnRestaurar.style.cssText = `
    padding: 8px 16px;
    background: transparent;
    color: var(--c-text-muted);
    border: 2px solid var(--c-text-muted);
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
    transition: all 0.3s ease;
    font-family: inherit;
  `;
  btnRestaurar.addEventListener('mouseenter', () => {
    btnRestaurar.style.background = 'var(--c-text-muted)';
    btnRestaurar.style.color = '#000';
  });
  btnRestaurar.addEventListener('mouseleave', () => {
    btnRestaurar.style.background = 'transparent';
    btnRestaurar.style.color = 'var(--c-text-muted)';
  });
  btnRestaurar.addEventListener('click', () => {
    localStorage.removeItem('xtreino_poster_image_cache');
    posterImageDataURL = null;
    imagemCarregada = false;
    preCarregarImagem();
    status.textContent = '✅ Imagem padrão restaurada!';
    status.style.color = '#00ff88';
    mostrarNotificacao('🔄 Imagem padrão restaurada!', 'info');
  });

  uploadContainer.appendChild(fileInput);
  uploadContainer.appendChild(label);
  uploadContainer.appendChild(status);
  uploadContainer.appendChild(btnRestaurar);

  const posterWrapper = posterCard.querySelector('.poster-wrapper');
  posterCard.insertBefore(uploadContainer, posterWrapper);
}

// ========== GARANTIR CANVAS ==========
function ensurePosterCanvas() {
  let canvas = porId('posterCanvas');
  if (canvas && canvas instanceof HTMLCanvasElement && canvas.getContext) {
    if (canvas.width !== 1024 || canvas.height !== 1536) {
      canvas.width = 1024;
      canvas.height = 1536;
    }
    return canvas;
  }
  canvas = document.createElement('canvas');
  canvas.id = 'posterCanvas';
  canvas.width = 1024;
  canvas.height = 1536;
  canvas.style.display = 'block';
  canvas.style.maxWidth = '95vw';
  canvas.style.maxHeight = '85vh';
  canvas.style.margin = '20px auto';
  canvas.style.boxShadow = '0 15px 40px rgba(0,0,0,0.6)';
  canvas.style.borderRadius = '16px';
  canvas.style.border = '4px solid var(--c-primary, #ff0000)';
  canvas.style.background = '#000';
  canvas.style.cursor = 'pointer';
  canvas.style.aspectRatio = '9 / 16';
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
    subtitle.textContent = 'Clique na imagem para baixar | Imagem de fundo fixa';
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

// ========== GERAR PÔSTER (VERSÃO MELHORADA COM ALTA QUALIDADE) ==========
async function gerarPosterTop3() {
  const canvas = ensurePosterCanvas();
  if (!canvas) return false;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  // Melhora a qualidade de renderização
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.clearRect(0, 0, w, h);

  // Desenhar imagem de fundo
  if (posterImageDataURL) {
    try {
      const img = new Image();
      img.src = posterImageDataURL;
      await new Promise((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = resolve;
          img.onerror = resolve;
        }
      });
      const imgRatio = img.width / img.height;
      const canvasRatio = w / h;
      let sx, sy, sw, sh;
      if (imgRatio > canvasRatio) {
        sh = img.height;
        sw = img.height * canvasRatio;
        sx = (img.width - sw) / 2;
        sy = 0;
      } else {
        sw = img.width;
        sh = img.width / canvasRatio;
        sx = 0;
        sy = (img.height - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    } catch (error) {
      console.error('Erro ao desenhar imagem:', error);
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, w, h);
    }
  } else {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);
    if (!imagemCarregada) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '28px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⏳ Carregando imagem...', w/2, h/2);
    }
  }

  // Obter top 3
  const sorted = [...ESTADO.times].sort((a, b) => b.score - a.score || b.totalKills - a.totalKills || b.booyas - a.booyas);
  const top = [sorted[0] || null, sorted[1] || null, sorted[2] || null];
  const cores = ['#FFD700', '#C0C0C0', '#CD7F32'];

  // Desenhar cada slot
  for (let i = 0; i < 3; i++) {
    const cfg = slotConfigs[i];
    const t = top[i];
    const x = cfg.x;
    const y = cfg.y;
    const sw = cfg.w;
    const sh = cfg.h;

    ctx.save();

    // Fundo do slot com gradiente melhorado
    const grad = ctx.createLinearGradient(x, y, x, y + sh);
    grad.addColorStop(0, 'rgba(10, 10, 20, 0.92)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.95)');
    grad.addColorStop(1, 'rgba(10, 10, 20, 0.92)');
    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 8;
    ctx.fillRect(x, y, sw, sh);
    ctx.shadowBlur = 0;

    // Borda com brilho
    ctx.strokeStyle = cores[i] || '#ff0000';
    ctx.lineWidth = 6;
    ctx.shadowColor = cores[i] || 'rgba(255, 0, 0, 0.3)';
    ctx.shadowBlur = 20;
    ctx.strokeRect(x, y, sw, sh);
    ctx.shadowBlur = 0;

    // Número da posição
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = cores[i] || '#ffffff';
    ctx.font = `bold ${Math.min(sw, sh) * 0.18}px Arial`;
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 12;
    ctx.fillText(`#${i+1}`, x + 24, y + 18);
    ctx.shadowBlur = 0;

    // LOGO - VERSÃO MELHORADA
    if (t && t.logoDataUrl) {
      try {
        const img = new Image();
        img.src = t.logoDataUrl;
        await new Promise((resolve) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = resolve;
            img.onerror = resolve;
          }
        });
        
        const logoSize = Math.min(sw, sh) * 0.85;
        const logoX = x + (sw - logoSize) / 2;
        const logoY = y + (sh - logoSize) / 2 - 15;
        
        ctx.save();
        
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 25;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
        
        ctx.beginPath();
        ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
        
        ctx.shadowBlur = 0;
        ctx.strokeStyle = cores[i] || '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.stroke();
        
        const gradGlow = ctx.createRadialGradient(
          logoX + logoSize * 0.3, logoY + logoSize * 0.3, 0,
          logoX + logoSize * 0.3, logoY + logoSize * 0.3, logoSize * 0.5
        );
        gradGlow.addColorStop(0, 'rgba(255,255,255,0.15)');
        gradGlow.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradGlow;
        ctx.beginPath();
        ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
      } catch (error) {
        console.error('Erro ao carregar logo:', error);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.font = `${Math.min(sw, sh) * 0.12}px Arial`;
        ctx.fillText('LOGO', x + sw/2, y + sh/2 - 10);
      }
    } else {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.font = `${Math.min(sw, sh) * 0.14}px Arial`;
      ctx.fillText('SEM LOGO', x + sw/2, y + sh/2 - 10);
      ctx.font = `${Math.min(sw, sh) * 0.2}px Arial`;
      ctx.fillText('🖼️', x + sw/2, y + sh/2 - 40);
    }

    // Nome do time
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = `bold ${Math.min(sw, sh) * 0.08}px Arial`;
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 10;
    const nomeTime = t ? t.nome || `LINE ${t.id}` : '—';
    ctx.fillText(nomeTime.substring(0, 20), x + sw/2, y + sh - 50);
    ctx.shadowBlur = 0;

    // Pontuação
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = cores[i] || '#ff0000';
    ctx.font = `bold ${Math.min(sw, sh) * 0.16}px Arial`;
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 15;
    const score = t ? `${t.score} pts` : '0 pts';
    ctx.fillText(score, x + sw/2, y + sh - 18);
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  // Coroa para o primeiro lugar
  if (top[0]) {
    const cfg = slotConfigs[0];
    const crownSize = Math.min(cfg.w, cfg.h) * 0.22;
    drawCrown(ctx, cfg.x + cfg.w/2, cfg.y - crownSize * 0.5, crownSize);
  }

  // Borda externa no pôster
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
  ctx.lineWidth = 8;
  ctx.shadowColor = 'rgba(255, 215, 0, 0.2)';
  ctx.shadowBlur = 30;
  ctx.strokeRect(10, 10, w - 20, h - 20);
  ctx.restore();

  return true;
}

// ========== COROA MELHORADA ==========
function drawCrown(ctx, x, y, size, color = '#FFD700') {
  ctx.save();
  ctx.translate(x, y);
  
  ctx.shadowColor = 'rgba(255, 215, 0, 0.4)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 8;
  
  ctx.fillStyle = color;
  ctx.strokeStyle = '#FFA500';
  ctx.lineWidth = 3;

  ctx.beginPath();
  const spikeHeight = size * 0.6;
  const baseWidth = size * 1.2;

  ctx.moveTo(-baseWidth / 2, spikeHeight / 2);
  ctx.lineTo(-baseWidth / 2 + size * 0.1, -spikeHeight / 2);
  ctx.lineTo(-baseWidth / 2 + size * 0.2, spikeHeight / 4);
  ctx.lineTo(-baseWidth / 2 + size * 0.35, -spikeHeight / 2 * 0.9);
  ctx.lineTo(-baseWidth / 2 + size * 0.45, spikeHeight / 5);
  ctx.lineTo(-baseWidth / 2 + size * 0.55, -spikeHeight / 2 * 1.2);
  ctx.lineTo(-baseWidth / 2 + size * 0.65, spikeHeight / 5);
  ctx.lineTo(-baseWidth / 2 + size * 0.8, -spikeHeight / 2 * 0.9);
  ctx.lineTo(-baseWidth / 2 + size * 0.9, spikeHeight / 4);
  ctx.lineTo(baseWidth / 2, -spikeHeight / 2);
  ctx.lineTo(baseWidth / 2, spikeHeight / 2);
  ctx.closePath();

  ctx.fill();
  ctx.stroke();

  ctx.shadowBlur = 0;

  const coresJoias = ['#FF4444', '#44FF44', '#4444FF', '#FFFF44', '#FF44FF'];
  const tamanhoJoia = size * 0.12;
  
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    const jewelX = -baseWidth / 2 + size * 0.1 + i * (baseWidth / 5);
    const jewelY = -spikeHeight / 3;
    
    ctx.moveTo(jewelX, jewelY - tamanhoJoia);
    ctx.lineTo(jewelX + tamanhoJoia * 0.7, jewelY);
    ctx.lineTo(jewelX, jewelY + tamanhoJoia);
    ctx.lineTo(jewelX - tamanhoJoia * 0.7, jewelY);
    ctx.closePath();
    
    ctx.fillStyle = coresJoias[i % coresJoias.length];
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.globalAlpha = 0.2;
  ctx.fillStyle = '#FFFF99';
  ctx.beginPath();
  ctx.arc(0, -spikeHeight / 4, size * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}

// ========== BAIXAR PÔSTER (ALTA QUALIDADE) ==========
function baixarPoster() {
  const canvas = porId('posterCanvas');
  if (!canvas) {
    gerarPosterTop3().then(() => {
      setTimeout(() => {
        const newCanvas = porId('posterCanvas');
        if (newCanvas) downloadCanvas(newCanvas);
      }, 200);
    });
    return;
  }
  downloadCanvas(canvas);
}

function downloadCanvas(canvas) {
  const scaleFactor = 2;
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width * scaleFactor;
  tempCanvas.height = canvas.height * scaleFactor;
  const tempCtx = tempCanvas.getContext('2d');
  
  tempCtx.imageSmoothingEnabled = true;
  tempCtx.imageSmoothingQuality = 'high';
  
  tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
  
  const link = document.createElement('a');
  link.download = `poster_top3_toman_${new Date().toISOString().slice(0,10)}.png`;
  link.href = tempCanvas.toDataURL('image/png', 1.0);
  link.click();
  
  mostrarNotificacao('📸 Pôster baixado em alta resolução!', 'success');
}

// ========== EVENTOS ==========
document.addEventListener('DOMContentLoaded', () => {
  const cacheCarregado = carregarImagemCache();
  
  if (cacheCarregado) {
    console.log('⚡ Imagem carregada instantaneamente do cache!');
    criarControlesPoster();
    gerarPosterTop3();
  } else {
    console.log('⏳ Primeiro carregamento, buscando imagem...');
    criarControlesPoster();
    preCarregarImagem();
  }

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

window.gerarPosterTop3 = gerarPosterTop3;
window.baixarPoster = baixarPoster;