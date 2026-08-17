import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Login } from './components/Login';
import { TermGeneratorModal } from './components/TermGeneratorModal';
import { TemplateEditorView } from './views/TemplateEditorView';
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
  const [currentView, setCurrentView] = useState<string>('dashboard');
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
      infractionCode: 'NIC-DUPLICADA',
      infractionAuto: 'Gerado Duplicada',
      vehiclePlate: 'JCO8C10',
      driverName: 'ANDREIA MERCEDES ROCHA DE ARAUJO',
      description: 'MULTA. POR NÃO IDENTIFICACAO DO CONDUTOR INFRATOR, IMPOSTA A PESSOA JURIDICA',
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
      dueDate: '2026-07-15',
      status: 'Paga',
    },
  ]);

  const [people, setPeople] = useState<Person[]>([
    {
      id: 'peo-1',
      name: 'ANDREIA MERCEDES ROCHA DE ARAUJO',
      docNumber: '002.574.880-73',
      phone: '(51) 99887-6655',
      email: 'andreia.araujo@transpinho.com',
      address: 'Gravataí/RS',
      type: 'Condutor',
      notes: 'CNH Categoria D. Prefixo: 24127',
    },
    {
      id: 'peo-2',
      name: 'MICHELE ROSA DA ROSA',
      docNumber: '016.998.180-02',
      phone: '(51) 98765-4321',
      email: 'michele.rosa@transpinho.com',
      address: 'Gravataí/RS',
      type: 'Condutor',
      notes: 'CNH Categoria C. Prefixo: 226',
    },
  ]);

  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: 'veh-1',
      plate: 'JCO8C10',
      prefix: '24127',
      renavam: '01928374650',
      brand: 'Volkswagen',
      model: 'Constellation 24.280',
      year: 2024,
      color: 'Branco',
      status: 'Ativo',
    },
    {
      id: 'veh-2',
      plate: 'TRD3E72',
      prefix: '226',
      renavam: '82716354901',
      brand: 'Mercedes-Benz',
      model: 'Atego 1719',
      year: 2023,
      color: 'Prata',
      status: 'Ativo',
    },
  ]);

  const [templates, setTemplates] = useState<DocumentTemplate[]>([
    {
      id: 'tmpl-1',
      name: 'Termo de Responsabilidade (Multas & NIC Duplicada)',
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

  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(claims[0]);

  // Modals visibility
  const [showTermGenModal, setShowTermGenModal] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch initial API data on mount
  useEffect(() => {
    fetch('/api/claims')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data)) setClaims(data);
      })
      .catch(() => {});
  }, []);

  const handleGenerateTerm = (newTerm: Term) => {
    setTerms((prev) => [newTerm, ...prev]);
    setShowTermGenModal(false);
    setCurrentView('terms');
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
        currentView={currentView}
        onViewChange={setCurrentView}
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
          onOpenNewClaim={() => setCurrentView('claims')}
          onOpenExcelImport={() => setCurrentView('fines')}
          onLogout={logout}
        />

        <main className="flex-1 overflow-y-auto p-6 relative">
          {currentView === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
                <div>
                  <span className="badge bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded border border-amber-300">
                    TRANS PINHO GRAVATAÍ/RS • REACT TYPESCRIPT VITE
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
                    Gestão Integrada de Sinistros & Automação de Termos
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sistema empresarial completo com gerador automático de documentos, editor de templates e importador Excel.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedClaim(claims[0]);
                      setShowTermGenModal(true);
                    }}
                    className="btn bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-lg shadow-sm"
                  >
                    <i className="fa-solid fa-wand-magic-sparkles mr-1.5"></i> Emitir Termo Inteligente
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold uppercase text-slate-400">Total Sinistros</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">{claims.length}</span>
                    <span className="text-[11px] font-semibold text-blue-600">Cadastrados</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold uppercase text-slate-400">Multas & Infração</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">{fines.length}</span>
                    <span className="text-[11px] font-semibold text-rose-600">Com NIC e Parcelamento</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold uppercase text-slate-400">Modelos de Templates</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">{templates.length}</span>
                    <span className="text-[11px] font-semibold text-amber-600">Com Variáveis</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold uppercase text-slate-400">Veículos em Frota</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">{vehicles.length}</span>
                    <span className="text-[11px] font-semibold text-purple-600">Com Prefixo</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'templates' && (
            <TemplateEditorView
              templates={templates}
              onSaveTemplate={handleSaveTemplate}
              onToggleTemplateStatus={handleToggleTemplateStatus}
            />
          )}
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
