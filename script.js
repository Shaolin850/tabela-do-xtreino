/* script.js — Tabela XTreino TOMAN ☯️ (ATUALIZADO: +50 EFEITOS DE FUNDO + PÓDIO ELEVADO + 30 TEMAS VIBRANTES) */

const ESTADO = {
  animacoes: true,
  times: [],
  tema: { primaria:'#00e7ff', secundaria:'#ff004c', bg:'#0a0b10', texto:'#e8f1ff' },
  ultimoTemaPoster: null,
  temasUsados: []
};

const NUM_TIMES = 12;
const NUM_QUEDAS = 4;

/* ========== Inicialização ========== */
document.addEventListener('DOMContentLoaded', () => {
  try {
    const salvo = JSON.parse(localStorage.getItem('xt_theme') || 'null');
    if (salvo) ESTADO.tema = salvo;
  } catch(e) {}
  
  inicializarTimes();
  ligarEventosUI();
  aplicarTema(ESTADO.tema);
  renderizarEditorTimes();
  calcularEExibir();
});

/* ========== Helpers ========== */
function porId(id) { return document.getElementById(id); }

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const v = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(255 * v);
  };
  return `#${f(0).toString(16).padStart(2,'0')}${f(8).toString(16).padStart(2,'0')}${f(4).toString(16).padStart(2,'0')}`;
}

