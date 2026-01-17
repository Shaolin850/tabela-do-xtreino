/* script.js — Tabela XTreino TOMAN ☯️
   CORRIGIDO: Pôster TOP 3 gera corretamente agora
   - Dois botões chamam a mesma função
   - Temas 100% aleatórios e não repetitivos (hue livre + 12 efeitos variados)
   - Coroa maior no campeão
   - PDF inalterado
   - Sem erros de "randomFrom is not defined"
*/

const ESTADO = {
  animacoes: true,
  times: [],
  tema: { primaria:'#00e7ff', secundaria:'#ff004c', bg:'#0a0b10', texto:'#e8f1ff' }
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
    btn?.addEventListener('click', gerarPosterTop3);
  });

  porId('btnDownloadPoster')?.addEventListener('click', baixarPoster);

  porId('btnClear')?.addEventListener('click', () => {
    inicializarTimes();
    renderizarEditorTimes();
    calcularEExibir();
  });

  porId('btnCompute')?.addEventListener('click', calcularEExibir);

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

function temaAleatorio() {
  const presets = [
    {primaria:'#00e7ff', secundaria:'#ff6a8a', bg:'#06070a', texto:'#e8f1ff'},
    {primaria:'#ff9f1c', secundaria:'#ff2d95', bg:'#08020a', texto:'#fff7ef'},
    {primaria:'#7afcff', secundaria:'#ff6b6b', bg:'#04060a', texto:'#eafcff'},
    {primaria:'#b6ff6b', secundaria:'#6bd3ff', bg:'#061014', texto:'#f3fff7'},
    {primaria:'#ffd400', secundaria:'#ff3b3b', bg:'#0b0612', texto:'#fffbe6'}
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
        <label style="width:70px">Booyas</label>
        <div style="display:flex;gap:6px;">
          <button class="btn tiny" data-action="dec-booya" data-idx="${idx}">-</button>
          <input type="number" min="0" value="${time.booyas||0}" data-idx="${idx}" data-field="booyas" style="width:56px;text-align:center;"/>
          <button class="btn tiny" data-action="inc-booya" data-idx="${idx}">+</button>
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
        <img class="logo-preview" id="logo-prev-${idx}" src="${time.logoDataUrl||''}" alt="Logo preview"/>
      </div>
    `;

    container.appendChild(card);
  });

  // Eventos
  container.querySelectorAll('input, button').forEach(el => {
    const idx = el.dataset.idx !== undefined ? parseInt(el.dataset.idx, 10) : null;
    const field = el.dataset.field;
    const q = el.dataset.q ? parseInt(el.dataset.q, 10) : null;

    if (el.dataset.action === 'inc-booya') {
      el.addEventListener('click', () => {
        if (idx == null) return;
        ESTADO.times[idx].booyas = (parseInt(ESTADO.times[idx].booyas, 10) || 0) + 1;
        calcularEExibir();
        renderizarEditorTimes();
      });
      return;
    }

    if (el.dataset.action === 'dec-booya') {
      el.addEventListener('click', () => {
        if (idx == null) return;
        ESTADO.times[idx].booyas = Math.max(0, (parseInt(ESTADO.times[idx].booyas, 10) || 0) - 1);
        calcularEExibir();
        renderizarEditorTimes();
      });
      return;
    }

    if (field === 'logo') {
      el.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          ESTADO.times[idx].logoDataUrl = reader.result;
          porId(`logo-prev-${idx}`).src = reader.result;
          calcularEExibir();
        };
        reader.readAsDataURL(file);
      });
      return;
    }

    el.addEventListener('input', e => {
      const val = e.target.value;
      if (field === 'nome') ESTADO.times[idx].nome = val;
      if (field === 'booyas') ESTADO.times[idx].booyas = val === '' ? 0 : Math.max(0, parseInt(val, 10) || 0);
      if (field === 'posQ' && q !== null) {
        let pos = val === '' ? '' : Math.max(1, Math.min(NUM_TIMES, parseInt(val, 10) || 1));
        ESTADO.times[idx].posQ[q] = pos;
        e.target.value = pos;
        ESTADO.times[idx].booyas = ESTADO.times[idx].posQ.reduce((s, p) => s + (parseInt(p, 10) === 1 ? 1 : 0), 0);
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
  return { totalKills: kills, booyas, score: kills*5 + pts };
}

function calcularEExibir() {
  ESTADO.times.forEach(t => {
    const c = calcularPontuacaoTime(t);
    t.booyas = c.booyas;
    t.totalKills = c.totalKills;
    t.score = c.score;
  });

  const sorted = [...ESTADO.times].sort((a,b) => b.score - a.score || b.totalKills - a.totalKills || b.booyas - a.booyas);

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

  [1,2,3].forEach(i => {
    const p = sorted[i-1];
    porId(`podium${i}Logo`).src = p?.logoDataUrl || '';
    porId(`podium${i}Name`).textContent = p ? p.nome || `LINE ${p.id}` : '—';
    porId(`podium${i}Score`).textContent = p ? `${p.score} pts` : '0 pts';
  });

  porId('timesResumo').innerHTML = montarTabelaTimesResumo(ESTADO.times);
}

/* ========== Temas INFINITOS e NÃO repetitivos ========== */
function gerarTemaPosterUnico() {
  const h1 = randomInt(0, 359);
  const h2 = (h1 + randomInt(60, 300)) % 360;
  const h3 = (h1 + randomInt(120, 240)) % 360;

  return {
    bg1: hslToHex(h1, randomInt(8, 45), randomInt(4, 22)),
    bg2: hslToHex(h2, randomInt(10, 50), randomInt(6, 25)),
    accent1: hslToHex(h1, randomInt(75, 100), randomInt(45, 75)),
    accent2: hslToHex(h2, randomInt(70, 98), randomInt(40, 70)),
    glow: hslToHex(h3, randomInt(80, 100), randomInt(50, 80)),
    text: '#ffffff'
  };
}

/* ========== Efeitos visuais (12 tipos com variações) ========== */
const efeitosVariados = [
  'nebula', 'solarFlare', 'cyberGrid', 'auroraVeil', 'deepSpace', 'plasmaStorm',
  'crystalFacet', 'digitalGlitch', 'wavePulse', 'particleFall', 'vaporRetro', 'neonCircuit'
];

/* ========== Geração do Pôster ========== */
async function gerarPosterTop3() {
  const canvas = porId('posterCanvas');
  if (!canvas) {
    console.error('Canvas não encontrado');
    return;
  }
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  const sorted = [...ESTADO.times].sort((a,b) => b.score - a.score || b.totalKills - a.totalKills || b.booyas - a.booyas);
  const top = [sorted[0], sorted[1], sorted[2]];

  const tema = gerarTemaPosterUnico();
  const efeito = randomFrom(efeitosVariados);

  ctx.clearRect(0, 0, w, h);

  // Fundo
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, tema.bg1);
  grad.addColorStop(1, tema.bg2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Efeito aleatório
  if (efeito === 'nebula') {
    for (let i = 0; i < randomInt(6,12); i++) {
      const x = randomBetween(0,w), y = randomBetween(0,h);
      const r = randomBetween(w*0.2, w*0.7);
      const g = ctx.createRadialGradient(x,y,0,x,y,r);
      g.addColorStop(0, hexToRgba(tema.accent1, randomBetween(0.1,0.3)));
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0,0,w,h);
    }
  } else if (efeito === 'solarFlare') {
    const cx = w/2 + randomBetween(-100,100);
    const cy = h*0.3 + randomBetween(-50,50);
    const g = ctx.createRadialGradient(cx,cy,0,cx,cy,w*0.8);
    g.addColorStop(0, hexToRgba('#ffdd44', 0.6));
    g.addColorStop(0.4, hexToRgba('#ff6600', 0.3));
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);
  } else if (efeito === 'cyberGrid') {
    ctx.strokeStyle = hexToRgba(tema.accent1, 0.18);
    ctx.lineWidth = 1.5;
    for (let x = 0; x < w; x += randomInt(50,90)) {
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke();
    }
    for (let y = 0; y < h; y += randomInt(50,90)) {
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke();
    }
  } else if (efeito === 'auroraVeil') {
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.moveTo(0, h*0.2 + i*80);
      for (let x = 0; x < w; x += 25) {
        ctx.lineTo(x, h*0.2 + i*80 + Math.sin(x/100 + i*3) * 120);
      }
      ctx.lineTo(w,h);
      ctx.lineTo(0,h);
      ctx.closePath();
      ctx.fillStyle = hexToRgba(tema.accent1, 0.06 + i*0.03);
      ctx.fill();
    }
  } else if (efeito === 'deepSpace') {
    for (let i = 0; i < 800; i++) {
      ctx.fillStyle = randomBetween(0,1)>0.92 ? tema.accent1 : '#fff';
      ctx.globalAlpha = randomBetween(0.4,1);
      ctx.fillRect(randomBetween(0,w), randomBetween(0,h), 1.5, 1.5);
    }
    ctx.globalAlpha = 1;
  } else if (efeito === 'plasmaStorm') {
    ctx.filter = 'blur(12px)';
    for (let i = 0; i < 6; i++) {
      const grad = ctx.createRadialGradient(w/2,h/2,0,w/2+Math.sin(i*2)*150,h/2+Math.cos(i*2)*150,w*0.7);
      grad.addColorStop(0, hexToRgba(tema.accent1,0.35));
      grad.addColorStop(0.5, hexToRgba(tema.accent2,0.18));
      grad.addColorStop(1,'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0,0,w,h);
    }
    ctx.filter = 'none';
  } else if (efeito === 'crystalFacet') {
    for (let i = 0; i < 18; i++) {
      ctx.beginPath();
      const cx = randomBetween(0,w), cy = randomBetween(0,h);
      ctx.moveTo(cx,cy);
      for (let j = 0; j < 7; j++) {
        const ang = j * Math.PI*2/7 + randomBetween(-0.4,0.4);
        ctx.lineTo(cx + Math.cos(ang)*randomBetween(80,160), cy + Math.sin(ang)*randomBetween(80,160));
      }
      ctx.closePath();
      ctx.fillStyle = hexToRgba(tema.accent1, 0.07);
      ctx.fill();
      ctx.strokeStyle = hexToRgba('#fff',0.12);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  } else if (efeito === 'digitalGlitch') {
    ctx.globalAlpha = 0.7;
    for (let i = 0; i < 50; i++) {
      const y = randomBetween(0,h);
      ctx.fillStyle = randomFrom([tema.accent1, tema.accent2, '#fff']);
      ctx.fillRect(randomBetween(0,w-150), y, randomBetween(40,180), 3);
    }
    ctx.globalAlpha = 1;
  } else if (efeito === 'wavePulse') {
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo(0, h*0.4 + i*50);
      for (let x = 0; x < w; x += 30) {
        ctx.lineTo(x, h*0.4 + i*50 + Math.sin(x/90 + i*2.5) * (70 + i*15));
      }
      ctx.strokeStyle = hexToRgba(tema.accent1, 0.1 + i*0.02);
      ctx.lineWidth = 8 - i*0.6;
      ctx.stroke();
    }
  } else if (efeito === 'particleFall') {
    for (let i = 0; i < 400; i++) {
      const x = randomBetween(0,w);
      const y = randomBetween(0,h);
      const len = randomBetween(12,45);
      ctx.beginPath();
      ctx.moveTo(x,y);
      ctx.lineTo(x + randomBetween(-12,12), y + len);
      ctx.strokeStyle = hexToRgba(tema.accent2, 0.45);
      ctx.lineWidth = randomBetween(1.5,3.5);
      ctx.stroke();
    }
  } else if (efeito === 'vaporRetro') {
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = tema.accent1;
    ctx.fillRect(0, h*0.15, w, h*0.2);
    ctx.fillStyle = tema.accent2;
    ctx.fillRect(0, h*0.55, w, h*0.18);
    ctx.globalAlpha = 1;
  } else if (efeito === 'neonCircuit') {
    for (let i = 0; i < 25; i++) {
      const y = randomBetween(0,h);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.quadraticCurveTo(w/2 + randomBetween(-200,200), y + randomBetween(-150,150), w, y + randomBetween(-80,80));
      ctx.strokeStyle = hexToRgba(tema.accent1, 0.45);
      ctx.lineWidth = randomBetween(4,10);
      ctx.shadowBlur = 25;
      ctx.shadowColor = tema.accent1;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  // Cabeçalho
  ctx.textAlign = 'center';
  ctx.fillStyle = tema.text;
  ctx.font = 'bold 80px Arial';
  ctx.fillText('TOP 3', w/2, 120);
  ctx.font = '28px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fillText('XTREINO TOMAN ☯️', w/2, 175);

  // Pódio
  const slots = [
    {rank:1, x:w/2,    y:460, size:380},
    {rank:2, x:w*0.25, y:760, size:240},
    {rank:3, x:w*0.75, y:760, size:240}
  ];

  const loadImage = src => new Promise((res,rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });

  for (let i = 0; i < slots.length; i++) {
    const s = slots[i];
    const t = top[i];
    if (!t) continue;

    ctx.save();
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size/2 + 28, 0, Math.PI*2);
    ctx.fillStyle = hexToRgba(tema.accent1, 0.14);
    ctx.fill();
    ctx.restore();

    if (t.logoDataUrl) {
      try {
        const img = await loadImage(t.logoDataUrl);
        ctx.save();
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size/2, 0, Math.PI*2);
        ctx.clip();
        const ratio = Math.max(s.size/img.width, s.size/img.height);
        ctx.drawImage(img, s.x-(img.width*ratio)/2, s.y-(img.height*ratio)/2, img.width*ratio, img.height*ratio);
        ctx.restore();
      } catch {
        ctx.fillStyle = '#111';
        ctx.fillRect(s.x-s.size/2, s.y-s.size/2, s.size, s.size);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('LOGO', s.x, s.y+14);
      }
    }

    if (s.rank === 1) {
      drawCrown(ctx, s.x, s.y - s.size/2 - 60, 160);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = s.rank === 1 ? 'bold 48px Arial' : 'bold 30px Arial';
    ctx.fillText((t.nome || `LINE ${t.id}`).toUpperCase(), s.x, s.y + s.size/2 + 70);

    ctx.font = s.rank === 1 ? '34px Arial' : '24px Arial';
    ctx.fillText(`${t.score || 0} pts • ${t.totalKills || 0} kills • ${t.booyas || 0} booyas`, s.x, s.y + s.size/2 + 110);
  }

  // Rodapé
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillRect(0, h-100, w, 100);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px Arial';
  ctx.fillText('Parabéns aos Campeões do Xtreino da TOMAN ☯️!', w/2, h-38);
}

/* ========== Baixar ========== */
function baixarPoster() {
  const canvas = porId('posterCanvas');
  if (!canvas) return;
  const a = document.createElement('a');
  a.download = `poster_top3_${Date.now()}.png`;
  a.href = canvas.toDataURL('image/png');
  a.click();
}

/* ========== PDF (inalterado) ========== */
async function exportarPDF(tryShare = false) {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) { alert('jsPDF não carregado'); return; }

  const linhas = ESTADO.times.map(t=>{
    const c = calcularPontuacaoTime(t);
    return {...t, totalKills: c.totalKills, score: c.score, booyas: c.booyas, pontosBooya: c.pontosBooya};
  }).sort((a,b)=> (b.score||0)-(a.score||0) || (b.totalKills||0)-(a.totalKills||0) || (b.booyas||0)-(a.booyas||0));

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const margin = 28;
  const contentW = W - margin*2;

  pdf.setFillColor('#000000');
  pdf.rect(0,0,W,H,'F');

  pdf.setFillColor('#c8102e');
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

  pdf.setTextColor('#c8102e'); pdf.text('Rank', margin + 6, y+6);
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
  const canvas = await html2canvas(node, {backgroundColor: null, scale: 2});
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a'); a.href = url; a.download = `tabela_xtreino_toman_${Date.now()}.png`; a.click();
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

window.renderizarEditorTimes = renderizarEditorTimes;
window.calcularEExibir = calcularEExibir;

document.addEventListener('DOMContentLoaded', () => {
  const out = porId('timesResumo');
  if(out) out.innerHTML = montarTabelaTimesResumo(ESTADO.times);
});
