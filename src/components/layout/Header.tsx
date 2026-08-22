import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RoleType } from '../../types';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenNewClaim: () => void;
  onLogout?: () => void;
  onOpenSidebar?: () => void;
  podeGerenciarUsuarios?: boolean;
  podeCriar?: boolean;
  currentRole?: RoleType;
  onRoleChange?: (role: RoleType) => void;
  onOpenExcelImport?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenNewClaim,
  onLogout,
  onOpenSidebar,
  podeGerenciarUsuarios = false,
  podeCriar = true,
}) => {
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between z-20 shadow-xs gap-2">
      <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-md">
        <button onClick={onOpenSidebar} className="md:hidden text-slate-500 hover:text-slate-800 p-2 -ml-1 cursor-pointer" title="Abrir menu lateral">
          <i className="fa-solid fa-bars text-base"></i>
        </button>
        <div
          onClick={onOpenSearch}
          className="w-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg px-2.5 sm:px-3.5 py-2 flex items-center justify-between text-xs text-slate-500 cursor-pointer transition-all"
        >
          <div className="flex items-center gap-2 min-w-0">
            <i className="fa-solid fa-magnifying-glass text-slate-400 shrink-0"></i>
            <span className="truncate hidden sm:inline">Pesquisar por Condutor, Placa, Prefixo, Auto...</span>
            <span className="truncate sm:hidden">Pesquisar...</span>
          </div>
          <kbd className="hidden sm:inline-block bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-500 shrink-0">
            Ctrl + K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {podeGerenciarUsuarios && (
          <button
            onClick={() => navigate('/usuarios')}
            className="text-slate-400 hover:text-slate-700 transition p-2 cursor-pointer rounded-lg hover:bg-slate-100"
            title="Configurações e Usuários"
          >
            <i className="fa-solid fa-gear text-base"></i>
          </button>
        )}

        {podeCriar && (
          <button
            onClick={onOpenNewClaim}
            className="btn bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-2.5 sm:px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Novo Sinistro"
          >
            <i className="fa-solid fa-plus text-xs text-amber-400"></i>
            <span className="hidden sm:inline">Novo Sinistro</span>
          </button>
        )}

        {onLogout && (
          <button
            onClick={onLogout}
            title="Sair do sistema"
            className="btn bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs px-2.5 sm:px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-right-from-bracket text-xs"></i>
            <span className="hidden md:inline">Sair</span>
          </button>
        )}
      </div>
    </header>
  );
};