function hexToRgba(hex, alpha) {
  hex = hex.replace('#','');
  const r = parseInt(hex.substring(0,2),16);
  const g = parseInt(hex.substring(2,4),16);
  const b = parseInt(hex.substring(4,6),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ========== Desenhar coroa maior ========== */
function drawCrown(ctx, x, y, size, color = '#FFD700') {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#FFA500';
  ctx.lineWidth = 4;
  
  ctx.beginPath();
  const spikeHeight = size * 0.55;
  const baseWidth = size * 1.1;
  
  ctx.moveTo(-baseWidth/2, spikeHeight/2);
  for (let i = 0; i < 5; i++) {
    ctx.lineTo(-baseWidth/2 + (baseWidth/4) * i, -spikeHeight/2);
    if (i < 4) ctx.lineTo(-baseWidth/2 + (baseWidth/4) * (i + 0.5), spikeHeight/4);
  }
  ctx.lineTo(baseWidth/2, spikeHeight/2);
  ctx.lineTo(-baseWidth/2, spikeHeight/2);
  ctx.closePath();
  
  ctx.fill();
  ctx.stroke();
  
  ctx.fillStyle = '#FF4444';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    const jewelX = -baseWidth/2 + (baseWidth/4) * i;
    const jewelY = -spikeHeight/3;
    ctx.arc(jewelX, jewelY, size * 0.14, 0, Math.PI*2);
    ctx.fill();
  }
  
  ctx.fillStyle = '#FFFF99';
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.arc(0, -spikeHeight/5, size * 0.35, 0, Math.PI*2);
  ctx.fill();
  ctx.globalAlpha = 1;
  
  ctx.restore();
}

/* ========== Inicializar times ========== */
function inicializarTimes() {
  ESTADO.times = Array.from({length: NUM_TIMES}, (_,i) => ({
    id: i+1,
    nome: '',
    posQ: Array(NUM_QUEDAS).fill(''),
    killsQ: Array(NUM_QUEDAS).fill(0),
    booyas: 0,
    totalKills: 0,
    score: 0,
    logoDataUrl: ''
  }));
}

/* ========== Eventos UI ========== */
function ligarEventosUI() {
  porId('btnApplyTheme')?.addEventListener('click', () => {
    const tema = {
      primaria: porId('colorPrimary').value,
      secundaria: porId('colorSecondary').value,
      bg: porId('colorBg').value,
      texto: porId('colorText').value
    };
    aplicarTema(tema, true);
  });

  porId('btnRandomTheme')?.addEventListener('click', temaAleatorio);

  porId('btnExportPNG')?.addEventListener('click', exportarPNG);
  porId('btnExportPDF')?.addEventListener('click', () => exportarPDF(false));

  // AMBOS os botões geram o pôster
  [porId('btnPosterTop3'), porId('btnGeneratePoster')].forEach(btn => {
    btn?.addEventListener('click', () => {
      gerarPosterTop3().then(() => {
        // Feedback visual sutil em vez de alerta
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

  porId('btnClear')?.addEventListener('click', () => {
    if (confirm('Limpar todos os dados dos times?')) {
      inicializarTimes();
      renderizarEditorTimes();
      calcularEExibir();
    }
  });

  porId('btnToggleAnim')?.addEventListener('click', () => {
    ESTADO.animacoes = !ESTADO.animacoes;
    document.documentElement.classList.toggle('anim-off', !ESTADO.animacoes);
    porId('btnToggleAnim').textContent = `Animações: ${ESTADO.animacoes ? 'ON' : 'OFF'}`;
  });
}

/* ========== Aplicar tema UI ========== */
function aplicarTema(tema, persist = false) {
  ESTADO.tema = { ...tema };
  document.documentElement.style.setProperty('--c-primary', tema.primaria);
  document.documentElement.style.setProperty('--c-secondary', tema.secundaria);
  document.documentElement.style.setProperty('--c-bg', tema.bg);
  document.documentElement.style.setProperty('--c-text', tema.texto);
  if (persist) localStorage.setItem('xt_theme', JSON.stringify(tema));
}

/* ========== TEMAS VIBRANTES EXPANDIDOS (30+ opções) ========== */
function temaAleatorio() {
  const presets = [
    // Neon Vibrante
    {primaria:'#00f3ff', secundaria:'#ff00d4', bg:'#050510', texto:'#f0f8ff'},
    {primaria:'#ff00ff', secundaria:'#00ffff', bg:'#0a0510', texto:'#ffffff'},
    {primaria:'#ff006e', secundaria:'#00ff88', bg:'#08050a', texto:'#ffffff'},
    {primaria:'#9d00ff', secundaria:'#ffd300', bg:'#0a060f', texto:'#ffffff'},
    {primaria:'#00ffaa', secundaria:'#ff0080', bg:'#05100a', texto:'#ffffff'},
    
    // Cyberpunk
    {primaria:'#00e7ff', secundaria:'#ff004c', bg:'#0a0b10', texto:'#e8f1ff'},
    {primaria:'#7afcff', secundaria:'#ff6b6b', bg:'#04060a', texto:'#eafcff'},
    {primaria:'#b6ff6b', secundaria:'#6bd3ff', bg:'#061014', texto:'#ffffff'},
    {primaria:'#ff9f1c', secundaria:'#2d00ff', bg:'#08020a', texto:'#fff7ef'},
    
    // Cores Vivas
    {primaria:'#ff0055', secundaria:'#00ffcc', bg:'#0a0a0a', texto:'#ffffff'},
    {primaria:'#ff5500', secundaria:'#00aaff', bg:'#0c0804', texto:'#ffffff'},
    {primaria:'#aa00ff', secundaria:'#ffaa00', bg:'#0a040c', texto:'#ffffff'},
    {primaria:'#00ff55', secundaria:'#ff00aa', bg:'#040a08', texto:'#ffffff'},
    
    // Gradientes Intensos
    {primaria:'#ff0040', secundaria:'#8000ff', bg:'#000000', texto:'#ffffff'},
    {primaria:'#00ff80', secundaria:'#0080ff', bg:'#000814', texto:'#ffffff'},
    {primaria:'#ff80ff', secundaria:'#80ffff', bg:'#140008', texto:'#ffffff'},
    {primaria:'#ffff00', secundaria:'#ff0080', bg:'#141400', texto:'#fffbfb'},
    
    // Esquemas Únicos
    {primaria:'#38b000', secundaria:'#ff0054', bg:'#040a08', texto:'#e6ffe6'},
    {primaria:'#7209b7', secundaria:'#f72585', bg:'#0a040c', texto:'#f5e6ff'},
    {primaria:'#ff5400', secundaria:'#00cfc1', bg:'#0c0804', texto:'#fff0e6'},
    {primaria:'#3a86ff', secundaria:'#ff006e', bg:'#03071e', texto:'#ffffff'},
    
    // Mais opções vibrantes
    {primaria:'#ff0066', secundaria:'#66ff00', bg:'#0a050a', texto:'#ffffff'},
    {primaria:'#00ff66', secundaria:'#ff6600', bg:'#050a05', texto:'#ffffff'},
    {primaria:'#ffcc00', secundaria:'#cc00ff', bg:'#0a0a05', texto:'#fffafa'},
    {primaria:'#ff3366', secundaria:'#33ffcc', bg:'#0a0508', texto:'#ffffff'},
    {primaria:'#33ff66', secundaria:'#ff33cc', bg:'#050a08', texto:'#fffdfd'},
    {primaria:'#ff9933', secundaria:'#3399ff', bg:'#0a0805', texto:'#fffafa'},
    {primaria:'#ff66cc', secundaria:'#66ffcc', bg:'#0a050c', texto:'#ffffff'},
    {primaria:'#ccff66', secundaria:'#ff66ff', bg:'#080a05', texto:'#e8dddd'},
    {primaria:'#00ccff', secundaria:'#ffcc66', bg:'#05080a', texto:'#fff7f7'},
    {primaria:'#ff0066', secundaria:'#00ffcc', bg:'#0a0a05', texto:'#ffffff'}
  ];
  aplicarTema(randomFrom(presets), true);
}

/* ========== Render editor ========== */
function renderizarEditorTimes() {
  const container = porId('teamsContainer');
  if (!container) return;
  container.innerHTML = '';

  ESTADO.times.forEach((time, idx) => {
    const card = document.createElement('div');
    card.className = 'team-card';

    card.innerHTML = `
      <div class="team-row">
        <label>Slot ${time.id}</label>
        <input type="text" placeholder="Nome da LINE/Equipe" value="${escapeHtml(time.nome||'')}" data-idx="${idx}" data-field="nome"/>
      </div>

      <div class="team-row" style="align-items:center;">
        <label>Booyas</label>
        <div style="display:flex;gap:6px;">
          <div id="booyas-${idx}" class="muted" style="min-width:56px;text-align:center;">${time.booyas||0}</div>
        </div>
      </div>

      <div style="margin-top:8px;font-size:13px;color:var(--muted)">Quedas (Pos / Kills)</div>
      <div class="quedas-row">
        ${Array(NUM_QUEDAS).fill().map((_, q) => `
          <div class="queda-box">
            <label>Q${q+1} Pos</label>
            <input type="number" min="1" max="${NUM_TIMES}" value="${time.posQ[q]||''}" data-idx="${idx}" data-field="posQ" data-q="${q}" style="width:96px;"/>
            <label>Kills</label>
            <input type="number" min="0" value="${time.killsQ[q]||0}" data-idx="${idx}" data-field="killsQ" data-q="${q}" style="width:96px;"/>
          </div>
        `).join('')}
      </div>

      <div class="team-row" style="margin-top:12px;">
        <label class="btn tiny ghost" for="logo-${idx}">Logo</label>
        <input id="logo-${idx}" type="file" accept="image/*" data-idx="${idx}" data-field="logo" style="display:none;"/>
        <img class="logo-preview" id="logo-prev-${idx}" src="${time.logoDataUrl||''}" alt="Logo preview" style="${time.logoDataUrl ? '' : 'display:none;'}"/>
      </div>
    `;

    container.appendChild(card);
  });

  // Eventos
  container.querySelectorAll('input, button').forEach(el => {
    const idx = el.dataset.idx !== undefined ? parseInt(el.dataset.idx, 10) : null;
    const field = el.dataset.field;
    const q = el.dataset.q ? parseInt(el.dataset.q, 10) : null;

    if (field === 'logo') {
      el.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          ESTADO.times[idx].logoDataUrl = reader.result;
          const preview = porId(`logo-prev-${idx}`);
          preview.src = reader.result;
          preview.style.display = 'block';
          calcularEExibir();
        };
        reader.readAsDataURL(file);
      });
      return;
    }

    el.addEventListener('input', e => {
      const val = e.target.value;
      if (field === 'nome') ESTADO.times[idx].nome = val;
      if (field === 'posQ' && q !== null) {
        let pos = val === '' ? '' : Math.max(1, Math.min(NUM_TIMES, parseInt(val, 10) || 1));
        ESTADO.times[idx].posQ[q] = pos;
        e.target.value = pos;
      }
      if (field === 'killsQ' && q !== null) {
        ESTADO.times[idx].killsQ[q] = val === '' ? 0 : Math.max(0, parseInt(val, 10) || 0);
      }
      calcularEExibir();
    });
  });
}

/* ========== Cálculo ========== */
function calcularPontuacaoTime(t) {
  let kills = t.killsQ.reduce((a,b)=>a+(+b||0),0);
  let booyas = 0, pts = 0;
  t.posQ.forEach(p => {
    const pos = +p;
    if (!isNaN(pos)) {
      if (pos === 1) { booyas++; pts += 20; }
      else if (pos === 2) pts += 15;
      else if (pos === 3) pts += 10;
    }
  });
  return { totalKills: kills, booyas, score: kills*5 + pts, pontosPorPosicao: pts };
}

function calcularEExibir() {
  // Recalcular todos os times
  ESTADO.times.forEach(t => {
    const c = calcularPontuacaoTime(t);
    t.booyas = c.booyas;
    t.totalKills = c.totalKills;
    t.score = c.score;
  });

  // Atualizar exibição de booyas no editor
  ESTADO.times.forEach((t, idx) => {
    const el = porId(`booyas-${idx}`);
    if (el) el.textContent = t.booyas;
  });

  // Ordenar times por pontuação
  const sorted = [...ESTADO.times].sort((a,b) => {
    const scoreDiff = b.score - a.score;
    if (scoreDiff !== 0) return scoreDiff;
    const killsDiff = b.totalKills - a.totalKills;
    if (killsDiff !== 0) return killsDiff;
    return b.booyas - a.booyas;
  });

  // Atualizar tabela de pontuação
  if (porId('scoreBody')) {
    porId('scoreBody').innerHTML = sorted.map((t,i) => `
      <tr>
        <td><span class="badge">${i+1}</span></td>
        <td>${escapeHtml(t.nome || `LINE ${t.id}`)}</td>
        <td>${t.posQ.map(p=>p||'-').join(' / ')}</td>
        <td class="center">${t.booyas}</td>
        <td class="center">${t.totalKills}</td>
        <td class="right"><strong>${t.score}</strong></td>
      </tr>
    `).join('');
  }

  // Atualizar pódio
  [1,2,3].forEach(i => {
    const p = sorted[i-1];
    const logoEl = porId(`podium${i}Logo`);
    const nameEl = porId(`podium${i}Name`);
    const scoreEl = porId(`podium${i}Score`);
    if (logoEl) {
      if (p?.logoDataUrl) {
        logoEl.src = p.logoDataUrl;
        logoEl.style.display = 'block';
      } else {
        logoEl.style.display = 'none';
      }
    }
    if (nameEl) nameEl.textContent = p ? p.nome || `LINE ${p.id}` : '—';
    if (scoreEl) scoreEl.textContent = p ? `${p.score} pts` : '0 pts';
  });

  // Atualizar resumo
  if (porId('timesResumo')) {
    porId('timesResumo').innerHTML = montarTabelaTimesResumo(ESTADO.times);
  }
}

/* ========== Temas INFINITOS para pôster (NÃO REPETITIVOS) ========== */
function gerarTemaPosterUnico() {
  let tentativas = 0;
  let tema;
  
  do {
    // Gera cores baseadas em esquemas harmônicos
    const h1 = randomInt(0, 359);
    const esquema = randomInt(1, 5);
    
    let h2, h3;
    
    switch(esquema) {
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
    
    // LISTA DE +100 EFEITOS DISPONÍVEIS PARA O FUNDO
    const efeitosFundo = [
      // Espaço (1-15)
      'estrelas', 'estrelasCadentes', 'constelacoes', 'nebulosa', 'galaxia',
      'viaLactea', 'planetas', 'satelites', 'cometas', 'meteoros',
      'buracoNegro', 'supernova', 'eclipse', 'auroraBoreal', 'arcoIris',
      
      // Natureza (16-30)
      'floresta', 'montanhas', 'oceano', 'deserto', 'selva',
      'campo', 'cachoeira', 'rio', 'lago', 'geiser',
      'vulcao', 'neve', 'chuva', 'nevoa', 'aurora',
      
      // Elementos (31-45)
      'fogo', 'agua', 'terra', 'ar', 'lava',
      'gelo', 'raio', 'tempestade', 'vento', 'furacao',
      'tsunami', 'terremoto', 'incendio', 'inundacao', 'neblina',
      
      // Cidades (46-60)
      'metropole', 'skyline', 'noiteCidade', 'ponte', 'arranhaCeus',
      'tunel', 'estrada', 'rodovia', 'viaduto', 'ferrovia',
      'porto', 'aeroporto', 'estacao', 'terminal', 'rotatoria',
      
      // Tecnologia (61-75)
      'circuitos', 'neon', 'matrix', 'cyberpunk', 'holograma',
      'led', 'rgb', 'glitch', 'pixel', 'digital',
      'binario', 'codigo', 'dados', 'rede', 'wiFi',
      
      // Abstrato (76-90)
      'geometria', 'fractais', 'mandala', 'espiral', 'vortex',
      'turbilhao', 'remoinho', 'espuma', 'bolhas', 'ondas',
      'textura', 'padrao', 'gradiente', 'degrade', 'arcoIris',
      
      // Arte (91-105)
      'pintura', 'aquarela', 'oleo', 'grafite', 'spray',
      'stencil', 'colagem', 'mosaico', 'vitral', 'vitrais',
      'origami', 'kirigami', 'origamiModular', 'escultura', 'ceramica',
      
      // Música (106-120)
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
    
    // Verifica se o tema é muito similar aos últimos 10 usados
    const temaSimilar = ESTADO.temasUsados.some(temaUsado => {
      return Math.abs(parseInt(temaUsado.bg1) - parseInt(tema.bg1)) < 20 &&
             Math.abs(parseInt(temaUsado.bg2) - parseInt(tema.bg2)) < 20;
    });
    
    if (!temaSimilar || tentativas > 15) {
      break;
    }
  } while (true);
  
  // Armazena o tema usado
  ESTADO.temasUsados.push(tema);
  ESTADO.ultimoTemaPoster = tema;
  
  // Mantém apenas os últimos 20 temas na memória
  if (ESTADO.temasUsados.length > 20) {
    ESTADO.temasUsados.shift();
  }
  
  return tema;
}

/* ========== BIBLIOTECA DE +50 EFEITOS DE FUNDO ========== */

/* 1-15: ESPAÇO E ASTRONOMIA */
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
    const angle = randomBetween(-Math.PI/4, Math.PI/4);
    
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
  desenharEstrelas(ctx, w, h, tema, 80);
  
  ctx.strokeStyle = hexToRgba(tema.accent2, 0.4);
  ctx.lineWidth = 1;
  
  const constellations = randomInt(3, 6);
  for (let c = 0; c < constellations; c++) {
    const stars = randomInt(4, 8);
    const points = [];
    
    for (let s = 0; s < stars; s++) {
      points.push([randomBetween(0, w), randomBetween(0, h * 0.8)]);
    }
    
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
    
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, radius
    );
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
  
  const coreGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, 80
  );
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
    
    const gradient = ctx.createLinearGradient(0, h/2 + offsetY, w, h/2 + offsetY);
    gradient.addColorStop(0, hexToRgba(tema.accent1, 0));
    gradient.addColorStop(0.3, hexToRgba(tema.glow, 0.1));
    gradient.addColorStop(0.7, hexToRgba(tema.glow, 0.15));
    gradient.addColorStop(1, hexToRgba(tema.accent1, 0));
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, h/2 + offsetY - height/2, w, height);
  }
}

function desenharPlanetas(ctx, w, h, tema) {
  const planetCount = randomInt(3, 6);
  for (let p = 0; p < planetCount; p++) {
    const x = randomBetween(50, w - 50);
    const y = randomBetween(50, h - 50);
    const radius = randomBetween(20, 80);
    const planetHue = randomInt(0, 359);
    
    const planetGradient = ctx.createRadialGradient(
      x - radius/3, y - radius/3, 0,
      x, y, radius
    );
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
    ctx.fillRect(-size/2, -size/3, size, size * 0.66);
    
    ctx.fillStyle = hexToRgba(tema.glow, 0.7);
    ctx.fillRect(-size/2 - size*0.4, -size/6, size*0.3, size*0.33);
    ctx.fillRect(size/2 + size*0.1, -size/6, size*0.3, size*0.33);
    
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
    
    const gradient = ctx.createLinearGradient(
      startX, startY,
      startX - Math.cos(angle) * length,
      startY - Math.sin(angle) * length
    );
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
  
  // Disco de acreção
  const accretionGradient = ctx.createRadialGradient(
    centerX, centerY, radius * 0.7,
    centerX, centerY, radius * 1.5
  );
  accretionGradient.addColorStop(0, hexToRgba(tema.accent1, 0));
  accretionGradient.addColorStop(0.5, hexToRgba(tema.accent1, 0.6));
  accretionGradient.addColorStop(1, hexToRgba(tema.accent1, 0));
  
  ctx.save();
  ctx.fillStyle = accretionGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  // Horizonte de eventos
  const horizonGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, radius * 0.7
  );
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
  
  // Explosão
  const explosionGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, radius
  );
  explosionGradient.addColorStop(0, hexToRgba('#ffffff', 0.9));
  explosionGradient.addColorStop(0.5, hexToRgba(tema.accent1, 0.7));
  explosionGradient.addColorStop(1, hexToRgba(tema.accent1, 0));
  
  ctx.fillStyle = explosionGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();
  
  // Onda de choque
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
  
  // Sol
  const sunGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, sunRadius
  );
  sunGradient.addColorStop(0, '#FFFF00');
  sunGradient.addColorStop(1, '#FFA500');
  
  ctx.fillStyle = sunGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, sunRadius, 0, Math.PI * 2);
  ctx.fill();
  
  // Lua
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(centerX + offset, centerY, moonRadius, 0, Math.PI * 2);
  ctx.fill();
  
  // Corona
  const coronaGradient = ctx.createRadialGradient(
    centerX, centerY, sunRadius,
    centerX, centerY, sunRadius * 1.5
  );
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

