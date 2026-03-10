/* export.js — Funções de exportação PNG e PDF da Tabela XTreino TOMAN ☯️ */

// ========== EXPORTAR PNG ==========
async function exportarPNG() {
  const node = porId('scoreboard');
  if (!node) return;

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

// ========== EXPORTAR PDF ==========
async function exportarPDF(tryShare = false) {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) { alert('jsPDF não carregado'); return; }

  const linhas = ESTADO.times.map(t => {
    const c = calcularPontuacaoTime(t);
    return { ...t, totalKills: c.totalKills, score: c.score, booyas: c.booyas };
  }).sort((a, b) => (b.score || 0) - (a.score || 0) || (b.totalKills || 0) - (a.totalKills || 0) || (b.booyas || 0) - (a.booyas || 0));

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const margin = 28;
  const contentW = W - margin * 2;

  pdf.setFillColor('#000000');
  pdf.rect(0, 0, W, H, 'F');

  pdf.setFillColor(ESTADO.tema.primaria);
  pdf.rect(margin, margin, contentW, 64, 'F');
  pdf.setFontSize(20); pdf.setTextColor('#ffffff'); pdf.setFont('helvetica', 'bold');
  pdf.text('TABELA DE PONTUAÇÃO — XTREINO DA TOMAN', margin + contentW / 2, margin + 42, { align: 'center' });

  let y = margin + 96;
  pdf.setFontSize(10);
  pdf.setTextColor('#ffffff');
  pdf.setFillColor('#0b0b0b');
  pdf.rect(margin, y - 12, contentW, 22, 'F');

  const col = {
    rankW: 38,
    nameW: Math.round(contentW * 0.22),
    qW: Math.max(38, Math.round(contentW * 0.12 / 4)),
    booyaW: 60,
    killsW: 60,
    scoreW: 64
  };
  col.nameX = margin + col.rankW + 8;
  col.qStartX = col.nameX + col.nameW + 8;
  col.booyaX = col.qStartX + col.qW * 4 + 8;
  col.killsX = col.booyaX + col.booyaW + 8;
  col.scoreX = col.killsX + col.killsW + 8;

  pdf.setTextColor(ESTADO.tema.primaria); pdf.text('Rank', margin + 6, y + 6);
  pdf.text('LINE / Equipe', col.nameX, y + 6);
  pdf.setTextColor('#ffffff');
  for (let i = 0; i < NUM_QUEDAS; i++) pdf.text(`Q${i + 1}`, col.qStartX + i * col.qW, y + 6);
  pdf.text('Booyas', col.booyaX, y + 6);
  pdf.text(' kills', col.killsX, y + 6);
  pdf.text('Score', col.scoreX, y + 6);

  y += 28;
  pdf.setFontSize(10);
  for (let i = 0; i < linhas.length; i++) {
    const t = linhas[i];
    const rowH = 20;
    pdf.setFillColor(i % 2 === 0 ? '#090909' : '#060606');
    pdf.rect(margin, y - 10, contentW, rowH, 'F');

    pdf.setTextColor('#ffffff');
    pdf.text(String(i + 1), margin + 6, y + 6);
    pdf.text(String(t.nome || `LINE ${t.id}`), col.nameX, y + 6);
    for (let q = 0; q < NUM_QUEDAS; q++) {
      const v = t.posQ && t.posQ[q] ? String(t.posQ[q]) : '-';
      pdf.text(v, col.qStartX + q * col.qW, y + 6);
    }
    pdf.text(String(t.booyas || 0), col.booyaX, y + 6);
    pdf.text(String(t.totalKills || 0), col.killsX, y + 6);
    pdf.text(String(t.score || 0), col.scoreX, y + 6);

    y += rowH + 6;
    if (y > pdf.internal.pageSize.getHeight() - 80) {
      pdf.addPage();
      y = margin + 20;
    }
  }

  pdf.setFontSize(9);
  pdf.setTextColor('#999999');
  pdf.text('Gerado por Tabela XTreino TOMAN.', margin, H - 20);

  const blob = pdf.output('blob');
  if (tryShare) {
    const file = new File([blob], `tabela_xtreino_${Date.now()}.pdf`, { type: 'application/pdf' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ title: 'Tabela XTreino Da TOMAN', text: 'Tabela de pontuação', files: [file] }); return; } catch (e) { }
    }
  }
  pdf.save(`tabela_xtreino_${Date.now()}.pdf`);
}

// ========== EVENTOS DE EXPORTAÇÃO ==========
document.addEventListener('DOMContentLoaded', () => {
  porId('btnExportPNG')?.addEventListener('click', exportarPNG);
  porId('btnExportPDF')?.addEventListener('click', () => exportarPDF(false));
});

// Tornar funções globais
window.exportarPNG = exportarPNG;
window.exportarPDF = exportarPDF;