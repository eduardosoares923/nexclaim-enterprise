import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';

/** Converte um File (.docx) em base64, pra guardar no Firestore. */
export async function arquivoParaBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const resultado = reader.result as string;
      resolve(resultado.split(',')[1] || '');
    };
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
    reader.readAsDataURL(file);
  });
}

function base64ParaUint8Array(base64: string): Uint8Array {
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return bytes;
}

/**
 * Preenche as variáveis {{...}} dentro do .docx do modelo e devolve o arquivo
 * pronto, com a formatação original intacta (rodapé, margens, fontes).
 */
export function gerarDocxPreenchido(
  docxBase64: string,
  dados: Record<string, string>
): Blob {
  const zip = new PizZip(base64ParaUint8Array(docxBase64));
  const doc = new Docxtemplater(zip, {
    delimiters: { start: '{{', end: '}}' },
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => '',
  });
  doc.render(dados);
  return doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

/** Gera o .docx preenchido e já dispara o download. */
export function baixarDocxPreenchido(
  docxBase64: string,
  dados: Record<string, string>,
  nomeArquivo: string
) {
  const blob = gerarDocxPreenchido(docxBase64, dados);
  saveAs(blob, nomeArquivo.endsWith('.docx') ? nomeArquivo : `${nomeArquivo}.docx`);
}

/** Lista as variáveis {{...}} que existem dentro do .docx do modelo. */
export function listarVariaveisDoDocx(docxBase64: string): string[] {
  try {
    const zip = new PizZip(base64ParaUint8Array(docxBase64));
    const encontradas = new Set<string>();
    Object.keys(zip.files)
      .filter((n) => /^word\/(document|header\d*|footer\d*)\.xml$/.test(n))
      .forEach((nome) => {
        const xml = zip.file(nome)?.asText() || '';
        // Remove as marcações internas do Word que quebram a variável no meio
        const limpo = xml.replace(/<[^>]+>/g, '');
        const achados = limpo.match(/\{\{\s*[\w_]+\s*\}\}/g) || [];
        achados.forEach((v) => encontradas.add(v.replace(/\s/g, '')));
      });
    return Array.from(encontradas).sort();
  } catch {
    return [];
  }
}

/**
 * Substitui um texto por uma variável dentro do XML do Word, funcionando mesmo
 * quando o Word partiu o texto em pedaços internamente (acontece direto).
 */
function substituirNoXml(xml: string, alvo: string, variavel: string): string {
  return xml.replace(/<w:p[ >][\s\S]*?<\/w:p>/g, (paragrafo) => {
    const pedacos = [...paragrafo.matchAll(/(<w:t(?:\s[^>]*)?>)([\s\S]*?)(<\/w:t>)/g)];
    if (pedacos.length === 0) return paragrafo;

    const textoCompleto = pedacos.map((p) => p[2]).join('');
    const pos = textoCompleto.indexOf(alvo);
    if (pos === -1) return paragrafo;

    const fim = pos + alvo.length;
    let cursor = 0;
    let jaColocou = false;
    let novoParagrafo = paragrafo;
    const substituicoes: [string, string][] = [];

    for (const p of pedacos) {
      const ini = cursor;
      const termino = cursor + p[2].length;
      cursor = termino;
      if (termino <= pos || ini >= fim) continue;
      const antes = p[2].slice(0, Math.max(pos - ini, 0));
      const depois = p[2].slice(Math.min(Math.max(fim - ini, 0), p[2].length));
      const meio = jaColocou ? '' : variavel;
      jaColocou = true;
      substituicoes.push([p[0], `${p[1]}${antes}${meio}${depois}${p[3]}`]);
    }

    substituicoes.forEach(([de, para]) => {
      novoParagrafo = novoParagrafo.replace(de, para);
    });
    return novoParagrafo;
  });
}

/**
 * Recebe o .docx em base64, troca um texto por uma variável, e devolve o .docx
 * atualizado em base64. A formatação original fica intacta.
 */
export function marcarVariavelNoDocx(
  docxBase64: string,
  textoAlvo: string,
  variavel: string
): string {
  const zip = new PizZip(base64ParaUint8Array(docxBase64));
  const alvos = Object.keys(zip.files).filter((n) =>
    /^word\/(document|header\d*|footer\d*)\.xml$/.test(n)
  );
  alvos.forEach((nome) => {
    const xml = zip.file(nome)?.asText() || '';
    zip.file(nome, substituirNoXml(xml, textoAlvo, variavel));
  });
  return zip.generate({ type: 'base64' });
}
