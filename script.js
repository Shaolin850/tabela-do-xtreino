/* script.js
   Lógica em Português (comentários e funções principais) conforme solicitado.
*/

const ESTADO = {
  animacoes: true,
  times: [], // {id, nome, posicao, jogadores:[{nome,kills}], logoDataUrl}
  tema: {
    primaria: '#00e7ff',
    secundaria: '#ff004c',
    bg: '#0a0b10',
    texto: '#e8f1ff'
  },
  estiloPoster: null // será preenchido ao gerar o pôster
};

const NUM_TIMES = 12;
const NUM_JOGADORES = 4;

// ================== Inicialização ==================
document.addEventListener('DOMContentLoaded', () => {
  try {
    const salvo = JSON.parse(localStorage.getItem('xt_theme')||'null');
    if(salvo) ESTADO.tema = salvo;
  } catch {}
  inicializarTimes();
  ligarEventosUI();
  aplicarTema(ESTADO.tema);
  renderizarEditorTimes();
  calcularEExibir();
});

// ================== Helpers DOM ==================
function porId(id){ return document.getElementById(id); }
function ligarClique(id, fn){ const el = porId(id); if(el) el.addEventListener('click', fn); }

// ================== Inicialização dos times ==================
function inicializarTimes(){
  ESTADO.times = Array.from({length: NUM_TIMES}).map((_,i)=>({
    id: i+1,
    nome: '',
    posicao: '', // 1..12
    jogadores: Array.from({length: NUM_JOGADORES}).map(()=>({nome:'', kills:''})),
    logoDataUrl: ''
  }));
}

// ================== Vincular UI ==================
function ligarEventosUI(){
  // Tema
  ligarClique('btnRandomTheme', temaAleatorio);
  ligarClique('btnApplyTheme', ()=>{
    const prox = {
      primaria: porId('colorPrimary').value,
      secundaria: porId('colorSecondary').value,
      bg: porId('colorBg').value,
      texto: porId('colorText').value
    };
    aplicarTema(prox, true);
  });

  // Animações
  ligarClique('btnToggleAnim', ()=>{
    ESTADO.animacoes = !ESTADO.animacoes;
    document.documentElement.classList.toggle('anim-off', !ESTADO.animacoes);
    porId('btnToggleAnim').textContent = `Animações: ${ESTADO.animacoes? 'ON':'OFF'}`;
  });

  // Exportações
  ligarClique('btnExportPNG', exportarPNG);
  ligarClique('btnExportPDF', ()=> exportarPDF(false));
  ligarClique('btnSharePDF', ()=> exportarPDF(true));

  // Pôster
  ligarClique('btnPosterTop3', gerarPosterTop3);
  ligarClique('btnDownloadPoster', baixarPoster);
  ligarClique('btnSharePoster', compartilharPoster);

  // Editor
  ligarClique('btnClear', ()=>{ inicializarTimes(); renderizarEditorTimes(); calcularEExibir(); });
  ligarClique('btnCompute', calcularEExibir);
}

// ================== Tema ==================
function aplicarTema(tema, persist=false){
  ESTADO.tema = {...tema};
  document.documentElement.style.setProperty('--c-primary', tema.primaria);
  document.documentElement.style.setProperty('--c-secondary', tema.secundaria);
  document.documentElement.style.setProperty('--c-bg', tema.bg);
  document.documentElement.style.setProperty('--c-text', tema.texto);

  const mapa = {colorPrimary:'primaria',colorSecondary:'secundaria',colorBg:'bg',colorText:'texto'};
  Object.keys(mapa).forEach(k=>{
    const el = porId(k);
    if(el) el.value = tema[mapa[k]];
  });

  if(persist){
    localStorage.setItem('xt_theme', JSON.stringify(tema));
  }
}

function temaAleatorio(){
  const presets = [
    {primaria:'#00e7ff', secundaria:'#ff004c', bg:'#0a0b10', texto:'#e8f1ff'},
    {primaria:'#12ff7f', secundaria:'#6d28d9', bg:'#07090e', texto:'#f0f4ff'},
    {primaria:'#ffd400', secundaria:'#ff006e', bg:'#0b0612', texto:'#fff6d6'},
    {primaria:'#a3ff00', secundaria:'#00c2ff', bg:'#020409', texto:'#e6faff'},
    {primaria:'#ff7a00', secundaria:'#00ffc6', bg:'#0b0f14', texto:'#f7fbff'}
  ];
  const prox = presets[Math.floor(Math.random()*presets.length)];
  aplicarTema(prox,true);
}

