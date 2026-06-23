/* core.js — Estado global, helpers, cálculo e UI principal da Tabela XTreino TOMAN ☯️ */
// Versão com TEMA FIXO (preto, vermelho, branco) e sem temas aleatórios

// ========== CONSTANTES ==========
const NUM_TIMES = 12;
const NUM_QUEDAS = 4;

// ========== ESTADO GLOBAL ==========
const ESTADO = {
  animacoes: true,
  times: [],
  tema: { primaria: '#ff0000', secundaria: '#ffffff', bg: '#0a0a0a', texto: '#ffffff' },
  ultimoTemaPoster: null,
  temasUsados: []
};

// ========== HELPERS ==========
function porId(id) { return document.getElementById(id); }

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
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
  return `#${f(0).toString(16).padStart(2, '0')}${f(8).toString(16).padStart(2, '0')}${f(4).toString(16).padStart(2, '0')}`;
}

function hexToRgba(hex, alpha) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', () => {
  inicializarTimes();
  ligarEventosUI();
  aplicarTemaFixo();
  renderizarEditorTimes();
  calcularEExibir();
});

function inicializarTimes() {
  ESTADO.times = Array.from({ length: NUM_TIMES }, (_, i) => ({
    id: i + 1,
    nome: '',
    posQ: Array(NUM_QUEDAS).fill(''),
    killsQ: Array(NUM_QUEDAS).fill(0),
    booyas: 0,
    totalKills: 0,
    score: 0,
    logoDataUrl: ''
  }));
}

// ========== TEMA FIXO ==========
function aplicarTemaFixo() {
  const tema = { primaria: '#ff0000', secundaria: '#ffffff', bg: '#0a0a0a', texto: '#ffffff' };
  ESTADO.tema = tema;
  document.documentElement.style.setProperty('--c-primary', tema.primaria);
  document.documentElement.style.setProperty('--c-secondary', tema.secundaria);
  document.documentElement.style.setProperty('--c-bg', tema.bg);
  document.documentElement.style.setProperty('--c-text', tema.texto);
}

// ========== CÁLCULO DOS TIMES ==========
function calcularPontuacaoTime(t) {
  let kills = t.killsQ.reduce((a, b) => a + (+b || 0), 0);
  let booyas = 0, pts = 0;
  t.posQ.forEach(p => {
    const pos = +p;
    if (!isNaN(pos)) {
      if (pos === 1) { booyas++; pts += 20; }
      else if (pos === 2) pts += 15;
      else if (pos === 3) pts += 10;
    }
  });
  return { totalKills: kills, booyas, score: kills * 5 + pts, pontosPorPosicao: pts };
}

function calcularEExibir() {
  ESTADO.times.forEach(t => {
    const c = calcularPontuacaoTime(t);
    t.booyas = c.booyas;
    t.totalKills = c.totalKills;
    t.score = c.score;
  });

  ESTADO.times.forEach((t, idx) => {
    const el = porId(`booyas-${idx}`);
    if (el) el.textContent = t.booyas;
  });

  const sorted = [...ESTADO.times].sort((a, b) => {
    const scoreDiff = b.score - a.score;
    if (scoreDiff !== 0) return scoreDiff;
    const killsDiff = b.totalKills - a.totalKills;
    if (killsDiff !== 0) return killsDiff;
    return b.booyas - a.booyas;
  });

  if (porId('scoreBody')) {
    porId('scoreBody').innerHTML = sorted.map((t, i) => `
      <tr>
        <td><span class="badge">${i + 1}</span></td>
        <td>${escapeHtml(t.nome || `LINE ${t.id}`)}</td>
        <td>${t.posQ.map(p => p || '-').join(' / ')}</td>
        <td class="center">${t.booyas}</td>
        <td class="center">${t.totalKills}</td>
        <td class="right"><strong>${t.score}</strong></td>
      </tr>
    `).join('');
  }

  [1, 2, 3].forEach(i => {
    const p = sorted[i - 1];
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

  if (porId('timesResumo')) {
    porId('timesResumo').innerHTML = montarTabelaTimesResumo(ESTADO.times);
  }
}

// ========== RENDERIZAÇÃO DO EDITOR ==========
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
        <input type="text" placeholder="Nome da LINE/Equipe" value="${escapeHtml(time.nome || '')}" data-idx="${idx}" data-field="nome"/>
      </div>

      <div class="team-row" style="align-items:center;">
        <label>Booyas</label>
        <div style="display:flex;gap:6px;">
          <div id="booyas-${idx}" class="muted" style="min-width:56px;text-align:center;">${time.booyas || 0}</div>
        </div>
      </div>

      <div style="margin-top:8px;font-size:13px;color:var(--muted)">Quedas (Pos / Kills)</div>
      <div class="quedas-row">
        ${Array(NUM_QUEDAS).fill().map((_, q) => `
          <div class="queda-box">
            <label>Q${q + 1} Pos</label>
            <input type="number" min="1" max="${NUM_TIMES}" value="${time.posQ[q] || ''}" data-idx="${idx}" data-field="posQ" data-q="${q}" style="width:96px;"/>
            <label>Kills</label>
            <input type="number" min="0" value="${time.killsQ[q] || 0}" data-idx="${idx}" data-field="killsQ" data-q="${q}" style="width:96px;"/>
          </div>
        `).join('')}
      </div>

      <div class="team-row" style="margin-top:12px;">
        <label class="btn tiny ghost" for="logo-${idx}">Logo</label>
        <input id="logo-${idx}" type="file" accept="image/*" data-idx="${idx}" data-field="logo" style="display:none;"/>
        <img class="logo-preview" id="logo-prev-${idx}" src="${time.logoDataUrl || ''}" alt="Logo preview" style="${time.logoDataUrl ? '' : 'display:none;'}"/>
      </div>
    `;

    container.appendChild(card);
  });

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

// ========== RESUMO ==========
function montarTabelaTimesResumo(times) {
  if (!Array.isArray(times)) return '<div class="muted">Nenhum time configurado.</div>';
  let html = '<table class="times-table"><thead><tr><th>Line</th>';
  for (let i = 0; i < NUM_QUEDAS; i++) html += `<th>Q${i + 1}</th>`;
  html += '<th>Booyas</th><th>Pts Pos</th><th>Kills</th></tr></thead><tbody>';
  times.forEach(t => {
    const c = calcularPontuacaoTime(t);
    html += `<tr><td>${escapeHtml(t.nome || `LINE ${t.id}`)}</td>`;
    for (let i = 0; i < NUM_QUEDAS; i++) html += `<td>${t.posQ[i] || '-'}</td>`;
    html += `<td>${t.booyas || 0}</td><td>${c.pontosPorPosicao || 0}</td><td>${c.totalKills || 0}</td></tr>`;
  });
  html += '</tbody></table>';
  return html;
}

// ========== EVENTOS UI ==========
function ligarEventosUI() {
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

window.ESTADO = ESTADO;
window.renderizarEditorTimes = renderizarEditorTimes;
window.calcularEExibir = calcularEExibir;
window.porId = porId;
window.hexToRgba = hexToRgba;
window.hslToHex = hslToHex;
window.randomInt = randomInt;
window.randomBetween = randomBetween;
window.randomFrom = randomFrom;