/* ==========================================================================
   NexClaim Enterprise - Global Store & State Management
   ========================================================================== */

class Store {
  constructor() {
    this.listeners = [];
    this.state = {
      currentView: 'dashboard',
      selectedClaimId: 'claim-1',
      currentUser: {
        id: 'usr-1',
        name: 'Carlos Silva',
        email: 'carlos.silva@empresa.com.br',
        role: 'ADMINISTRADOR',
        avatar: 'CS',
        department: 'Gestão de Frotas'
      },
      searchQuery: '',
      activeFilters: {
        status: '',
        priority: '',
        insurer: '',
        period: ''
      },
      unreadNotificationsCount: 2
    };
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  setView(viewName, claimId = null) {
    this.state.currentView = viewName;
    if (claimId) {
      this.state.selectedClaimId = claimId;
    }
    this.notify();
  }

  setUserRole(roleName) {
    const roleUserMap = {
      'ADMINISTRADOR': { id: 'usr-1', name: 'Carlos Silva', role: 'ADMINISTRADOR', avatar: 'CS', department: 'Gestão de Frotas' },
      'GESTOR': { id: 'usr-2', name: 'Mariana Souza', role: 'GESTOR', avatar: 'MS', department: 'Sinistros & Seguros' },
      'OPERADOR': { id: 'usr-3', name: 'Roberto Alves', role: 'OPERADOR', avatar: 'RA', department: 'Operações' },
      'VISUALIZADOR': { id: 'usr-4', name: 'Beatriz Lima', role: 'VISUALIZADOR', avatar: 'BL', department: 'Auditoria Interna' }
    };
    
    if (roleUserMap[roleName]) {
      this.state.currentUser = roleUserMap[roleName];
      this.notify();
    }
  }

  setFilters(filters) {
    this.state.activeFilters = { ...this.state.activeFilters, ...filters };
    this.notify();
  }

  resetFilters() {
    this.state.activeFilters = { status: '', priority: '', insurer: '', period: '' };
    this.notify();
  }
}

export const store = new Store();
