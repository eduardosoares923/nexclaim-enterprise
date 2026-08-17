const { React, useState, useEffect } = window;

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedClaimId, setSelectedClaimId] = useState('claim-1');
  const [currentUser, setCurrentUser] = useState({
    id: 'usr-1',
    name: 'Carlos Silva',
    email: 'carlos.silva@empresa.com.br',
    role: 'ADMINISTRADOR',
    avatar: 'CS',
    department: 'Gestão de Frotas'
  });

  const [claimsList, setClaimsList] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showNewClaimModal, setShowNewClaimModal] = useState(false);
  const [showTermGeneratorModal, setShowTermGeneratorModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [modalClaim, setModalClaim] = useState(null);

  useEffect(() => {
    fetchClaims();
  }, []);

  async function fetchClaims() {
    try {
      const res = await fetch('/api/claims');
      const data = await res.json();
      setClaimsList(data || []);
    } catch (err) {
      console.error(err);
    }
  }

  function handleSelectClaim(id) {
    setSelectedClaimId(id);
    setCurrentView('claim-detail');
  }

  function handleOpenTermGenerator(claim = null) {
    setModalClaim(claim || (claimsList[0] || null));
    setShowTermGeneratorModal(true);
  }

  function handleOpenExportModal(claim = null) {
    const target = claim || claimsList.find(c => c.id === selectedClaimId) || claimsList[0];
    setModalClaim(target);
    setShowExportModal(true);
  }

  function handleSetRole(newRole) {
    const roleMap = {
      'ADMINISTRADOR': { id: 'usr-1', name: 'Carlos Silva', role: 'ADMINISTRADOR', avatar: 'CS' },
      'GESTOR': { id: 'usr-2', name: 'Mariana Souza', role: 'GESTOR', avatar: 'MS' },
      'OPERADOR': { id: 'usr-3', name: 'Roberto Alves', role: 'OPERADOR', avatar: 'RA' },
      'VISUALIZADOR': { id: 'usr-4', name: 'Beatriz Lima', role: 'VISUALIZADOR', avatar: 'BL' }
    };
    if (roleMap[newRole]) {
      setCurrentUser(roleMap[newRole]);
    }
  }

  return (
    <div class="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Sidebar Navigation */}
      <window.Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        currentUser={currentUser} 
      />

      {/* Main Content Area */}
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar Header */}
        <window.Header 
          currentUser={currentUser} 
          setCurrentUserRole={handleSetRole}
          onOpenSearch={() => setShowSearchModal(true)}
          onOpenNewClaimModal={() => setShowNewClaimModal(true)}
        />

        {/* Dynamic View Canvas */}
        <main class="flex-1 overflow-y-auto p-6 relative">
          {currentView === 'dashboard' && (
            <window.DashboardView 
              setCurrentView={setCurrentView} 
              selectClaim={handleSelectClaim}
              onOpenNewClaimModal={() => setShowNewClaimModal(true)}
            />
          )}

          {currentView === 'claims' && (
            <window.ClaimsListView 
              selectClaim={handleSelectClaim}
              onOpenNewClaimModal={() => setShowNewClaimModal(true)}
            />
          )}

          {currentView === 'claim-detail' && (
            <window.ClaimDetailView 
              claimId={selectedClaimId}
              setCurrentView={setCurrentView}
              onOpenExportModal={handleOpenExportModal}
              onOpenTermGeneratorModal={handleOpenTermGenerator}
            />
          )}

          {currentView === 'fines' && <window.FinesView />}
          {currentView === 'documents' && <window.DocumentsView />}
          {currentView === 'media' && <window.MediaGalleryView />}
          
          {currentView === 'terms' && (
            <window.TermsView 
              onOpenTermGeneratorModal={handleOpenTermGenerator}
            />
          )}

          {currentView === 'people' && <window.PeopleView />}
          {currentView === 'vehicles' && <window.VehiclesView />}
          
          {currentView === 'reports' && (
            <window.ReportsView 
              onOpenExportModal={handleOpenExportModal}
            />
          )}

          {currentView === 'activity' && <window.AuditLogView />}
          {currentView === 'users' && <window.UsersView />}
        </main>
      </div>

      {/* Global Search Overlay Modal */}
      {showSearchModal && (
        <window.GlobalSearchModal 
          onClose={() => setShowSearchModal(false)}
          selectClaim={handleSelectClaim}
        />
      )}

      {/* New Claim Modal */}
      {showNewClaimModal && (
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden animate-fade-in border border-slate-200">
            <window.NewClaimModal 
              onClose={() => setShowNewClaimModal(false)}
              onCreated={() => { fetchClaims(); setCurrentView('claims'); }}
            />
          </div>
        </div>
      )}

      {/* Smart Term Generator Modal (Requisito 35) */}
      {showTermGeneratorModal && (
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden animate-fade-in border border-slate-200">
            <window.TermGeneratorModal 
              claims={claimsList}
              initialClaim={modalClaim}
              onClose={() => setShowTermGeneratorModal(false)}
              onGenerated={() => fetchClaims()}
            />
          </div>
        </div>
      )}

      {/* Dossier Export Modal */}
      {showExportModal && (
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden animate-fade-in border border-slate-200">
            <window.DossierExportModal 
              claim={modalClaim}
              onClose={() => setShowExportModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
