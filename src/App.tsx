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
      id: 'tmpl-multa-descontada',
      name: 'Termo de Responsabilidade (Valores Descontados e Assumindo os Pontos)',
      category: 'Responsabilidade',
      isActive: true,
      conditionRules: { hasFine: true },
      availableVariables: [
        '{{nome_condutor}}',
        '{{cpf_condutor}}',
        '{{placa}}',
        '{{prefixo}}',
        '{{auto_infracao}}',
        '{{data_infracao}}',
        '{{horario_infracao}}',
        '{{motivo_infracao}}',
        '{{valor_infracao}}',
        '{{valor_total}}',
        '{{data_vencimento}}',
        '{{numero_parcelas}}',
        '{{valor_parcela}}',
        '{{data_primeira_parcela}}',
        '{{dia_assinatura}}',
        '{{mes_assinatura}}',
      ],
      content: `TERMO DE RESPONSABILIDADE\n\n1. IDENTIFICAÇÃO DO CONDUTOR\n\nEu, {{nome_condutor}}, portador do CPF de nº {{cpf_condutor}} na qualidade de condutor dos veículos abaixo identificado:\n\n- Placa: {{placa}}\n- Prefixo do Carro: {{prefixo}}\n\n2. DETALHAMENTO DA INFRAÇÃO E VALOR\n\n- Infração 01:\n  - Auto de Infração nº: {{auto_infracao}}\n  - Data: {{data_infracao}} | Horário: {{horario_infracao}}\n  - Motivo/Enquadramento: {{motivo_infracao}}\n  - Valor: {{valor_infracao}}\n\nVALOR TOTAL: {{valor_total}}\n\n3. DA FORMA DE PAGAMENTO E PARCELAMENTO\n\nO condutor declara-se ciente do débito total acima mencionado e opta pela seguinte modalidade de quitação:\n\n☐ Cota Única: Vencimento em {{data_vencimento}}\n☐ Parcelado: Em {{numero_parcelas}} parcelas de {{valor_parcela}} Mensais.\nPrimeira parcela em: {{data_primeira_parcela}}\n\n4. DA RESPONSABILIDADE E QUITAÇÃO\n\nAssumo integral responsabilidade civil e administrativa pelo pagamento dos valores aqui descritos. Ao concluir o pagamento total, outorgo à empresa JOÃO BATISTA DE SOUZA PINHO EPP – TRANS PINHO a mais ampla, geral e irrevogável quitação, para nada mais declarar em juízo ou fora dele, operando-se a sub-rogação de direitos em favor da referida Trans Pinho.\n\nGRAVATAÍ, {{dia_assinatura}} de {{mes_assinatura}} de 2026.\n\n\n_______________________________________________\nAssinatura do Condutor`,
    },
    {
      id: 'tmpl-empresa-paga-multa',
      name: 'Termo de Responsabilidade (Empresa Paga a Multa)',
      category: 'Responsabilidade',
      isActive: true,
      conditionRules: { hasFine: true },
      availableVariables: [
        '{{nome_condutor}}',
        '{{cpf_condutor}}',
        '{{placa}}',
        '{{prefixo}}',
        '{{auto_infracao}}',
        '{{data_infracao}}',
        '{{horario_infracao}}',
        '{{motivo_infracao}}',
        '{{dia_assinatura}}',
        '{{mes_assinatura}}',
      ],
      content: `TERMO DE RESPONSABILIDADE\n\n1. IDENTIFICAÇÃO DO CONDUTOR\n\nEu, {{nome_condutor}} portador(a) do CPF nº {{cpf_condutor}}, na qualidade de condutor(a) do veículo abaixo identificado:\n\n- Placa: {{placa}}\n- Prefixo do Carro: {{prefixo}}\n\n2. DETALHES DO OCORRIDO\n\n- Auto de Infração nº: {{auto_infracao}}\n- Data do ocorrido: {{data_infracao}}\n- Horário: {{horario_infracao}}\n- Motivo (Enquadramento): {{motivo_infracao}}\n\n3. DECLARAÇÃO DE RESPONSABILIDADE\n\nDeclaro e assumo total e integral responsabilidade civil e administrativa pelas infrações de trânsito ocorridas com o veículo acima descrito, bem como por todas as consequências decorrentes destes atos. Confirmo ter total ciência da natureza e gravidade das referidas infrações, isentando a empresa João Batista de Souza Pinho EPP (Trans Pinho) de qualquer responsabilidade sobre as mesmas, uma vez que decorreram da minha conduta direta na condução do veículo.\n\nGRAVATAÍ, {{dia_assinatura}} de {{mes_assinatura}} de 2026.\n\n\n_______________________________________________\nAssinatura do Condutor`,
    },
    {
      id: 'tmpl-desconto-folha',
      name: 'Termo de Ciência e Autorização de Desconto em Folha de Pagamento',
      category: 'Ciência',
      isActive: true,
      conditionRules: { hasThirdParty: true },
      availableVariables: [
        '{{nome_condutor}}',
        '{{cpf_condutor}}',
        '{{modelo_veiculo}}',
        '{{placa}}',
        '{{numero_ocorrencia}}',
        '{{modelo_veiculo_terceiro}}',
        '{{placa_terceiro}}',
        '{{valor_total}}',
        '{{valor_total_extenso}}',
        '{{numero_parcelas}}',
        '{{valor_parcela}}',
        '{{data_primeira_parcela}}',
        '{{dia_assinatura}}',
        '{{mes_assinatura}}',
      ],
      content: `TERMO DE CIÊNCIA E AUTORIZAÇÃO DE DESCONTO EM FOLHA DE PAGAMENTO\n\nEu, {{nome_condutor}}, inscrito no CPF sob nº {{cpf_condutor}}, declaro, para os devidos fins de direito, na qualidade de condutor do veículo {{modelo_veiculo}}, placa {{placa}}, envolvido na ocorrência de trânsito nº {{numero_ocorrencia}}, envolvendo o veículo {{modelo_veiculo_terceiro}}, placa {{placa_terceiro}}, que:\n\nI – Da ciência e reconhecimento da ocorrência\nDeclaro estar plenamente ciente dos fatos relacionados à ocorrência acima descrita, bem como dos danos materiais dela decorrentes.\n\nII – Do reconhecimento de responsabilidade\nReconheço minha responsabilidade pelos danos ocasionados em decorrência do referido evento, assumindo integralmente a obrigação referente ao ressarcimento dos prejuízos apurados, no valor total de {{valor_total}} ({{valor_total_extenso}}).\n\nIII – Da autorização de desconto em folha\nAutorizo, de forma expressa, livre, consciente e inequívoca, nos termos da legislação aplicável e do acordo firmado entre as partes, o desconto do valor acima mencionado em minha folha de pagamento/contracheque, mediante o seguinte parcelamento:\n\nValor total: {{valor_total}}\nParcelamento: {{numero_parcelas}} parcelas mensais e sucessivas de {{valor_parcela}}\n\nData do primeiro pagamento: {{data_primeira_parcela}}\n\nDeclaro que assino o presente instrumento por minha livre e espontânea vontade, sem qualquer vício de consentimento, estando ciente de todos os seus termos, efeitos e consequências jurídicas.\n\nGravataí, {{dia_assinatura}} de {{mes_assinatura}} de 2026\n\n\n_______________________________________________\n{{nome_condutor}}\n{{cpf_condutor}}`,
    },
    {
      id: 'tmpl-quitacao-reparo-empresa',
      name: 'Termo de Quitação (Reparo Custeado pela Empresa)',
      category: 'Declaração',
      isActive: true,
      conditionRules: {},
      availableVariables: [
        '{{nome_condutor}}',
        '{{cpf_condutor}}',
        '{{placa}}',
        '{{data_sinistro}}',
        '{{numero_ocorrencia}}',
        '{{dia_assinatura}}',
        '{{mes_assinatura}}',
      ],
      content: `TERMO DE QUITAÇÃO\n\nEu, {{nome_condutor}}, inscrito(a) no CPF nº {{cpf_condutor}}, proprietário(a)/condutor(a) do micro-ônibus placa {{placa}}, declaro, para todos os fins de direito, estar de pleno acordo com os reparos realizados em meu veículo, decorrentes do sinistro ocorrido em {{data_sinistro}}, registrado sob a ocorrência nº {{numero_ocorrencia}}, os quais foram executados na chapeação da empresa JOÃO BATISTA DE SOUZA PINHO EPP – TRANS PINHO, bem como com o custeio, por esta empresa, da confecção e aplicação dos adesivos necessários para o restabelecimento das características originais do veículo.\n\nDeclaro que os serviços foram executados de forma satisfatória e atendem integralmente ao que foi acordado entre as partes, considerando plenamente reparados os danos decorrentes do sinistro.\n\nPor meio deste instrumento, concedo à JOÃO BATISTA DE SOUZA PINHO EPP – TRANS PINHO, inscrita no CNPJ nº 94.476.207/0001-80, plena, geral, irrevogável e irretratável quitação, nada mais tendo a reclamar ou exigir, judicial ou extrajudicialmente, a qualquer título, em relação aos fatos, danos, prejuízos, obrigações e eventuais desdobramentos decorrentes do referido sinistro.\n\nDeclaro, ainda, que o presente termo é firmado por minha livre e espontânea vontade, com plena ciência de seus efeitos legais, dando quitação integral, rasa, geral, irrevogável e irretratável sobre os fatos aqui descritos.\n\nPor estarem justas e acordadas, as partes firmam o presente instrumento para que produza todos os seus efeitos legais.\n\nGravataí/RS, {{dia_assinatura}} de {{mes_assinatura}} de 2026.\n\n\n_______________________________________________\n{{nome_condutor}}\nCPF: {{cpf_condutor}}`,
    },
    {
      id: 'tmpl-quitacao-pix-condutor',
      name: 'Termo de Quitação (Pagamento via Pix pelo Condutor)',
      category: 'Declaração',
      isActive: true,
      conditionRules: {},
      availableVariables: [
        '{{nome_condutor}}',
        '{{cpf_condutor}}',
        '{{placa}}',
        '{{modelo_veiculo}}',
        '{{oficina}}',
        '{{valor_total}}',
        '{{valor_total_extenso}}',
        '{{chave_pix}}',
        '{{data_sinistro}}',
        '{{numero_ocorrencia}}',
        '{{placa_terceiro}}',
        '{{dia_assinatura}}',
        '{{mes_assinatura}}',
      ],
      content: `TERMO DE QUITAÇÃO\n\nEu, {{nome_condutor}}, inscrito no CPF nº {{cpf_condutor}}, condutor do veículo placa {{placa}}, modelo {{modelo_veiculo}}, declaro, para todos os fins de direito, estar de pleno acordo com o conserto do referido veículo junto à oficina {{oficina}}, no valor total de {{valor_total}} ({{valor_total_extenso}}) a ser paga mediante transferência via Pix para a chave {{chave_pix}}, referente à composição e reparação dos danos decorrentes do sinistro ocorrido em {{data_sinistro}}, registrado sob a ocorrência nº {{numero_ocorrencia}} envolvendo o veículo da empresa JOÃO BATISTA DE SOUZA PINHO EPP – TRANS PINHO, placa {{placa_terceiro}}.\n\nPor meio deste instrumento, concedo à JOÃO BATISTA DE SOUZA PINHO EPP – TRANS PINHO, inscrita no CNPJ nº 94.476.207/0001-80, plena, geral, irrevogável e irretratável quitação, nada mais tendo a reclamar ou exigir, judicial ou extrajudicialmente, a qualquer título, em relação aos fatos, danos, obrigações e eventuais desdobramentos decorrentes do referido sinistro.\n\nDeclaro, ainda, que o presente termo é firmado por minha livre e espontânea vontade, com plena ciência de seus efeitos legais, dando quitação integral, rasa e geral sobre os fatos aqui descritos, operando-se, se cabível, a sub-rogação de eventuais direitos em favor da TRANS PINHO.\n\nPor estarem justas e acordadas, as partes firmam o presente instrumento para que produza todos os seus efeitos legais.\n\nGravataí/RS, {{dia_assinatura}} de {{mes_assinatura}} de 2026.\n\n\n_______________________________________________\n{{nome_condutor}}\nCPF: {{cpf_condutor}}`,
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
                    console.log('[DIAG] onSaveVehicle recebido no App.tsx:', newV);
                    const { id, ...data } = newV;
                    console.log('[DIAG] chamando createVehicleMutation.mutate com:', data);
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
