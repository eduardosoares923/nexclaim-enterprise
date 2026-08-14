/* ==========================================================================
   NexClaim Enterprise - Trans Pinho Focused Engine (Excel Import + Exact PDF Terms)
   ========================================================================== */

(function () {
  const defaultCompany = {
    name: 'JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)',
    address: 'Rua Florida, 116 – Nossa Chácara – Gravataí/ RS',
    phone: '(051) 3047-0212 / 98266-0028',
    email: 'Transpinho@transpinho.com',
    city: 'Gravataí',
    state: 'RS'
  };

  const defaultSeedClaims = [
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
      description: 'Ocorrência com a unidade prefixo 24127 (Placa JCO8C10). Avarias traseiras. Condutor Andreia Mercedes Rocha de Araujo ciente dos fatos e danos decorrentes.',
      vehiclePlate: 'JCO8C10',
      vehicleModel: 'VW Constellation (Prefixo 24127)',
      driverName: 'ANDREIA MERCEDES ROCHA DE ARAUJO',
      insurer: 'Porto Seguro Cia de Seguros',
      policyNumber: 'AP-99201928-01',
      boNumber: 'BO-RS-48912/2026',
      assignedUser: 'Mariana Souza',
      estimatedCost: 3500.00,
      approvedCost: 3500.00,
      notes: 'Termo de ciência e autorização de desconto em folha assinado pelo condutor.'
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
      description: 'Auto EL00093302 (Velocidade superior a 20% - R$ 130,16) e Multa por Não Indicação de Condutor (NIC - R$ 130,16). Total acumulado R$ 260,32. Condutor solicitou não indicar CNH e assumiu pagamento em dobro.',
      vehiclePlate: 'JCO8C10',
      vehicleModel: 'VW Constellation (Prefixo 24127)',
      driverName: 'ANDREIA MERCEDES ROCHA DE ARAUJO',
      insurer: 'N/A',
      policyNumber: 'N/A',
      boNumber: 'N/A',
      assignedUser: 'Carlos Pinho',
      estimatedCost: 260.32,
      approvedCost: 260.32,
      notes: 'Termo de Responsabilidade firmado com parcelamento em 2x.'
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
      description: 'Auto TE02141677 - Estacionar em local/horário proibido pela sinalização. Veículo TRD3E72 (Prefixo 226). Condutor Michele Rosa da Rosa assumiu responsabilidade civil e administrativa.',
      vehiclePlate: 'TRD3E72',
      vehicleModel: 'Mercedes-Benz Atego (Prefixo 226)',
      driverName: 'MICHELE ROSA DA ROSA',
      insurer: 'N/A',
      policyNumber: 'N/A',
      boNumber: 'N/A',
      assignedUser: 'Carlos Pinho',
      estimatedCost: 195.23,
      approvedCost: 195.23,
      notes: 'Termo de Responsabilidade assinado.'
    }
  ];

  const defaultSeedFines = [
    { id: 'fine-1', infractionAuto: 'EL00093302', vehiclePlate: 'JCO8C10', driverName: 'ANDREIA MERCEDES ROCHA DE ARAUJO', description: 'TRANSITAR EM VELOCIDADE SUPERIOR A MAXIMA PERMITIDA EM ATE 20%', amount: 130.16, points: 4, dueDate: '2026-07-06', status: 'Pendente' },
    { id: 'fine-2', infractionAuto: 'Gerado Duplicada', vehiclePlate: 'JCO8C10', driverName: 'ANDREIA MERCEDES ROCHA DE ARAUJO', description: 'MULTA. POR NÃO IDENTIFICACAO DO CONDUTOR INFRATOR, IMPOSTA A PESSOA JURIDICA', amount: 130.16, points: 0, dueDate: '2026-07-06', status: 'Pendente' },
    { id: 'fine-3', infractionAuto: 'TE02141677', vehiclePlate: 'TRD3E72', driverName: 'MICHELE ROSA DA ROSA', description: 'ESTACIONAR EM LOCAL/HORARIO PROIBIDO ESPECIFICAMENTE PELA SINALIZACAO', amount: 195.23, points: 5, dueDate: '2026-07-15', status: 'Paga' }
  ];

  const defaultSeedPeople = [
    { id: 'peo-1', name: 'ANDREIA MERCEDES ROCHA DE ARAUJO', docNumber: '002.574.880-73', phone: '(51) 99887-6655', email: 'andreia.araujo@transpinho.com', address: 'Gravataí/RS', type: 'Condutor', notes: 'CNH Categoria D. Prefixo: 24127' },
    { id: 'peo-2', name: 'MICHELE ROSA DA ROSA', docNumber: '016.998.180-02', phone: '(51) 98765-4321', email: 'michele.rosa@transpinho.com', address: 'Gravataí/RS', type: 'Condutor', notes: 'CNH Categoria C. Prefixo: 226' }
  ];

  const defaultSeedVehicles = [
    { id: 'veh-1', plate: 'JCO8C10', prefix: '24127', renavam: '01928374650', brand: 'Volkswagen', model: 'Constellation 24.280', year: 2024, color: 'Branco', status: 'Ativo' },
    { id: 'veh-2', plate: 'TRD3E72', prefix: '226', renavam: '82716354901', brand: 'Mercedes-Benz', model: 'Atego 1719', year: 2023, color: 'Prata', status: 'Ativo' }
  ];

  const defaultSeedTerms = [
    {
      id: 'trm-1',
      title: 'TERMO DE RESPONSABILIDADE - MULTAS & NÃO INDICAÇÃO',
      type: 'Termo de Responsabilidade',
      date: '2026-06-19',
      responsible: 'Carlos Pinho',
      involvedPerson: 'ANDREIA MERCEDES ROCHA DE ARAUJO',
      status: 'Assinado',
      htmlContent: `
        <div class="trans-pinho-doc text-slate-900">
          <div class="trans-pinho-header">
            <h2 class="font-black text-sm uppercase">JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)</h2>
            <p class="text-[11px] text-slate-600">Rua Florida, 116 – Nossa Chácara – Gravataí/ RS</p>
            <p class="text-[11px] text-slate-600">(051) 3047-0212 / 98266-0028 | Transpinho@transpinho.com</p>
          </div>

          <h3 class="trans-pinho-title">TERMO DE RESPONSABILIDADE</h3>

          <div class="trans-pinho-section">1. IDENTIFICAÇÃO DO CONDUTOR</div>
          <p class="text-xs mb-3">
            Eu, <strong>ANDREIA MERCEDES ROCHA DE ARAUJO</strong>, portador do CPF de nº <strong>002.574.880-73</strong>, na qualidade de condutor dos veículos abaixo identificado:
          </p>
          <ul class="list-disc pl-6 text-xs mb-4 font-semibold">
            <li>Placa: <strong>JCO8C10</strong> &nbsp;&nbsp;&nbsp;&nbsp; Prefixo do Carro: <strong>24127</strong></li>
          </ul>

          <div class="trans-pinho-section">2. DETALHAMENTO DAS INFRAÇÕES E VALORES</div>
          <ul class="space-y-2 text-xs mb-3">
            <li class="font-bold">• Infração 01:</li>
            <ul class="pl-6 space-y-1 text-[11px]">
              <li>o Auto de Infração nº: <strong>EL00093302</strong></li>
              <li>o Data: <strong>27/04/2026</strong> | Horário: <strong>10:44</strong></li>
              <li>o Motivo/Enquadramento: <strong>TRANSITAR EM VELOCIDADE SUPERIOR A MAXIMA PERMITIDA EM ATE 20%</strong></li>
              <li>o Valor: <strong>R$ 130,16</strong></li>
            </ul>

            <li class="font-bold">• Infração 02:</li>
            <ul class="pl-6 space-y-1 text-[11px]">
              <li>o Auto de Infração nº: <strong>Gerado Duplicada</strong></li>
              <li>o Data: | Horário:</li>
              <li>o Motivo/Enquadramento: <strong>MULTA. POR NÃO INDENTIFICACAO DO CONTUDOR INFRATOR, IMPOSTA A PESSOA JURITICA</strong></li>
              <li>o Valor: <strong>R$ 130,16</strong></li>
            </ul>
          </ul>

          <p class="text-xs text-justify leading-relaxed mb-3">
            O condutor reconhece a infração nº <strong>EL00093302</strong>. Considerando que o próprio condutor solicitou a não realização da indicação de condutor para transferência dos pontos da CNH, por não desejar o registro de pontos em sua carteira de habilitação, declara estar ciente e de acordo com o pagamento em dobro do valor original da multa, totalizando <strong>R$ 260,32 (duzentos e sessenta reais e trinta e dois centavos)</strong>, assumindo integral responsabilidade pela nova infração gerada.
          </p>

          <p class="font-bold text-xs mb-4">VALOR TOTAL ACUMULADO: R$ 260,32</p>

          <div class="trans-pinho-section">3. DA FORMA DE PAGAMENTO E PARCELAMENTO</div>
          <p class="text-xs mb-2">O condutor reconhece a dívida total acima mencionada e opta pela seguinte modalidade de quitação:</p>
          <div class="space-y-1 text-xs mb-4 pl-2 font-semibold">
            <p>☐ Cota Única: Vencimento em 06/07/2026</p>
            <p>☑ Parcelado: Em 2 parcelas de R$ 130,16 Mensais. (Primeira parcela em: 06/07/2026)</p>
          </div>

          <div class="trans-pinho-section">4. DA RESPONSABILIDADE E QUITAÇÃO</div>
          <p class="text-xs text-justify leading-relaxed mb-6">
            Assumo integral responsabilidade civil e administrativa pelo pagamento dos valores aqui descritos. Ao concluir o pagamento total, outorgo à empresa <strong>João Batista de Souza Pinho EPP (Trans Pinho)</strong> a mais ampla, geral e irrevogável quitação, para nada mais declarar em juízo ou fora dele, operando-se a sub-rogação de direitos em favor da referida Trans Pinho.
          </p>

          <p class="text-xs mb-10">GRAVATAÍ, 19 de Junho de 2026.</p>

          <div class="text-center pt-8 border-t border-slate-400 w-72 mx-auto">
            <p class="font-bold text-xs">ANDREIA MERCEDES ROCHA DE ARAUJO</p>
            <p class="text-[10px] text-slate-500">Condutor Responsável</p>
          </div>
        </div>
      `
    },
    {
      id: 'trm-2',
      title: 'TERMO DE RESPONSABILIDADE - INFRAÇÃO DIRETA',
      type: 'Termo de Responsabilidade',
      date: '2026-06-24',
      responsible: 'Carlos Pinho',
      involvedPerson: 'MICHELE ROSA DA ROSA',
      status: 'Assinado',
      htmlContent: `
        <div class="trans-pinho-doc text-slate-900">
          <div class="trans-pinho-header">
            <h2 class="font-black text-sm uppercase">JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)</h2>
            <p class="text-[11px] text-slate-600">Rua Florida, 116 – Nossa Chácara – Gravataí/ RS</p>
            <p class="text-[11px] text-slate-600">(051) 3047-0212 / 98266-0028 | Transpinho@transpinho.com</p>
          </div>

          <h3 class="trans-pinho-title">TERMO DE RESPONSABILIDADE</h3>

          <div class="trans-pinho-section">1. IDENTIFICAÇÃO DO CONDUTOR</div>
          <p class="text-xs mb-3">
            Eu, <strong>MICHELE ROSA DA ROSA</strong> portador(a) do CPF nº <strong>016.998.180-02</strong>, na qualidade de condutor(a) do veículo abaixo identificado:
          </p>
          <ul class="list-disc pl-6 text-xs mb-4 font-semibold">
            <li>Placa: <strong>TRD3E72</strong></li>
            <li>Prefixo do Carro: <strong>226</strong></li>
          </ul>

          <div class="trans-pinho-section">2. DETALHES DO OCORRIDO</div>
          <ul class="space-y-1 text-xs mb-4 pl-4">
            <li>• Auto de Infração nº: <strong>TE02141677</strong></li>
            <li>• Data do ocorrido: <strong>15/04/2026</strong></li>
            <li>• Horário: <strong>16:50</strong></li>
            <li>• Motivo (Enquadramento): <strong>ESTACIONAR EM LOCAL/HORARIO PROIBIDO ESPECIFICAMENTE PELA SINALIZACAO.</strong></li>
          </ul>

          <div class="trans-pinho-section">3. DECLARAÇÃO DE RESPONSABILIDADE</div>
          <p class="text-xs text-justify leading-relaxed mb-6">
            Declaro e assumo total e integral responsabilidade civil e administrativa pelas infrações de trânsito ocorridas com o veículo acima descritos, bem como por todas as consequências decorrentes destes atos. Confirmo ter total ciência da natureza e gravidade das referidas infrações, isentando a empresa <strong>João Batista de Souza Pinho EPP (Trans Pinho)</strong> de qualquer responsabilidade sobre as mesmas, uma vez que decorreram da minha conduta direta na condução do veículo.
          </p>

          <p class="text-xs mb-10">GRAVATAÍ, 24 de Junho de 2026.</p>

          <div class="text-center pt-8 border-t border-slate-400 w-72 mx-auto">
            <p class="font-bold text-xs">Assinatura do Condutor</p>
            <p class="text-[10px] text-slate-500">MICHELE ROSA DA ROSA</p>
          </div>
        </div>
      `
    },
    {
      id: 'trm-3',
      title: 'TERMO DE CIÊNCIA E AUTORIZAÇÃO DE DESCONTO EM FOLHA DE PAGAMENTO',
      type: 'Termo de ciência e autorização de desconto',
      date: '2026-06-15',
      responsible: 'Mariana Souza',
      involvedPerson: 'ANDREIA MERCEDES ROCHA DE ARAUJO',
      status: 'Assinado',
      htmlContent: `
        <div class="trans-pinho-doc text-slate-900">
          <div class="trans-pinho-header">
            <h2 class="font-black text-sm uppercase">Trans Pinho</h2>
          </div>

          <h3 class="trans-pinho-title">TERMO DE CIÊNCIA E AUTORIZAÇÃO DE DESCONTO EM FOLHA DE PAGAMENTO</h3>

          <p class="text-xs text-justify leading-relaxed mb-4">
            Eu, <strong>ANDREIA MERCEDES ROCHA DE ARAUJO</strong>, inscrito no CPF sob nº <strong>002.574.880-73</strong>, declaro, para os devidos fins de direito, na qualidade de condutor do veículo <strong>VW Constellation</strong>, placa <strong>JCO8C10</strong>, envolvido na ocorrência de trânsito nº <strong>SIN-2026-00124</strong>, que:
          </p>

          <div class="trans-pinho-section">I – Da ciência e reconhecimento da ocorrência</div>
          <p class="text-xs text-justify leading-relaxed mb-4">
            Declaro estar plenamente ciente dos fatos relacionados à ocorrência acima descrita, bem como dos danos materiais dela decorrentes.
          </p>

          <div class="trans-pinho-section">II – Do reconhecimento de responsabilidade</div>
          <p class="text-xs text-justify leading-relaxed mb-4">
            Reconheço minha responsabilidade pelos danos ocasionados em decorrência do referido evento, assumindo integralmente a obrigação referente ao ressarcimento dos prejuízos apurados, no valor total de <strong>R$ 3.500,00 (Três mil e quinhentos reais)</strong>.
          </p>

          <div class="trans-pinho-section">III – Da autorização de desconto em folha</div>
          <p class="text-xs text-justify leading-relaxed mb-3">
            Autorizo, de forma expressa, livre, consciente e inequívoca, nos termos da legislação aplicável e do acordo firmado entre as partes, o desconto do valor acima mencionado em minha folha de pagamento/contracheque, mediante o seguinte parcelamento:
          </p>
          <div class="space-y-1 text-xs mb-4 pl-4 font-semibold">
            <p>Valor total: R$ 3.500,00</p>
            <p>Parcelamento: 5 parcelas mensais e sucessivas de R$ 700,00</p>
          </div>

          <p class="text-xs text-justify leading-relaxed mb-6">
            Declaro que assino o presente instrumento por minha livre e espontânea vontade, sem qualquer vício de consentimento, estando ciente de todos os seus termos, efeitos e consequências jurídicas.
          </p>

          <p class="text-xs mb-10">Gravataí, 15 de Junho de 2026</p>

          <div class="text-center pt-8 border-t border-slate-400 w-72 mx-auto">
            <p class="font-bold text-xs">ANDREIA MERCEDES ROCHA DE ARAUJO</p>
          </div>
        </div>
      `
    }
  ];

  const state = {
    currentView: 'dashboard',
    selectedClaimId: 'claim-1',
    currentUser: { id: 'usr-1', name: 'Carlos Pinho', email: 'carlos@transpinho.com', role: 'ADMINISTRADOR', avatar: 'CP' },
    company: defaultCompany,
    claims: defaultSeedClaims,
    fines: defaultSeedFines,
    terms: defaultSeedTerms,
    people: defaultSeedPeople,
    vehicles: defaultSeedVehicles,
    activeClaimDossier: null,
    searchQuery: '',
    showSearchModal: false,
    showNewClaimModal: false,
    showTermGeneratorModal: false,
    showExcelImportModal: false,
    toast: null
  };

  function formatCurrency(val) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0); }
  function formatDate(str) { if (!str) return 'N/A'; const d = new Date(str); return isNaN(d.getTime()) ? str : new Intl.DateTimeFormat('pt-BR').format(d); }
  function maskCpfCnpj(val) { if (!val) return 'N/A'; const clean = val.replace(/\D/g, ''); if (clean.length === 11) return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'); if (clean.length === 14) return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5'); return val; }

  function getStatusBadgeClass(status) {
    const map = {
      'Novo': 'bg-blue-100 text-blue-800 border-blue-200',
      'Em análise': 'bg-amber-100 text-amber-800 border-amber-200',
      'Aguardando documentos': 'bg-orange-100 text-orange-800 border-orange-200',
      'Resolvido': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Pendente': 'bg-amber-100 text-amber-800 border-amber-200',
      'Paga': 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
    return map[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  }

  function showToast(msg, type = 'info') {
    state.toast = { msg, type };
    renderToast();
    setTimeout(() => { state.toast = null; renderToast(); }, 3500);
  }

  async function apiFetch(endpoint, options = {}) {
    try {
      const res = await fetch(`/api${endpoint}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', 'X-User-Role': state.currentUser.role, ...(options.headers || {}) }
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn(`API /api${endpoint} offline, using fallback.`);
    }
    return null;
  }

  async function loadData() {
    const claims = await apiFetch('/claims');
    if (claims && Array.isArray(claims)) state.claims = claims;

    const fines = await apiFetch('/fines');
    if (fines && Array.isArray(fines)) state.fines = fines;

    const terms = await apiFetch('/terms');
    if (terms && Array.isArray(terms)) state.terms = terms;

    const people = await apiFetch('/people');
    if (people && Array.isArray(people)) state.people = people;

    const vehicles = await apiFetch('/vehicles');
    if (vehicles && Array.isArray(vehicles)) state.vehicles = vehicles;

    renderApp();
  }

  async function loadClaimDossier(claimId) {
    state.selectedClaimId = claimId;
    const dossier = await apiFetch(`/claims/${claimId}/dossier`);
    if (dossier) {
      state.activeClaimDossier = dossier;
    } else {
      const c = state.claims.find(cl => cl.id === claimId) || state.claims[0];
      state.activeClaimDossier = {
        claim: c,
        fines: state.fines.filter(f => f.claimId === claimId),
        terms: state.terms.filter(t => t.claimId === claimId),
        vehicle: state.vehicles[0],
        driver: state.people[0]
      };
    }
    renderApp();
  }

  function renderApp() {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    appEl.innerHTML = `
      ${renderSidebar()}
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        ${renderHeader()}
        <main class="flex-1 overflow-y-auto p-6 relative">
          ${renderMainView()}
        </main>
      </div>
    `;

    attachEvents();
  }

  function renderSidebar() {
    const menuItems = [
      { id: 'dashboard', label: 'Painel Trans Pinho', icon: 'fa-chart-pie' },
      { id: 'claims', label: 'Sinistros & Ocorrências', icon: 'fa-folder-closed', badge: state.claims.length },
      { id: 'fines', label: 'Multas de Trânsito', icon: 'fa-file-invoice-dollar', badge: state.fines.length },
      { id: 'terms', label: 'Emitir Termos Oficial', icon: 'fa-file-pen', badge: state.terms.length },
      { id: 'people', label: 'Condutores', icon: 'fa-users' },
      { id: 'vehicles', label: 'Frota & Prefixos', icon: 'fa-truck-front' }
    ];

    return `
      <aside class="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col flex-shrink-0 z-30 select-none">
        <div class="h-16 flex items-center px-5 border-b border-slate-800 gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg">TP</div>
          <div class="min-w-0 flex-1">
            <h1 class="font-black text-white text-sm tracking-tight leading-none truncate">Trans Pinho</h1>
            <span class="text-[9px] uppercase font-bold text-amber-400 tracking-wider">Gravataí / RS</span>
          </div>
        </div>

        <nav class="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div class="px-3 mb-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Sistema Corporativo</div>
          ${menuItems.map(item => {
            const isActive = state.currentView === item.id || (item.id === 'claims' && state.currentView === 'claim-detail');
            return `
              <button 
                data-view="${item.id}"
                class="nav-btn w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }"
              >
                <div class="flex items-center gap-3">
                  <i class="fa-solid ${item.icon} text-sm w-4 text-center ${isActive ? 'text-slate-950' : 'text-slate-400'}"></i>
                  <span>${item.label}</span>
                </div>
                ${item.badge ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-slate-950 text-white' : 'bg-slate-800 text-slate-300'}">${item.badge}</span>` : ''}
              </button>
            `;
          }).join('')}
        </nav>

        <div class="p-4 border-t border-slate-800 bg-slate-950/50">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs shadow-inner">
              ${state.currentUser.avatar}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-white truncate">${state.currentUser.name}</p>
              <p class="text-[10px] text-amber-400 font-semibold truncate">${state.currentUser.email}</p>
            </div>
          </div>
        </div>
      </aside>
    `;
  }

  function renderHeader() {
    return `
      <header class="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-20 shadow-xs">
        <div class="flex items-center gap-4 flex-1 max-w-md">
          <div id="search-trigger" class="w-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg px-3.5 py-2 flex items-center justify-between text-xs text-slate-500 cursor-pointer transition-all">
            <div class="flex items-center gap-2.5">
              <i class="fa-solid fa-magnifying-glass text-slate-400"></i>
              <span>Pesquisar por Condutor, Placa, Prefixo...</span>
            </div>
            <kbd class="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-500">Ctrl + K</kbd>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button id="open-excel-import" class="btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs">
            <i class="fa-solid fa-file-excel text-xs"></i> Ler Planilha Excel (.xlsx)
          </button>
          <button id="open-new-claim" class="btn bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs">
            <i class="fa-solid fa-plus text-xs text-amber-400"></i> Novo Sinistro
          </button>
        </div>
      </header>
    `;
  }

  function renderMainView() {
    switch (state.currentView) {
      case 'dashboard': return renderDashboardView();
      case 'claims': return renderClaimsListView();
      case 'claim-detail': return renderClaimDetailView();
      case 'fines': return renderFinesView();
      case 'terms': return renderTermsView();
      case 'people': return renderPeopleView();
      case 'vehicles': return renderVehiclesView();
      default: return renderDashboardView();
    }
  }

  function renderDashboardView() {
    return `
      <div class="space-y-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <div class="flex items-center gap-2">
              <span class="badge bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded border border-amber-300">JOÃO BATISTA DE SOUZA PINHO EPP</span>
            </div>
            <h2 class="text-xl font-bold text-slate-900 tracking-tight mt-1">Gestão Trans Pinho - Gravataí/RS</h2>
            <p class="text-xs text-slate-500 mt-0.5">Emissão de Termos Oficiais, Leitura de Excel (.xlsx) e Controle de Multas NIC.</p>
          </div>
          <div class="flex flex-wrap gap-2.5">
            <button id="dash-import-excel" class="btn bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
              <i class="fa-solid fa-file-excel"></i> Importar Excel (.xlsx)
            </button>
            <button id="dash-new-term" class="btn bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
              <i class="fa-solid fa-wand-magic-sparkles"></i> Gerar Termo Oficial
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span class="text-xs font-bold uppercase text-slate-400">Total Sinistros</span>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-2xl font-black text-slate-900">${state.claims.length}</span>
              <span class="text-[11px] font-semibold text-blue-600">Cadastrados</span>
            </div>
          </div>

          <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span class="text-xs font-bold uppercase text-slate-400">Multas & Infração</span>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-2xl font-black text-slate-900">${state.fines.length}</span>
              <span class="text-[11px] font-semibold text-rose-600">Com NIC e Parcelamento</span>
            </div>
          </div>

          <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span class="text-xs font-bold uppercase text-slate-400">Termos Emitidos</span>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-2xl font-black text-slate-900">${state.terms.length}</span>
              <span class="text-[11px] font-semibold text-amber-600">Modelos Oficiais</span>
            </div>
          </div>

          <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span class="text-xs font-bold uppercase text-slate-400">Veículos em Frota</span>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-2xl font-black text-slate-900">${state.vehicles.length}</span>
              <span class="text-[11px] font-semibold text-purple-600">Com Prefixo</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div class="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 class="font-bold text-slate-900 text-sm"><i class="fa-solid fa-file-pen text-amber-500 mr-2"></i> Termos de Responsabilidade Emitidos</h3>
            <button data-view="terms" class="nav-btn text-xs font-semibold text-blue-600 hover:underline">Ver Todos os Termos →</button>
          </div>
          <div class="divide-y divide-slate-100 text-xs">
            ${state.terms.map(t => `
              <div class="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                <div>
                  <span class="badge bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2 py-0.5 rounded border border-amber-300">${t.type}</span>
                  <h4 class="font-bold text-slate-900 text-sm mt-1">${t.title}</h4>
                  <p class="text-[11px] text-slate-500">Condutor: <strong>${t.involvedPerson}</strong> • Emissão: ${formatDate(t.date)}</p>
                </div>
                <button data-view="terms" class="nav-btn btn bg-slate-900 text-white hover:bg-slate-800 text-xs px-3.5 py-1.5 rounded-lg font-bold">Visualizar Layout PDF</button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function renderClaimsListView() {
    return `
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold text-slate-900">Dossiês de Sinistros & Ocorrências</h2>
            <p class="text-xs text-slate-500">Acompanhamento por prefixo, placa, condutor e valores apurados.</p>
          </div>
          <div class="flex gap-2">
            <button id="claims-import-excel" class="btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg">
              <i class="fa-solid fa-file-excel mr-1"></i> Importar Excel
            </button>
            <button id="claims-new-btn" class="btn bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-lg">
              + Novo Sinistro
            </button>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th class="p-3.5">Ocorrência</th>
                <th class="p-3.5">Condutor</th>
                <th class="p-3.5">Placa / Modelo</th>
                <th class="p-3.5">Valor Apurado</th>
                <th class="p-3.5">Status</th>
                <th class="p-3.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${state.claims.map(c => `
                <tr class="hover:bg-slate-50">
                  <td class="p-3.5">
                    <span data-claim-id="${c.id}" class="open-dossier-btn font-bold text-blue-600 hover:underline cursor-pointer">${c.claimNumber}</span>
                    <div class="text-[10px] text-slate-500 font-semibold">${c.occurrenceType}</div>
                  </td>
                  <td class="p-3.5 font-bold text-slate-800">${c.driverName}</td>
                  <td class="p-3.5"><span class="font-bold font-mono bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded text-[11px]">${c.vehiclePlate}</span><div class="text-[10px] text-slate-500">${c.vehicleModel}</div></td>
                  <td class="p-3.5 font-bold text-slate-900">${formatCurrency(c.estimatedCost)}</td>
                  <td class="p-3.5"><span class="badge ${getStatusBadgeClass(c.status)} px-2.5 py-0.5 rounded-full text-[10px] font-bold">${c.status}</span></td>
                  <td class="p-3.5 text-right">
                    <button data-claim-id="${c.id}" class="open-dossier-btn btn bg-slate-900 text-white hover:bg-slate-800 text-xs px-3 py-1.5 rounded-lg font-bold">Abrir Dossiê</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderClaimDetailView() {
    const d = state.activeClaimDossier || { claim: state.claims[0], fines: state.fines, terms: state.terms };
    const claim = d.claim || state.claims[0];

    return `
      <div class="space-y-6">
        <div class="flex items-center justify-between text-xs text-slate-500">
          <button data-view="claims" class="nav-btn font-bold text-blue-600 hover:underline">← Voltar para Sinistros</button>
          <span class="font-mono text-[11px]">JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)</span>
        </div>

        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span class="badge bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2.5 py-0.5 rounded border border-amber-300">DOSSIÊ DIGITAL OFICIAL</span>
              <h2 class="text-2xl font-black text-slate-900 mt-1">${claim.claimNumber}</h2>
              <p class="text-xs text-slate-500 font-mono">Protocolo: ${claim.protocol} • Data: ${formatDate(claim.date)} às ${claim.time}</p>
            </div>
            <div class="flex gap-2">
              <button id="detail-gen-term" class="btn bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg">
                <i class="fa-solid fa-file-pen mr-1"></i> Emitir Termo Oficial
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Condutor Declarado</span>
              <p class="text-sm font-bold text-slate-900 mt-0.5">${claim.driverName}</p>
            </div>
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Veículo / Prefixo</span>
              <p class="text-sm font-bold text-slate-900 mt-0.5">${claim.vehiclePlate} (${claim.vehicleModel})</p>
            </div>
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Valor Apurado</span>
              <p class="text-sm font-bold text-slate-900 mt-0.5">${formatCurrency(claim.estimatedCost)}</p>
            </div>
          </div>

          <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <h4 class="font-bold text-slate-900 uppercase text-[11px] mb-1">Descrição do Ocorrido</h4>
            <p class="text-slate-700 leading-relaxed">${claim.description}</p>
          </div>
        </div>
      </div>
    `;
  }

  function renderFinesView() {
    return `
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold text-slate-900">Controle de Multas & Infrações NIC</h2>
            <p class="text-xs text-slate-500">Importe planilhas Excel (.xlsx) e emita os termos de responsabilidade em 1 clique.</p>
          </div>
          <button id="fines-import-excel" class="btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-xs">
            <i class="fa-solid fa-file-excel"></i> Importar Planilha Excel (.xlsx)
          </button>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 uppercase text-[10px]">
              <tr>
                <th class="p-3.5">Auto de Infração</th>
                <th class="p-3.5">Condutor</th>
                <th class="p-3.5">Placa</th>
                <th class="p-3.5">Descrição</th>
                <th class="p-3.5">Valor</th>
                <th class="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${state.fines.map(f => `
                <tr>
                  <td class="p-3.5 font-bold font-mono text-slate-900">${f.infractionAuto}</td>
                  <td class="p-3.5 font-bold text-slate-800">${f.driverName}</td>
                  <td class="p-3.5 font-bold font-mono bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded text-[11px]">${f.vehiclePlate}</td>
                  <td class="p-3.5 font-medium text-slate-700">${f.description}</td>
                  <td class="p-3.5 font-bold">${formatCurrency(f.amount)}</td>
                  <td class="p-3.5"><span class="badge ${getStatusBadgeClass(f.status)} px-2.5 py-0.5 rounded-full text-[10px] font-bold">${f.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderTermsView() {
    return `
      <div class="space-y-6">
        <div class="bg-slate-900 text-white p-6 rounded-xl shadow-md flex justify-between items-center">
          <div>
            <span class="badge bg-amber-500 text-slate-950 text-[10px] px-2 py-0.5 rounded font-black uppercase mb-1 inline-block">Formatos Idênticos aos PDFs Oficiais</span>
            <h2 class="text-xl font-bold tracking-tight">Emissão & Impressão de Termos Oficial Trans Pinho</h2>
            <p class="text-xs text-slate-300 mt-1">Gerador com layout idêntico aos documentos digitalizados (Ciência com Desconto em Folha, Multa NIC e Infração Direta).</p>
          </div>
          <button id="terms-open-gen" class="btn bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Emitir Novo Termo
          </button>
        </div>

        <div class="space-y-6">
          ${state.terms.map(t => `
            <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-md space-y-4">
              <div class="flex justify-between items-center border-b border-slate-200 pb-3 btn-no-print">
                <div>
                  <span class="badge bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2.5 py-0.5 rounded border border-amber-300">${t.type}</span>
                  <h3 class="font-bold text-slate-900 text-base mt-1">${t.title}</h3>
                  <p class="text-xs text-slate-500">Condutor: <strong>${t.involvedPerson}</strong> • Emissão: ${formatDate(t.date)}</p>
                </div>
                <button onclick="window.print()" class="btn bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-lg">
                  <i class="fa-solid fa-print mr-1.5"></i> Imprimir / Gerar PDF A4
                </button>
              </div>

              ${t.htmlContent}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderPeopleView() {
    return `
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold text-slate-900">Cadastro de Condutores</h2>
            <p class="text-xs text-slate-500">Listagem e importação via Excel (.xlsx).</p>
          </div>
          <button id="people-import-excel" class="btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2">
            <i class="fa-solid fa-file-excel"></i> Importar Planilha Excel
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          ${state.people.map(p => `
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <span class="badge bg-blue-100 text-blue-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold">${p.type}</span>
              <h4 class="font-bold text-slate-900 text-base">${p.name}</h4>
              <p class="text-slate-600 font-mono">CPF: ${maskCpfCnpj(p.docNumber)}</p>
              <p class="text-slate-500 text-[11px]">${p.notes || ''}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderVehiclesView() {
    return `
      <div class="space-y-6">
        <h2 class="text-xl font-bold text-slate-900">Frota Corporativa & Prefixos</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          ${state.vehicles.map(v => `
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div class="flex items-center gap-2">
                <span class="font-black text-lg bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded font-mono">${v.plate}</span>
                <span class="badge bg-slate-900 text-amber-400 font-bold text-xs px-2.5 py-1 rounded">Prefixo: ${v.prefix || 'N/A'}</span>
              </div>
              <h4 class="font-bold text-slate-900 text-sm mt-1">${v.brand} ${v.model} (${v.year})</h4>
              <p class="text-slate-500 font-mono">RENAVAM: ${v.renavam}</p>
              <p class="text-slate-600 font-semibold">Condutor Habitual: ${v.defaultDriver}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderToast() {
    const root = document.getElementById('toast-root');
    if (!root) return;
    if (!state.toast) { root.innerHTML = ''; return; }
    root.innerHTML = `<div class="bg-slate-900 text-white p-4 rounded-xl shadow-xl flex items-center gap-3 border border-amber-500/40"><i class="fa-solid fa-circle-check text-amber-400 text-lg"></i><p class="text-xs font-bold">${state.toast.msg}</p></div>`;
  }

  function renderModals() {
    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return;

    if (state.showNewClaimModal) {
      modalRoot.classList.remove('hidden');
      modalRoot.innerHTML = renderNewClaimModalHtml();
    } else if (state.showTermGeneratorModal) {
      modalRoot.classList.remove('hidden');
      modalRoot.innerHTML = renderTermGeneratorModalHtml();
    } else if (state.showExcelImportModal) {
      modalRoot.classList.remove('hidden');
      modalRoot.innerHTML = renderExcelImportModalHtml();
    } else if (state.showSearchModal) {
      modalRoot.classList.remove('hidden');
      modalRoot.innerHTML = renderSearchModalHtml();
    } else {
      modalRoot.classList.add('hidden');
      modalRoot.innerHTML = '';
    }

    attachModalEvents();
  }

  function renderExcelImportModalHtml() {
    return `
      <div class="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 space-y-4" onclick="event.stopPropagation()">
        <div class="flex justify-between items-center border-b border-slate-200 pb-3">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-file-excel text-emerald-600 text-xl"></i>
            <h3 class="font-bold text-slate-900 text-base">Importador de Planilhas Excel (.xlsx / .csv)</h3>
          </div>
          <button id="close-modal-btn" class="text-slate-400 hover:text-slate-700 text-lg"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div class="space-y-4 text-xs">
          <p class="text-slate-600">Selecione uma planilha de multas, condutores ou sinistros. O sistema lerá os dados automaticamente!</p>

          <div id="excel-dropzone" class="border-2 border-dashed border-emerald-400 bg-emerald-50/50 p-8 rounded-xl text-center cursor-pointer hover:bg-emerald-100/50 transition-colors">
            <i class="fa-solid fa-cloud-arrow-up text-emerald-600 text-3xl mb-2"></i>
            <p class="font-bold text-slate-800 text-sm">Clique para selecionar ou arraste o arquivo Excel (.xlsx)</p>
            <span class="text-[11px] text-slate-500">Suporta arquivos .xlsx, .xls e .csv</span>
            <input type="file" id="excel-file-input" accept=".xlsx, .xls, .csv" class="hidden" />
          </div>

          <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span class="font-bold text-slate-700 block mb-1">Colunas recomendadas no Excel:</span>
            <code class="text-[10px] text-emerald-700 block font-mono">Auto, Placa, Condutor, CPF, Descrição, Valor, Vencimento</code>
          </div>

          <div class="pt-2 flex justify-end gap-2">
            <button type="button" id="close-modal-btn-2" class="btn btn-secondary text-xs px-4 py-2">Cancelar</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderNewClaimModalHtml() {
    return `
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
        <div class="flex justify-between items-center border-b border-slate-200 pb-3">
          <h3 class="font-bold text-slate-900 text-base">Cadastrar Novo Sinistro / Ocorrência</h3>
          <button id="close-modal-btn" class="text-slate-400 hover:text-slate-700 text-lg"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <form id="new-claim-form" class="space-y-4 text-xs">
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="form-label text-xs">Tipo de Ocorrência</label>
              <select name="occurrenceType" class="form-select text-xs">
                <option value="Colisão Traseira com Avarias">Colisão Traseira com Avarias</option>
                <option value="Infração por Velocidade + NIC Duplicada">Infração por Velocidade + NIC Duplicada</option>
                <option value="Estacionamento Proibido">Estacionamento Proibido</option>
              </select>
            </div>
            <div>
              <label class="form-label text-xs">Prioridade</label>
              <select name="priority" class="form-select text-xs">
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
            <div>
              <label class="form-label text-xs">Status Inicial</label>
              <select name="status" class="form-select text-xs"><option value="Novo">Novo</option></select>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="form-label text-xs">Placa *</label>
              <input type="text" name="vehiclePlate" value="JCO8C10" class="form-input text-xs font-bold uppercase" required />
            </div>
            <div>
              <label class="form-label text-xs">Modelo / Prefixo *</label>
              <input type="text" name="vehicleModel" value="VW Constellation (Prefixo 24127)" class="form-input text-xs" required />
            </div>
            <div>
              <label class="form-label text-xs">Condutor *</label>
              <input type="text" name="driverName" value="ANDREIA MERCEDES ROCHA DE ARAUJO" class="form-input text-xs" required />
            </div>
          </div>

          <div>
            <label class="form-label text-xs">Descrição Detalhada *</label>
            <textarea name="description" rows="3" placeholder="Descreva a ocorrência..." class="form-textarea text-xs" required></textarea>
          </div>

          <div class="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button type="button" id="close-modal-btn-2" class="btn btn-secondary text-xs px-4 py-2">Cancelar</button>
            <button type="submit" class="btn bg-slate-900 text-white font-bold text-xs px-5 py-2">Cadastrar Sinistro</button>
          </div>
        </form>
      </div>
    `;
  }

  function renderTermGeneratorModalHtml() {
    return `
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
        <div class="flex justify-between items-center border-b border-slate-200 pb-3">
          <div>
            <span class="badge bg-amber-100 text-amber-900 text-[10px] px-2 py-0.5 rounded font-black uppercase">Modelos Trans Pinho (Layout Idêntico aos PDFs)</span>
            <h3 class="font-bold text-slate-900 text-base">Gerador Inteligente de Termos</h3>
          </div>
          <button id="close-modal-btn" class="text-slate-400 hover:text-slate-700 text-lg"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <form id="gen-term-form" class="space-y-4 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label text-xs">Selecione o Modelo de Termo *</label>
              <select id="term-template-select" class="form-select text-xs font-bold text-slate-900">
                <option value="multa_nic">1. TERMO DE RESPONSABILIDADE (MULTA + NIC DUPLICADA)</option>
                <option value="infracao_direta">2. TERMO DE RESPONSABILIDADE (INFRAÇÃO DIRETA)</option>
                <option value="desconto_folha">3. TERMO DE CIÊNCIA E AUTORIZAÇÃO DE DESCONTO EM FOLHA</option>
              </select>
            </div>
            <div>
              <label class="form-label text-xs">Condutor *</label>
              <select id="term-driver-select" class="form-select text-xs font-semibold">
                <option value="ANDREIA MERCEDES ROCHA DE ARAUJO">ANDREIA MERCEDES ROCHA DE ARAUJO (CPF 002.574.880-73)</option>
                <option value="MICHELE ROSA DA ROSA">MICHELE ROSA DA ROSA (CPF 016.998.180-02)</option>
              </select>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button type="button" id="close-modal-btn-2" class="btn btn-secondary text-xs px-4 py-2">Cancelar</button>
            <button type="submit" class="btn bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-2">Emitir Termo com Layout Oficial</button>
          </div>
        </form>
      </div>
    `;
  }

  function buildTermHtml(type, driverName) {
    const isAndreia = driverName.includes('ANDREIA');
    const cpf = isAndreia ? '002.574.880-73' : '016.998.180-02';
    const placa = isAndreia ? 'JCO8C10' : 'TRD3E72';
    const prefixo = isAndreia ? '24127' : '226';

    if (type === 'multa_nic') {
      return `
        <div class="trans-pinho-doc text-slate-900">
          <div class="trans-pinho-header">
            <h2 class="font-black text-sm uppercase">JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)</h2>
            <p class="text-[11px] text-slate-600">Rua Florida, 116 – Nossa Chácara – Gravataí/ RS</p>
            <p class="text-[11px] text-slate-600">(051) 3047-0212 / 98266-0028 | Transpinho@transpinho.com</p>
          </div>

          <h3 class="trans-pinho-title">TERMO DE RESPONSABILIDADE</h3>

          <div class="trans-pinho-section">1. IDENTIFICAÇÃO DO CONDUTOR</div>
          <p class="text-xs mb-3">
            Eu, <strong>${driverName}</strong>, portador do CPF de nº <strong>${cpf}</strong>, na qualidade de condutor dos veículos abaixo identificado:
          </p>
          <ul class="list-disc pl-6 text-xs mb-4 font-semibold">
            <li>Placa: <strong>${placa}</strong> &nbsp;&nbsp;&nbsp;&nbsp; Prefixo do Carro: <strong>${prefixo}</strong></li>
          </ul>

          <div class="trans-pinho-section">2. DETALHAMENTO DAS INFRAÇÕES E VALORES</div>
          <ul class="space-y-2 text-xs mb-3">
            <li class="font-bold">• Infração 01:</li>
            <ul class="pl-6 space-y-1 text-[11px]">
              <li>o Auto de Infração nº: <strong>EL00093302</strong></li>
              <li>o Data: <strong>27/04/2026</strong> | Horário: <strong>10:44</strong></li>
              <li>o Motivo/Enquadramento: <strong>TRANSITAR EM VELOCIDADE SUPERIOR A MAXIMA PERMITIDA EM ATE 20%</strong></li>
              <li>o Valor: <strong>R$ 130,16</strong></li>
            </ul>

            <li class="font-bold">• Infração 02:</li>
            <ul class="pl-6 space-y-1 text-[11px]">
              <li>o Auto de Infração nº: <strong>Gerado Duplicada</strong></li>
              <li>o Data: | Horário:</li>
              <li>o Motivo/Enquadramento: <strong>MULTA. POR NÃO INDENTIFICACAO DO CONTUDOR INFRATOR, IMPOSTA A PESSOA JURITICA</strong></li>
              <li>o Valor: <strong>R$ 130,16</strong></li>
            </ul>
          </ul>

          <p class="text-xs text-justify leading-relaxed mb-3">
            O condutor reconhece a infração nº <strong>EL00093302</strong>. Considerando que o próprio condutor solicitou a não realização da indicação de condutor para transferência dos pontos da CNH, por não desejar o registro de pontos em sua carteira de habilitação, declara estar ciente e de acordo com o pagamento em dobro do valor original da multa, totalizando <strong>R$ 260,32 (duzentos e sessenta reais e trinta e dois centavos)</strong>, assumindo integral responsabilidade pela nova infração gerada.
          </p>

          <p class="font-bold text-xs mb-4">VALOR TOTAL ACUMULADO: R$ 260,32</p>

          <div class="trans-pinho-section">3. DA FORMA DE PAGAMENTO E PARCELAMENTO</div>
          <p class="text-xs mb-2">O condutor declara-se ciente do débito total acima mencionado e opta pela seguinte modalidade de quitação:</p>
          <div class="space-y-1 text-xs mb-4 pl-2 font-semibold">
            <p>☐ Cota Única: Vencimento em 06/07/2026</p>
            <p>☑ Parcelado: Em 2 parcelas de R$ 130,16 Mensais. (Primeira parcela em: 06/07/2026)</p>
          </div>

          <div class="trans-pinho-section">4. DA RESPONSABILIDADE E QUITAÇÃO</div>
          <p class="text-xs text-justify leading-relaxed mb-6">
            Assumo integral responsabilidade civil e administrativa pelo pagamento dos valores aqui descritos. Ao concluir o pagamento total, outorgo à empresa <strong>João Batista de Souza Pinho EPP (Trans Pinho)</strong> a mais ampla, geral e irrevogável quitação, para nada mais declarar em juízo ou fora dele, operando-se a sub-rogação de direitos em favor da referida Trans Pinho.
          </p>

          <p class="text-xs mb-10">GRAVATAÍ, ${new Date().getDate()} de Junho de 2026.</p>

          <div class="text-center pt-8 border-t border-slate-400 w-72 mx-auto">
            <p class="font-bold text-xs">${driverName}</p>
            <p class="text-[10px] text-slate-500">Condutor Responsável</p>
          </div>
        </div>
      `;
    } else if (type === 'infracao_direta') {
      return `
        <div class="trans-pinho-doc text-slate-900">
          <div class="trans-pinho-header">
            <h2 class="font-black text-sm uppercase">JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)</h2>
            <p class="text-[11px] text-slate-600">Rua Florida, 116 – Nossa Chácara – Gravataí/ RS</p>
            <p class="text-[11px] text-slate-600">(051) 3047-0212 / 98266-0028 | Transpinho@transpinho.com</p>
          </div>

          <h3 class="trans-pinho-title">TERMO DE RESPONSABILIDADE</h3>

          <div class="trans-pinho-section">1. IDENTIFICAÇÃO DO CONDUTOR</div>
          <p class="text-xs mb-3">
            Eu, <strong>${driverName}</strong> portador(a) do CPF nº <strong>${cpf}</strong>, na qualidade de condutor(a) do veículo abaixo identificado:
          </p>
          <ul class="list-disc pl-6 text-xs mb-4 font-semibold">
            <li>Placa: <strong>${placa}</strong></li>
            <li>Prefixo do Carro: <strong>${prefixo}</strong></li>
          </ul>

          <div class="trans-pinho-section">2. DETALHES DO OCORRIDO</div>
          <ul class="space-y-1 text-xs mb-4 pl-4">
            <li>• Auto de Infração nº: <strong>TE02141677</strong></li>
            <li>• Data do ocorrido: <strong>15/04/2026</strong></li>
            <li>• Horário: <strong>16:50</strong></li>
            <li>• Motivo (Enquadramento): <strong>ESTACIONAR EM LOCAL/HORARIO PROIBIDO ESPECIFICAMENTE PELA SINALIZACAO.</strong></li>
          </ul>

          <div class="trans-pinho-section">3. DECLARAÇÃO DE RESPONSABILIDADE</div>
          <p class="text-xs text-justify leading-relaxed mb-6">
            Declaro e assumo total e integral responsabilidade civil e administrativa pelas infrações de trânsito ocorridas com o veículo acima descritos, bem como por todas as consequências decorrentes destes atos. Confirmo ter total ciência da natureza e gravidade das referidas infrações, isentando a empresa <strong>João Batista de Souza Pinho EPP (Trans Pinho)</strong> de qualquer responsabilidade sobre as mesmas, uma vez que decorreram da minha conduta direta na condução do veículo.
          </p>

          <p class="text-xs mb-10">GRAVATAÍ, ${new Date().getDate()} de Junho de 2026.</p>

          <div class="text-center pt-8 border-t border-slate-400 w-72 mx-auto">
            <p class="font-bold text-xs">Assinatura do Condutor</p>
            <p class="text-[10px] text-slate-500">${driverName}</p>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="trans-pinho-doc text-slate-900">
          <div class="trans-pinho-header">
            <h2 class="font-black text-sm uppercase">Trans Pinho</h2>
          </div>

          <h3 class="trans-pinho-title">TERMO DE CIÊNCIA E AUTORIZAÇÃO DE DESCONTO EM FOLHA DE PAGAMENTO</h3>

          <p class="text-xs text-justify leading-relaxed mb-4">
            Eu, <strong>${driverName}</strong>, inscrito no CPF sob nº <strong>${cpf}</strong>, declaro, para os devidos fins de direito, na qualidade de condutor do veículo <strong>VW Constellation</strong>, placa <strong>${placa}</strong>, envolvido na ocorrência de trânsito nº <strong>SIN-2026-00124</strong>, que:
          </p>

          <div class="trans-pinho-section">I – Da ciência e reconhecimento da ocorrência</div>
          <p class="text-xs text-justify leading-relaxed mb-4">
            Declaro estar plenamente ciente dos fatos relacionados à ocorrência acima descrita, bem como dos danos materiais dela decorrentes.
          </p>

          <div class="trans-pinho-section">II – Do reconhecimento de responsabilidade</div>
          <p class="text-xs text-justify leading-relaxed mb-4">
            Reconheço minha responsabilidade pelos danos ocasionados em decorrência do referido evento, assumindo integralmente a obrigação referente ao ressarcimento dos prejuízos apurados, no valor total de <strong>R$ 3.500,00 (Três mil e quinhentos reais)</strong>.
          </p>

          <div class="trans-pinho-section">III – Da autorização de desconto em folha</div>
          <p class="text-xs text-justify leading-relaxed mb-3">
            Autorizo, de forma expressa, livre, consciente e inequívoca, nos termos da legislação aplicável e do acordo firmado entre as partes, o desconto do valor acima mencionado em minha folha de pagamento/contracheque, mediante o seguinte parcelamento:
          </p>
          <div class="space-y-1 text-xs mb-4 pl-4 font-semibold">
            <p>Valor total: R$ 3.500,00</p>
            <p>Parcelamento: 5 parcelas mensais e sucessivas de R$ 700,00</p>
          </div>

          <p class="text-xs text-justify leading-relaxed mb-6">
            Declaro que assino o presente instrumento por minha livre e espontânea vontade, sem qualquer vício de consentimento, estando ciente de todos os seus termos, efeitos e consequências jurídicas.
          </p>

          <p class="text-xs mb-10">Gravataí, ${new Date().getDate()} de Junho de 2026</p>

          <div class="text-center pt-8 border-t border-slate-400 w-72 mx-auto">
            <p class="font-bold text-xs">${driverName}</p>
          </div>
        </div>
      `;
    }
  }

  function renderSearchModalHtml() {
    return `
      <div class="bg-white rounded-xl shadow-2xl max-w-xl w-full p-4 space-y-3" onclick="event.stopPropagation()">
        <div class="flex items-center gap-3 border-b border-slate-200 pb-3">
          <i class="fa-solid fa-magnifying-glass text-slate-400"></i>
          <input type="text" id="search-modal-input" placeholder="Pesquise por Andreia, Michele, JCO8C10, TRD3E72..." value="${state.searchQuery}" class="w-full text-xs focus:outline-none" autofocus />
          <button id="close-modal-btn" class="text-slate-400 text-xs">ESC</button>
        </div>
        <div id="search-modal-results" class="max-h-64 overflow-y-auto text-xs space-y-2">
          ${renderSearchResultsHtml()}
        </div>
      </div>
    `;
  }

  function renderSearchResultsHtml() {
    if (!state.searchQuery.trim()) return `<p class="text-slate-400 text-center py-4">Digite para buscar...</p>`;
    const q = state.searchQuery.toLowerCase();
    const matched = state.claims.filter(c => c.claimNumber.toLowerCase().includes(q) || c.vehiclePlate.toLowerCase().includes(q) || c.driverName.toLowerCase().includes(q));

    if (matched.length === 0) return `<p class="text-slate-500 text-center py-4">Nenhum resultado encontrado.</p>`;

    return matched.map(c => `
      <div data-claim-id="${c.id}" class="open-dossier-btn p-2.5 bg-slate-50 hover:bg-amber-50 rounded-lg cursor-pointer flex justify-between items-center">
        <div>
          <span class="font-bold text-slate-900">${c.claimNumber}</span> - <span class="font-semibold text-slate-700">${c.driverName}</span>
          <p class="text-[10px] text-slate-400">Placa: ${c.vehiclePlate}</p>
        </div>
        <span class="badge ${getStatusBadgeClass(c.status)} px-2 py-0.5 rounded text-[9px] font-bold">${c.status}</span>
      </div>
    `).join('');
  }

  function attachEvents() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.currentTarget.getAttribute('data-view');
        if (view) { state.currentView = view; renderApp(); }
      });
    });

    document.querySelectorAll('.open-dossier-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const claimId = e.currentTarget.getAttribute('data-claim-id');
        if (claimId) {
          state.currentView = 'claim-detail';
          loadClaimDossier(claimId);
        }
      });
    });

    document.getElementById('search-trigger')?.addEventListener('click', () => { state.showSearchModal = true; renderModals(); });
    document.getElementById('open-excel-import')?.addEventListener('click', () => { state.showExcelImportModal = true; renderModals(); });
    document.getElementById('dash-import-excel')?.addEventListener('click', () => { state.showExcelImportModal = true; renderModals(); });
    document.getElementById('claims-import-excel')?.addEventListener('click', () => { state.showExcelImportModal = true; renderModals(); });
    document.getElementById('fines-import-excel')?.addEventListener('click', () => { state.showExcelImportModal = true; renderModals(); });
    document.getElementById('people-import-excel')?.addEventListener('click', () => { state.showExcelImportModal = true; renderModals(); });

    document.getElementById('open-new-claim')?.addEventListener('click', () => { state.showNewClaimModal = true; renderModals(); });
    document.getElementById('claims-new-btn')?.addEventListener('click', () => { state.showNewClaimModal = true; renderModals(); });
    document.getElementById('dash-new-term')?.addEventListener('click', () => { state.showTermGeneratorModal = true; renderModals(); });
    document.getElementById('terms-open-gen')?.addEventListener('click', () => { state.showTermGeneratorModal = true; renderModals(); });
    document.getElementById('detail-gen-term')?.addEventListener('click', () => { state.showTermGeneratorModal = true; renderModals(); });

    document.onkeydown = function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); state.showSearchModal = true; renderModals();
      } else if (e.key === 'Escape') {
        state.showSearchModal = false; state.showNewClaimModal = false; state.showTermGeneratorModal = false; state.showExcelImportModal = false; renderModals();
      }
    };
  }

  function attachModalEvents() {
    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return;

    modalRoot.onclick = function () {
      state.showSearchModal = false; state.showNewClaimModal = false; state.showTermGeneratorModal = false; state.showExcelImportModal = false; renderModals();
    };

    document.querySelectorAll('#close-modal-btn, #close-modal-btn-2').forEach(b => {
      b.onclick = function () {
        state.showSearchModal = false; state.showNewClaimModal = false; state.showTermGeneratorModal = false; state.showExcelImportModal = false; renderModals();
      };
    });

    const dropzone = document.getElementById('excel-dropzone');
    const fileInput = document.getElementById('excel-file-input');

    if (dropzone && fileInput) {
      dropzone.onclick = () => fileInput.click();
      fileInput.onchange = function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (evt) {
          try {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);

            if (json && json.length > 0) {
              json.forEach((row, idx) => {
                const auto = row['Auto'] || row['Auto de Infração'] || row['Auto de Infracao'] || `AUTO-${Date.now()}-${idx}`;
                const placa = row['Placa'] || row['Veículo'] || 'JCO8C10';
                const condutor = row['Condutor'] || row['Nome'] || 'ANDREIA MERCEDES ROCHA DE ARAUJO';
                const desc = row['Descrição'] || row['Enquadramento'] || row['Motivo'] || 'Infração de trânsito importada via Excel';
                const valor = parseFloat(row['Valor'] || row['Valor Total'] || 130.16);
                const venc = row['Vencimento'] || row['Data'] || '2026-07-06';

                state.fines.unshift({
                  id: `fine-xl-${Date.now()}-${idx}`,
                  infractionAuto: auto,
                  vehiclePlate: placa,
                  driverName: condutor,
                  description: desc,
                  amount: valor,
                  points: 4,
                  dueDate: venc,
                  status: 'Pendente'
                });
              });

              showToast(`${json.length} registros importados da planilha Excel com sucesso!`, 'info');
              state.showExcelImportModal = false;
              renderModals();
              state.currentView = 'fines';
              renderApp();
            } else {
              alert('A planilha selecionada parece estar vazia.');
            }
          } catch (err) {
            console.error(err);
            alert('Erro ao processar o arquivo Excel. Verifique o formato.');
          }
        };
        reader.readAsArrayBuffer(file);
      };
    }

    const genTermForm = document.getElementById('gen-term-form');
    if (genTermForm) {
      genTermForm.onsubmit = async function (e) {
        e.preventDefault();
        const typeSelect = document.getElementById('term-template-select').value;
        const driverName = document.getElementById('term-driver-select').value;

        const titleMap = {
          'multa_nic': 'TERMO DE RESPONSABILIDADE - MULTAS & NÃO INDICAÇÃO',
          'infracao_direta': 'TERMO DE RESPONSABILIDADE - INFRAÇÃO DIRETA',
          'desconto_folha': 'TERMO DE CIÊNCIA E AUTORIZAÇÃO DE DESCONTO EM FOLHA DE PAGAMENTO'
        };

        const title = titleMap[typeSelect] || 'TERMO DE RESPONSABILIDADE';
        const htmlContent = buildTermHtml(typeSelect, driverName);

        const newObj = {
          id: `trm-${Date.now()}`,
          title,
          type: title,
          date: new Date().toISOString().split('T')[0],
          responsible: state.currentUser.name,
          involvedPerson: driverName,
          status: 'Assinado',
          htmlContent
        };

        state.terms.unshift(newObj);
        showToast('Termo com layout oficial gerado e salvo!', 'info');
        state.showTermGeneratorModal = false;
        renderModals();
        state.currentView = 'terms';
        renderApp();
      };
    }
  }

  renderApp();
  loadData();
})();
