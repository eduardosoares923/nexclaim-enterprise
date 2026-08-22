import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  claimsCount: number;
  finesCount: number;
  termsCount: number;
  currentUser: { name: string; email: string; role: string; avatar: string };
  podeGerenciarUsuarios?: boolean;
  onLogout?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

interface MenuItem {
  path: string;
  label: string;
  icon: string;
  badge?: number;
  isNew?: boolean;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  claimsCount,
  finesCount,
  termsCount,
  currentUser,
  podeGerenciarUsuarios = false,
  onLogout,
  isOpen,
  onClose,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const [gruposAbertos, setGruposAbertos] = useState<Set<string>>(
    new Set(['VISÃO GERAL', 'OPERACIONAL', 'FINANCEIRO', 'DOCUMENTOS', 'CADASTROS'])
  );

  const alternarGrupo = (titulo: string) => {
    setGruposAbertos((atual) => {
      const novo = new Set(atual);
      if (novo.has(titulo)) novo.delete(titulo);
      else novo.add(titulo);
      return novo;
    });
  };

  // Fecha o menu de perfil ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuGroups: MenuGroup[] = [
    {
      title: 'VISÃO GERAL',
      items: [
        { path: '/', label: 'Painel Trans Pinho', icon: 'fa-chart-pie' },
      ],
    },
    {
      title: 'OPERACIONAL',
      items: [
        { path: '/sinistros', label: 'Sinistros & Ocorrências', icon: 'fa-folder-closed', badge: claimsCount },
        { path: '/multas', label: 'Multas de Trânsito', icon: 'fa-file-invoice-dollar', badge: finesCount },
        { path: '/os', label: 'Orçamentos & OS Chapeação', icon: 'fa-wrench' },
      ],
    },
    {
      title: 'FINANCEIRO',
      items: [
        { path: '/financeiro', label: 'Financeiro', icon: 'fa-sack-dollar' },
      ],
    },
    {
      title: 'DOCUMENTOS',
      items: [
        { path: '/termos', label: 'Emitir Termos Oficial', icon: 'fa-file-pen', badge: termsCount },
        { path: '/templates', label: 'Modelos de Documentos', icon: 'fa-sliders' },
      ],
    },
    {
      title: 'CADASTROS',
      items: [
        { path: '/frota-condutores', label: 'Frota & Condutores', icon: 'fa-users-gear' },
      ],
    },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/60 z-30 md:hidden" onClick={onClose} />
      )}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col flex-shrink-0 select-none transform transition-transform duration-200 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-slate-800 gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg">
            TP
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-black text-white text-sm tracking-tight leading-none truncate">
              Trans Pinho
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[9px] font-medium text-slate-400">Gravataí/RS</span>
              <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase">
                v2.6.0-BETA
              </span>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white p-1 ml-auto cursor-pointer">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 py-4 px-3 space-y-4 overflow-y-auto sidebar-scroll">
          {menuGroups.map((group) => {
            if (!group.items || group.items.length === 0) return null;
            return (
              <div key={group.title}>
                <button
                  onClick={() => alternarGrupo(group.title)}
                  className="w-full flex items-center justify-between px-3 mb-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider hover:text-slate-300 transition cursor-pointer"
                >
                  <span>{group.title}</span>
                  <i className={`fa-solid fa-chevron-down text-[8px] transition-transform ${gruposAbertos.has(group.title) ? '' : '-rotate-90'}`}></i>
                </button>
                {gruposAbertos.has(group.title) && (
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={onClose}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                            isActive
                              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <i
                              className={`fa-solid ${item.icon} text-sm w-4 text-center ${
                                isActive ? 'text-slate-950' : 'text-slate-400'
                              }`}
                            ></i>
                            <span>{item.label}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {item.isNew && (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                NOVO
                              </span>
                            )}
                            {item.badge !== undefined && (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isActive ? 'bg-slate-950 text-white' : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Profile Footer with Popover Menu */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 relative shrink-0" ref={profileRef}>
          {showProfileMenu && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 text-slate-800 z-50 animate-in fade-in zoom-in-95 duration-100">
              {podeGerenciarUsuarios && (
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onClose?.();
                    navigate('/usuarios');
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition cursor-pointer"
                >
                  <i className="fa-solid fa-users-gear text-amber-600 w-4 text-center"></i>
                  <span>Gerenciar Usuários</span>
                </button>
              )}

              {onLogout && (
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onClose?.();
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 border-t border-slate-100 mt-1 pt-1.5 transition cursor-pointer"
                >
                  <i className="fa-solid fa-right-from-bracket text-rose-600 w-4 text-center"></i>
                  <span>Sair</span>
                </button>
              )}
            </div>
          )}

          <div
            onClick={() => setShowProfileMenu((v) => !v)}
            className="flex items-center gap-3 p-2 -m-2 rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Opções do Usuário"
          >
            <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs shadow-inner shrink-0">
              {currentUser.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-amber-400 font-semibold truncate">{currentUser.role}</p>
            </div>
            <i className="fa-solid fa-chevron-up text-[10px] text-slate-500 mr-1"></i>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
