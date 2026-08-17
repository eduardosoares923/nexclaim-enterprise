/* ==========================================================================
   NexClaim Enterprise - Topbar Header Component
   ========================================================================== */
import { store } from '../store.js';

export function renderHeader(container, state) {
  const { currentUser, unreadNotificationsCount } = state;

  container.innerHTML = `
    <!-- Global Search Trigger -->
    <div class="flex items-center gap-4 flex-1 max-w-md">
      <div 
        id="global-search-trigger" 
        class="w-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg px-3.5 py-2 flex items-center justify-between text-xs text-slate-500 cursor-pointer transition-all"
      >
        <div class="flex items-center gap-2.5">
          <i class="fa-solid fa-magnifying-glass text-slate-400"></i>
          <span>Pesquisar por Sinistro, Placa, CPF, Multa...</span>
        </div>
        <kbd class="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-500 shadow-2xs">Ctrl + K</kbd>
      </div>
    </div>

    <!-- Header Actions -->
    <div class="flex items-center gap-3">
      
      <!-- Role Switcher (Demo Feature) -->
      <div class="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
        <span class="text-[10px] font-bold text-slate-500 uppercase px-2">Perfil:</span>
        <select id="role-switcher" class="bg-white border border-slate-200 rounded text-xs font-semibold px-2 py-1 text-slate-700 focus:outline-none cursor-pointer">
          <option value="ADMINISTRADOR" ${currentUser.role === 'ADMINISTRADOR' ? 'selected' : ''}>ADMINISTRADOR (Acesso Total)</option>
          <option value="GESTOR" ${currentUser.role === 'GESTOR' ? 'selected' : ''}>GESTOR (Gestão Operacional)</option>
          <option value="OPERADOR" ${currentUser.role === 'OPERADOR' ? 'selected' : ''}>OPERADOR (Cadastro & Atualizações)</option>
          <option value="VISUALIZADOR" ${currentUser.role === 'VISUALIZADOR' ? 'selected' : ''}>VISUALIZADOR (Somente Leitura)</option>
        </select>
      </div>

      <!-- Notifications Bell Button -->
      <div class="relative">
        <button id="notif-btn" class="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 flex items-center justify-center relative transition-colors">
          <i class="fa-solid fa-bell text-sm"></i>
          ${unreadNotificationsCount > 0 ? `
            <span class="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
              ${unreadNotificationsCount}
            </span>
          ` : ''}
        </button>

        <!-- Notification Center Dropdown -->
        <div id="notif-dropdown" class="hidden absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-fade-in">
          <div class="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
            <h4 class="text-xs font-bold text-slate-800">Notificações</h4>
            <span class="text-[10px] text-blue-600 font-semibold cursor-pointer">Marcar todas como lidas</span>
          </div>
          <div class="max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs">
            <div class="p-3 hover:bg-slate-50 transition-colors flex gap-2.5">
              <i class="fa-solid fa-triangle-exclamation text-amber-500 text-sm mt-0.5"></i>
              <div>
                <p class="font-semibold text-slate-800">Multa AIF-772910-Y com vencimento em 18/08</p>
                <span class="text-[10px] text-slate-400">Há 2 horas</span>
              </div>
            </div>
            <div class="p-3 hover:bg-slate-50 transition-colors flex gap-2.5">
              <i class="fa-solid fa-file-circle-exclamation text-rose-500 text-sm mt-0.5"></i>
              <div>
                <p class="font-semibold text-slate-800">Documento pendente no Sinistro SIN-2026-00127</p>
                <span class="text-[10px] text-slate-400">Há 1 dia</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Action Add Button -->
      <button id="quick-new-claim-btn" class="btn btn-primary text-xs shadow-sm">
        <i class="fa-solid fa-plus text-xs"></i> Novo Sinistro
      </button>

    </div>
  `;

  // Attach event handlers
  document.getElementById('global-search-trigger')?.addEventListener('click', () => {
    const searchModal = document.getElementById('search-modal-container');
    if (searchModal) searchModal.classList.remove('hidden');
  });

  document.getElementById('role-switcher')?.addEventListener('change', (e) => {
    store.setUserRole(e.target.value);
  });

  const notifBtn = document.getElementById('notif-btn');
  const notifDropdown = document.getElementById('notif-dropdown');
  notifBtn?.addEventListener('click', () => {
    notifDropdown?.classList.toggle('hidden');
  });

  document.getElementById('quick-new-claim-btn')?.addEventListener('click', () => {
    const modalContainer = document.getElementById('modal-container');
    if (window.openNewClaimModal) {
      window.openNewClaimModal();
    }
  });

  // Global Keyboard Shortcut Ctrl+K
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const searchModal = document.getElementById('search-modal-container');
      if (searchModal) searchModal.classList.remove('hidden');
    }
  });
}