/* 16-30: NATUREZA */
function desenharFloresta(ctx, w, h, tema) {
  const treeCount = randomInt(20, 40);
  for (let t = 0; t < treeCount; t++) {
    const x = randomBetween(0, w);
    const baseY = randomBetween(h * 0.7, h);
    const height = randomBetween(50, 150);
    const width = randomBetween(30, 60);
    
    // Tronco
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x - width/4, baseY - height/3, width/2, height/3);
    
    // Copa da árvore
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.arc(x, baseY - height/3, width/2, 0, Math.PI * 2);
    ctx.arc(x - width/3, baseY - height/2, width/2, 0, Math.PI * 2);
    ctx.arc(x + width/3, baseY - height/2, width/2, 0, Math.PI * 2);
    ctx.arc(x, baseY - height, width/2, 0, Math.PI * 2);
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
    
    // Neve no topo
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
  // Água
  const oceanGradient = ctx.createLinearGradient(0, h * 0.6, 0, h);
  oceanGradient.addColorStop(0, '#1E90FF');
  oceanGradient.addColorStop(1, '#000080');
  
  ctx.fillStyle = oceanGradient;
  ctx.fillRect(0, h * 0.6, w, h * 0.4);
  
  // Ondas
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  
  for (let i = 0; i < 10; i++) {
    const y = h * 0.6 + i * 15;
    ctx.beginPath();
    ctx.moveTo(0, y);
    
    for (let x = 0; x < w; x += 20) {
      ctx.lineTo(x, y + Math.sin(x * 0.05 + i) * 10);
    }
    
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  
  // Espuma
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
  // Areia
  const sandGradient = ctx.createLinearGradient(0, 0, 0, h);
  sandGradient.addColorStop(0, '#F4A460');
  sandGradient.addColorStop(1, '#D2691E');
  
  ctx.fillStyle = sandGradient;
  ctx.fillRect(0, 0, w, h);
  
  // Dunas
  ctx.fillStyle = '#DEB887';
  for (let i = 0; i < 15; i++) {
    const duneHeight = randomBetween(30, 80);
    const duneWidth = randomBetween(100, 300);
    const duneX = randomBetween(-50, w + 50);
    const duneY = randomBetween(h * 0.5, h);
    
    ctx.beginPath();
    ctx.moveTo(duneX - duneWidth/2, duneY);
    ctx.quadraticCurveTo(duneX, duneY - duneHeight, duneX + duneWidth/2, duneY);
    ctx.closePath();
    ctx.fill();
  }
  
  // Cactos
  const cactusCount = randomInt(10, 20);
  for (let c = 0; c < cactusCount; c++) {
    const x = randomBetween(0, w);
    const y = randomBetween(h * 0.7, h);
    const height = randomBetween(40, 100);
    const width = randomBetween(10, 20);
    
    ctx.fillStyle = '#228B22';
    // Caule principal
    ctx.fillRect(x - width/2, y - height, width, height);
    
    // Ramos
    const arms = randomInt(1, 3);
    for (let a = 0; a < arms; a++) {
      const armHeight = height * randomBetween(0.3, 0.6);
      const armWidth = width * randomBetween(1.5, 2);
      const armY = y - height + (height / (arms + 1)) * (a + 1);
      
      if (Math.random() > 0.5) {
        // Ramo para a esquerda
        ctx.fillRect(x - width/2 - armWidth, armY - armHeight/2, armWidth, armHeight);
      } else {
        // Ramo para a direita
        ctx.fillRect(x + width/2, armY - armHeight/2, armWidth, armHeight);
      }
    }
  }
}

function desenharSelva(ctx, w, h, tema) {
  // Fundo verde
  const jungleGradient = ctx.createLinearGradient(0, 0, 0, h);
  jungleGradient.addColorStop(0, '#006400');
  jungleGradient.addColorStop(0.5, '#228B22');
  jungleGradient.addColorStop(1, '#32CD32');
  
  ctx.fillStyle = jungleGradient;
  ctx.fillRect(0, 0, w, h);
  
  // Folhagem
  const leafCount = randomInt(100, 200);
  for (let i = 0; i < leafCount; i++) {
    const x = randomBetween(0, w);
    const y = randomBetween(0, h);
    const size = randomBetween(10, 30);
    
    ctx.fillStyle = randomFrom(['#006400', '#228B22', '#32CD32', '#3CB371']);
    ctx.beginPath();
    
    // Desenha folha
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
  
  // Lianas
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
  // Grama
  const fieldGradient = ctx.createLinearGradient(0, 0, 0, h);
  fieldGradient.addColorStop(0, '#7CFC00');
  fieldGradient.addColorStop(1, '#32CD32');
  
  ctx.fillStyle = fieldGradient;
  ctx.fillRect(0, 0, w, h);
  
  // Flores
  const flowerCount = randomInt(50, 100);
  for (let f = 0; f < flowerCount; f++) {
    const x = randomBetween(0, w);
    const y = randomBetween(0, h);
    const size = randomBetween(5, 15);
    
    // Caule
    ctx.strokeStyle = '#006400';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + size * 3);
    ctx.stroke();
    
    // Flor
    const petalCount = randomInt(5, 8);
    const petalColor = randomFrom(['#FF69B4', '#FF0000', '#FFA500', '#FFFF00', '#FF00FF']);
    
    // Centro
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.arc(x, y, size/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Pétalas
    ctx.fillStyle = petalColor;
    for (let p = 0; p < petalCount; p++) {
      const angle = (Math.PI * 2 / petalCount) * p;
      const petalX = x + Math.cos(angle) * size;
      const petalY = y + Math.sin(angle) * size;
      
      ctx.beginPath();
      ctx.arc(petalX, petalY, size/2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Colinas
  const hillCount = randomInt(3, 6);
  for (let hc = 0; hc < hillCount; hc++) {
    const hillX = randomBetween(-100, w + 100);
    const hillY = randomBetween(h * 0.5, h);
    const hillWidth = randomBetween(200, 400);
    const hillHeight = randomBetween(50, 150);
    
    ctx.fillStyle = '#32CD32';
    ctx.beginPath();
    ctx.moveTo(hillX - hillWidth/2, hillY);
    ctx.quadraticCurveTo(hillX, hillY - hillHeight, hillX + hillWidth/2, hillY);
    ctx.closePath();
    ctx.fill();
  }
}

function desenharCachoeira(ctx, w, h, tema) {
  // Cachoeira
  const waterfallX = w / 2;
  const waterfallWidth = randomBetween(80, 150);
  const startY = 0;
  const endY = h;
  
  // Água caindo
  const waterGradient = ctx.createLinearGradient(waterfallX - waterfallWidth/2, 0, waterfallX + waterfallWidth/2, 0);
  waterGradient.addColorStop(0, hexToRgba('#1E90FF', 0.7));
  waterGradient.addColorStop(0.5, hexToRgba('#87CEEB', 0.9));
  waterGradient.addColorStop(1, hexToRgba('#1E90FF', 0.7));
  
  ctx.fillStyle = waterGradient;
  ctx.fillRect(waterfallX - waterfallWidth/2, startY, waterfallWidth, endY);
  
  // Espuma
  for (let i = 0; i < 50; i++) {
    const x = randomBetween(waterfallX - waterfallWidth/2, waterfallX + waterfallWidth/2);
    const y = randomBetween(startY, endY);
    const size = randomBetween(2, 10);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Rochas
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
  
  // Rio
  const riverGradient = ctx.createLinearGradient(0, riverY - riverWidth/2, 0, riverY + riverWidth/2);
  riverGradient.addColorStop(0, '#1E90FF');
  riverGradient.addColorStop(0.5, '#87CEEB');
  riverGradient.addColorStop(1, '#1E90FF');
  
  ctx.fillStyle = riverGradient;
  ctx.fillRect(0, riverY - riverWidth/2, w, riverWidth);
  
  // Onde no rio
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  
  for (let i = 0; i < 20; i++) {
    const y = riverY + randomBetween(-riverWidth/3, riverWidth/3);
    ctx.beginPath();
    ctx.moveTo(0, y);
    
    for (let x = 0; x < w; x += 30) {
      ctx.lineTo(x, y + Math.sin(x * 0.1 + i) * 10);
    }
    
    ctx.stroke();
  }
  
  // Margens
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(0, 0, w, riverY - riverWidth/2);
  ctx.fillRect(0, riverY + riverWidth/2, w, h - (riverY + riverWidth/2));
}

function desenharLago(ctx, w, h, tema) {
  const lakeX = w / 2;
  const lakeY = h / 2;
  const lakeWidth = randomBetween(300, 500);
  const lakeHeight = randomBetween(200, 300);
  
  // Lago
  const lakeGradient = ctx.createRadialGradient(
    lakeX, lakeY, 0,
    lakeX, lakeY, Math.max(lakeWidth, lakeHeight) / 2
  );
  lakeGradient.addColorStop(0, '#1E90FF');
  lakeGradient.addColorStop(0.7, '#87CEEB');
  lakeGradient.addColorStop(1, '#4682B4');
  
  ctx.fillStyle = lakeGradient;
  ctx.beginPath();
  ctx.ellipse(lakeX, lakeY, lakeWidth/2, lakeHeight/2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Reflexo
  ctx.fillStyle = hexToRgba('#FFFFFF', 0.2);
  ctx.beginPath();
  ctx.ellipse(lakeX, lakeY, lakeWidth/2 - 20, lakeHeight/2 - 20, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Lírios
  const lilyCount = randomInt(10, 20);
  for (let l = 0; l < lilyCount; l++) {
    const angle = randomBetween(0, Math.PI * 2);
    const distance = randomBetween(0, Math.min(lakeWidth, lakeHeight) / 2 - 30);
    const x = lakeX + Math.cos(angle) * distance;
    const y = lakeY + Math.sin(angle) * distance;
    const size = randomBetween(20, 40);
    
    // Folha
    ctx.fillStyle = '#32CD32';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Flor (alguns lírios têm flor)
    if (Math.random() > 0.7) {
      const petalCount = randomInt(5, 8);
      const petalColor = randomFrom(['#FFFFFF', '#FFB6C1', '#FF69B4']);
      
      // Centro
      ctx.fillStyle = '#FFFF00';
      ctx.beginPath();
      ctx.arc(x, y, size/4, 0, Math.PI * 2);
      ctx.fill();
      
      // Pétalas
      ctx.fillStyle = petalColor;
      for (let p = 0; p < petalCount; p++) {
        const petalAngle = (Math.PI * 2 / petalCount) * p;
        const petalX = x + Math.cos(petalAngle) * size/2;
        const petalY = y + Math.sin(petalAngle) * size/2;
        
        ctx.beginPath();
        ctx.arc(petalX, petalY, size/3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function desenharGeiser(ctx, w, h, tema) {
  const geyserX = w / 2;
  const geyserY = h * 0.7;
  const geyserWidth = randomBetween(30, 60);
  
  // Base do gêiser
  ctx.fillStyle = '#696969';
  ctx.beginPath();
  ctx.arc(geyserX, geyserY, geyserWidth, 0, Math.PI * 2);
  ctx.fill();
  
  // Jato de água/ vapor
  const jetHeight = randomBetween(100, 200);
  const jetGradient = ctx.createLinearGradient(geyserX, geyserY, geyserX, geyserY - jetHeight);
  jetGradient.addColorStop(0, hexToRgba('#87CEEB', 0.9));
  jetGradient.addColorStop(0.5, hexToRgba('#FFFFFF', 0.7));
  jetGradient.addColorStop(1, hexToRgba('#87CEEB', 0.3));
  
  ctx.fillStyle = jetGradient;
  ctx.beginPath();
  ctx.moveTo(geyserX - geyserWidth/2, geyserY);
  ctx.quadraticCurveTo(geyserX, geyserY - jetHeight, geyserX + geyserWidth/2, geyserY);
  ctx.closePath();
  ctx.fill();
  
  // Gotas de água
  const dropCount = randomInt(20, 40);
  for (let d = 0; d < dropCount; d++) {
    const x = randomBetween(geyserX - geyserWidth, geyserX + geyserWidth);
    const y = randomBetween(geyserY - jetHeight/2, geyserY);
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
  
  // Vulcão
  ctx.fillStyle = '#8B4513';
  ctx.beginPath();
  ctx.moveTo(volcanoX - volcanoWidth/2, volcanoY);
  ctx.lineTo(volcanoX, volcanoY - volcanoHeight);
  ctx.lineTo(volcanoX + volcanoWidth/2, volcanoY);
  ctx.closePath();
  ctx.fill();
  
  // Cratera
  ctx.fillStyle = '#696969';
  ctx.beginPath();
  ctx.arc(volcanoX, volcanoY - volcanoHeight + 30, volcanoWidth/4, 0, Math.PI * 2);
  ctx.fill();
  
  // Lava
  const lavaGradient = ctx.createRadialGradient(
    volcanoX, volcanoY - volcanoHeight + 30, 0,
    volcanoX, volcanoY - volcanoHeight + 30, volcanoWidth/4
  );
  lavaGradient.addColorStop(0, '#FF4500');
  lavaGradient.addColorStop(0.7, '#FF8C00');
  lavaGradient.addColorStop(1, '#FFD700');
  
  ctx.fillStyle = lavaGradient;
  ctx.beginPath();
  ctx.arc(volcanoX, volcanoY - volcanoHeight + 30, volcanoWidth/4 - 10, 0, Math.PI * 2);
  ctx.fill();
  
  // Fumaça
  const smokeCount = randomInt(5, 10);
  for (let s = 0; s < smokeCount; s++) {
    const smokeX = volcanoX + randomBetween(-volcanoWidth/4, volcanoWidth/4);
    const smokeY = volcanoY - volcanoHeight + randomBetween(0, 50);
    const smokeSize = randomBetween(30, 80);
    
    ctx.fillStyle = hexToRgba('#696969', randomBetween(0.3, 0.7));
    ctx.beginPath();
    ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

function desenharNeve(ctx, w, h, tema) {
  // Neve no chão
  const snowGradient = ctx.createLinearGradient(0, h * 0.7, 0, h);
  snowGradient.addColorStop(0, '#FFFFFF');
  snowGradient.addColorStop(1, '#F0F8FF');
  
  ctx.fillStyle = snowGradient;
  ctx.fillRect(0, h * 0.7, w, h * 0.3);
  
  // Flocos de neve caindo
  const flakeCount = randomInt(100, 200);
  for (let f = 0; f < flakeCount; f++) {
    const x = randomBetween(0, w);
    const y = randomBetween(0, h);
    const size = randomBetween(1, 4);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Alguns flocos maiores com detalhes
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
  
  // Árvores com neve
  const treeCount = randomInt(10, 20);
  for (let t = 0; t < treeCount; t++) {
    const x = randomBetween(0, w);
    const baseY = randomBetween(h * 0.7, h);
    const height = randomBetween(60, 120);
    const width = randomBetween(20, 40);
    
    // Tronco
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x - width/4, baseY - height/3, width/2, height/3);
    
    // Copa com neve
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.arc(x, baseY - height/3, width/2, 0, Math.PI * 2);
    ctx.arc(x - width/3, baseY - height/2, width/2, 0, Math.PI * 2);
    ctx.arc(x + width/3, baseY - height/2, width/2, 0, Math.PI * 2);
    ctx.arc(x, baseY - height, width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Neve nas árvores
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, baseY - height, width/2, 0, Math.PI * 2);
    ctx.arc(x - width/3, baseY - height/2, width/2, 0, Math.PI);
    ctx.arc(x + width/3, baseY - height/2, width/2, 0, Math.PI);
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
  
  // Poças de água
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
  // Similar à Aurora Boreal, mas mais colorida
  desenharAuroraBoreal(ctx, w, h, tema);
  
  // Adiciona mais cores
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

/* 31-45: ELEMENTOS */
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
      ctx.moveTo(x - flameWidth/2, baseY);
      ctx.bezierCurveTo(
        x - flameWidth/4, baseY - flameHeight/2,
        x + flameWidth/4, baseY - flameHeight/2,
        x + flameWidth/2, baseY
      );
      ctx.lineTo(x + flameWidth/2, baseY + 10);
      ctx.bezierCurveTo(
        x + flameWidth/4, baseY - flameHeight/4,
        x - flameWidth/4, baseY - flameHeight/4,
        x - flameWidth/2, baseY + 10
      );
      ctx.closePath();
      
      const fireGradient = ctx.createLinearGradient(
        x, baseY, x, baseY - flameHeight
      );
      fireGradient.addColorStop(0, hexToRgba('#FF0000', 0.8));
      fireGradient.addColorStop(0.5, hexToRgba('#FF8800', 0.9));
      fireGradient.addColorStop(1, hexToRgba('#FFFF00', 0.7));
      
      ctx.fillStyle = fireGradient;
      ctx.fill();
    }
  }
}

function desenharAgua(ctx, w, h, tema) {
  desenharOceano(ctx, w, h, tema);
}

function desenharTerra(ctx, w, h, tema) {
  // Solo
  const earthGradient = ctx.createLinearGradient(0, 0, 0, h);
  earthGradient.addColorStop(0, '#8B4513');
  earthGradient.addColorStop(0.5, '#A0522D');
  earthGradient.addColorStop(1, '#D2691E');
  
  ctx.fillStyle = earthGradient;
  ctx.fillRect(0, 0, w, h);
  
  // Pedras
  const rockCount = randomInt(30, 60);
  for (let r = 0; r < rockCount; r++) {
    const x = randomBetween(0, w);
    const y = randomBetween(0, h);
    const size = randomBetween(10, 40);
    
    ctx.fillStyle = '#696969';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Textura nas pedras
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
  // Vento
  const windCount = randomInt(10, 20);
  ctx.strokeStyle = hexToRgba('#87CEEB', 0.3);
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  
  for (let wd = 0; wd < windCount; wd++) {
    const startX = randomBetween(0, w * 0.3);
    const startY = randomBetween(0, h);
    const length = randomBetween(100, 200);
    const angle = randomBetween(-Math.PI/6, Math.PI/6);
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + Math.cos(angle) * length, startY + Math.sin(angle) * length);
    ctx.stroke();
  }
  
  ctx.setLineDash([]);
  
  // Nuvens leves
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

function desenharLava(ctx, w, h, tema) {
  desenharVulcao(ctx, w, h, tema);
}

function desenharGelo(ctx, w, h, tema) {
  // Gelo
  const iceGradient = ctx.createLinearGradient(0, 0, 0, h);
  iceGradient.addColorStop(0, '#ADD8E6');
  iceGradient.addColorStop(0.5, '#87CEEB');
  iceGradient.addColorStop(1, '#4682B4');
  
  ctx.fillStyle = iceGradient;
  ctx.fillRect(0, 0, w, h);
  
  // Geleiras
  const glacierCount = randomInt(5, 10);
  for (let g = 0; g < glacierCount; g++) {
    const x = randomBetween(0, w);
    const y = randomBetween(h * 0.5, h);
    const width = randomBetween(100, 200);
    const height = randomBetween(80, 150);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(x - width/2, y);
    ctx.lineTo(x, y - height);
    ctx.lineTo(x + width/2, y);
    ctx.closePath();
    ctx.fill();
    
    // Fendas no gelo
    ctx.strokeStyle = '#4682B4';
    ctx.lineWidth = 2;
    const cracks = randomInt(3, 6);
    for (let c = 0; c < cracks; c++) {
      const startX = x - width/2 + (width / cracks) * c;
      const startY = y;
      const endX = x;
      const endY = y - height + randomBetween(0, height/2);
      
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
      const angle = randomBetween(-Math.PI/3, Math.PI/3);
      const segmentLength = randomBetween(30, 80);
      
      currentX += Math.cos(angle) * segmentLength;
      currentY += Math.sin(angle) * segmentLength;
      
      ctx.lineTo(currentX, currentY);
    }
    
    ctx.stroke();
  }
  
  // Brilho
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
      const angle = randomBetween(-Math.PI/3, Math.PI/3);
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
  // Céu tempestuoso
  const skyGradient = ctx.createLinearGradient(0, 0, 0, h);
  skyGradient.addColorStop(0, hexToRgba('#333333', 0.8));
  skyGradient.addColorStop(0.5, hexToRgba('#222222', 0.9));
  skyGradient.addColorStop(1, hexToRgba('#111111', 1));
  
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, w, h);
  
  // Nuvens de tempestade
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
  
  // Chuva
  desenharChuva(ctx, w, h, tema);
  
  // Relâmpagos
  desenharRaio(ctx, w, h, tema);
}

function desenharVento(ctx, w, h, tema) {
  desenharAr(ctx, w, h, tema);
}

function desenharFuracao(ctx, w, h, tema) {
  const centerX = w / 2;
  const centerY = h / 2;
  const radius = Math.min(w, h) * 0.3;
  
  // Olho do furacão
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.2, 0, Math.PI * 2);
  ctx.fill();
  
  // Espirais do furacão
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
  
  // Nuvens em espiral
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
  // Onda gigante
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
  
  // Crista da onda
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, waveY - waveHeight * 0.8);
  
  for (let x = 0; x <= w; x += 10) {
    const y = waveY - Math.sin(x * 0.02) * waveHeight * 0.9;
    ctx.lineTo(x, y);
  }
  ctx.stroke();
  
  // Espuma
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
  // Rachaduras no solo
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
      const angle = randomBetween(-Math.PI/4, Math.PI/4);
      const endX = startX + Math.cos(angle) * segmentLength * (i + 1);
      const endY = startY + Math.sin(angle) * segmentLength * (i + 1);
      
      ctx.lineTo(endX, endY);
    }
    
    ctx.stroke();
  }
  
  // Pedras deslocadas
  const rockCount = randomInt(20, 40);
  for (let r = 0; r < rockCount; r++) {
    const x = randomBetween(0, w);
    const y = randomBetween(h * 0.7, h);
    const size = randomBetween(10, 30);
    const rotation = randomBetween(-Math.PI/6, Math.PI/6);
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    
    ctx.fillStyle = '#696969';
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  // Poeira
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
  // Fogo
  desenharFogo(ctx, w, h, tema);
  
  // Fumaça
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
  
  // Árvores queimadas
  const treeCount = randomInt(10, 20);
  for (let t = 0; t < treeCount; t++) {
    const x = randomBetween(0, w);
    const baseY = randomBetween(h * 0.7, h);
    const height = randomBetween(60, 120);
    const width = randomBetween(20, 40);
    
    // Tronco queimado
    ctx.fillStyle = '#000000';
    ctx.fillRect(x - width/4, baseY - height/3, width/2, height/3);
    
    // Galhos queimados
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 3;
    
    const branches = randomInt(3, 6);
    for (let b = 0; b < branches; b++) {
      const branchY = baseY - height/3 + (height/3 / (branches + 1)) * (b + 1);
      const branchLength = randomBetween(20, 40);
      const branchAngle = Math.random() > 0.5 ? Math.PI/4 : -Math.PI/4;
      
      ctx.beginPath();
      ctx.moveTo(x, branchY);
      ctx.lineTo(x + Math.cos(branchAngle) * branchLength, branchY + Math.sin(branchAngle) * branchLength);
      ctx.stroke();
    }
  }
}

function desenharInundacao(ctx, w, h, tema) {
  // Água
  const waterHeight = h * 0.4;
  const waterGradient = ctx.createLinearGradient(0, h - waterHeight, 0, h);
  waterGradient.addColorStop(0, '#1E90FF');
  waterGradient.addColorStop(1, '#4682B4');
  
  ctx.fillStyle = waterGradient;
  ctx.fillRect(0, h - waterHeight, w, waterHeight);
  
  // Objetos flutuando
  const objectCount = randomInt(10, 20);
  for (let o = 0; o < objectCount; o++) {
    const x = randomBetween(0, w);
    const y = randomBetween(h - waterHeight, h);
    const type = randomFrom(['tree', 'house', 'car']);
    
    if (type === 'tree') {
      // Árvore flutuando
      const size = randomBetween(20, 40);
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(x - size/6, y - size, size/3, size);
      ctx.fillStyle = '#228B22';
      ctx.beginPath();
      ctx.arc(x, y - size, size/2, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'house') {
      // Casa flutuando
      const size = randomBetween(30, 50);
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(x - size/2, y - size, size, size);
      ctx.fillStyle = '#A52A2A';
      ctx.beginPath();
      ctx.moveTo(x - size/2, y - size);
      ctx.lineTo(x, y - size * 1.5);
      ctx.lineTo(x + size/2, y - size);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'car') {
      // Carro flutuando
      const size = randomBetween(25, 40);
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(x - size/2, y - size/3, size, size/3);
      ctx.fillRect(x - size/3, y - size/2, size * 0.66, size/3);
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(x - size/4, y, size/8, 0, Math.PI * 2);
      ctx.arc(x + size/4, y, size/8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Ondas
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  for (let i = 0; i < 10; i++) {
    const waveY = h - waterHeight + i * 10;
    ctx.beginPath();
    ctx.moveTo(0, waveY);
    
    for (let x = 0; x < w; x += 20) {
      ctx.lineTo(x, waveY + Math.sin(x * 0.05 + i) * 5);
    }
    
    ctx.stroke();
  }
}

function desenharNeblina(ctx, w, h, tema) {
  desenharNevoa(ctx, w, h, tema);
}

/* ========== MAPA DE EFEITOS ========== */
const efeitosMap = {
  // Espaço (1-15)
  'estrelas': desenharEstrelas,
  'estrelasCadentes': desenharEstrelasCadentes,
  'constelacoes': desenharConstelacoes,
  'nebulosa': desenharNebulosa,
  'galaxia': desenharGalaxia,
  'viaLactea': desenharViaLactea,
  'planetas': desenharPlanetas,
  'satelites': desenharSatelites,
  'cometas': desenharCometas,
  'meteoros': desenharMeteoros,
  'buracoNegro': desenharBuracoNegro,
  'supernova': desenharSupernova,
  'eclipse': desenharEclipse,
  'auroraBoreal': desenharAuroraBoreal,
  'arcoIris': desenharArcoIris,
  
  // Natureza (16-30)
  'floresta': desenharFloresta,
  'montanhas': desenharMontanhas,
  'oceano': desenharOceano,
  'deserto': desenharDeserto,
  'selva': desenharSelva,
  'campo': desenharCampo,
  'cachoeira': desenharCachoeira,
  'rio': desenharRio,
  'lago': desenharLago,
  'geiser': desenharGeiser,
  'vulcao': desenharVulcao,
  'neve': desenharNeve,
  'chuva': desenharChuva,
  'nevoa': desenharNevoa,
  'aurora': desenharAurora,
  
  // Elementos (31-45)
  'fogo': desenharFogo,
  'agua': desenharAgua,
  'terra': desenharTerra,
  'ar': desenharAr,
  'lava': desenharLava,
  'gelo': desenharGelo,
  'raio': desenharRaio,
  'tempestade': desenharTempestade,
  'vento': desenharVento,
  'furacao': desenharFuracao,
  'tsunami': desenharTsunami,
  'terremoto': desenharTerremoto,
  'incendio': desenharIncendio,
  'inundacao': desenharInundacao,
  'neblina': desenharNeblina,
  
  // Padrão default
  'default': desenharEstrelas
};

/* ========== UTIL: garantir canvas existe ========== */
function ensurePosterCanvas() {
  let canvas = porId('posterCanvas');
  
  if (canvas && canvas instanceof HTMLCanvasElement && canvas.getContext) {
    if (canvas.width < 1800) canvas.width = 2000;
    if (canvas.height < 1200) canvas.height = 1400;
    return canvas;
  }
  
  // Criar novo canvas GRANDE
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
  canvas.title = 'Clique para baixar';
  
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

/* ========== Geração do Pôster (COM +50 EFEITOS) ========== */
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
  
  const top = [
    sorted[0] || null,
    sorted[1] || null,
    sorted[2] || null
  ];
  
  const tema = gerarTemaPosterUnico();
  
  ctx.clearRect(0, 0, w, h);
  
  // ===== FUNDO COM DESIGN AVANÇADO =====
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, tema.bg1);
  grad.addColorStop(0.5, tema.bg2);
  grad.addColorStop(1, tema.bg1);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  
  // ===== APLICAR EFEITO DE FUNDO ESCOLHIDO =====
  console.log(`Aplicando efeito de fundo: ${tema.efeito}`);
  
  const efeitoFunc = efeitosMap[tema.efeito] || efeitosMap['default'];
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
  
  // ===== TÍTULO ESTILIZADO =====
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
  
  // ===== PÓDIO ELEVADO =====
  const slots = [
    { rank: 1, x: w / 2, y: 600, size: 450, elevation: 0, platformHeight: 20 },
    { rank: 2, x: w * 0.25, y: 750, size: 320, elevation: 60, platformHeight: 40 },
    { rank: 3, x: w * 0.75, y: 750, size: 320, elevation: 60, platformHeight: 40 }
  ];
  
  const loadImage = (src) => {
    return new Promise((resolve) => {
      if (!src || src.trim() === '') {
        resolve(null);
        return;
      }
      
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
    ctx.roundRect(s.x - s.size/2 - 20, s.y + s.size/2, s.size + 40, s.platformHeight, 8);
    ctx.fill();
    ctx.restore();
    
    ctx.save();
    ctx.fillStyle = hexToRgba('#000000', 0.3);
    ctx.beginPath();
    ctx.roundRect(s.x - s.size/2 - 15, s.y + s.size/2 + s.platformHeight, s.size + 30, 15, 5);
    ctx.fill();
    ctx.restore();
    
    const gradient = ctx.createRadialGradient(s.x, s.y, s.size/2, s.x, s.y, s.size/2 + 50);
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
    if (t.logoDataUrl) {
      img = await loadImage(t.logoDataUrl);
    }
    
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
      const placeholderGradient = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size/2);
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
      drawCrown(ctx, s.x, s.y - s.size/2 - 80, 200, tema.accent1);
      
      ctx.save();
      ctx.fillStyle = hexToRgba(tema.accent1, 0.2);
      ctx.beginPath();
      ctx.arc(s.x, s.y - s.size/2 - 80, 120, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    
    ctx.save();
    ctx.fillStyle = hexToRgba(tema.accent1, 0.9);
    ctx.font = `bold ${s.rank === 1 ? '80' : '70'}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`#${s.rank}`, s.x, s.y - s.size/2 - (s.rank === 1 ? 180 : 160));
    ctx.restore();
    
    ctx.fillStyle = tema.text;
    ctx.font = s.rank === 1 ? 'bold 70px Arial, sans-serif' : 'bold 55px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText((t.nome || `LINE ${t.id}`).toUpperCase(), s.x, s.y + s.size/2 + 120);
    
    ctx.font = s.rank === 1 ? '42px Arial, sans-serif' : '38px Arial, sans-serif';
    ctx.fillStyle = hexToRgba(tema.accent2, 0.95);
    const statsY = s.y + s.size/2 + (s.rank === 1 ? 180 : 170);
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
  const dateStr = now.toLocaleDateString('pt-BR', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
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

/* ========== Baixar Poster ========== */
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

/* ========== Exportar PDF ========== */
async function exportarPDF(tryShare = false) {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) { alert('jsPDF não carregado'); return; }

  const linhas = ESTADO.times.map(t => {
    const c = calcularPontuacaoTime(t);
    return {...t, totalKills: c.totalKills, score: c.score, booyas: c.booyas};
  }).sort((a,b) => (b.score||0)-(a.score||0) || (b.totalKills||0)-(a.totalKills||0) || (b.booyas||0)-(a.booyas||0));

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const margin = 28;
  const contentW = W - margin*2;

  pdf.setFillColor('#000000');
  pdf.rect(0,0,W,H,'F');

  pdf.setFillColor(ESTADO.tema.primaria);
  pdf.rect(margin, margin, contentW, 64, 'F');
  pdf.setFontSize(20); pdf.setTextColor('#ffffff'); pdf.setFont('helvetica','bold');
  pdf.text('TABELA DE PONTUAÇÃO — XTREINO DA TOMAN', margin + contentW/2, margin + 42, {align:'center'});

  let y = margin + 96;
  pdf.setFontSize(10);
  pdf.setTextColor('#ffffff');
  pdf.setFillColor('#0b0b0b');
  pdf.rect(margin, y-12, contentW, 22, 'F');

  const col = {
    rankW: 38,
    nameW: Math.round(contentW*0.22),
    qW: Math.max(38, Math.round(contentW*0.12/4)),
    booyaW: 60,
    killsW: 60,
    scoreW: 64
  };
  col.nameX = margin + col.rankW + 8;
  col.qStartX = col.nameX + col.nameW + 8;
  col.booyaX = col.qStartX + col.qW*4 + 8;
  col.killsX = col.booyaX + col.booyaW + 8;
  col.scoreX = col.killsX + col.killsW + 8;

  pdf.setTextColor(ESTADO.tema.primaria); pdf.text('Rank', margin + 6, y+6);
  pdf.text('LINE / Equipe', col.nameX, y+6);
  pdf.setTextColor('#ffffff');
  for (let i=0;i<NUM_QUEDAS;i++) pdf.text(`Q${i+1}`, col.qStartX + i*col.qW, y+6);
  pdf.text('Booyas', col.booyaX, y+6);
  pdf.text(' kills', col.killsX, y+6);
  pdf.text('Score', col.scoreX, y+6);

  y += 28;
  pdf.setFontSize(10);
  for (let i=0;i<linhas.length;i++){
    const t = linhas[i];
    const rowH = 20;
    pdf.setFillColor(i%2===0? '#090909':'#060606');
    pdf.rect(margin, y - 10, contentW, rowH, 'F');

    pdf.setTextColor('#ffffff');
    pdf.text(String(i+1), margin + 6, y + 6);
    pdf.text(String(t.nome || `LINE ${t.id}`), col.nameX, y + 6);
    for (let q=0;q<NUM_QUEDAS;q++){
      const v = t.posQ && t.posQ[q] ? String(t.posQ[q]) : '-';
      pdf.text(v, col.qStartX + q*col.qW, y + 6);
    }
    pdf.text(String(t.booyas || 0), col.booyaX, y + 6);
    pdf.text(String(t.totalKills || 0), col.killsX, y + 6);
    pdf.text(String(t.score || 0), col.scoreX, y + 6);

    y += rowH + 6;
    if (y > pdf.internal.pageSize.getHeight() - 80){
      pdf.addPage();
      y = margin + 20;
    }
  }

  pdf.setFontSize(9);
  pdf.setTextColor('#999999');
  pdf.text('Gerado por Tabela XTreino TOMAN.', margin, H - 20);

  const blob = pdf.output('blob');
  if (tryShare){
    const file = new File([blob], `tabela_xtreino_${Date.now()}.pdf`, {type:'application/pdf'});
    if (navigator.canShare && navigator.canShare({ files: [file] })){
      try{ await navigator.share({ title:'Tabela XTreino Da TOMAN', text:'Tabela de pontuação', files:[file] }); return; } catch(e){ }
    }
  }
  pdf.save(`tabela_xtreino_${Date.now()}.pdf`);
}

/* ========== Export PNG ========== */
async function exportarPNG(){
  const node = porId('scoreboard');
  if(!node) return;
  
  try {
    const canvas = await html2canvas(node, {
      backgroundColor: ESTADO.tema.bg,
      scale: 2,
      useCORS: true
    });
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `tabela_xtreino_toman_${Date.now()}.png`;
    a.click();
  } catch (error) {
    alert('Erro ao gerar imagem PNG: ' + error.message);
  }
}

/* ========== Resumo ========== */
function montarTabelaTimesResumo(times){
  if(!Array.isArray(times)) return '<div class="muted">Nenhum time configurado.</div>';
  let html = '<table class="times-table"><thead><tr><th>Line</th>';
  for(let i=0;i<NUM_QUEDAS;i++) html += `<th>Q${i+1}</th>`;
  html += '<th>Booyas</th><th>Pts Pos</th><th>Kills</th></tr></thead><tbody>';
  times.forEach(t=>{
    const c = calcularPontuacaoTime(t);
    html += `<tr><td>${escapeHtml(t.nome||`LINE ${t.id}`)}</td>`;
    for(let i=0;i<NUM_QUEDAS;i++) html += `<td>${t.posQ[i] || '-'}</td>`;
    html += `<td>${t.booyas||0}</td><td>${c.pontosPorPosicao||0}</td><td>${c.totalKills||0}</td></tr>`;
  });
  html += '</tbody></table>';
  return html;
}

// Tornar funções disponíveis globalmente
window.renderizarEditorTimes = renderizarEditorTimes;
window.calcularEExibir = calcularEExibir;
window.gerarPosterTop3 = gerarPosterTop3;
window.baixarPoster = baixarPoster;
