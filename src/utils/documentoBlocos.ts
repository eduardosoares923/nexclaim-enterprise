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
  const linhas: string[] = [];

  blocos.forEach((b, i) => {
    const anterior = blocos[i - 1];

    // Linha em branco antes de título, seção, assinatura, e antes do primeiro item de uma lista
    if (i > 0) {
      const precisaEspaco =
        b.tipo === 'titulo' ||
        b.tipo === 'secao' ||
        b.tipo === 'assinatura' ||
        b.tipo === 'paragrafo' ||
        (b.tipo === 'item' && anterior?.tipo !== 'item');
      if (precisaEspaco) linhas.push('');
    }

    switch (b.tipo) {
      case 'espaco':
        linhas.push('');
        break;
      case 'assinatura':
        linhas.push('_______________________________________________');
        break;
      case 'item':
        linhas.push(`${'  '.repeat(b.nivel || 0)}- ${b.texto}`);
        break;
      default:
        linhas.push(b.texto);
    }
  });

  return linhas.join('\n');
}

/**
 * Garante que um modelo tenha blocos: se ainda não tiver, converte a partir do
 * texto antigo. Não grava nada, só devolve os blocos prontos pra uso.
 */
export function garantirBlocos(template: { blocos?: BlocoDocumento[]; content: string }): BlocoDocumento[] {
  if (template.blocos && template.blocos.length > 0) return template.blocos;
  return textoParaBlocos(template.content);
}

/**
 * Converte o conteúdo antigo (texto corrido) em HTML, pra migrar os modelos
 * existentes pro editor rico. Usado uma única vez, na primeira abertura.
 */
export function textoParaHtml(conteudo: string): string {
  const linhas = (conteudo || '').split('\n');
  const partes: string[] = [];
  let listaAberta = false;

  const fecharLista = () => {
    if (listaAberta) {
      partes.push('</ul>');
      listaAberta = false;
    }
  };

  linhas.forEach((linha, idx) => {
    const limpa = linha.trim();

    if (limpa === '') {
      fecharLista();
      return;
    }

    if (/^_{10,}$/.test(limpa)) {
      fecharLista();
      partes.push('<hr>');
      return;
    }

    if (idx === 0 && limpa === limpa.toUpperCase() && limpa.length > 5) {
      fecharLista();
      partes.push(`<h1 style="text-align:center">${limpa}</h1>`);
      return;
    }

    if (/^\d+\.\s+[A-ZÀ-Ú\s]+$/.test(limpa) || /^[IVX]+\s*[-–]\s+/.test(limpa)) {
      fecharLista();
      partes.push(`<h2>${limpa}</h2>`);
      return;
    }

    if (/^-\s+/.test(limpa)) {
      if (!listaAberta) {
        partes.push('<ul>');
        listaAberta = true;
      }
      partes.push(`<li><p>${limpa.replace(/^-\s+/, '')}</p></li>`);
      return;
    }

    fecharLista();
    partes.push(`<p>${limpa}</p>`);
  });

  fecharLista();
  return partes.join('');
}

/**
 * Devolve o HTML de um modelo: usa o htmlContent se já existir, senão converte
 * do texto antigo.
 */
export function garantirHtml(template: { htmlContent?: string; content?: string }): string {
  if (template.htmlContent && template.htmlContent.trim()) return template.htmlContent;
  return textoParaHtml(template.content || '');
}
