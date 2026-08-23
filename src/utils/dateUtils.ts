/**
 * Utilitários centralizados de formatação e manipulação de datas para o padrão brasileiro (pt-BR).
 */

/**
 * Converte data ISO (YYYY-MM-DD) ou timestamp para o formato brasileiro DD/MM/YYYY.
 * Se o valor for nulo ou vazio, retorna '—'.
 */
export function formatarDataBr(iso: string | undefined | null): string {
  if (!iso) return '—';
  const str = String(iso).trim().split('T')[0];
  
  if (str.includes('/')) {
    // Já está no formato com barras (ex: DD/MM/YYYY ou D/M/YYYY)
    const partes = str.split('/');
    if (partes.length === 3) {
      return `${partes[0].padStart(2, '0')}/${partes[1].padStart(2, '0')}/${partes[2]}`;
    }
    return str;
  }

  const [ano, mes, dia] = str.split('-');
  if (!ano || !mes || !dia) return str || '—';
  
  return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
}

/**
 * Formata data e horário juntos no padrão "DD/MM/YYYY às HH:mm" (ou só a data se não houver horário).
 */
export function formatarDataHoraBr(
  data: string | undefined | null,
  horario?: string | undefined | null
): string {
  const dataFormatada = formatarDataBr(data);
  if (dataFormatada === '—') return '—';
  if (!horario) return dataFormatada;
  return `${dataFormatada} às ${horario}`;
}

/**
 * Limpa a descrição de uma multa removendo prefixos redundantes (ex: MULTA.) e aplicando formato de frase.
 */
export function limparDescricaoMulta(desc: string | undefined): string {
  if (!desc) return 'Infração de Trânsito';
  let texto = desc.trim();
  // Remove "MULTA." ou "MULTA -" ou "MULTA:" repetido no início (case-insensitive)
  texto = texto.replace(/^multa[\s.:-]+/i, '').trim();
  if (!texto) return 'Infração de Trânsito';
  // Deixa em formato de frase (primeira letra maiúscula, resto minúsculo),
  // preservando números e parênteses como estão
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}
