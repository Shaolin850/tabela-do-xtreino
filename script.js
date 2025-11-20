/* script.js — Versão atualizada: 
   - Somente o fundo do pôster muda com temas aleatórios
   - Todas as letras na cor branca para melhor visualização
   - Coroa de rei MAIOR adicionada no campeão (1º lugar)
*/

/* ========== Estado e constantes ========== */
const ESTADO = {
  animacoes: true,
  times: [],
  tema: { primaria:'#00e7ff', secundaria:'#ff004c', bg:'#0a0b10', texto:'#e8f1ff' },
  estiloPoster: null
};
const NUM_TIMES = 12;
const NUM_QUEDAS = 4;

/* ========== Inicialização ========== */
document.addEventListener('DOMContentLoaded', () => {
  try {
    const salvo = JSON.parse(localStorage.getItem('xt_theme') || 'null');
    if (salvo) ESTADO.tema = salvo;
  } catch(e){}
  inicializarTimes();
  ligarEventosUI();
  aplicarTema(ESTADO.tema);
  renderizarEditorTimes();
  calcularEExibir();
});

/* ========== Helpers ========== */
function porId(id){ return document.getElementById(id); }
function escapeHtml(s){ return String(s || '').replace(/[&<>"']/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function randomFrom(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function randomInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
function randomBetween(a,b){ return a + Math.random()*(b-a); }

function hslToHex(h,s,l){
  s /= 100; l /= 100;
  const k = n => (n + h/30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const v = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(255 * v);
  };
  const r = f(0), g = f(8), b = f(4);
  const toHex = v => v.toString(16).padStart(2,'0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToRgba(hex, alpha){
  const c = (hex||'#000000').replace('#','');
  const r = parseInt(c.substring(0,2),16);
  const g = parseInt(c.substring(2,4),16);
  const b = parseInt(c.substring(4,6),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ========== Função para desenhar coroa MAIOR no campeão ========== */
function drawCrown(ctx, x, y, size, color = '#FFD700') {
  ctx.save();
  ctx.translate(x, y);
  
  // Corpo principal da coroa - AUMENTADO
  ctx.fillStyle = color;
  ctx.strokeStyle = '#FFA500';
  ctx.lineWidth = 3; // Linha mais grossa para destacar
  
  // Desenhar a coroa com 5 pontas - MAIOR
  ctx.beginPath();
  const spikeHeight = size * 0.5; // Pontas mais altas
  const baseWidth = size * 1.0;   // Base mais larga
  
  // Começar do lado esquerdo
  ctx.moveTo(-baseWidth/2, spikeHeight/2);
  
  // Desenhar as 5 pontas
  for(let i = 0; i < 5; i++) {
    // Pico da ponta
    ctx.lineTo(-baseWidth/2 + (baseWidth/4) * i, -spikeHeight/2);
    // Vale entre as pontas
    if(i < 4) {
      ctx.lineTo(-baseWidth/2 + (baseWidth/4) * (i + 0.5), spikeHeight/4);
    }
  }
  
  // Completar o retângulo base
  ctx.lineTo(baseWidth/2, spikeHeight/2);
  ctx.lineTo(-baseWidth/2, spikeHeight/2);
  
  ctx.fill();
  ctx.stroke();
  
  // Adicionar detalhes - joias nas pontas MAIORES
  ctx.fillStyle = '#FF6B6B';
  for(let i = 0; i < 5; i++) {
    ctx.beginPath();
    const jewelX = -baseWidth/2 + (baseWidth/4) * i;
    const jewelY = -spikeHeight/3;
    ctx.arc(jewelX, jewelY, size * 0.12, 0, Math.PI * 2); // Joias maiores
    ctx.fill();
  }

  // Adicionar brilho extra
  ctx.fillStyle = '#FFF9C4';
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.arc(0, -spikeHeight/6, size * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  
  ctx.restore();
}

/* ========== Inicializar times ========== */
function inicializarTimes(){
  ESTADO.times = Array.from({length: NUM_TIMES}).map((_,i)=>({
    id: i+1,
    nome: '',
    posQ: Array.from({length: NUM_QUEDAS}).map(()=>''),
    killsQ: Array.from({length: NUM_QUEDAS}).map(()=>0),
    booyas: 0,
    pontosBooya: 0,
    pontosPorPosicao: 0,
    totalKills: 0,
    score: 0,
    logoDataUrl: ''
  }));
}

/* ========== Vincular eventos UI ========== */
function ligarEventosUI(){
  const btnApply = porId('btnApplyTheme'); if(btnApply) btnApply.addEventListener('click', ()=> {
    const tema = {
      primaria: porId('colorPrimary').value,
      secundaria: porId('colorSecondary').value,
      bg: porId('colorBg').value,
      texto: porId('colorText').value
    };
    aplicarTema(tema, true);
  });
  const btnRandom = porId('btnRandomTheme'); if(btnRandom) btnRandom.addEventListener('click', temaAleatorio);

  const btnExportPNG = porId('btnExportPNG'); if(btnExportPNG) btnExportPNG.addEventListener('click', exportarPNG);
  const btnExportPDF = porId('btnExportPDF'); if(btnExportPDF) btnExportPDF.addEventListener('click', ()=>exportarPDF(false));
  const btnSharePDF = porId('btnSharePDF'); if(btnSharePDF) btnSharePDF.addEventListener('click', ()=>exportarPDF(true));
  const btnPosterTop3 = porId('btnPosterTop3'); if(btnPosterTop3) btnPosterTop3.addEventListener('click', gerarPosterTop3);
  const btnDownloadPoster = porId('btnDownloadPoster'); if(btnDownloadPoster) btnDownloadPoster.addEventListener('click', baixarPoster);
  const btnSharePoster = porId('btnSharePoster'); if(btnSharePoster) btnSharePoster.addEventListener('click', compartilharPoster);

  const btnClear = porId('btnClear'); if(btnClear) btnClear.addEventListener('click', ()=>{ inicializarTimes(); renderizarEditorTimes(); calcularEExibir(); });
  const btnCompute = porId('btnCompute'); if(btnCompute) btnCompute.addEventListener('click', ()=>{ calcularEExibir(); });

  const btnToggleAnim = porId('btnToggleAnim');
  if (btnToggleAnim){
    btnToggleAnim.addEventListener('click', ()=> {
      ESTADO.animacoes = !ESTADO.animacoes;
      document.documentElement.classList.toggle('anim-off', !ESTADO.animacoes);
      btnToggleAnim.textContent = `Animações: ${ESTADO.animacoes? 'ON':'OFF'}`;
    });
  }
}

/* ========== Tema da UI ========== */
function aplicarTema(tema, persist=false){
  ESTADO.tema = {...tema};
  document.documentElement.style.setProperty('--c-primary', tema.primaria);
  document.documentElement.style.setProperty('--c-secondary', tema.secundaria);
  document.documentElement.style.setProperty('--c-bg', tema.bg);
  document.documentElement.style.setProperty('--c-text', tema.texto);
  if(persist) localStorage.setItem('xt_theme', JSON.stringify(tema));
}

function temaAleatorio(){
  const presets = [
    {primaria:'#00e7ff', secundaria:'#ff6a8a', bg:'#06070a', texto:'#e8f1ff'},
    {primaria:'#ff9f1c', secundaria:'#ff2d95', bg:'#08020a', texto:'#fff7ef'},
    {primaria:'#7afcff', secundaria:'#ff6b6b', bg:'#04060a', texto:'#eafcff'},
    {primaria:'#b6ff6b', secundaria:'#6bd3ff', bg:'#061014', texto:'#f3fff7'},
    {primaria:'#ffd400', secundaria:'#ff3b3b', bg:'#0b0612', texto:'#fffbe6'}
  ];
  aplicarTema(presets[Math.floor(Math.random()*presets.length)], true);
}

/* ========== Render do Editor ========== */
function renderizarEditorTimes(){
  const container = porId('teamsContainer');
  if(!container) return;
  container.innerHTML = '';

  ESTADO.times.forEach((time, idx)=> {
    const card = document.createElement('div');
    card.className = 'team-card';

    let html = '';
    html += `<div class="team-row"><label>Slot ${time.id}</label><input type="text" placeholder="Nome da LINE/Equipe" value="${escapeHtml(time.nome||'')}" data-idx="${idx}" data-field="nome" /></div>`;

    html += `<div class="team-row" style="align-items:center;">
      <label style="width:70px">Booyas</label>
      <div style="display:flex;align-items:center;gap:6px;">
        <button class="btn tiny" data-action="dec-booya" data-idx="${idx}">-</button>
        <input type="number" min="0" value="${time.booyas||0}" data-idx="${idx}" data-field="booyas" style="width:56px;text-align:center;" />
        <button class="btn tiny" data-action="inc-booya" data-idx="${idx}">+</button>
      </div>
    </div>`;

    html += `<div style="margin-top:8px;font-size:13px;color:var(--muted)">Quedas (Posição / Kills)</div>`;
    html += `<div class="quedas-row">`;
    for(let q=0;q<NUM_QUEDAS;q++){
      html += `
        <div class="queda-box">
          <label style="font-size:12px">Q${q+1} - Posição</label>
          <input type="number" min="1" max="${NUM_TIMES}" value="${time.posQ[q]||''}" data-idx="${idx}" data-field="posQ" data-q="${q}" style="width:96px"/>
          <label style="font-size:12px">Q${q+1} - Kills</label>
          <input type="number" min="0" value="${time.killsQ[q]||0}" data-idx="${idx}" data-field="killsQ" data-q="${q}" style="width:96px"/>
        </div>`;
    }
    html += `</div>`;

    html += `<div class="team-row" style="margin-top:8px;">
      <div class="logo-input">
        <label class="btn tiny ghost" for="logo-${idx}">Logo</label>
        <input id="logo-${idx}" type="file" accept="image/*" data-idx="${idx}" data-field="logo" style="display:none"/>
        <img class="logo-preview" id="logo-prev-${idx}" src="${time.logoDataUrl || ''}" alt="logo preview"/>
      </div>
    </div>`;

    card.innerHTML = html;
    container.appendChild(card);
  });

  container.querySelectorAll('input, button').forEach(el=>{
    const idx = el.dataset.idx !== undefined ? parseInt(el.dataset.idx,10) : null;
    const field = el.dataset.field;

    if (el.dataset.action === 'inc-booya'){
      el.addEventListener('click', ()=> {
        if (idx==null) return;
        ESTADO.times[idx].booyas = (parseInt(ESTADO.times[idx].booyas,10)||0) + 1;
        ESTADO.times[idx].pontosBooya = (ESTADO.times[idx].booyas || 0) * 20;
        ESTADO.times[idx].pontosPorPosicao = ESTADO.times[idx].pontosBooya;
        renderizarEditorTimes(); calcularEExibir();
      });
      return;
    }
    if (el.dataset.action === 'dec-booya'){
      el.addEventListener('click', ()=> {
        if (idx==null) return;
        ESTADO.times[idx].booyas = Math.max(0, (parseInt(ESTADO.times[idx].booyas,10)||0) - 1);
        ESTADO.times[idx].pontosBooya = (ESTADO.times[idx].booyas||0) * 20;
        ESTADO.times[idx].pontosPorPosicao = ESTADO.times[idx].pontosBooya;
        renderizarEditorTimes(); calcularEExibir();
      });
      return;
    }

    if (field === 'logo'){
      el.addEventListener('change', (e)=> {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ()=> {
          ESTADO.times[idx].logoDataUrl = reader.result;
          const prev = porId(`logo-prev-${idx}`);
          if (prev) prev.src = reader.result;
        };
        reader.readAsDataURL(file);
      });
      return;
    }

    el.addEventListener('input', (e)=>{
      const val = e.target.value;
      const q = e.target.dataset.q !== undefined ? parseInt(e.target.dataset.q,10) : null;
      switch(field){
        case 'nome':
          ESTADO.times[idx].nome = val;
          break;
        case 'booyas':
          ESTADO.times[idx].booyas = (val === '') ? 0 : Math.max(0, parseInt(val,10)||0);
          ESTADO.times[idx].pontosBooya = (ESTADO.times[idx].booyas || 0) * 20;
          ESTADO.times[idx].pontosPorPosicao = ESTADO.times[idx].pontosBooya;
          break;
        case 'posQ':
          if (q!=null){
            ESTADO.times[idx].posQ[q] = (val === '') ? '' : Math.max(1, Math.min(NUM_TIMES, parseInt(val,10)||'' ));
            e.target.value = ESTADO.times[idx].posQ[q] || '';
            ESTADO.times[idx].booyas = ESTADO.times[idx].posQ.reduce((s,p)=> s + ((parseInt(p,10)===1)?1:0), 0);
          }
          break;
        case 'killsQ':
          if (q!=null){
            ESTADO.times[idx].killsQ[q] = (val === '') ? 0 : Math.max(0, parseInt(val,10)||0);
          }
          break;
      }
      calcularEExibir();
    });
  });
}

/* ========== Cálculo de pontuação ========== */
function calcularPontuacaoTime(time){
  const totalKills = Array.isArray(time.killsQ) ? time.killsQ.reduce((s,n)=> s + (parseInt(n,10)||0), 0) : 0;

  let booyas = 0;
  let pontosPorPosicao = 0;
  if (Array.isArray(time.posQ)){
    for (let i=0; i<time.posQ.length; i++){
      const p = parseInt(time.posQ[i], 10);
      if (p === 1){ booyas += 1; pontosPorPosicao += 20; }
      else if (p === 2) { pontosPorPosicao += 15; }
      else if (p === 3) { pontosPorPosicao += 10; }
    }
  } else {
    booyas = parseInt(time.booyas,10) || 0;
    pontosPorPosicao = booyas * 20;
  }

  const score = (totalKills * 5) + pontosPorPosicao;

  return { totalKills, score, booyas, pontosPorPosicao };
}

function calcularEExibir(){
  ESTADO.times.forEach(t=>{
    if(!Array.isArray(t.killsQ)) t.killsQ = Array.from({length: NUM_QUEDAS}).map(()=>0);
    if(!Array.isArray(t.posQ)) t.posQ = Array.from({length: NUM_QUEDAS}).map(()=>'');

    t.booyas = t.posQ.reduce((s,p)=> s + ((parseInt(p,10)===1)?1:0), 0);

    const c = calcularPontuacaoTime(t);
    t.totalKills = c.totalKills;
    t.score = c.score;
    t.pontosPorPosicao = c.pontosPorPosicao;
    t.pontosBooya = c.pontosPorPosicao;
  });

  const linhas = ESTADO.times.map(t=>({
    ...t,
    totalKills: t.totalKills || 0,
    score: t.score || 0,
    booyas: t.booyas || 0,
    pontosBooya: t.pontosBooya || 0,
    pontosPorPosicao: t.pontosPorPosicao || 0
  }));

  linhas.sort((a,b)=>{
    if ((b.score||0) !== (a.score||0)) return (b.score||0) - (a.score||0);
    if ((b.totalKills||0) !== (a.totalKills||0)) return (b.totalKills||0) - (a.totalKills||0);
    if ((b.booyas||0) !== (a.booyas||0)) return (b.booyas||0) - (a.booyas||0);
    return (a.id || 0) - (b.id || 0);
  });

  renderizarTabelaPontuacao(linhas);
  renderizarPodio(linhas);

  const out = porId('timesResumo');
  if (out) {
    out.innerHTML = montarTabelaTimesResumo(ESTADO.times);
  }
}

/* ========== Render tabela ========== */
function renderizarTabelaPontuacao(linhas){
  const tbody = porId('scoreBody');
  if(!tbody) return;
  tbody.innerHTML = '';

  linhas.forEach((t, idx) => {
    const tr = document.createElement('tr');
    const rankClass = idx===0 ? 'rank-1' : idx===1 ? 'rank-2' : idx===2 ? 'rank-3' : '';
    tr.className = rankClass;

    const posQTexto = t.posQ.map((p,i)=> `${p || '-'}`).join(' • ');
    tr.innerHTML = `
      <td><span class="badge ${idx>2?'ghost':''}">${idx+1}</span></td>
      <td>${escapeHtml(t.nome || `LINE ${t.id}`)}</td>
      <td style="white-space:nowrap;">${posQTexto}</td>
      <td style="text-align:center;">${t.booyas ?? 0}</td>
      <td style="text-align:center;">${t.pontosPorPosicao ?? 0}</td>
      <td style="text-align:center;">${t.totalKills ?? 0}</td>
      <td style="text-align:right;"><strong>${t.score ?? 0}</strong></td>
    `;
    tbody.appendChild(tr);
  });
}

/* ========== Podio ========== */
function renderizarPodio(sortedLinhas){
  const t1 = sortedLinhas[0] || {}, t2 = sortedLinhas[1] || {}, t3 = sortedLinhas[2] || {};
  definirPodio('1', t1); definirPodio('2', t2); definirPodio('3', t3);
}

function definirPodio(slot, t){
  const nomeEl = porId(`podium${slot}Name`);
  const scoreEl = porId(`podium${slot}Score`);
  const logoEl = porId(`podium${slot}Logo`);
  if(!nomeEl || !scoreEl || !logoEl) return;
  if(!t || (!t.nome && (t.score===undefined))){
    nomeEl.textContent = '—'; scoreEl.textContent = '0 pts'; logoEl.src = ''; logoEl.style.visibility = 'hidden'; return;
  }
  nomeEl.textContent = t.nome || `LINE ${t.id}`;
  scoreEl.textContent = `${t.score ?? 0} pts • ${t.totalKills ?? 0} kills • ${t.booyas || 0} booyas • ${t.pontosPorPosicao || 0} ptsPos`;
  if(t.logoDataUrl){ logoEl.src = t.logoDataUrl; logoEl.style.visibility = 'visible'; }
  else { logoEl.src = ''; logoEl.style.visibility = 'hidden'; }
}

/* ========== Pôster TOP 3 - ATUALIZADO ========== */
const POSTER_PRESETS = [
  { name:'Vermelho Néon', pal:{bg:['#0b0507','#3a0008']}, effect:'rays' },
  { name:'Neon Aqua', pal:{bg:['#001219','#002b36']}, effect:'glow' },
  { name:'Sunset', pal:{bg:['#2b0707','#3a1a1a']}, effect:'confetti' },
  { name:'Emerald', pal:{bg:['#041412','#073527']}, effect:'particles' },
  { name:'Royal', pal:{bg:['#0a0412','#2b072e']}, effect:'minimal' },
  { name:'Midnight Stars', pal:{bg:['#03031a','#07133a']}, effect:'stars' },
  { name:'Cyberpunk', pal:{bg:['#100014','#2b001f']}, effect:'glow' },
  { name:'Desert', pal:{bg:['#2b1a07','#3a2a0a']}, effect:'particles' },
  { name:'Ocean Mist', pal:{bg:['#021826','#003544']}, effect:'aurora' }
];

const POSTER_EFFECTS = ['rays','glow','confetti','particles','minimal','stars','aurora','geometric','bokeh','glitch','wave'];

function getPosterPreset(){
  if (Math.random() < 0.55) return gerarPresetAleatorio();
  return POSTER_PRESETS[Math.floor(Math.random()*POSTER_PRESETS.length)];
}

function gerarPresetAleatorio(){
  const schemes = ['cool','warm','neon','muted','pastel','mono'];
  const scheme = randomFrom(schemes);

  let baseHue;
  if (scheme === 'cool') baseHue = randomInt(180,260);
  else if (scheme === 'warm') baseHue = randomInt(0,60);
  else if (scheme === 'neon') baseHue = randomInt(280,360);
  else if (scheme === 'muted') baseHue = randomInt(20,220);
  else if (scheme === 'pastel') baseHue = randomInt(0,360);
  else baseHue = randomInt(0,360);

  const sat = scheme === 'pastel' ? randomInt(35,55) : (scheme === 'muted' ? randomInt(18,36) : randomInt(60,95));
  const primLight = scheme === 'pastel' ? randomInt(65,85) : randomInt(40,65);

  const bgHue = (baseHue + randomInt(-30,30) + 360)%360;
  const bg1 = hslToHex(bgHue, Math.max(12, sat-20), Math.max(4, primLight - 48));
  const bg2 = hslToHex((bgHue + randomInt(10,50))%360, Math.max(8, sat-30), Math.max(6, primLight - 36));

  const effect = randomFrom(POSTER_EFFECTS);
  const name = `Aleatório ${String(Math.floor(Math.random()*9000)+1000)} • ${scheme}`;

  return {
    name,
    pal: { bg: [bg1, bg2] },
    effect
  };
}

/* ========== FUNÇÃO PRINCIPAL DO PÔSTER ATUALIZADA ========== */
async function gerarPosterTop3(){
  const canvas = porId('posterCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const preset = getPosterPreset();
  ESTADO.estiloPoster = preset;

  const linhas = ESTADO.times.map(t=>{
    const c = calcularPontuacaoTime(t);
    return {...t, totalKills: c.totalKills, score: c.score, booyas: c.booyas, pontosPorPosicao: c.pontosPorPosicao};
  }).sort((a,b)=> (b.score||0)-(a.score||0) || (b.totalKills||0)-(a.totalKills||0) );

  const top = [linhas[0], linhas[1], linhas[2]].filter(Boolean);

  // Background com tema aleatório
  const grad = ctx.createLinearGradient(0,0,0,canvas.height);
  grad.addColorStop(0, preset.pal.bg[0]);
  grad.addColorStop(1, preset.pal.bg[1] || preset.pal.bg[0]);
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // *** ATUALIZAÇÃO: TODOS OS TEXTOS EM BRANCO ***
  const textColor = '#ffffff';
  const headerTextColor = '#ffffff';
  const subtitleColor = '#ffffff';
  const statsColor = '#ffffff';

  // Efeitos de fundo (mantidos)
  if (preset.effect === 'rays'){
    ctx.save(); ctx.globalAlpha = 0.08;
    for(let i=0;i<22;i++){
      ctx.beginPath();
      const ang = (i/22)*Math.PI*2;
      ctx.moveTo(canvas.width/2, canvas.height*0.68);
      ctx.lineTo(canvas.width/2 + Math.cos(ang)*canvas.width*1.6, canvas.height*0.68 + Math.sin(ang)*canvas.height*1.3);
      ctx.lineWidth = 90;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }
    ctx.restore();
  } else if (preset.effect === 'glow'){
    const radial = ctx.createRadialGradient(canvas.width/2, canvas.height*0.32, 30, canvas.width/2, canvas.height*0.32, canvas.width*0.9);
    radial.addColorStop(0, 'rgba(255,255,255,0.28)');
    radial.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = radial; ctx.fillRect(0,0,canvas.width,canvas.height);
  } else if (preset.effect === 'confetti'){
    for(let i=0;i<140;i++){
      ctx.fillStyle = randomFrom(['#ffffff', '#ffd700', '#ff6b6b']);
      const w = 6 + Math.random()*12;
      const x = Math.random()*canvas.width;
      const y = Math.random()*canvas.height*0.8;
      ctx.fillRect(x,y,w, Math.max(4, Math.random()*12));
    }
  } else if (preset.effect === 'particles'){
    for(let i=0;i<120;i++){
      ctx.beginPath();
      ctx.globalAlpha = 0.04 + Math.random()*0.18;
      ctx.fillStyle = randomFrom(['#ffffff', '#ffd700', '#ff6b6b']);
      ctx.arc(Math.random()*canvas.width, Math.random()*canvas.height, 6+Math.random()*26, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (preset.effect === 'stars'){
    for(let i=0;i<240;i++){
      ctx.beginPath();
      const x = Math.random()*canvas.width;
      const y = Math.random()*canvas.height*0.9;
      const r = Math.random()*1.8 + 0.4;
      ctx.fillStyle = hexToRgba('#ffffff', 0.6 + Math.random()*0.4);
      ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fill();
    }
  } else if (preset.effect === 'aurora'){
    const g = ctx.createLinearGradient(0, canvas.height*0.1, canvas.width, canvas.height*0.55);
    g.addColorStop(0, 'rgba(255,255,255,0.12)');
    g.addColorStop(0.5, 'rgba(255,215,0,0.08)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, canvas.height*0.05, canvas.width, canvas.height*0.8);
  } else if (preset.effect === 'geometric'){
    ctx.save(); ctx.globalAlpha = 0.06;
    for(let i=0;i<28;i++){
      ctx.beginPath();
      const size = 120 + Math.random()*280;
      const x = Math.random()*canvas.width;
      const y = Math.random()*canvas.height;
      ctx.fillStyle = randomFrom(['#ffffff', '#ffd700', '#ff6b6b']);
      ctx.fillRect(x - size/2, y - size/2, size, size);
    }
    ctx.restore();
  } else if (preset.effect === 'bokeh'){
    for(let i=0;i<120;i++){
      ctx.beginPath();
      const r = 20 + Math.random()*120;
      ctx.globalAlpha = 0.03 + Math.random()*0.22;
      ctx.fillStyle = randomFrom(['#ffffff', '#ffd700', '#ff6b6b']);
      ctx.arc(Math.random()*canvas.width, Math.random()*canvas.height, r, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (preset.effect === 'glitch'){
    for(let i=0;i<40;i++){
      ctx.fillStyle = randomFrom(['#ffffff', '#ffd700', '#000000']);
      const h = 2 + Math.random()*8;
      ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, Math.random()*40 + 20, h);
    }
  } else if (preset.effect === 'wave'){
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#ffffff';
    for(let i=0;i<6;i++){
      ctx.beginPath();
      const amp = 16 + i*10;
      ctx.moveTo(0, canvas.height*0.2 + i*80);
      for(let x=0;x<canvas.width;x+=20){
        ctx.lineTo(x, canvas.height*0.2 + i*80 + Math.sin((x/200)+i)*amp);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Header - TODOS OS TEXTOS EM BRANCO
  ctx.textAlign = 'center';
  ctx.fillStyle = headerTextColor;
  ctx.font = 'bold 64px Arial';
  ctx.fillText('TOP 3', canvas.width/2, 100);
  ctx.font = '600 20px Arial';
  ctx.fillStyle = subtitleColor;
  ctx.fillText('XTREINO TOMAN — RESULTADOS', canvas.width/2, 132);

  const slots = [
    {rank:1, x: canvas.width/2, y: 420, size: 360},
    {rank:2, x: canvas.width*0.22, y: 720, size: 220},
    {rank:3, x: canvas.width*0.78, y: 720, size: 220}
  ];

  const loadImage = (src)=> new Promise((res,rej)=>{ const img = new Image(); img.crossOrigin='anonymous'; img.onload=()=>res(img); img.onerror=rej; img.src=src; });

  for (let i=0;i<slots.length;i++){
    const s = slots[i];
    const t = top[i];
    if (!t) continue;

    ctx.save();
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size/2 + 20, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fill();
    ctx.closePath();
    ctx.restore();

    if (t.logoDataUrl){
      try{
        const img = await loadImage(t.logoDataUrl);
        ctx.save();
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size/2, 0, Math.PI*2);
        ctx.closePath();
        ctx.clip();
        const iw = img.width, ih = img.height;
        const ratio = Math.max((s.size)/(iw), (s.size)/(ih));
        const dw = iw * ratio, dh = ih * ratio;
        ctx.drawImage(img, (s.x - dw/2), (s.y - dh/2), dw, dh);
        ctx.restore();
      } catch(e){
        drawLogoPlaceholder(ctx, s);
      }
    } else {
      drawLogoPlaceholder(ctx, s);
    }

    // *** ADICIONAR COROA MAIOR NO CAMPEÃO (1º LUGAR) ***
    
    
    // Título "CAMPEÃO" apenas para o primeiro colocado
    if (s.rank === 1) {
      ctx.fillStyle = '#FFD700'; // Dourado para o título CAMPEÃO
      ctx.font = `900 42px Arial`;
      ctx.fillText('CAMPEÃO', s.x, s.y + s.size/2 + 50);
    }

    // Nome da equipe - BRANCO
    ctx.fillStyle = textColor;
    ctx.font = `800 ${s.rank===1?36:22}px Arial`;
    ctx.fillText((t.nome || `LINE ${t.id}`).toUpperCase(), s.x, s.y + s.size/2 + (s.rank===1?90:48));
    
    // Estatísticas - BRANCO
    ctx.fillStyle = statsColor;
    ctx.font = `700 ${s.rank===1?28:18}px Arial`;
    
    // Texto mais detalhado com informações
    const statsText = `${t.score || 0} pts • ${t.totalKills || 0} kills • ${t.booyas || 0} booyas`;
    ctx.fillText(statsText, s.x, s.y + s.size/2 + (s.rank===1?130:76));
  }

  // Rodapé - TEXTO EM BRANCO
  const footerPhrase = 'Parabéns aos Campeões do Xtreino da TOMAN ☯️!';
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = '#000000';
  const footerHeight = 68;
  ctx.fillRect(0, canvas.height - footerHeight, canvas.width, footerHeight);
  ctx.restore();

  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 20px Arial';
  ctx.fillText(footerPhrase, canvas.width/2, canvas.height - 26);
  ctx.restore();

  ctx.save();
  ctx.font = '400 12px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.66)';
  ctx.textAlign = 'left';
  ctx.fillText('', 20, canvas.height - 10);
  ctx.restore();
}

function drawLogoPlaceholder(ctx, s){
  ctx.save();
  ctx.beginPath();
  ctx.arc(s.x, s.y, s.size/2, 0, Math.PI*2);
  ctx.fillStyle = '#111';
  ctx.fill();
  ctx.closePath();
  ctx.restore();
  ctx.fillStyle = '#fff';
  ctx.font = '700 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('LOGO', s.x, s.y+10);
}

/* ========== Poster helpers ========== */
function baixarPoster(){
  const canvas = porId('posterCanvas'); if(!canvas) return;
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a'); a.href = url; a.download = `poster_top3_xtreino_${Date.now()}.png`; a.click();
}

async function compartilharPoster(){
  const canvas = porId('posterCanvas'); if(!canvas) return;
  const blob = await new Promise(r=> canvas.toBlob(r,'image/png'));
  if(!blob) return;
  const file = new File([blob], `poster_top3_xtreino_${Date.now()}.png`, {type:'image/png'});
  if(navigator.canShare && navigator.canShare({files:[file]})){
    try{ await navigator.share({title:'Pôster TOP 3 — XTreino TOMAN', text:'Campeões da rodada!', files:[file]}); }catch(e){}
  } else { baixarPoster(); }
}

/* ========== Exportar PDF ========== */
async function exportarPDF(tryShare = false){
  const { jsPDF } = window.jspdf || {};
  if(!jsPDF){ alert('jsPDF não carregado'); return; }

  const linhas = ESTADO.times.map(t=>{
    const c = calcularPontuacaoTime(t);
    return {...t, totalKills: c.totalKills, score: c.score, booyas: c.booyas, pontosBooya: c.pontosBooya};
  }).sort((a,b)=> (b.score||0)-(a.score||0) || (b.totalKills||0)-(a.totalKills||0) || (b.booyas||0)-(a.booyas||0) );

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
  pdf.text('Kills', col.killsX, y+6);
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

/* ========== Resumo timesResumo ========== */
function montarTabelaTimesResumo(times){
  if(!Array.isArray(times)) return '<div class="muted">Nenhum time configurado.</div>';
  let html = '<table class="times-table"><thead><tr><th>Line</th>';
  for(let i=0;i<NUM_QUEDAS;i++) html += `<th>Q${i+1}</th>`;
  html += '<th>Booyas</th><th>Pts Pos</th><th>Kills</th></tr></thead><tbody>';
  times.forEach(t=>{
    const c = calcularPontuacaoTime(t);
    const totalKills = (t.totalKills !== undefined) ? t.totalKills : c.totalKills;
    const pontosPos = (t.pontosPorPosicao !== undefined) ? t.pontosPorPosicao : c.pontosPorPosicao;
    html += `<tr><td>${escapeHtml(t.nome||`LINE ${t.id}`)}</td>`;
    for(let i=0;i<NUM_QUEDAS;i++){
      const pos = (t.posQ && t.posQ[i] != null) ? t.posQ[i] : '-';
      html += `<td style="white-space:nowrap;">${pos}</td>`;
    }
    html += `<td>${t.booyas||0}</td>`;
    html += `<td style="text-align:center;">${pontosPos}</td>`;
    html += `<td style="text-align:center;">${totalKills}</td></tr>`;
  });
  html += '</tbody></table>';
  return html;
}

window.renderizarEditorTimes = renderizarEditorTimes;
window.calcularEExibir = calcularEExibir;

document.addEventListener('DOMContentLoaded', function(){
  const out = porId('timesResumo');
  if(out) out.innerHTML = montarTabelaTimesResumo(ESTADO.times);
});
