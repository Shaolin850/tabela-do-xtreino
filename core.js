/* core.js — Estado global, helpers, cálculo e UI principal da Tabela XTreino TOMAN ☯️ */
// Versão com salvamento automático, compressão de logos melhorada e HEADER FIXO

const NUM_TIMES = 12;
const NUM_QUEDAS = 4;

const ESTADO = {
  animacoes: true,
  times: [],
  tema: { primaria: '#ff0000', secundaria: '#ffffff', bg: '#0a0a0a', texto: '#ffffff' }
};

// ========== HELPERS ==========
function porId(id) { return document.getElementById(id); }

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function hexToRgba(hex, alpha) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ========== COMPRESSÃO DE IMAGEM (VERSÃO MELHORADA) ==========
function comprimirImagem(dataURL, maxWidth = 300, maxHeight = 300, qualidade = 0.85) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Mantém proporção e aumenta a resolução para o pôster
      const targetSize = 300;
      
      if (width > height) {
        if (width > targetSize) {
          height = (height * targetSize) / width;
          width = targetSize;
        }
      } else {
        if (height > targetSize) {
          width = (width * targetSize) / height;
          height = targetSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      // Melhora a qualidade do redimensionamento
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/png', qualidade));
    };
    img.onerror = () => resolve(dataURL);
    img.src = dataURL;
  });
}

// ========== NOTIFICAÇÕES ANIMADAS ==========
function mostrarNotificacao(mensagem, tipo = 'success') {
  const old = document.querySelector('.toast-notification');
  if (old) old.remove();

  const cores = {
    success: { bg: '#00ff88', text: '#000', icon: '✅' },
    warning: { bg: '#ffcc00', text: '#000', icon: '⚠️' },
    danger: { bg: '#ff4757', text: '#fff', icon: '❌' },
    info: { bg: '#00e7ff', text: '#000', icon: 'ℹ️' }
  };

  const cor = cores[tipo] || cores.success;

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;">
      <span style="font-size:28px;">${cor.icon}</span>
      <span style="font-weight:600;font-size:16px;">${mensagem}</span>
    </div>
  `;
  toast.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: ${cor.bg};
    color: ${cor.text};
    padding: 16px 24px;
    border-radius: 12px;
    font-family: 'Inter', Arial, sans-serif;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    z-index: 9999;
    max-width: 400px;
    min-width: 280px;
    border: 2px solid rgba(255,255,255,0.1);
    transform: translateX(120%);
    opacity: 0;
    transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.4s ease;
    pointer-events: none;
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  });

  setTimeout(() => {
    toast.style.transform = 'translateX(120%)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 500);
  }, 3500);
}

// ========== PERSISTÊNCIA LOCAL (SALVAMENTO AUTOMÁTICO) ==========
function salvarDados() {
  try {
    const dados = ESTADO.times.map(t => ({
      id: t.id,
      nome: t.nome,
      posQ: t.posQ,
      killsQ: t.killsQ,
      logoDataUrl: t.logoDataUrl || ''
    }));
    
    const json = JSON.stringify(dados);
    localStorage.setItem('xtreino_dados', json);
  } catch (error) {
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      mostrarNotificacao('❌ Espaço insuficiente! Exporte os dados.', 'danger');
    }
  }
}

function carregarDados() {
  const raw = localStorage.getItem('xtreino_dados');
  if (!raw) {
    inicializarTimes();
    return false;
  }
  try {
    const dados = JSON.parse(raw);
    if (dados && dados.length === NUM_TIMES) {
      ESTADO.times = dados.map((t, i) => ({
        ...t,
        id: i + 1,
        booyas: 0,
        totalKills: 0,
        score: 0
      }));
      return true;
    }
  } catch (e) {}
  inicializarTimes();
  return false;
}

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DOM carregado - Inicializando...');
  
  carregarDados();
  console.log('📂 Dados carregados');
  
  ligarEventosUI();
  console.log('🔗 Eventos UI conectados');
  
  aplicarTemaFixo();
  console.log('🎨 Tema fixo aplicado');
  
  renderizarEditorTimes();
  console.log('📝 Editor renderizado');
  
  calcularEExibir();
  console.log('📊 Cálculos exibidos');
  
  // Detecta scroll para adicionar classe no header
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.fixed-header');
    if (header) {
      if (window.scrollY > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  });
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

// ========== CÁLCULO ==========
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
  if (!container) {
    console.error('❌ Container teamsContainer não encontrado!');
    return;
  }
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

  // Reconectar eventos após recriar os inputs
  container.querySelectorAll('input, button').forEach(el => {
    const idx = el.dataset.idx !== undefined ? parseInt(el.dataset.idx, 10) : null;
    const field = el.dataset.field;
    const q = el.dataset.q ? parseInt(el.dataset.q, 10) : null;

    if (field === 'logo') {
      el.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        mostrarNotificacao('⏳ Comprimindo imagem...', 'info');
        
        const reader = new FileReader();
        reader.onload = async (ev) => {
          try {
            const comprimida = await comprimirImagem(ev.target.result, 300, 300, 0.85);
            ESTADO.times[idx].logoDataUrl = comprimida;
            const preview = porId(`logo-prev-${idx}`);
            preview.src = comprimida;
            preview.style.display = 'block';
            calcularEExibir();
            salvarDados();
            mostrarNotificacao('✅ Logo adicionada com sucesso!', 'success');
          } catch (error) {
            mostrarNotificacao('❌ Erro ao comprimir imagem', 'danger');
          }
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
      salvarDados();
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
  console.log('🔗 Conectando eventos...');
  
  const btnSalvar = porId('btnSalvar');
  if (btnSalvar) {
    console.log('✅ Botão "Salvar" encontrado (oculto)');
  }

  const btnToggleAnim = porId('btnToggleAnim');
  if (btnToggleAnim) {
    btnToggleAnim.addEventListener('click', () => {
      ESTADO.animacoes = !ESTADO.animacoes;
      document.documentElement.classList.toggle('anim-off', !ESTADO.animacoes);
      btnToggleAnim.textContent = `Animações: ${ESTADO.animacoes ? 'ON' : 'OFF'}`;
    });
  }
  
  console.log('✅ Todos os eventos conectados!');
}

window.ESTADO = ESTADO;
window.renderizarEditorTimes = renderizarEditorTimes;
window.calcularEExibir = calcularEExibir;
window.porId = porId;
window.hexToRgba = hexToRgba;
window.mostrarNotificacao = mostrarNotificacao;
window.comprimirImagem = comprimirImagem;