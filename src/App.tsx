import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Login } from './components/Login';
import { TermGeneratorModal } from './components/TermGeneratorModal';
import { TemplateEditorView } from './views/TemplateEditorView';
import { TermsView } from './views/TermsView';
import { ClaimsListView } from './views/ClaimsListView';
import { FinesView } from './views/FinesView';
import { PeopleView } from './views/PeopleView';
import { VehiclesView } from './views/VehiclesView';
import { WorkOrdersView } from './views/WorkOrdersView';
import { DashboardView } from './views/DashboardView';
import { observarAutenticacao, logout } from './services/firebase';
import {
  useClaims,
  useCreateClaim,
  useUpdateClaim,
  useDeleteClaim,
  useFines,
  useCreateFine,
  useUpdateFine,
  useDeleteFine,
  useTerms,
  useCreateTerm,
  useUpdateTerm,
  useDeleteTerm,
  useVehicles,
  useCreateVehicle,
  useUpdateVehicle,
  useDeleteVehicle,
  usePeople,
  useCreatePerson,
  useUpdatePerson,
  useDeletePerson,
} from './hooks/useFirestoreData';
import {
  Claim,
  Fine,
  Term,
  DocumentTemplate,
  Person,
  Vehicle,
  RoleType,
} from './types';

export const App: React.FC = () => {
  const navigate = useNavigate();
  const [currentRole, setCurrentRole] = useState<RoleType>('ADMINISTRADOR');

  // Firebase Auth State
  const [usuarioLogado, setUsuarioLogado] = useState<User | null>(null);
  const [verificandoLogin, setVerificandoLogin] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = observarAutenticacao((user) => {
      setUsuarioLogado(user);
      setVerificandoLogin(false);
    });
    return () => unsubscribe();
  }, []);

  // React Query Firestore Data Hooks
  const { data: claims = [], isLoading: loadingClaims } = useClaims();
  const { data: fines = [], isLoading: loadingFines } = useFines();
  const { data: terms = [], isLoading: loadingTerms } = useTerms();
  const { data: vehicles = [], isLoading: loadingVehicles } = useVehicles();
  const { data: people = [], isLoading: loadingPeople } = usePeople();

  // Mutations
  const createClaimMutation = useCreateClaim();
  const updateClaimMutation = useUpdateClaim();
  const deleteClaimMutation = useDeleteClaim();

  const createFineMutation = useCreateFine();
  const updateFineMutation = useUpdateFine();
  const deleteFineMutation = useDeleteFine();

  const createTermMutation = useCreateTerm();
  const updateTermMutation = useUpdateTerm();
  const deleteTermMutation = useDeleteTerm();

  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();
  const deleteVehicleMutation = useDeleteVehicle();

  const createPersonMutation = useCreatePerson();
  const updatePersonMutation = useUpdatePerson();
  const deletePersonMutation = useDeletePerson();

  // Selected claim for term generation
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  // Template State
  const [templates, setTemplates] = useState<DocumentTemplate[]>([
    {
      id: 'tmpl-1',
      name: 'Termo de Responsabilidade (Multas & Não Indicação - NIC)',
      category: 'Responsabilidade',
      isActive: true,
      conditionRules: { occurrenceType: 'velocidade_nic' },
      availableVariables: [
        '{{nome_condutor}}',
        '{{cpf_condutor}}',
        '{{placa}}',
        '{{prefixo}}',
        '{{data_sinistro}}',
        '{{valor_total}}',
      ],
      content: `JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)\nRua Florida, 116 – Nossa Chácara – Gravataí/ RS\n\nTERMO DE RESPONSABILIDADE\n\n1. IDENTIFICAÇÃO DO CONDUTOR\nEu, {{nome_condutor}}, portador do CPF de nº {{cpf_condutor}}, na qualidade de condutor do veículo Placa: {{placa}}, Prefixo: {{prefixo}}.\n\n2. DETALHAMENTO DAS INFRAÇÕES E VALORES\n- Infração 01: Auto EL00093302 | Data: {{data_sinistro}} | Motivo: TRANSITAR EM VELOCIDADE SUPERIOR A MAXIMA PERMITIDA EM ATE 20% | Valor: R$ 130,16\n- Infração 02: Auto Gerado Duplicada | Motivo: MULTA POR NÃO INDENTIFICACAO DO CONTUDOR INFRATOR | Valor: R$ 130,16\n\nO condutor reconhece a infração. Considerando que o próprio condutor solicitou a não realização da indicação de condutor para transferência dos pontos da CNH, declara estar ciente e de acordo com o pagamento em dobro no valor total de {{valor_total}}.\n\n3. DA FORMA DE PAGAMENTO E PARCELAMENTO\n☑ Parcelado em 2 parcelas mensais de R$ 130,16.\n\n4. DA RESPONSABILIDADE E QUITAÇÃO\nAssumo integral responsabilidade pelo pagamento. Ao concluir o pagamento total, outorgo à empresa João Batista de Souza Pinho EPP (Trans Pinho) a mais ampla quitação.\n\nGRAVATAÍ, {{data_sinistro}}.`,
    },
    {
      id: 'tmpl-2',
      name: 'Termo de Responsabilidade (Infração Direta)',
      category: 'Responsabilidade',
      isActive: true,
      conditionRules: { occurrenceType: 'estacionamento_proibido' },
      availableVariables: [
        '{{nome_condutor}}',
        '{{cpf_condutor}}',
        '{{placa}}',
        '{{prefixo}}',
        '{{data_sinistro}}',
      ],
      content: `JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)\nRua Florida, 116 – Nossa Chácara – Gravataí/ RS\n\nTERMO DE RESPONSABILIDADE\n\n1. IDENTIFICAÇÃO DO CONDUTOR\nEu, {{nome_condutor}}, portador do CPF nº {{cpf_condutor}}, condutor do veículo Placa: {{placa}}, Prefixo: {{prefixo}}.\n\n2. DETALHES DO OCORRIDO\n- Auto de Infração nº: TE02141677 | Data: {{data_sinistro}}\n- Motivo: ESTACIONAR EM LOCAL/HORARIO PROIBIDO ESPECIFICAMENTE PELA SINALIZACAO.\n\n3. DECLARAÇÃO DE RESPONSABILIDADE\nDeclaro e assumo total e integral responsabilidade civil e administrativa pelas infrações de trânsito ocorridas, isentando a empresa João Batista de Souza Pinho EPP (Trans Pinho) de qualquer responsabilidade.\n\nGRAVATAÍ, {{data_sinistro}}.`,
    },
    {
      id: 'tmpl-3',
      name: 'Termo de Ciência e Autorização de Desconto em Folha',
      category: 'Ciência',
      isActive: true,
      conditionRules: { occurrenceType: 'colisao' },
      availableVariables: [
        '{{nome_condutor}}',
        '{{cpf_condutor}}',
        '{{placa}}',
        '{{valor_total}}',
        '{{data_sinistro}}',
      ],
      content: `JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)\nRua Florida, 116 – Nossa Chácara – Gravataí/ RS\n\nTERMO DE CIÊNCIA E AUTORIZAÇÃO DE DESCONTO EM FOLHA DE PAGAMENTO\n\nEu, {{nome_condutor}}, inscrito no CPF sob nº {{cpf_condutor}}, condutor do veículo Placa: {{placa}}, envolvido na ocorrência de trânsito, declaro que:\n\nI – Da ciência e reconhecimento da ocorrência: Declaro estar plenamente ciente dos fatos e danos materiais decorrentes.\nII – Do reconhecimento de responsabilidade: Reconheço minha responsabilidade pelos danos, assumindo o ressarcimento dos prejuízos no valor total de {{valor_total}}.\nIII – Da autorização de desconto em folha: Autorizo expressamente o desconto do valor em minha folha de pagamento em parcelas mensais.\n\nGravataí, {{data_sinistro}}.`,
    },
  ]);

  // Modals visibility
  const [showTermGenModal, setShowTermGenModal] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);

  const handleGenerateTerm = (newTerm: Term) => {
    const { id, ...termData } = newTerm;
    createTermMutation.mutate(termData);
    setShowTermGenModal(false);
    navigate('/termos');
  };

  const handleSaveTemplate = (updatedTemplate: DocumentTemplate) => {
    setTemplates((prev) => {
      const idx = prev.findIndex((t) => t.id === updatedTemplate.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedTemplate;
        return copy;
      }
      return [updatedTemplate, ...prev];
    });
  };

  const handleToggleTemplateStatus = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t))
    );
  };

  if (verificandoLogin) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white font-bold">
        <div className="flex flex-col items-center gap-3">
          <i className="fa-solid fa-circle-notch fa-spin text-2xl text-amber-400"></i>
          <span className="text-xs tracking-wider text-slate-300 font-semibold uppercase">
            Verificando autenticação...
          </span>
        </div>
      </div>
    );
  }

  if (!usuarioLogado) {
    return <Login onLoginSuccess={() => {}} />;
  }

  const isLoadingData = loadingClaims && loadingVehicles && loadingPeople;

  if (isLoadingData) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white font-bold">
        <div className="flex flex-col items-center gap-3">
          <i className="fa-solid fa-circle-notch fa-spin text-3xl text-amber-400"></i>
          <span className="text-xs tracking-wider text-slate-300 font-semibold uppercase">
            Carregando dados do Firestore (Trans Pinho)...
          </span>
        </div>
      </div>
    );
  }

  const userEmail = usuarioLogado.email || 'carlos@transpinho.com';
  const userName = userEmail.split('@')[0];
  const userAvatar = (userEmail.charAt(0) || 'U').toUpperCase();

  const currentUser = {
    name: userName,
    email: userEmail,
    role: currentRole,
    avatar: userAvatar,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar
        claimsCount={claims.length}
        finesCount={fines.length}
        termsCount={terms.length}
        currentUser={currentUser}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          onOpenSearch={() => setShowSearchModal(true)}
          onOpenNewClaim={() => navigate('/sinistros')}
          onOpenExcelImport={() => navigate('/multas')}
          onLogout={logout}
        />

        <main className="flex-1 overflow-y-auto p-6 relative">
          <Routes>
            <Route
              path="/"
              element={
                <DashboardView
                  claims={claims}
                  fines={fines}
                  terms={terms}
                  vehicles={vehicles}
                  people={people}
                  templates={templates}
                  onOpenTermGenerator={(claim) => {
                    setSelectedClaim(claim || claims[0]);
                    setShowTermGenModal(true);
                  }}
                />
              }
            />
            <Route
              path="/templates"
              element={
                <TemplateEditorView
                  templates={templates}
                  onSaveTemplate={handleSaveTemplate}
                  onToggleTemplateStatus={handleToggleTemplateStatus}
                />
              }
            />
            <Route
              path="/sinistros"
              element={
                <ClaimsListView
                  claims={claims}
                  people={people}
                  vehicles={vehicles}
                  terms={terms}
                  templates={templates}
                  onSaveNewClaim={(newClaim) => {
                    const { id, ...data } = newClaim;
                    createClaimMutation.mutate(data);
                  }}
                  onOpenTermGenerator={(claim) => {
                    setSelectedClaim(claim);
                    setShowTermGenModal(true);
                  }}
                  onDeleteClaim={(id) => deleteClaimMutation.mutate(id)}
                />
              }
            />
            <Route
              path="/multas"
              element={
                <FinesView
                  fines={fines}
                  vehicles={vehicles}
                  people={people}
                  onSaveFine={(newFine) => {
                    const { id, ...data } = newFine;
                    createFineMutation.mutate(data);
                  }}
                  onUpdateFineStatus={(id, newStatus) =>
                    updateFineMutation.mutate({ id, data: { status: newStatus } })
                  }
                  onDeleteFine={(id) => deleteFineMutation.mutate(id)}
                />
              }
            />
            <Route
              path="/termos"
              element={
                <TermsView
                  terms={terms}
                  claims={claims}
                  people={people}
                  vehicles={vehicles}
                  templates={templates}
                  onOpenTermGenerator={(claim) => {
                    if (claim) setSelectedClaim(claim);
                    setShowTermGenModal(true);
                  }}
                  onDeleteTerm={(id) => deleteTermMutation.mutate(id)}
                />
              }
            />
            <Route
              path="/frota"
              element={
                <VehiclesView
                  vehicles={vehicles}
                  people={people}
                  onSaveVehicle={(newV) => {
                    const { id, ...data } = newV;
                    createVehicleMutation.mutate(data);
                  }}
                  onDeleteVehicle={(id) => deleteVehicleMutation.mutate(id)}
                />
              }
            />
            <Route
              path="/condutores"
              element={
                <PeopleView
                  people={people}
                  onSavePerson={(newP) => {
                    const { id, ...data } = newP;
                    createPersonMutation.mutate(data);
                  }}
                  onDeletePerson={(id) => deletePersonMutation.mutate(id)}
                />
              }
            />
            <Route
              path="/os"
              element={
                <WorkOrdersView
                  vehicles={vehicles}
                  people={people}
                  claims={claims}
                />
              }
            />
          </Routes>
        </main>
      </div>

      {showTermGenModal && (
        <TermGeneratorModal
          claim={selectedClaim || claims[0]}
          people={people}
          vehicles={vehicles}
          templates={templates.filter((t) => t.isActive)}
          onClose={() => setShowTermGenModal(false)}
          onGenerateTerm={handleGenerateTerm}
        />
      )}
    </div>
  );
};

export default App;
