import React from 'react';
import { createPortal } from 'react-dom';
import { Fine } from '../types';
import { ColunaExportacaoMulta } from '../services/finesImport';
import { formatarDataBr, formatarDataHoraBr } from '../utils/dateUtils';

interface Props {
  fines: Fine[];
  colunas: ColunaExportacaoMulta[];
  onClose: () => void;
}

const CAMPOS_DESTAQUE = ['infractionAuto', 'vehiclePlate', 'infractionDate', 'status'];

function ConteudoRelatorio({ fines, colunas }: { fines: Fine[]; colunas: ColunaExportacaoMulta[] }) {
  const dataGeracao = new Date().toLocaleDateString('pt-BR');

  const formatarValor = (f: any, col: ColunaExportacaoMulta): string => {
    const v = f[col.chave];
    if (!v && v !== 0) return '—';
    if (col.tipo === 'moeda') {
      const n = typeof v === 'number' ? v : parseFloat(v);
      return isNaN(n) ? '—' : n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    if (col.chave === 'dueDate' || col.chave === 'discountDate' || col.chave === 'infractionDate') {
      return formatarDataBr(v);
    }
    return String(v);
  };

  const valorTotalGeral = fines.reduce((acc, f) => acc + (f.amount || 0), 0);
  const porStatus = fines.reduce((acc: Record<string, number>, f) => {
    acc[f.status] = (acc[f.status] || 0) + 1;
    return acc;
  }, {});

  const corStatus = (status: string) => {
    if (status === 'Paga') return 'bg-emerald-50 text-emerald-700 border-emerald-300';
    if (status === 'Pendente') return 'bg-rose-50 text-rose-700 border-rose-300';
    return 'bg-slate-100 text-slate-700 border-slate-300';
  };

  const colunasDetalhe = colunas.filter((c) => !CAMPOS_DESTAQUE.includes(c.chave) && c.chave !== 'description');
  const temDescricao = colunas.some((c) => c.chave === 'description');
  const mostrarPlaca = colunas.some((c) => c.chave === 'vehiclePlate');
  const mostrarData = colunas.some((c) => c.chave === 'infractionDate');
  const mostrarStatus = colunas.some((c) => c.chave === 'status');

  return (
    <div className="p-4 sm:p-8 bg-white text-black">
      {/* Cabeçalho com Logo */}
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <img src="/legado/images/logo.png" alt="Trans Pinho" className="h-10 w-auto object-contain" />
          <div>
            <h1 className="text-base font-black uppercase text-slate-950">Relatório de Multas de Trânsito</h1>
            <p className="text-[10px] text-slate-400">Gravataí/RS</p>
          </div>
        </div>
        <div className="text-right text-[11px] text-slate-500">
          <p>Gerado em {dataGeracao}</p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Total de Infrações</span>
          <span className="text-lg font-black text-slate-900">{fines.length}</span>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Valor Total das Multas</span>
          <span className="text-lg font-black text-slate-900">
            {valorTotalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Situações</span>
          <span className="text-[10px] text-slate-700 leading-tight block mt-1">
            {Object.entries(porStatus).map(([status, qtd]) => `${status}: ${qtd}`).join(' · ')}
          </span>
        </div>
      </div>

      {/* Cartões de Cada Multa */}
      <div className="space-y-3">
        {fines.map((f: any, i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-2.5 break-inside-avoid bg-white" style={{ breakInside: 'avoid' }}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 flex-wrap gap-1">
              <div>
                <span className="font-bold font-mono text-slate-900 text-xs">{f.infractionAuto || `Multa #${i + 1}`}</span>
                {mostrarPlaca && f.vehiclePlate && (
                  <span className="text-slate-600 text-[10px] ml-2 font-bold font-mono">Placa: {f.vehiclePlate}</span>
                )}
                {f.duplicateOfAuto && (
                  <span className="text-amber-700 text-[9px] font-bold ml-2 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    Duplicidade de {f.duplicateOfAuto}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {mostrarData && f.infractionDate && (
                  <span className="text-slate-500 text-[10px] font-medium">
                    {formatarDataHoraBr(f.infractionDate, f.infractionTime)}
                  </span>
                )}
                {mostrarStatus && f.status && (
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${corStatus(f.status)}`}>
                    {f.status}
                  </span>
                )}
              </div>
            </div>

            {colunasDetalhe.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[9px] mb-1.5">
                {colunasDetalhe.map((col) => (
                  <div key={col.chave} className="bg-slate-50 p-1 rounded border border-slate-100">
                    <span className="text-slate-400 font-bold uppercase text-[7px] block leading-tight">{col.rotulo}</span>
                    <span className="text-slate-800 font-medium break-words leading-tight">{formatarValor(f, col)}</span>
                  </div>
                ))}
              </div>
            )}

            {temDescricao && f.description && (
              <div className="bg-slate-50 p-1.5 rounded border border-slate-100 text-[9px]">
                <span className="text-slate-400 font-bold uppercase text-[7px] block mb-0.5">Enquadramento / Descrição</span>
                <p className="text-slate-700 leading-snug whitespace-pre-wrap">{f.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-center text-[9px] text-slate-400 pt-4 mt-4 border-t border-slate-100">
        Trans Pinho Gravataí/RS • Relatório gerado automaticamente pelo NexClaim Enterprise
      </p>
    </div>
  );
}

export const FinesPdfReportModal: React.FC<Props> = ({ fines, colunas, onClose }) => {
  return createPortal(
    <>
      {/* Modal de Pré-visualização na tela (oculto na impressão) */}
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:hidden">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-3xl w-full my-4 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-file-pdf text-rose-400"></i>
              <span className="font-bold text-sm">Relatório de Multas de Trânsito — Pré-visualização</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm transition"
              >
                <i className="fa-solid fa-print"></i> Imprimir / Salvar PDF
              </button>
              <button onClick={onClose} className="text-slate-300 hover:text-white px-2 cursor-pointer">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[80vh]">
            <ConteudoRelatorio fines={fines} colunas={colunas} />
          </div>
        </div>
      </div>

      {/* Conteúdo Exclusivo de Impressão (visível apenas ao imprimir) */}
      <div className="hidden print:block trans-pinho-doc print-multipagina p-0 m-0 w-full">
        <ConteudoRelatorio fines={fines} colunas={colunas} />
      </div>
    </>,
    document.body
  );
};
