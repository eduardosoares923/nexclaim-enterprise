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
