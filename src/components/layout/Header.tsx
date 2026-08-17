import React from 'react';
import { RoleType } from '../../types';

interface HeaderProps {
  currentRole: RoleType;
  onRoleChange: (role: RoleType) => void;
  onOpenSearch: () => void;
  onOpenNewClaim: () => void;
  onOpenExcelImport: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  onOpenSearch,
  onOpenNewClaim,
  onOpenExcelImport,
  onLogout,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-20 shadow-xs">
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div
          onClick={onOpenSearch}
          className="w-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg px-3.5 py-2 flex items-center justify-between text-xs text-slate-500 cursor-pointer transition-all"
        >
          <div className="flex items-center gap-2.5">
            <i className="fa-solid fa-magnifying-glass text-slate-400"></i>
            <span>Pesquisar por Condutor, Placa, Prefixo, Auto...</span>
          </div>
          <kbd className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-500">
            Ctrl + K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-[10px] font-black text-blue-900 uppercase tracking-wide">v2.6.0-BETA</span>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase px-2">Perfil:</span>
          <select
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value as RoleType)}
            className="bg-white border border-slate-200 rounded text-xs font-semibold px-2 py-1 text-slate-700 cursor-pointer"
          >
            <option value="ADMINISTRADOR">ADMINISTRADOR</option>
            <option value="GESTOR">GESTOR</option>
            <option value="OPERADOR">OPERADOR</option>
            <option value="VISUALIZADOR">VISUALIZADOR</option>
          </select>
        </div>

        <button
          onClick={onOpenExcelImport}
          className="btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs"
        >
          <i className="fa-solid fa-file-excel text-xs"></i> Ler Planilha Excel (.xlsx)
        </button>

        <button
          onClick={onOpenNewClaim}
          className="btn bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs"
        >
          <i className="fa-solid fa-plus text-xs text-amber-400"></i> Novo Sinistro
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            title="Sair do sistema"
            className="btn bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <i className="fa-solid fa-right-from-bracket text-xs"></i> Sair
          </button>
        )}
      </div>
    </header>
  );
};
