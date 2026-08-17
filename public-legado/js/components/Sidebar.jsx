const { React } = window;

window.Sidebar = function Sidebar({ currentView, setCurrentView, currentUser }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
    { id: 'claims', label: 'Sinistros', icon: 'fa-folder-closed', badge: '5' },
    { id: 'fines', label: 'Multas', icon: 'fa-file-invoice-dollar', badge: '3' },
    { id: 'documents', label: 'Documentos', icon: 'fa-file-contract' },
    { id: 'media', label: 'Fotos e Mídias', icon: 'fa-images' },
    { id: 'terms', label: 'Termos & Gerador', icon: 'fa-file-pen', isAuto: true },
    { id: 'people', label: 'Pessoas / Envolvidos', icon: 'fa-users' },
    { id: 'vehicles', label: 'Veículos', icon: 'fa-car' },
    { id: 'reports', label: 'Relatórios', icon: 'fa-chart-column' },
    { id: 'activity', label: 'Auditoria LGPD', icon: 'fa-shield-halved' },
    { id: 'users', label: 'Usuários & Permissões', icon: 'fa-user-gear' }
  ];

  return (
    <aside class="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col flex-shrink-0 z-30 select-none">
      {/* Brand Header */}
      <div class="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
          N
        </div>
        <div>
          <h1 class="font-black text-white text-lg tracking-tight leading-none">NexClaim</h1>
          <span class="text-[10px] uppercase font-semibold text-blue-400 tracking-wider">Enterprise v2.5</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav class="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div class="px-3 mb-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Módulos Principais</div>
        {menuItems.map(item => {
          const isActive = currentView === item.id || (item.id === 'claims' && currentView === 'claim-detail');
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              class={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <div class="flex items-center gap-3">
                <i class={`fa-solid ${item.icon} text-sm w-4 text-center ${isActive ? 'text-white' : 'text-slate-400'}`}></i>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span class={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'}`}>
                  {item.badge}
                </span>
              )}
              {item.isAuto && (
                <span class="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  AUTO
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer Card */}
      <div class="p-4 border-t border-slate-800 bg-slate-950/50">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-inner border border-blue-400/30">
            {currentUser.avatar}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-bold text-white truncate">{currentUser.name}</p>
            <p class="text-[10px] text-blue-400 font-semibold truncate">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