// ================== Editor das LINEs ==================
function renderizarEditorTimes(){
  const container = porId('teamsContainer');
  if(!container) return;
  container.innerHTML = '';

  ESTADO.times.forEach((time, idx)=>{
    const card = document.createElement('div');
    card.className = 'team-card';

    const teamHeader = `
      <div class="team-row">
        <label>Slot ${time.id}</label>
        <input type="text" placeholder="Nome da LINE/Equipe" value="${time.nome}" data-idx="${idx}" data-field="nome"/>
      </div>
      <div class="team-row">
        <label>Posição</label>
        <input type="number" min="1" max="${NUM_TIMES}" placeholder="1-${NUM_TIMES}" value="${time.posicao}" data-idx="${idx}" data-field="posicao"/>
        <div class="logo-input">
          <label class="btn tiny ghost" for="logo-${idx}">Logo</label>
          <input id="logo-${idx}" type="file" accept="image/*" data-idx="${idx}" data-field="logo" style="display:none"/>
          <img class="logo-preview" id="logo-prev-${idx}" src="${time.logoDataUrl || ''}" alt="logo preview"/>
        </div>
      </div>
    `;

    const jogadores = time.jogadores.map((p, pIdx)=>`
      <div class="team-row">
        <input type="text" placeholder="Jogador ${pIdx+1}" value="${p.nome}" data-idx="${idx}" data-pidx="${pIdx}" data-field="nomeJogador"/>
        <input type="number" min="0" placeholder="Kills" value="${p.kills}" data-idx="${idx}" data-pidx="${pIdx}" data-field="killsJogador"/>
      </div>
    `).join('');

    card.innerHTML = teamHeader + jogadores;
    container.appendChild(card);
  });

  // Bind inputs
  container.querySelectorAll('input').forEach(input=>{
    const idx = parseInt(input.dataset.idx,10);
    const field = input.dataset.field;

    if(field === 'logo'){
      input.addEventListener('change', (e)=>{
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          ESTADO.times[idx].logoDataUrl = reader.result;
          const prev = porId(`logo-prev-${idx}`);
          if(prev) prev.src = reader.result;
        };
        reader.readAsDataURL(file);
      });
      return;
    }

    input.addEventListener('input', (e)=>{
      const value = e.target.value;
      const pidx = e.target.dataset.pidx ? parseInt(e.target.dataset.pidx,10) : null;

      switch(field){
        case 'nome': ESTADO.times[idx].nome = value; break;
        case 'posicao': ESTADO.times[idx].posicao = limitarInteiro(value,1,NUM_TIMES); e.target.value = ESTADO.times[idx].posicao || ''; break;
        case 'nomeJogador': ESTADO.times[idx].jogadores[pidx].nome = value; break;
        case 'killsJogador': ESTADO.times[idx].jogadores[pidx].kills = somenteInteiro(value); e.target.value = ESTADO.times[idx].jogadores[pidx].kills; break;
      }
    });
  });
}

function limitarInteiro(v, min, max){
  const n = parseInt(v,10);
  if(Number.isNaN(n)) return '';
  return Math.max(min, Math.min(max, n));
}
function somenteInteiro(v){
  const n = parseInt(v,10);
  return Number.isNaN(n) || n<0 ? '' : n.toString();
}

// ================== Cálculo / Renderização ==================
/*
  Regras:
  - totalKills = soma das kills dos 4 jogadores
  - bônus por posição: 1 -> +20 / 2 -> +15 / 3 -> +10
  - scoreFinal = totalKills * 5 + bonus
  Ordenação para exibição:
  - scoreFinal (desc)
  - totalKills (desc)
  - posição (asc)
*/
function calcularPontuacaoTime(time){
  const totalKills = time.jogadores.reduce((s,p)=> s + (parseInt(p.kills,10) || 0), 0);
  const pos = parseInt(time.posicao,10);
  let bonus = 0;
  if(pos === 1) bonus = 20;
  else if(pos === 2) bonus = 15;
  else if(pos === 3) bonus = 10;
  const score = totalKills * 5 + bonus;
  return { totalKills, bonus, score, pos };
}

