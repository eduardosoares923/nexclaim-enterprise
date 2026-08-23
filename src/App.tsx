import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Login } from './components/Login';
import { TermGeneratorModal } from './components/TermGeneratorModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { TemplateEditorView } from './views/TemplateEditorView';
import { TermsView } from './views/TermsView';
import { ClaimsListView } from './views/ClaimsListView';
import { FinesView } from './views/FinesView';
import { FrotaCondutoresView } from './views/FrotaCondutoresView';
import { WorkOrdersView } from './views/WorkOrdersView';
import { FinanceiroView } from './views/FinanceiroView';
import { DashboardView } from './views/DashboardView';
import { UsersView } from './views/UsersView';
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
  useInfractionTypes,
  useCreateInfractionType,
  useUpdateInfractionType,
  useDeleteInfractionType,
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
  useWorkOrders,
  useCreateWorkOrder,
  useUpdateWorkOrder,
  useDeleteWorkOrder,
  useFinancialEntries,
  useCreateFinancialEntry,
  useUpdateFinancialEntry,
  useDeleteFinancialEntry,
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
import { usePermissions } from './hooks/usePermissions';
import { formatarDataBr, limparDescricaoMulta } from './utils/dateUtils';

export const App: React.FC = () => {
  const navigate = useNavigate();
  const [papelReal, setPapelReal] = useState<RoleType | undefined>(undefined);
  const [sidebarAberto, setSidebarAberto] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Firebase Auth State
  const [usuarioLogado, setUsuarioLogado] = useState<User | null>(null);
  const [verificandoLogin, setVerificandoLogin] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = observarAutenticacao((user) => {
      setUsuarioLogado(user);
      if (user) {
        user.getIdTokenResult().then((res: any) => {
          setPapelReal((res?.claims?.role as RoleType) || 'VISUALIZADOR');
          setVerificandoLogin(false);
        }).catch(() => {
          setPapelReal('VISUALIZADOR');
          setVerificandoLogin(false);
        });
      } else {
        setPapelReal(undefined);
        setVerificandoLogin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // React Query Firestore Data Hooks
  const loginConfirmado = !verificandoLogin && !!usuarioLogado;
  const { data: claims = [], isLoading: loadingClaims } = useClaims(loginConfirmado);
  const { data: fines = [], isLoading: loadingFines } = useFines(loginConfirmado);
  const { data: infractionTypes = [] } = useInfractionTypes(loginConfirmado);
  const { data: terms = [], isLoading: loadingTerms } = useTerms(loginConfirmado);
  const { data: vehicles = [], isLoading: loadingVehicles } = useVehicles(loginConfirmado);
  const { data: people = [], isLoading: loadingPeople } = usePeople(loginConfirmado);
  const { data: workOrders = [], isLoading: loadingWorkOrders } = useWorkOrders(loginConfirmado);
  const { data: financialEntries = [], isLoading: loadingFinancialEntries } = useFinancialEntries(loginConfirmado);

  // Mutations
  const createClaimMutation = useCreateClaim();
  const updateClaimMutation = useUpdateClaim();
  const deleteClaimMutation = useDeleteClaim();

  const createFineMutation = useCreateFine();
  const updateFineMutation = useUpdateFine();
  const deleteFineMutation = useDeleteFine();

  const createInfractionTypeMutation = useCreateInfractionType();
  const updateInfractionTypeMutation = useUpdateInfractionType();
  const deleteInfractionTypeMutation = useDeleteInfractionType();

  const createTermMutation = useCreateTerm();
  const updateTermMutation = useUpdateTerm();
  const deleteTermMutation = useDeleteTerm();

  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();
  const deleteVehicleMutation = useDeleteVehicle();

  const createPersonMutation = useCreatePerson();
  const updatePersonMutation = useUpdatePerson();
  const deletePersonMutation = useDeletePerson();

  const createWorkOrderMutation = useCreateWorkOrder();
  const updateWorkOrderMutation = useUpdateWorkOrder();
  const deleteWorkOrderMutation = useDeleteWorkOrder();

  const createFinancialEntryMutation = useCreateFinancialEntry();
  const updateFinancialEntryMutation = useUpdateFinancialEntry();
  const deleteFinancialEntryMutation = useDeleteFinancialEntry();

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
        '{{opcao_cota_unica}}',
        '{{opcao_parcelado}}',
        '{{data_vencimento}}',
        '{{numero_parcelas}}',
        '{{valor_parcela}}',
        '{{data_primeira_parcela}}',
        '{{dia_assinatura}}',
        '{{mes_assinatura}}',
      ],
      content: `TERMO DE RESPONSABILIDADE\n\n1. IDENTIFICAÇÃO DO CONDUTOR\n\nEu, {{nome_condutor}}, portador do CPF de nº {{cpf_condutor}} na qualidade de condutor dos veículos abaixo identificado:\n\n- Placa: {{placa}}\n- Prefixo do Carro: {{prefixo}}\n\n2. DETALHAMENTO DA INFRAÇÃO E VALOR\n\n- Infração 01:\n  - Auto de Infração nº: {{auto_infracao}}\n  - Data: {{data_infracao}} | Horário: {{horario_infracao}}\n  - Motivo/Enquadramento: {{motivo_infracao}}\n  - Valor: {{valor_infracao}}\n\nVALOR TOTAL: {{valor_total}}\n\n3. DA FORMA DE PAGAMENTO E PARCELAMENTO\n\nO condutor declara-se ciente do débito total acima mencionado e opta pela seguinte modalidade de quitação:\n\n{{opcao_cota_unica}} Cota Única: Vencimento em {{data_vencimento}}\n{{opcao_parcelado}} Parcelado: Em {{numero_parcelas}} parcelas de {{valor_parcela}} Mensais.\nPrimeira parcela em: {{data_primeira_parcela}}\n\n4. DA RESPONSABILIDADE E QUITAÇÃO\n\nAssumo integral responsabilidade civil e administrativa pelo pagamento dos valores aqui descritos. Ao concluir o pagamento total, outorgo à empresa JOÃO BATISTA DE SOUZA PINHO EPP – TRANS PINHO a mais ampla, geral e irrevogável quitação, para nada mais declarar em juízo ou fora dele, operando-se a sub-rogação de direitos em favor da referida Trans Pinho.\n\nGRAVATAÍ, {{dia_assinatura}} de {{mes_assinatura}} de 2026.\n\n\n_______________________________________________\nAssinatura do Condutor`,
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
    gerarLancamentoAutomaticoParaTermo(newTerm);
    setShowTermGenModal(false);
    navigate('/termos');
  };

  const gerarLancamentoAutomaticoParaTermo = async (term: Term) => {
    if (term.status !== 'Assinado') return;

    const jaExiste = financialEntries.some(
      (e) => e.originId === term.claimId || e.originId === term.fineId
    );
    if (jaExiste) return;

    try {
      if (term.claimId) {
        const claim = claims.find((c) => c.id === term.claimId);
        if (!claim) return;
        const total = claim.totalValue || claim.approvedCost || claim.estimatedCost || 0;
        if (total <= 0) return;
        await createFinancialEntryMutation.mutateAsync({
          driverName: claim.driverName || 'Condutor Não Informado',
          originType: 'Sinistro',
          originId: claim.id,
          originLabel: claim.claimNumber,
          description: `Sinistro ${claim.claimNumber} - ${claim.occurrenceType || 'Ocorrência'}`,
          direction: (claim.paymentDirection as 'Cobrar' | 'Pagar') || 'Cobrar',
          totalAmount: total,
          installmentsCount: 1,
          installmentValue: total,
          paidInstallments: 0,
          firstDueDate: claim.date || new Date().toISOString().split('T')[0],
          status: 'Pendente',
          notes: claim.description ? `Sinistro: ${claim.description.slice(0, 150)}` : undefined,
        });
        return;
      }

      if (term.fineId) {
        const fine = fines.find((f) => f.id === term.fineId);
        if (!fine) return;
        const total = fine.amount || 0;
        if (total <= 0) return;
        const numParcelas = term.installmentsCount && term.installmentsCount > 0 ? term.installmentsCount : 1;
        await createFinancialEntryMutation.mutateAsync({
          driverName: fine.driverName || 'Condutor Não Informado',
          originType: 'Multa',
          originId: fine.id,
          originLabel: fine.infractionAuto || fine.infractionCode || 'Multa',
          description: `Multa ${fine.infractionAuto || fine.infractionCode || ''} - ${limparDescricaoMulta(fine.description)}`,
          direction: 'Cobrar',
          totalAmount: total,
          installmentsCount: numParcelas,
          installmentValue: Math.round((total / numParcelas) * 100) / 100,
          paidInstallments: 0,
          firstDueDate: fine.dueDate || new Date().toISOString().split('T')[0],
          status: 'Pendente',
          notes: `Placa: ${fine.vehiclePlate}`,
        });
      }
    } catch (err: any) {
      alert(`Não foi possível gerar o lançamento financeiro automaticamente para este termo: ${err?.message || err}. Vá em Financeiro e use o botão "Gerar Lançamentos Automaticamente" pra tentar de novo.`);
    }
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
  const userRole = papelReal || 'VISUALIZADOR';
  const permissoes = usePermissions(userRole, userEmail);

  const currentUser = {
    name: userName,
    email: userEmail,
    role: userRole,
    avatar: userAvatar,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar
        claimsCount={claims.length}
        finesCount={fines.length}
        termsCount={terms.length}
        currentUser={currentUser}
        onLogout={logout}
        isOpen={sidebarAberto}
        onClose={() => setSidebarAberto(false)}
        podeGerenciarUsuarios={permissoes.podeGerenciarUsuarios}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onOpenSearch={() => setShowSearchModal(true)}
          onOpenNewClaim={() => navigate('/sinistros')}
          onLogout={logout}
          onOpenSidebar={() => setSidebarAberto(true)}
          podeGerenciarUsuarios={permissoes.podeGerenciarUsuarios}
          podeCriar={permissoes.podeCriar}
        />

        <main className="flex-1 overflow-y-auto p-3 sm:p-6 relative">
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
                    if (!claim && claims.length === 0) {
                      alert('Cadastre pelo menos um sinistro antes de emitir um termo.');
                      return;
                    }
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
                  userRole={userRole}
                  userEmail={userEmail}
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
                  onUpdateClaim={(id, data) => updateClaimMutation.mutate({ id, data })}
                  userRole={userRole}
                  userEmail={userEmail}
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
                  infractionTypes={infractionTypes}
                  templates={templates}
                  onGenerateTerm={(term) => {
                    const { id, ...termData } = term as any;
                    createTermMutation.mutate(termData, {
                      onSuccess: () => gerarLancamentoAutomaticoParaTermo(term),
                      onError: (err: any) => alert(`Não foi possível salvar o termo: ${err?.message || err}`),
                    });
                  }}
                  onSaveFine={(newFine) => {
                    const { id, ...data } = newFine;
                    createFineMutation.mutate(data);
                  }}
                  onUpdateFineStatus={(id, newStatus) =>
                    updateFineMutation.mutate({ id, data: { status: newStatus } })
                  }
                  onUpdateFine={(id, data) => updateFineMutation.mutate({ id, data })}
                  onDeleteFine={(id) => deleteFineMutation.mutate(id)}
                  onSaveInfractionType={(data) => createInfractionTypeMutation.mutate(data)}
                  onUpdateInfractionType={(id, data) => updateInfractionTypeMutation.mutate({ id, data })}
                  onDeleteInfractionType={(id) => deleteInfractionTypeMutation.mutate(id)}
                  userRole={userRole}
                  userEmail={userEmail}
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
                    if (!claim && claims.length === 0) {
                      alert('Cadastre pelo menos um sinistro antes de emitir um termo.');
                      return;
                    }
                    setSelectedClaim(claim || claims[0]);
                    setShowTermGenModal(true);
                  }}
                  onDeleteTerm={(id) => deleteTermMutation.mutate(id)}
                  onUpdateTerm={(id, data) => {
                    updateTermMutation.mutate(
                      { id, data },
                      {
                        onSuccess: () => {
                          const termoOriginal = terms.find((t) => t.id === id);
                          if (termoOriginal) {
                            gerarLancamentoAutomaticoParaTermo({ ...termoOriginal, ...data });
                          }
                        },
                        onError: (err: any) => {
                          alert(`Não foi possível salvar a assinatura: ${err?.message || err}`);
                        },
                      }
                    );
                  }}
                  userRole={userRole}
                  userEmail={userEmail}
                />
              }
            />
            <Route
              path="/frota-condutores"
              element={
                <FrotaCondutoresView
                  vehicles={vehicles}
                  people={people}
                  onSaveVehicle={(newV) => {
                    const { id, ...data } = newV;
                    createVehicleMutation.mutate(data);
                  }}
                  onUpdateVehicle={(id, data) => updateVehicleMutation.mutate({ id, data })}
                  onDeleteVehicle={(id) => deleteVehicleMutation.mutate(id)}
                  onSavePerson={(newP) => {
                    const { id, ...data } = newP;
                    createPersonMutation.mutate(data);
                  }}
                  onUpdatePerson={(id, data) => updatePersonMutation.mutate({ id, data })}
                  onDeletePerson={(id) => deletePersonMutation.mutate(id)}
                  userRole={userRole}
                  userEmail={userEmail}
                />
              }
            />
            <Route path="/frota" element={<Navigate to="/frota-condutores" replace />} />
            <Route path="/condutores" element={<Navigate to="/frota-condutores" replace />} />
            <Route
              path="/os"
              element={
                <WorkOrdersView
                  vehicles={vehicles}
                  people={people}
                  claims={claims}
                  orders={workOrders}
                  onSaveOrder={(data) => createWorkOrderMutation.mutate(data)}
                  onUpdateOrder={(id, data) => updateWorkOrderMutation.mutate({ id, data })}
                  onDeleteOrder={(id) => deleteWorkOrderMutation.mutate(id)}
                  userRole={userRole}
                  userEmail={userEmail}
                />
              }
            />
            <Route
              path="/financeiro"
              element={
                <FinanceiroView
                  financialEntries={financialEntries}
                  claims={claims}
                  fines={fines}
                  terms={terms}
                  people={people}
                  onSaveEntry={(data) => createFinancialEntryMutation.mutateAsync(data)}
                  onUpdateEntry={(id, data) => updateFinancialEntryMutation.mutate({ id, data })}
                  onDeleteEntry={(id) => deleteFinancialEntryMutation.mutate(id)}
                  userRole={userRole}
                  userEmail={userEmail}
                />
              }
            />
            <Route
              path="/usuarios"
              element={
                permissoes.podeGerenciarUsuarios ? (
                  <UsersView />
                ) : (
                  <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-sm max-w-md mx-auto mt-12 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl">
                      <i className="fa-solid fa-lock"></i>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">Acesso Restrito ao Proprietário</h3>
                    <p className="text-xs text-slate-500">
                      Apenas o perfil PROPRIETÁRIO possui permissão para gerenciar usuários e permissões do sistema.
                    </p>
                  </div>
                )
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

      {showSearchModal && (
        <GlobalSearchModal
          claims={claims}
          fines={fines}
          vehicles={vehicles}
          people={people}
          onClose={() => setShowSearchModal(false)}
        />
      )}
    </div>
  );
};

export default App;
