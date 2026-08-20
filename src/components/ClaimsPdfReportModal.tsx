import React from 'react';
import { createPortal } from 'react-dom';
import { Claim } from '../types';
import { ColunaExportacao } from '../services/claimsImport';

interface Props {
  claims: Claim[];
  colunas: ColunaExportacao[];
  onClose: () => void;
}

const CAMPOS_DESTAQUE = ['claimNumber', 'protocol', 'date', 'status'];

function ConteudoRelatorio({ claims, colunas }: { claims: Claim[]; colunas: ColunaExportacao[] }) {
  const dataGeracao = new Date().toLocaleDateString('pt-BR');

  const formatarValor = (c: any, col: ColunaExportacao): string => {
    const v = c[col.chave];
    if (!v && v !== 0) return '—';
    if (col.tipo === 'moeda') {
      const n = typeof v === 'number' ? v : parseFloat(v);
      return isNaN(n) ? '—' : n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    return String(v);
  };

  const valorTotalGeral = claims.reduce((acc, c) => acc + (c.totalValue || c.estimatedCost || 0), 0);
  const porStatus = claims.reduce((acc: Record<string, number>, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const corStatus = (status: string) => {
    if (status === 'Resolvido' || status === 'Encerrado') return 'bg-emerald-50 text-emerald-700 border-emerald-300';
    if (status === 'Em análise' || status === 'Aguardando aprovação') return 'bg-amber-50 text-amber-800 border-amber-300';
    return 'bg-blue-50 text-blue-700 border-blue-300';
  };

  const colunasDetalhe = colunas.filter((c) => !CAMPOS_DESTAQUE.includes(c.chave) && c.chave !== 'description');
  const temDescricao = colunas.some((c) => c.chave === 'description');
  const mostrarProtocolo = colunas.some((c) => c.chave === 'protocol');
  const mostrarData = colunas.some((c) => c.chave === 'date');
  const mostrarStatus = colunas.some((c) => c.chave === 'status');

  return (
    <div className="p-8 bg-white text-black">
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <img src="/legado/images/logo.png" alt="Trans Pinho" className="h-10 w-auto object-contain" />
          <div>
            <h1 className="text-base font-black uppercase text-slate-950">Relatório de Sinistros</h1>
            <p className="text-[10px] text-slate-400">Gravataí/RS</p>
          </div>
        </div>
        <div className="text-right text-[11px] text-slate-500">
          <p>Gerado em {dataGeracao}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Total de Sinistros</span>
          <span className="text-lg font-black text-slate-900">{claims.length}</span>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Valor Total Envolvido</span>
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

      <div className="space-y-3">
        {claims.map((c: any, i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-3 break-inside-avoid bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
              <div>
                <span className="font-bold text-slate-900 text-xs">{c.claimNumber || `Sinistro #${i + 1}`}</span>
                {mostrarProtocolo && c.protocol && (
                  <span className="text-slate-400 text-[10px] ml-2 font-mono">Protocolo: {c.protocol}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {mostrarData && c.date && (
                  <span className="text-slate-500 text-[10px] font-medium">{c.date}</span>
                )}
                {mostrarStatus && c.status && (
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${corStatus(c.status)}`}>
                    {c.status}
                  </span>
                )}
              </div>
            </div>

            {colunasDetalhe.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-[10px] mb-2">
                {colunasDetalhe.map((col) => (
                  <div key={col.chave} className="bg-slate-50 p-1.5 rounded border border-slate-100">
                    <span className="text-slate-400 font-bold uppercase text-[8px] block">{col.rotulo}</span>
                    <span className="text-slate-800 font-medium break-words">{formatarValor(c, col)}</span>
                  </div>
                ))}
              </div>
            )}

            {temDescricao && c.description && (
              <div className="bg-slate-50 p-2 rounded border border-slate-100 text-[10px]">
                <span className="text-slate-400 font-bold uppercase text-[8px] block mb-0.5">Ocorrido / Descrição</span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{c.description}</p>
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

export const ClaimsPdfReportModal: React.FC<Props> = ({ claims, colunas, onClose }) => {
  return createPortal(
    <>
      {/* Modal de Pré-visualização na tela (oculto na impressão) */}
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-start justify-center px-4 py-8 overflow-y-auto print:hidden">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-3xl w-full my-4 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-file-pdf text-rose-400"></i>
              <span className="font-bold text-sm">Relatório de Sinistros — Pré-visualização</span>
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
            <ConteudoRelatorio claims={claims} colunas={colunas} />
          </div>
        </div>
      </div>

      {/* Conteúdo Exclusivo de Impressão (visível apenas ao imprimir) */}
      <div className="hidden print:block trans-pinho-doc print-multipagina p-0 m-0 w-full">
        <ConteudoRelatorio claims={claims} colunas={colunas} />
      </div>
    </>,
    document.body
  );
};