function calcularEExibir(){
  const linhas = ESTADO.times.map(t=>{
    const calc = calcularPontuacaoTime(t);
    return {...t, totalKills: calc.totalKills, bonus: calc.bonus, score: calc.score, pos: calc.pos};
  });

  // Ordena para ranking geral conforme regras
  linhas.sort((a,b)=>{
    if((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
    if((b.totalKills || 0) !== (a.totalKills || 0)) return (b.totalKills || 0) - (a.totalKills || 0);
    const pa = a.pos || 999, pb = b.pos || 999;
    return pa - pb;
  });

  renderizarTabelaPontuacao(linhas);
  renderizarPodio(linhas);
}

function renderizarTabelaPontuacao(linhas){
  const tbody = porId('scoreBody');
  if(!tbody) return;
  tbody.innerHTML = '';
  linhas.forEach((t, idx)=>{
    const tr = document.createElement('tr');
    const rankClass = idx===0 ? 'rank-1' : idx===1 ? 'rank-2' : idx===2 ? 'rank-3' : '';
    tr.className = rankClass;
    tr.innerHTML = `
      <td><span class="badge ${idx>2?'ghost':''}">${idx+1}</span></td>
      <td>${t.nome || `LINE ${t.id}`}</td>
      <td>${t.totalKills ?? 0}</td>
      <td>${t.bonus ?? 0}</td>
      <td><strong>${t.score ?? 0}</strong></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderizarPodio(sortedLinhas){
  const t1 = sortedLinhas[0] || {}, t2 = sortedLinhas[1] || {}, t3 = sortedLinhas[2] || {};
  definirPodio('1', t1); definirPodio('2', t2); definirPodio('3', t3);
}

function definirPodio(slot, t){
  const nomeEl = porId(`podium${slot}Name`);
  const scoreEl = porId(`podium${slot}Score`);
  const logoEl = porId(`podium${slot}Logo`);
  if(!nomeEl || !scoreEl || !logoEl) return;

  if(!t || (!t.nome && !t.score)){
    nomeEl.textContent = '—'; scoreEl.textContent = '0 pts';
    logoEl.src = ''; logoEl.style.visibility = 'hidden'; return;
  }
  nomeEl.textContent = t.nome || `LINE ${t.id}`;
  scoreEl.textContent = `${t.score ?? 0} pts`;
  if(t.logoDataUrl){ logoEl.src = t.logoDataUrl; logoEl.style.visibility = 'visible'; }
  else { logoEl.src = ''; logoEl.style.visibility = 'hidden'; }
}

// ================== Exportações ==================
async function exportarPNG(){
  const node = porId('scoreboard');
  if(!node) return;
  const canvas = await html2canvas(node, {backgroundColor: null, scale: 2});
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = `tabela_xtreino_toman_${Date.now()}.png`;
  a.click();
}


/* =====================
   exportarPDF — versão atualizada
   - Remove o logo ☯️ do PDF (mantém no HTML)
   - Estilo: preto, branco e vermelho
   - "Cores animadas" simuladas com faixas/gradientes dinâmicos
   - Inclui todos os 12 slots
   ===================== */
async function exportarPDF(tryShare = false) {
  const { jsPDF } = window.jspdf || {};
  if(!jsPDF){ alert('jsPDF não carregado'); return; }

  // Cria PDF em A4 (px)
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const margin = 28;
  const contentWidth = W - margin*2;

  // -------------------- Fundo "animado" (simulado) --------------------
  // Base preta
  pdf.setFillColor('#000000');
  pdf.rect(0,0,W,H,'F');

  // Gera faixas diagonais vermelhas translúcidas simulando movimento/ani­mação
  // Como jsPDF não tem alpha direto, geramos tons mais claros de vermelho para dar sensação de transparência
  function hexToRgb(hex){
    const h = hex.replace('#','');
    return [parseInt(h.substring(0,2),16), parseInt(h.substring(2,4),16), parseInt(h.substring(4,6),16)];
  }
  function rgbToHex(r,g,b){ return '#' + [r,g,b].map(v=>v.toString(16).padStart(2,'0')).join(''); }
  function mixHex(a,b,t){
    const ra = hexToRgb(a), rb = hexToRgb(b);
    const rc = [0,1,2].map(i=>Math.round(ra[i] + (rb[i]-ra[i])*t));
    return rgbToHex(rc[0], rc[1], rc[2]);
  }

  const vermelhoBase = '#c8102e'; // vermelho vibrante
  const vermelhoDark = '#6b000a';
  // desenha várias faixas diagonais
  const faixaCount = 26;
  for(let i=0;i<faixaCount;i++){
    const t = i/faixaCount;
    // alterna intensidade para criar sensação de movimento
    const cor = mixHex(vermelhoDark, vermelhoBase, (Math.sin(t*Math.PI*2)+1)/2 * 0.7 + 0.15);
    pdf.setFillColor(cor);
    // desenha retângulos inclinados calculando uma grande largura e deslocamento em Y
    const w = W*1.2;
    const h = Math.max(30, 18 + Math.round(Math.abs(Math.sin(t*12))*36));
    const y = -H*0.15 + i * (H/faixaCount) * 0.9;
    // girar não é trivial em jsPDF; simulamos inclinando pelo deslocamento em X crescente
    const x = -W*0.15 + i * (W/faixaCount) * 0.8;
    pdf.rect(x, y, w, h, 'F');
  }

  // adiciona uma faixa horizontal suave branca translúcida no topo para destacar o título
  const topBarH = 86;
  for(let i=0;i<6;i++){
    const hex = mixHex('#ffffff', '#ffffff', i/8);
    pdf.setFillColor(hex);
    pdf.rect(margin, margin + i*2, contentWidth, Math.round(topBarH/6), 'F');
  }

  // -------------------- Cabeçalho (sem logo ☯️) --------------------
  pdf.setFontSize(28);
  // Sombra vermelha atrás do texto para efeito "vivo"
  pdf.setTextColor('#c8102e');
  pdf.setFont('helvetica','bold');
  pdf.text('TABELA DE PONTUAÇÃO', W/2 + 1.5, margin + 48, {align:'center'});
  // Texto principal em branco na frente
  pdf.setTextColor('#ffffff');
  pdf.text('TABELA DE PONTUAÇÃO', W/2, margin + 46, {align:'center'});

  pdf.setFontSize(12);
  pdf.setTextColor('#ffffff');
  pdf.text('XTREINO TOMAN — Todos os 12 slots incluídos', W/2, margin + 68, {align:'center'});

  // -------------------- Área da tabela --------------------
  // layout das colunas (ajustável)
  const col = {
    posX: margin + 6,
    posW: Math.round(contentWidth * 0.08),   // Posição (nº)
    nameW: Math.round(contentWidth * 0.57),  // Nome / Equipe
    killsW: Math.round(contentWidth * 0.11), // Kills
    bonusW: Math.round(contentWidth * 0.12), // Bonus
    scoreW: Math.round(contentWidth * 0.12)  // Score
  };
  col.posX = margin + 8;
  col.nameX = col.posX + col.posW + 8;
  col.killsX = col.nameX + col.nameW + 8;
  col.bonusX = col.killsX + col.killsW + 8;
  col.scoreX = col.bonusX + col.bonusW + 8;

  // Cabeçalho da tabela
  let y = margin + 100;
  pdf.setFontSize(11);
  pdf.setTextColor('#ffffff');
  pdf.setFillColor('#111111');
  pdf.rect(margin, y - 12, contentWidth, 26, 'F');
  pdf.setTextColor('#ffffff');
  pdf.text('Pos', col.posX, y+6);
  pdf.text('LINE / Equipe', col.nameX, y+6);
  pdf.text('Total Kills', col.killsX, y+6);
  pdf.text('Bônus', col.bonusX, y+6);
  pdf.text('Score', col.scoreX, y+6);

  // Preparar linhas (garante 12 entradas)
  let linhas = ESTADO.times.map(t=>{
    const c = calcularPontuacaoTime(t);
    return {
      id: t.id,
      nome: t.nome || `LINE ${t.id}`,
      totalKills: c.totalKills,
      bonus: c.bonus,
      score: c.score,
      pos: t.posicao || '-'
    };
  });

  // Ordena por score decrescente para exibição (ranking)
  linhas.sort((a,b)=> (b.score||0) - (a.score||0) || (b.totalKills||0) - (a.totalKills||0) || ( (a.pos||999)-(b.pos||999) ) );
  // Se houver menos de 12 (não ocorre aqui), completa com placeholders
  for(let i=linhas.length;i<12;i++) linhas.push({id:i+1,nome:`LINE ${i+1}`,totalKills:0,bonus:0,score:0,pos:'-'});

  // Estilo das linhas: fundo preto com caixa de score à direita branca (como imagem de referência)
  const linhaAltH = 34;
  y += 28;
  for(let i=0;i<linhas.length;i++){
    const t = linhas[i];
    const rowY = y + i * (linhaAltH + 6);

    // Fundo da linha (leve variação em cinza escuro para separar)
    const darkShade = i%2===0 ? '#0c0c0c' : '#141414';
    pdf.setFillColor(darkShade);
    pdf.rect(margin, rowY-8, contentWidth, linhaAltH, 'F');

    // Caixa do número (elipse escura com número branco)
    pdf.setFillColor('#000000');
    pdf.rect(margin + 6, rowY - 6, col.posW - 6, linhaAltH - 8, 'F');
    pdf.setTextColor('#ffffff');
    pdf.setFontSize(12);
    pdf.text(String(i+1), margin + 12, rowY + 14);

    // Nome da equipe (fundo preto com faixa interna preta + texto branco)
    pdf.setTextColor('#ffffff');
    pdf.setFontSize(12);
    // desenha primeira faixa preta centralizada para dar o efeito de cartão (como referência)
    pdf.setFillColor('#0b0b0b');
    pdf.rect(col.nameX - 6, rowY - 6, col.nameW + 4, linhaAltH - 8, 'F');
    pdf.text(t.nome, col.nameX, rowY + 14);

    // Caixa de kills (fundo vermelho suave / texto preto)
    const killsBoxW = col.killsW - 6;
    const killsX = col.killsX - 2;
    // escolher cor vibrante intercalada: vermelho mais claro ou mais escuro dependendo da linha
    const killColor = (i%2===0) ? '#ff4d5a' : '#ff1b2d';
    pdf.setFillColor(killColor);
    pdf.rect(killsX, rowY - 6, killsBoxW, linhaAltH - 8, 'F');
    pdf.setTextColor('#000000');
    pdf.text(String(t.totalKills), killsX + 8, rowY + 14);

    // Caixa de bonus (fundo branco / texto preto pequeno)
    const bonusBoxW = col.bonusW - 6;
    const bonusX = col.bonusX - 2;
    pdf.setFillColor('#ffffff');
    pdf.rect(bonusX, rowY - 6, bonusBoxW, linhaAltH - 8, 'F');
    pdf.setTextColor('#000000');
    pdf.text(String(t.bonus), bonusX + 8, rowY + 14);

    // Caixa de score (fundo branco com borda vermelha)
    const scoreBoxW = col.scoreW - 6;
    const scoreX = col.scoreX - 2;
    pdf.setFillColor('#ffffff');
    pdf.setDrawColor('#c8102e');
    pdf.setLineWidth(1.6);
    pdf.rect(scoreX, rowY - 6, scoreBoxW, linhaAltH - 8, 'FD');
    pdf.setTextColor('#000000');
    pdf.text(String(t.score), scoreX + 10, rowY + 14);
  }

  // -------------------- Finalização: salvar ou compartilhar --------------------

  const blob = pdf.output('blob');
  if(tryShare){
    const file = new File([blob], `tabela_xtreino_${Date.now()}.pdf`, {type:'application/pdf'});
    if(navigator.canShare && navigator.canShare({ files: [file] })){
      try{ await navigator.share({ title:'Tabela XTreino TOMAN', text:'PDF com tabela de pontuação.', files:[file] }); return; }catch(e){}
    }
  }
  pdf.save(`tabela_xtreino_${Date.now()}.pdf`);
}


// ================== Pôster TOP 3 — estilos aleatórios e efeitos adaptáveis ==================
function escolherEstiloPosterAleatorio(){
  const paletas = [
    {bg:['#22042e','#6e0404ff','#12061f'], prim:'#ffd700', sec:'#ffffff'},
    {bg:['#001219','#740404ff','#045052ff'], prim:'#ee9b00', sec:'#94d2bd'},
    {bg:['#0f1115','#420202ff','#12232e'], prim:'#00e7ff', sec:'#ff6b8a'},
    {bg:['#2b0b4a','#8a0707ff','#12061f'], prim:'#00ffb3', sec:'#ffd4fb'},
    {bg:['#06121a','#610202ff','#012547ff'], prim:'#ff7a00', sec:'#ffffff'}
  ];
  const efeitos = ['glow','rays','confetti','particles','minimal'];
  const p = paletas[Math.floor(Math.random()*paletas.length)];
  const e = efeitos[Math.floor(Math.random()*efeitos.length)];
  return { paleta: p, efeito: e };
}

async function gerarPosterTop3(){
  const canvas = porId('posterCanvas'); if(!canvas) return;
  const ctx = canvas.getContext('2d');

  const linhas = ESTADO.times.map(t=>{
    const c = calcularPontuacaoTime(t);
    return {...t, totalKills: c.totalKills, score: c.score, pos: c.pos};
  }).sort((a,b)=> (b.score || 0) - (a.score || 0) || (b.totalKills || 0) - (a.totalKills || 0) || (a.pos || 999) - (b.pos || 999));

  const top = [linhas[0], linhas[1], linhas[2]].filter(Boolean);
  const W = canvas.width, H = canvas.height;

  // Escolhe estilo aleatório e salva no estado
  ESTADO.estiloPoster = elegir = escolherEstiloPosterAleatorio();

  // Background gradiente (paleta)
  const grad = ctx.createLinearGradient(0,0,0,H);
  const bgStops = elegir.paleta.bg;
  grad.addColorStop(0, bgStops[0]); grad.addColorStop(0.5, bgStops[1]); grad.addColorStop(1, bgStops[2]);
  ctx.fillStyle = grad; ctx.fillRect(0,0,W,H);

  // Decorações variantes conforme efeito escolhido
  if(elegir.efeito === 'rays'){
    // raios vindos do centro inferior
    ctx.save();
    ctx.globalAlpha = 0.12;
    for(let i=0;i<24;i++){
      ctx.beginPath();
      const angle = (i/24) * Math.PI * 2;
      ctx.moveTo(W/2, H*0.75);
      ctx.lineTo(W/2 + Math.cos(angle)*W*1.6, H*0.75 + Math.sin(angle)*H*1.2);
      ctx.lineWidth = 120;
      ctx.strokeStyle = elegir.paleta.prim;
      ctx.stroke();
    }
    ctx.restore();
  } else if(elegir.efeito === 'glow'){
    // glow suave central
    const radial = ctx.createRadialGradient(W/2,H*0.45,50, W/2,H*0.45, W*0.9);
    radial.addColorStop(0, hexToRgba(elegir.paleta.prim, 0.28));
    radial.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = radial; ctx.fillRect(0,0,W,H);
  } else if(elegir.efeito === 'confetti'){
    // confetti estático decorativo
    for(let i=0;i<80;i++){
      ctx.fillStyle = randomFrom([elegir.paleta.prim, elegir.paleta.sec, '#ffffff', '#ffd400']);
      ctx.fillRect(Math.random()*W, Math.random()*H*0.7, 6, 10);
    }
  } else if(elegir.efeito === 'particles'){
    // partículas circulares
    for(let i=0;i<60;i++){
      ctx.beginPath();
      ctx.globalAlpha = 0.06 + Math.random()*0.12;
      ctx.fillStyle = randomFrom([elegir.paleta.prim, elegir.paleta.sec, '#ffffff']);
      ctx.arc(Math.random()*W, Math.random()*H, 6+Math.random()*18, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } // minimal -> sem decoração extra

  // Header
  ctx.fillStyle = elegir.paleta.sec; ctx.textAlign='center'; ctx.shadowColor='rgba(0,0,0,.6)'; ctx.shadowBlur=12;
  ctx.font='bold 90px "Segoe UI", Arial'; ctx.fillText('TOP 3', W/2, 140);
  ctx.font='600 28px "Segoe UI", Arial'; ctx.fillText('X-TREINO TOMAN', W/2, 190);
  ctx.shadowBlur = 0;

  // Função auxiliar para desenhar logo circular
  async function desenharLogo(x,y,tamanho,dataUrl,rank){
    const r = tamanho/2;
    ctx.save(); ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.closePath();
    ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth = 8; ctx.stroke(); ctx.clip();
    if(dataUrl){ const img = await loadImage(dataUrl); ctx.drawImage(img, x-r, y-r, tamanho, tamanho); }
    else {
      ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.fillRect(x-r, y-r, tamanho, tamanho);
      ctx.fillStyle = '#ddd'; ctx.font = '700 34px Arial'; ctx.textAlign='center'; ctx.fillText('LOGO', x, y+12);
    }
    ctx.restore();

    // efeito de destaque conforme rank
    if(rank === 1){
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.beginPath();
      ctx.arc(x,y,r+40,0,Math.PI*2);
      ctx.fillStyle = elegir.paleta.prim;
      ctx.fill();
      ctx.restore();
    }
  }

  // Cor do texto do score conforme rank
  function corDoScore(rank){
    if(rank === 1) return elegir.paleta.prim;
    if(rank === 2) return elegir.paleta.sec;
    return '#ffffff';
  }

  const slots = [
    {rank:1,x:W/2,y:H*0.47,size:360},
    {rank:2,x:W*0.25,y:H*0.62,size:260},
    {rank:3,x:W*0.75,y:H*0.62,size:260}
  ];

  for(let i=0;i<slots.length;i++){
    const s = slots[i]; const t = top[i];
    if(!t) continue;
    await desenharLogo(s.x, s.y, s.size, t.logoDataUrl, s.rank);

    // Cor e texto
    ctx.fillStyle = '#fff'; ctx.textAlign='center';
    ctx.font = `800 ${s.rank===1?44:36}px "Segoe UI", Arial`;
    ctx.fillText((t.nome||`LINE ${t.id}`).toUpperCase(), s.x, s.y + s.size/2 + 56);

    ctx.fillStyle = corDoScore(s.rank);
    ctx.font = `700 ${s.rank===1?40:30}px "Segoe UI", Arial`;
    ctx.fillText(`${t.score||0} pts • ${t.totalKills||0} kills`, s.x, s.y + s.size/2 + 102);

    // elemento decorativo dependendo do efeito
    if(elegir.efeito === 'glow' && s.rank === 1){
      // coroa estilo simples
      desenharCoroa(ctx, s.x, s.y - s.size/2 - 48);
    }
    if(elegir.efeito === 'rays' && s.rank === 1){
      // pequeno halo
      ctx.save(); ctx.globalAlpha = 0.2;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.size/2 + 24, 0, Math.PI*2); ctx.fillStyle = elegir.paleta.prim; ctx.fill(); ctx.restore();
    }
  }

  // Footer / assinatura
  ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.font='600 22px "Segoe UI", Arial'; ctx.fillText('Parabéns às equipes campeãs!', W/2, H-80);
  ctx.globalAlpha = 0.95; ctx.fillStyle = '#fff'; ctx.font='900 28px "Segoe UI", Arial'; ctx.fillText('XTREINO TOMAN ☯️', W/2, H-38); ctx.globalAlpha = 1;
}

// desenha uma coroa simples (não bloqueante)
function desenharCoroa(ctx, x, y){
  ctx.save();
  ctx.fillStyle = '#ffd700'; ctx.strokeStyle = '#d19c00'; ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x-70,y+30); ctx.lineTo(x-30,y-30); ctx.lineTo(x,y+10);
  ctx.lineTo(x+30,y-30); ctx.lineTo(x+70,y+30); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.restore();
}

// util: escolhe aleatório de array
function randomFrom(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function hexToRgba(hex, alpha){
  const c = hex.replace('#','');
  const r = parseInt(c.substring(0,2),16);
  const g = parseInt(c.substring(2,4),16);
  const b = parseInt(c.substring(4,6),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ================== Imagens / utilitárias ==================
function loadImage(src){
  return new Promise((res,rej)=>{ const img=new Image(); img.crossOrigin='anonymous'; img.onload=()=>res(img); img.onerror=rej; img.src=src; });
}

function baixarPoster(){
  const canvas = porId('posterCanvas'); if(!canvas) return;
  const a=document.createElement('a'); a.href=canvas.toDataURL('image/png'); a.download=`poster_top3_xtreino_${Date.now()}.png`; a.click();
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