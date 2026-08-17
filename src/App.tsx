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
import { firebaseService, auth, observarAutenticacao, logout } from './services/firebase';
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

  // Core App State
  const [usuarioLogado, setUsuarioLogado] = useState<User | null>(null);
  const [verificandoLogin, setVerificandoLogin] = useState<boolean>(true);

  // Observar estado de autenticação do Firebase Auth
  useEffect(() => {
    const unsubscribe = observarAutenticacao((user) => {
      setUsuarioLogado(user);
      setVerificandoLogin(false);
    });
    return () => unsubscribe();
  }, []);

  const [claims, setClaims] = useState<Claim[]>([
    {
      id: 'claim-1',
      claimNumber: 'SIN-2026-00124',
      protocol: 'PROT-2026-881920',
      status: 'Em análise',
      priority: 'Alta',
      occurrenceType: 'Colisão Traseira com Avarias',
      date: '2026-06-15',
      time: '14:35',
      location: 'BR-116, km 270',
      city: 'Gravataí',
      state: 'RS',
      description:
        'Ocorrência com a unidade prefixo 24127 (Placa JCO8C10). Avarias traseiras. Condutor Andreia Mercedes Rocha de Araujo ciente dos fatos e danos decorrentes.',
      vehiclePlate: 'JCO8C10',
      vehicleModel: 'VW Constellation (Prefixo 24127)',
      driverName: 'ANDREIA MERCEDES ROCHA DE ARAUJO',
      insurer: 'Porto Seguro Cia de Seguros',
      policyNumber: 'AP-99201928-01',
      boNumber: 'BO-RS-48912/2026',
      assignedUser: 'Mariana Souza',
      estimatedCost: 3500.0,
      approvedCost: 3500.0,
      createdAt: '2026-06-15T15:00:00.000Z',
      updatedAt: '2026-06-19T10:30:00.000Z',
      notes: 'Termo de ciência e autorização de desconto em folha assinado pelo condutor.',
    },
    {
      id: 'claim-2',
      claimNumber: 'SIN-2026-00125',
      protocol: 'PROT-2026-992011',
      status: 'Aguardando documentos',
      priority: 'Média',
      occurrenceType: 'Infração por Velocidade + NIC Duplicada',
      date: '2026-04-27',
      time: '10:44',
      location: 'Av. Dorival Cândido Luz de Oliveira, Gravataí/RS',
      city: 'Gravataí',
      state: 'RS',
      description:
        'Auto EL00093302 (Velocidade superior a 20% - R$ 130,16) e Multa por Não Indicação de Condutor (NIC - R$ 130,16). Total acumulado R$ 260,32. Condutor solicitou não indicar CNH e assumiu pagamento em dobro.',
      vehiclePlate: 'JCO8C10',
      vehicleModel: 'VW Constellation (Prefixo 24127)',
      driverName: 'ANDREIA MERCEDES ROCHA DE ARAUJO',
      insurer: 'N/A',
      policyNumber: 'N/A',
      boNumber: 'N/A',
      assignedUser: 'Carlos Pinho',
      estimatedCost: 260.32,
      approvedCost: 260.32,
      createdAt: '2026-06-19T10:15:00.000Z',
      updatedAt: '2026-06-19T14:20:00.000Z',
      notes: 'Termo de Responsabilidade firmado com parcelamento em 2x.',
    },
    {
      id: 'claim-3',
      claimNumber: 'SIN-2026-00126',
      protocol: 'PROT-2026-102934',
      status: 'Resolvido',
      priority: 'Baixa',
      occurrenceType: 'Estacionamento Proibido',
      date: '2026-04-15',
      time: '16:50',
      location: 'Rua Florida, Gravataí/RS',
      city: 'Gravataí',
      state: 'RS',
      description:
        'Auto TE02141677 - Estacionar em local/horário proibido pela sinalização. Veículo TRD3E72 (Prefixo 226). Condutor Michele Rosa da Rosa assumiu responsabilidade civil e administrativa.',
      vehiclePlate: 'TRD3E72',
      vehicleModel: 'Mercedes-Benz Atego (Prefixo 226)',
      driverName: 'MICHELE ROSA DA ROSA',
      insurer: 'N/A',
      policyNumber: 'N/A',
      boNumber: 'N/A',
      assignedUser: 'Carlos Pinho',
      estimatedCost: 195.23,
      approvedCost: 195.23,
      createdAt: '2026-06-24T08:30:00.000Z',
      updatedAt: '2026-06-24T11:00:00.000Z',
      notes: 'Termo de Responsabilidade assinado.',
    },
  ]);

  const [fines, setFines] = useState<Fine[]>([
    {
      id: 'fine-1',
      claimId: 'claim-2',
      infractionCode: 'EL00093302',
      infractionAuto: 'EL00093302',
      vehiclePlate: 'JCO8C10',
      driverName: 'ANDREIA MERCEDES ROCHA DE ARAUJO',
      description: 'TRANSITAR EM VELOCIDADE SUPERIOR A MAXIMA PERMITIDA EM ATE 20%',
      amount: 130.16,
      points: 4,
      dueDate: '2026-07-06',
      status: 'Pendente',
    },
    {
      id: 'fine-2',
      claimId: 'claim-2',
      infractionCode: 'NIC-DUP-24127',
      infractionAuto: 'NIC-EL00093302',
      vehiclePlate: 'JCO8C10',
      driverName: 'ANDREIA MERCEDES ROCHA DE ARAUJO',
      description: 'MULTA POR NÃO INDICAÇÃO DO CONDUTOR INFRATOR (NIC EM DOBRO)',
      amount: 130.16,
      points: 0,
      dueDate: '2026-07-06',
      status: 'Pendente',
    },
    {
      id: 'fine-3',
      claimId: 'claim-3',
      infractionCode: 'TE02141677',
      infractionAuto: 'TE02141677',
      vehiclePlate: 'TRD3E72',
      driverName: 'MICHELE ROSA DA ROSA',
      description: 'ESTACIONAR EM LOCAL/HORARIO PROIBIDO ESPECIFICAMENTE PELA SINALIZACAO',
      amount: 195.23,
      points: 5,
      dueDate: '2026-07-20',
      status: 'Pendente',
    },
  ]);

  const [people, setPeople] = useState<Person[]>([
    {
      id: 'peo-1',
      name: 'ANDREIA MERCEDES ROCHA DE ARAUJO',
      docNumber: '002.574.880-73',
      phone: '(051) 98266-0028',
      email: 'andreia.araujo@transpinho.com',
      address: 'Gravataí/RS',
      type: 'Condutor',
      notes: 'Motorista Profissional CNH D (Prefixo 24127)',
    },
    {
      id: 'peo-2',
      name: 'MICHELE ROSA DA ROSA',
      docNumber: '016.998.180-02',
      phone: '(051) 98266-0028',
      email: 'michele.rosa@transpinho.com',
      address: 'Gravataí/RS',
      type: 'Condutor',
      notes: 'Motorista CNH C (Prefixo 226)',
    },
    {
      id: 'peo-3',
      name: 'GELSON WEBER DE FARIAS',
      docNumber: '629.109.220-49',
      phone: '(051) 98266-0028',
      email: 'gelson.farias@transpinho.com',
      address: 'Gravataí/RS',
      type: 'Proprietário',
      notes: 'Proprietário/Motorista Micro-ônibus Prefixo 1961',
    },
    {
      id: 'peo-4',
      name: 'MARCELO TEIXEIRA DA SILVA',
      docNumber: '031.997.250-07',
      phone: '(051) 98266-0028',
      email: 'marcelo.teixeira@transpinho.com',
      address: 'Gravataí/RS',
      type: 'Condutor',
      notes: 'Motorista Volare W9C ON (Placa IZF4E82)',
    },
  ]);

  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: 'veh-1',
      plate: 'JCO8C10',
      prefix: '24127',
      renavam: '01293847561',
      brand: 'Volkswagen',
      model: 'VW Constellation 24.280',
      year: 2024,
      color: 'Branco',
      status: 'Ativo',
      defaultDriver: 'ANDREIA MERCEDES ROCHA DE ARAUJO',
    },
    {
      id: 'veh-2',
      plate: 'TRD3E72',
      prefix: '226',
      renavam: '09817263541',
      brand: 'Mercedes-Benz',
      model: 'Mercedes-Benz Atego 1719',
      year: 2023,
      color: 'Prata',
      status: 'Ativo',
      defaultDriver: 'MICHELE ROSA DA ROSA',
    },
    {
      id: 'veh-3',
      plate: 'HKO8087',
      prefix: '1961',
      renavam: '08765432109',
      brand: 'Marcopolo',
      model: 'Micro-ônibus Trans Pinho',
      year: 2022,
      color: 'Branco',
      status: 'Ativo',
      defaultDriver: 'GELSON WEBER DE FARIAS',
    },
    {
      id: 'veh-4',
      plate: 'IZF4E82',
      prefix: '1980',
      renavam: '07654321098',
      brand: 'Marcopolo',
      model: 'MARCOPOLO/VOLARE W9C ON',
      year: 2025,
      color: 'Branco',
      status: 'Ativo',
      defaultDriver: 'MARCELO TEIXEIRA DA SILVA',
    },
  ]);

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

  const [terms, setTerms] = useState<Term[]>([
    {
      id: 'trm-1',
      claimId: 'claim-1',
      title: 'TERMO DE CIÊNCIA E AUTORIZAÇÃO DE DESCONTO EM FOLHA DE PAGAMENTO',
      type: 'Ciência',
      date: '2026-06-15',
      responsible: 'Mariana Souza',
      involvedPerson: 'ANDREIA MERCEDES ROCHA DE ARAUJO',
      status: 'Assinado',
      content: `JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)\nRua Florida, 116 – Nossa Chácara – Gravataí/ RS\n(051) 3047-0212 / 98266-0028 | Transpinho@transpinho.com\n\nTERMO DE CIÊNCIA E AUTORIZAÇÃO DE DESCONTO EM FOLHA DE PAGAMENTO\n\nEu, ANDREIA MERCEDES ROCHA DE ARAUJO, inscrito no CPF sob nº 002.574.880-73, declaro, para os devidos fins de direito, na qualidade de condutor do veículo VW Constellation, placa JCO8C10, envolvido na ocorrência de trânsito nº SIN-2026-00124, que:\n\nI – Da ciência e reconhecimento da ocorrência:\nDeclaro estar plenamente ciente dos fatos relacionados à ocorrência acima descrita, bem como dos danos materiais dela decorrentes.\n\nII – Do reconhecimento de responsabilidade:\nReconheço minha responsabilidade pelos danos ocasionados em decorrência do referido evento, assumindo integralmente a obrigação referente ao ressarcimento dos prejuízos apurados, no valor total de R$ 3.500,00 (Três mil e quinhentos reais).\n\nIII – Da autorização de desconto em folha:\nAutorizo, de forma expressa, livre, consciente e inequívoca, o desconto do valor acima mencionado em minha folha de pagamento/contracheque em 5 parcelas mensais de R$ 700,00.\n\nGravataí, 15 de Junho de 2026.`,
    },
    {
      id: 'trm-2',
      claimId: 'claim-2',
      title: 'TERMO DE RESPONSABILIDADE - MULTAS & NÃO INDICAÇÃO',
      type: 'Responsabilidade',
      date: '2026-06-19',
      responsible: 'Carlos Pinho',
      involvedPerson: 'ANDREIA MERCEDES ROCHA DE ARAUJO',
      status: 'Assinado',
      content: `JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)\nRua Florida, 116 – Nossa Chácara – Gravataí/ RS\n\nTERMO DE RESPONSABILIDADE\n\n1. IDENTIFICAÇÃO DO CONDUTOR\nEu, ANDREIA MERCEDES ROCHA DE ARAUJO, portador do CPF nº 002.574.880-73, condutor do veículo Placa: JCO8C10 Prefixo do Carro: 24127.\n\n2. DETALHAMENTO DAS INFRAÇÕES E VALORES\n- Infração 01: Auto EL00093302 | Data: 27/04/2026 10:44 | TRANSITAR EM VELOCIDADE SUPERIOR A MAXIMA PERMITIDA EM ATE 20% | Valor: R$ 130,16\n- Infração 02: Auto Gerado Duplicada | MULTA POR NÃO INDENTIFICACAO DO CONTUDOR INFRATOR, IMPOSTA A PESSOA JURIDICA | Valor: R$ 130,16\n\nO condutor reconhece a infração EL00093302. Considerando que o próprio condutor solicitou a não realização da indicação de condutor para transferência dos pontos da CNH, declara estar ciente e de acordo com o pagamento em dobro do valor original da multa, totalizando R$ 260,32.\n\nVALOR TOTAL ACUMULADO: R$ 260,32\n\n3. DA FORMA DE PAGAMENTO E PARCELAMENTO\nOpção: Parcelado em 2 parcelas de R$ 130,16 mensais. Primeira parcela em: 06/07/2026.\n\n4. DA RESPONSABILIDADE E QUITAÇÃO\nAssumo integral responsabilidade pelo pagamento. Ao concluir o pagamento total, outorgo à empresa João Batista de Souza Pinho EPP (Trans Pinho) a mais ampla quitação.\n\nGRAVATAÍ, 19 de Junho de 2026.`,
    },
    {
      id: 'trm-3',
      claimId: 'claim-3',
      title: 'TERMO DE RESPONSABILIDADE - INFRAÇÃO DIRETA',
      type: 'Responsabilidade',
      date: '2026-06-24',
      responsible: 'Carlos Pinho',
      involvedPerson: 'MICHELE ROSA DA ROSA',
      status: 'Assinado',
      content: `JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)\nRua Florida, 116 – Nossa Chácara – Gravataí/ RS\n\nTERMO DE RESPONSABILIDADE\n\n1. IDENTIFICAÇÃO DO CONDUTOR\nEu, MICHELE ROSA DA ROSA, portador do CPF nº 016.998.180-02, condutor do veículo Placa: TRD3E72 Prefixo do Carro: 226.\n\n2. DETALHES DO OCORRIDO\n- Auto de Infração nº: TE02141677\n- Data: 15/04/2026 | Horário: 16:50\n- Motivo: ESTACIONAR EM LOCAL/HORARIO PROIBIDO ESPECIFICAMENTE PELA SINALIZACAO.\n\n3. DECLARAÇÃO DE RESPONSABILIDADE\nDeclaro e assumo total e integral responsabilidade civil e administrativa pelas infrações de trânsito ocorridas, isentando a empresa João Batista de Souza Pinho EPP (Trans Pinho) de qualquer responsabilidade.\n\nGRAVATAÍ, 24 de Junho de 2026.`,
    },
  ]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(claims[0]);

  // Modals visibility
  const [showTermGenModal, setShowTermGenModal] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);

  // Fetch initial API data on mount
  useEffect(() => {
    fetch('/api/claims')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data)) setClaims(data);
      })
      .catch(() => {});

    fetch('/api/terms')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data)) setTerms(data);
      })
      .catch(() => {});
  }, []);

  const handleGenerateTerm = (newTerm: Term) => {
    setTerms((prev) => [newTerm, ...prev]);
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
            Carregando NexClaim Enterprise...
          </span>
        </div>
      </div>
    );
  }

  if (!usuarioLogado) {
    return <Login onLoginSuccess={() => {}} />;
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
                  onSaveNewClaim={(newClaim) => setClaims((prev) => [newClaim, ...prev])}
                  onOpenTermGenerator={(claim) => {
                    setSelectedClaim(claim);
                    setShowTermGenModal(true);
                  }}
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
                  onSaveFine={(newFine) => setFines((prev) => [newFine, ...prev])}
                  onUpdateFineStatus={(id, newStatus) =>
                    setFines((prev) => prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f)))
                  }
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
                  onOpenTermGenerator={(claim, templateName) => {
                    if (claim) setSelectedClaim(claim);
                    setShowTermGenModal(true);
                  }}
                  onDeleteTerm={(id) => setTerms((prev) => prev.filter((t) => t.id !== id))}
                />
              }
            />
            <Route
              path="/frota"
              element={
                <VehiclesView
                  vehicles={vehicles}
                  people={people}
                  onSaveVehicle={(newV) => setVehicles((prev) => [newV, ...prev])}
                />
              }
            />
            <Route
              path="/condutores"
              element={
                <PeopleView
                  people={people}
                  onSavePerson={(newP) => setPeople((prev) => [newP, ...prev])}
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

      {showTermGenModal && selectedClaim && (
        <TermGeneratorModal
          claim={selectedClaim}
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
