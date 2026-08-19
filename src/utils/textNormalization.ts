export function normalizarTipoOcorrencia(bruto: string): string {
  const t = (bruto || '').trim();
  if (!t) return 'Não Especificado';
  const upper = t.toUpperCase();

  if (/BATIDA.*FRONTAL.*FAROL/.test(upper)) return 'Batida Frontal e Farol Danificado';
  if (/BATIDA.*(FRONTAL|FORNTAL|FROTAL|FONTAL|FONTRAL|FRONTA)\b/.test(upper)) return 'Batida Frontal';
  if (/BATIDA.*(ARANHAD|ARRANHAD)/.test(upper)) return 'Batida e Arranhado';
  if (/BATIDA.*LATERAL/.test(upper)) return 'Batida Lateral';
  if (/(BATIDA|COLIS[ÃA]O).*TRASEIRA/.test(upper)) return 'Colisão Traseira com Avarias';
  if (/RETROVI[SD]OR/.test(upper)) return 'Retrovisor Danificado';
  if (/^ARRANHAD/.test(upper)) return 'Arranhados';
  if (/ATROPELAMENTO/.test(upper)) return 'Atropelamento';
  if (/BALA PERDIDA/.test(upper)) return 'Bala Perdida (Supostamente)';
  if (/JANELA QUEBRADA/.test(upper)) return 'Janela Quebrada';
  if (/PERDA DE CONTROLE/.test(upper)) return 'Perda de Controle com Saída de Pista';
  if (/QUEBRA MEC[ÂA]NICA/.test(upper)) return 'Quebra Mecânica / Guincho';
  if (/MANOBRA DE P[ÁA]TIO/.test(upper)) return 'Avaria em Manobra de Pátio';
  if (/N[ÃA]O ESPECIFICADO/.test(upper)) return 'Não Especificado';

  // Não reconhecido: mantém o texto original (evita apagar um tipo novo e legítimo)
  return t;
}
