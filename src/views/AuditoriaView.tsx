import React, { useState, useMemo } from 'react';
import { AuditLog, RoleType } from '../types';
import { formatarDataHoraBr } from '../utils/dateUtils';

interface AuditoriaViewProps {
  logs: AuditLog[];
  userRole?: RoleType;
}

const CORES_ACAO: Record<string, string> = {
  criou: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  alterou: 'bg-blue-50 text-blue-700 border-blue-200',
  excluiu: 'bg-rose-50 text-rose-700 border-rose-200',
  importou: 'bg-amber-50 text-amber-800 border-amber-200',
};

export const AuditoriaView: React.FC<AuditoriaViewProps> = ({ logs }) => {
  const [busca, setBusca] = useState('');
  const [filtroModulo, setFiltroModulo] = useState('todos');

  const filtrados = useMemo(() => {
    const t = busca.trim().toLowerCase();
    return logs.filter((l) => {
      if (filtroModulo !== 'todos' && l.modulo !== filtroModulo) return false;
      if (!t) return true;
      return (
        (l.usuario || '').toLowerCase().includes(t) ||
        (l.descricao || '').toLowerCase().includes(t)
      );
    });
  }, [logs, busca, filtroModulo]);

  const modulos = Array.from(new Set(logs.map((l) => l.modulo))).sort();

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 p-6 rounded-xl text-white">
        <h2 className="text-lg font-black">Histórico de Alterações</h2>
        <p className="text-blue-300/80 text-xs mt-1">
          Registro de tudo que foi criado, alterado ou excluído no sistema, e por quem.
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-2.5">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por usuário ou descrição..."
          className="flex-1 min-w-[220px] px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/40"
        />
        <select
          value={filtroModulo}
          onChange={(e) => setFiltroModulo(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white font-bold text-slate-700"
        >
          <option value="todos">Todos os módulos</option>
          {modulos.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Registros</h3>
          <span className="text-xs text-slate-500">{filtrados.length} registro(s)</span>
        </div>

        {filtrados.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">Nenhum registro encontrado.</div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {filtrados.map((log) => (
              <div key={log.id} className="p-3.5 hover:bg-slate-50/80 transition flex items-start gap-3">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase shrink-0 ${CORES_ACAO[log.acao] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  {log.acao}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900">{log.descricao}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    <i className="fa-solid fa-user mr-1"></i>{log.usuario}
                    <span className="mx-1.5">•</span>
                    <i className="fa-regular fa-clock mr-1"></i>{formatarDataHoraBr(log.timestamp)}
                    <span className="mx-1.5">•</span>
                    <span className="font-semibold">{log.modulo}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
