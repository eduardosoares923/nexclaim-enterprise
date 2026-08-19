import React from 'react';
import { createPortal } from 'react-dom';
import { Claim } from '../types';
import { ColunaExportacao } from '../services/claimsImport';

interface Props {
  claims: Claim[];
  colunas: ColunaExportacao[];
  onClose: () => void;
}

export const ClaimsPdfReportModal: React.FC<Props> = ({ claims, colunas, onClose }) => {
  const dataGeracao = new Date().toLocaleDateString('pt-BR');

  const truncarTexto = (texto: string, max: number = 60): string => {
    if (!texto) return '—';
    const t = String(texto);
    return t.length > max ? t.slice(0, max).trim() + '…' : t;
  };

  const formatarValor = (c: any, col: ColunaExportacao) => {
    const v = c[col.chave];
    if (col.tipo === 'moeda') {
      const n = typeof v === 'number' ? v : parseFloat(v);
      return isNaN(n) || !v ? '—' : n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    return truncarTexto(v, col.chave === 'description' ? 70 : 30);
  };

  const valorTotalGeral = claims.reduce((acc, c) => acc + (c.totalValue || c.estimatedCost || 0), 0);
  const porStatus = claims.reduce((acc: Record<string, number>, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-start justify-center px-4 py-8 overflow-y-auto print:static print:p-0 print:bg-white print:overflow-visible">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-3xl w-full my-4 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 print:shadow-none print:border-none print:rounded-none print:max-w-none print:w-auto print:my-0">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-file-pdf text-rose-400"></i>
            <span className="font-bold text-sm">Relatório de Sinistros — Pré-visualização</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
            >
              <i className="fa-solid fa-print"></i> Imprimir / Salvar PDF
            </button>
            <button onClick={onClose} className="text-slate-300 hover:text-white px-2">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        {colunas.length > 8 && (
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-[11px] print:hidden">
            <i className="fa-solid fa-triangle-exclamation mr-1"></i>
            Você selecionou {colunas.length} colunas. Para um PDF mais legível, considere escolher no máximo 6 a 8 colunas — o texto ficará bem pequeno com muitas colunas.
          </div>
        )}

        <div className="trans-pinho-doc p-8 overflow-y-auto print:p-0 print:overflow-visible">
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-4">
            <div>
              <h1 className="text-base font-black uppercase text-slate-950">Relatório de Sinistros</h1>
              <p className="text-[11px] text-slate-500">JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)</p>
            </div>
            <div className="text-right text-[11px] text-slate-500">
              <p>Gerado em {dataGeracao}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
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

          <table className="w-full text-left text-[9px] border border-slate-200 table-fixed">
            <thead className="bg-slate-900 text-white">
              <tr>
                {colunas.map((col) => (
                  <th key={col.chave} className="p-1.5 whitespace-nowrap overflow-hidden text-ellipsis">{col.rotulo}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 [&>tr:nth-child(even)]:bg-slate-50">
              {claims.map((c, i) => (
                <tr key={i}>
                  {colunas.map((col) => (
                    <td key={col.chave} className="p-1.5 align-top whitespace-nowrap overflow-hidden text-ellipsis">{formatarValor(c, col)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-center text-[9px] text-slate-400 pt-4 mt-4 border-t border-slate-100">
            Trans Pinho Gravataí/RS • Relatório gerado automaticamente pelo NexClaim Enterprise
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};
