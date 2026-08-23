import { BlocoDocumento, BlocoTipo } from '../types';

let contadorId = 0;
function novoId(): string {
  contadorId += 1;
  return `blk-${Date.now()}-${contadorId}`;
}

export function criarBloco(tipo: BlocoTipo, texto = '', nivel = 0): BlocoDocumento {
  return { id: novoId(), tipo, texto, nivel: tipo === 'item' ? nivel : undefined };
}

/**
 * Converte o texto corrido antigo (com \n e marcadores "-") em blocos identificados.
 * Usado uma única vez, na primeira abertura de um modelo que ainda não tem blocos.
 */
export function textoParaBlocos(conteudo: string): BlocoDocumento[] {
  const linhas = (conteudo || '').split('\n');
  const blocos: BlocoDocumento[] = [];

  linhas.forEach((linha, idx) => {
    const limpa = linha.trim();

    if (limpa === '') {
      blocos.push(criarBloco('espaco'));
      return;
    }

    if (/^_{10,}$/.test(limpa)) {
      blocos.push(criarBloco('assinatura', ''));
      return;
    }

    if (idx === 0 && limpa === limpa.toUpperCase() && limpa.length > 5) {
      blocos.push(criarBloco('titulo', limpa));
      return;
    }

    if (/^\d+\.\s+[A-ZÀ-Ú\s]+$/.test(limpa) || /^[IVX]+\s*[-–]\s+/.test(limpa)) {
      blocos.push(criarBloco('secao', limpa));
      return;
    }

    if (/^-\s+/.test(limpa)) {
      const espacos = linha.length - linha.trimStart().length;
      const nivel = Math.min(Math.floor(espacos / 2), 2);
      blocos.push(criarBloco('item', limpa.replace(/^-\s+/, ''), nivel));
      return;
    }

    blocos.push(criarBloco('paragrafo', limpa));
  });

  return blocos;
}

/**
 * Converte os blocos de volta em texto corrido, mantendo compatibilidade com o
 * gerador de termo, que continua consumindo o campo "content".
 */
export function blocosParaTexto(blocos: BlocoDocumento[]): string {
  return blocos
    .map((b) => {
      switch (b.tipo) {
        case 'espaco':
          return '';
        case 'assinatura':
          return '_______________________________________________';
        case 'item':
          return `${'  '.repeat(b.nivel || 0)}- ${b.texto}`;
        default:
          return b.texto;
      }
    })
    .join('\n');
}

/**
 * Garante que um modelo tenha blocos: se ainda não tiver, converte a partir do
 * texto antigo. Não grava nada, só devolve os blocos prontos pra uso.
 */
export function garantirBlocos(template: { blocos?: BlocoDocumento[]; content: string }): BlocoDocumento[] {
  if (template.blocos && template.blocos.length > 0) return template.blocos;
  return textoParaBlocos(template.content);
}
