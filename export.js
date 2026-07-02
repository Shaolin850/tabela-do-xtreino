/* export.js — Funções de exportação PDF e LIMPEZA da Tabela XTreino TOMAN ☯️ */

// ========== MODAL DE CONFIRMAÇÃO PERSONALIZADA ==========
function mostrarModalConfirmacao(mensagem, subMensagem, callback) {
  // Remove modal existente se houver
  const modalExistente = document.querySelector('.modal-overlay');
  if (modalExistente) modalExistente.remove();

  // Cria overlay
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  
  // Cria box da modal
  const box = document.createElement('div');
  box.className = 'modal-box';
  
  box.innerHTML = `
    <div class="modal-icon">⚠️</div>
    <div class="modal-title">ATENÇÃO!</div>
    <div class="modal-message">${mensagem}</div>
    <div class="modal-submessage">${subMensagem}</div>
    <div class="modal-actions">
      <button class="modal-btn modal-btn-cancel" data-action="cancel">
        <span class="btn-icon">✕</span> Cancelar
      </button>
      <button class="modal-btn modal-btn-danger" data-action="confirm">
        <span class="btn-icon">🗑️</span> Limpar Tudo
      </button>
    </div>
  `;
  
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  // Fecha modal ao clicar fora (apenas no overlay)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      fecharModal(overlay);
      if (callback) callback(false);
    }
  });

  // Eventos dos botões
  const btnConfirm = box.querySelector('[data-action="confirm"]');
  const btnCancel = box.querySelector('[data-action="cancel"]');

  btnConfirm.addEventListener('click', () => {
    fecharModal(overlay);
    if (callback) callback(true);
  });

  btnCancel.addEventListener('click', () => {
    fecharModal(overlay);
    if (callback) callback(false);
  });

  // Fecha com ESC
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      fecharModal(overlay);
      if (callback) callback(false);
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);

  // Retorna função para fechar manualmente
  return () => fecharModal(overlay);
}

function fecharModal(overlay) {
  if (!overlay) return;
  overlay.style.animation = 'modalFadeIn 0.3s ease reverse';
  setTimeout(() => {
    if (overlay.parentNode) overlay.remove();
  }, 300);
}

// ========== LIMPAR DADOS (APENAS QUEDAS E KILLS) ==========
function limparDados() {
  // Usa a modal personalizada
  mostrarModalConfirmacao(
    'Você está prestes a limpar <strong>TODAS</strong> as quedas e kills!',
    '⚠️ Os nomes das LINEs e logos serão <strong>mantidos</strong>.<br>Esta ação <strong>NÃO</strong> pode ser desfeita!',
    (confirmado) => {
      if (!confirmado) {
        mostrarNotificacao('✅ Operação cancelada!', 'info');
        return;
      }

      // Zera apenas posições e kills de todos os times
      ESTADO.times.forEach(t => {
        t.posQ = Array(NUM_QUEDAS).fill('');
        t.killsQ = Array(NUM_QUEDAS).fill(0);
        t.booyas = 0;
        t.totalKills = 0;
        t.score = 0;
      });

      // Recalcula e exibe
      calcularEExibir();
      
      // Renderiza o editor novamente para atualizar os campos
      renderizarEditorTimes();
      
      // Salva automaticamente
      salvarDados();
      
      // Notifica o usuário
      mostrarNotificacao('🗑️ Todas as quedas e kills foram limpas com sucesso!', 'warning');
    }
  );
}

// ========== EXPORTAR PDF ==========
async function exportarPDF(tryShare = false) {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) { 
    alert('❌ jsPDF não carregado! Verifique sua conexão com a internet.'); 
    return; 
  }

  const linhas = ESTADO.times.map(t => {
    const c = calcularPontuacaoTime(t);
    return { ...t, totalKills: c.totalKills, score: c.score, booyas: c.booyas };
  }).sort((a, b) => (b.score || 0) - (a.score || 0) || (b.totalKills || 0) - (a.totalKills || 0) || (b.booyas || 0) - (a.booyas || 0));

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const margin = 28;
  const contentW = W - margin * 2;

  // Fundo preto
  pdf.setFillColor('#000000');
  pdf.rect(0, 0, W, H, 'F');

  // Cabeçalho
  pdf.setFillColor(ESTADO.tema.primaria);
  pdf.rect(margin, margin, contentW, 64, 'F');
  pdf.setFontSize(20); 
  pdf.setTextColor('#ffffff'); 
  pdf.setFont('helvetica', 'bold');
  pdf.text('TABELA DE PONTUAÇÃO — XTREINO DA TOMAN', margin + contentW / 2, margin + 42, { align: 'center' });

  // Cabeçalho da tabela
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

  // Cabeçalhos das colunas
  pdf.setTextColor(ESTADO.tema.primaria); 
  pdf.text('Rank', margin + 6, y + 6);
  pdf.text('LINE / Equipe', col.nameX, y + 6);
  pdf.setTextColor('#ffffff');
  for (let i = 0; i < NUM_QUEDAS; i++) {
    pdf.text(`Q${i + 1}`, col.qStartX + i * col.qW, y + 6);
  }
  pdf.text('Booyas', col.booyaX, y + 6);
  pdf.text('Kills', col.killsX, y + 6);
  pdf.text('Score', col.scoreX, y + 6);

  // Dados da tabela
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

  // Rodapé
  pdf.setFontSize(9);
  pdf.setTextColor('#999999');
  pdf.text('Gerado por Tabela XTreino TOMAN.', margin, H - 20);
  pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, margin + contentW - 180, H - 20);

  const blob = pdf.output('blob');
  if (tryShare) {
    const file = new File([blob], `tabela_xtreino_${Date.now()}.pdf`, { type: 'application/pdf' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { 
        await navigator.share({ 
          title: 'Tabela XTreino Da TOMAN', 
          text: 'Tabela de pontuação do XTreino da TOMAN', 
          files: [file] 
        }); 
        return; 
      } catch (e) { 
        if (e.name !== 'AbortError') {
          console.error('Erro ao compartilhar:', e);
        }
      }
    }
  }
  
  pdf.save(`tabela_xtreino_${Date.now()}.pdf`);
}

// ========== EVENTOS DE EXPORTAÇÃO E LIMPEZA ==========
document.addEventListener('DOMContentLoaded', () => {
  const btnPDF = porId('btnExportPDF');
  const btnLimpar = porId('btnLimpar');
  
  if (btnPDF) {
    btnPDF.addEventListener('click', () => exportarPDF(false));
    console.log('✅ Botão Exportar PDF conectado');
  } else {
    console.warn('⚠️ Botão Exportar PDF não encontrado');
  }
  
  if (btnLimpar) {
    btnLimpar.addEventListener('click', limparDados);
    console.log('✅ Botão Limpar conectado');
  } else {
    console.warn('⚠️ Botão Limpar não encontrado');
  }
});

// Tornar funções globais
window.limparDados = limparDados;
window.exportarPDF = exportarPDF;
window.mostrarModalConfirmacao = mostrarModalConfirmacao;
window.fecharModal = fecharModal;