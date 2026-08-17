import React from 'react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  claimsCount: number;
  finesCount: number;
  termsCount: number;
  currentUser: { name: string; email: string; role: string; avatar: string };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  claimsCount,
  finesCount,
  termsCount,
  currentUser,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Painel Trans Pinho', icon: 'fa-chart-pie' },
    { id: 'claims', label: 'Sinistros & Ocorrências', icon: 'fa-folder-closed', badge: claimsCount },
    { id: 'fines', label: 'Multas de Trânsito', icon: 'fa-file-invoice-dollar', badge: finesCount },
    { id: 'terms', label: 'Emitir Termos Oficial', icon: 'fa-file-pen', badge: termsCount },
    { id: 'templates', label: 'Modelos de Documentos', icon: 'fa-sliders', isNew: true },
    { id: 'people', label: 'Condutores', icon: 'fa-users' },
    { id: 'vehicles', label: 'Frota & Prefixos', icon: 'fa-truck-front' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col flex-shrink-0 z-30 select-none">
      <div className="h-16 flex items-center px-5 border-b border-slate-800 gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg">
          TP
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-black text-white text-sm tracking-tight leading-none truncate">
            Trans Pinho
          </h1>
          <span className="text-[9px] uppercase font-bold text-amber-400 tracking-wider">
            Gravataí / RS • React TS
          </span>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          Módulos Corporativos
        </div>
        {menuItems.map((item) => {
          const isActive =
            currentView === item.id || (item.id === 'claims' && currentView === 'claim-detail');
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
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
                    ADMIN
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
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs shadow-inner">
            {currentUser.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
            <p className="text-[10px] text-amber-400 font-semibold truncate">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
