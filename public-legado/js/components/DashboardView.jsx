const { React, useEffect, useState } = window;

window.DashboardView = function DashboardView({ setCurrentView, selectClaim, onOpenNewClaimModal }) {
  const [claims, setClaims] = useState([]);
  const [fines, setFines] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cRes, fRes, dRes, tRes] = await Promise.all([
          fetch('/api/claims').then(r => r.json()),
          fetch('/api/fines').then(r => r.json()),
          fetch('/api/documents').then(r => r.json()),
          fetch('/api/timeline').then(r => r.json())
        ]);
        setClaims(cRes || []);
        setFines(fRes || []);
        setDocuments(dRes || []);
        setTimeline(tRes || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div class="space-y-6 animate-pulse p-2">
        <div class="h-8 bg-slate-200 rounded w-48"></div>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="h-28 bg-slate-200 rounded-xl"></div>
          <div class="h-28 bg-slate-200 rounded-xl"></div>
          <div class="h-28 bg-slate-200 rounded-xl"></div>
          <div class="h-28 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const openClaimsCount = claims.filter(c => ['Novo', 'Em análise', 'Aguardando documentos', 'Aguardando seguradora', 'Em vistoria', 'Em reparo'].includes(c.status)).length;
  const analysisClaimsCount = claims.filter(c => c.status === 'Em análise').length;
  const resolvedClaimsCount = claims.filter(c => ['Resolvido', 'Encerrado'].includes(c.status)).length;
  const pendingFinesCount = fines.filter(f => f.status === 'Pendente' || f.status === 'Em análise').length;
  const totalFineAmount = fines.reduce((acc, f) => acc + (f.amount || 0), 0);

  return (
    <div class="space-y-6">
      {/* Welcome & Quick Action Header */}
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight">Painel de Gestão de Sinistros & Dossiês</h2>
          <p class="text-xs text-slate-500 mt-1">Visão consolidada de ocorrências, multas, documentos e históricos da frota corporativa.</p>
        </div>
        <div class="flex flex-wrap gap-2.5">
          <button 
            onClick={onOpenNewClaimModal}
            class="btn bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-2 shadow-sm"
          >
            <i class="fa-solid fa-plus text-xs"></i> Abrir Sinistro
          </button>
          <button 
            onClick={() => setCurrentView('terms')}
            class="btn bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-2"
          >
            <i class="fa-solid fa-file-pen text-xs text-amber-600"></i> Gerar Termo Automático
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Sinistros */}
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase text-slate-400 tracking-wider">Total de Sinistros</span>
            <div class="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
              <i class="fa-solid fa-folder-closed"></i>
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-2xl font-black text-slate-900">{claims.length}</span>
            <span class="text-[11px] font-semibold text-emerald-600"><i class="fa-solid fa-arrow-up text-[9px]"></i> +2 este mês</span>
          </div>
          <div class="mt-3 pt-3 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
            <span>Resolvidos: <strong>{resolvedClaimsCount}</strong></span>
            <span>Abertos: <strong>{openClaimsCount}</strong></span>
          </div>
        </div>

        {/* Card 2: Em Análise */}
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase text-slate-400 tracking-wider">Sinistros em Análise</span>
            <div class="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-sm">
              <i class="fa-solid fa-magnifying-glass"></i>
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-2xl font-black text-slate-900">{analysisClaimsCount}</span>
            <span class="text-[11px] font-semibold text-amber-600">Ação imediata requerida</span>
          </div>
          <div class="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Aguardando laudo de vistoria
          </div>
        </div>

        {/* Card 3: Multas Pendentes */}
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase text-slate-400 tracking-wider">Multas Pendentes</span>
            <div class="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-sm">
              <i class="fa-solid fa-file-invoice-dollar"></i>
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-2xl font-black text-slate-900">{pendingFinesCount}</span>
            <span class="text-[11px] font-semibold text-slate-500">Total: {window.formatCurrency(totalFineAmount)}</span>
          </div>
          <div class="mt-3 pt-3 border-t border-slate-100 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
            <i class="fa-solid fa-clock"></i> 1 multa vence nos próximos 5 dias
          </div>
        </div>

        {/* Card 4: Documentos Anexados */}
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase text-slate-400 tracking-wider">Documentos Recentes</span>
            <div class="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-sm">
              <i class="fa-solid fa-file-contract"></i>
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-2xl font-black text-slate-900">{documents.length}</span>
            <span class="text-[11px] font-semibold text-purple-600">100% digitalizado</span>
          </div>
          <div class="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            BO, CNH, Apólices e Laudos
          </div>
        </div>
      </div>

      {/* Main Grid: Charts & Recent Activity */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Visual Analytics & Recent Claims Table */}
        <div class="lg:col-span-2 space-y-6">
          
          {/* Claims Overview Table */}
          <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
                <i class="fa-solid fa-folder-open text-blue-600"></i> Sinistros em Andamento
              </h3>
              <button onClick={() => setCurrentView('claims')} class="text-xs font-semibold text-blue-600 hover:text-blue-800">
                Ver todos os {claims.length} sinistros →
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th class="p-3.5">Número / Protocolo</th>
                    <th class="p-3.5">Ocorrência</th>
                    <th class="p-3.5">Veículo / Placa</th>
                    <th class="p-3.5">Status</th>
                    <th class="p-3.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  {claims.slice(0, 4).map(claim => (
                    <tr key={claim.id} class="hover:bg-slate-50 transition-colors">
                      <td class="p-3.5">
                        <span class="font-bold text-blue-600 hover:underline cursor-pointer" onClick={() => selectClaim(claim.id)}>
                          {claim.claimNumber}
                        </span>
                        <div class="text-[10px] text-slate-400">{claim.protocol}</div>
                      </td>
                      <td class="p-3.5 font-medium text-slate-800">
                        {claim.occurrenceType}
                        <div class="text-[10px] text-slate-400">{window.formatDate(claim.date)}</div>
                      </td>
                      <td class="p-3.5">
                        <span class="font-bold text-slate-800">{claim.vehiclePlate}</span>
                        <div class="text-[10px] text-slate-400">{claim.vehicleModel}</div>
                      </td>
                      <td class="p-3.5">
                        <span class={`badge ${window.getStatusBadgeClass(claim.status)} px-2 py-0.5 rounded-full text-[10px] font-semibold inline-block`}>
                          {claim.status}
                        </span>
                      </td>
                      <td class="p-3.5 text-right">
                        <button 
                          onClick={() => selectClaim(claim.id)} 
                          class="btn btn-secondary text-[11px] py-1 px-2.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                        >
                          Abrir Dossiê
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Chart Simulation */}
          <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 class="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <i class="fa-solid fa-chart-bar text-indigo-600"></i> Distribuição por Tipo de Ocorrência
            </h3>
            <div class="space-y-3">
              <div>
                <div class="flex justify-between text-xs font-semibold mb-1">
                  <span>Colisão Traseira / Cruzamento</span>
                  <span>40%</span>
                </div>
                <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div class="bg-blue-600 h-full w-[40%] rounded-full"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-xs font-semibold mb-1">
                  <span>Avaria em Estacionamento</span>
                  <span>25%</span>
                </div>
                <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div class="bg-indigo-500 h-full w-[25%] rounded-full"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-xs font-semibold mb-1">
                  <span>Furto Parcial / Acessórios</span>
                  <span>20%</span>
                </div>
                <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div class="bg-amber-500 h-full w-[20%] rounded-full"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-xs font-semibold mb-1">
                  <span>Danos por Granizo / Naturais</span>
                  <span>15%</span>
                </div>
                <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div class="bg-emerald-500 h-full w-[15%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Operational Log */}
        <div class="space-y-6">
          
          {/* Timeline Feed */}
          <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 class="font-bold text-slate-900 text-sm mb-4 flex items-center justify-between">
              <span class="flex items-center gap-2">
                <i class="fa-solid fa-clock-rotate-left text-blue-600"></i> Atividades Recentes
              </span>
              <span class="text-[10px] text-slate-400">Tempo real</span>
            </h3>

            <div class="space-y-4">
              {timeline.slice(0, 5).map((evt, idx) => (
                <div key={evt.id || idx} class="flex gap-3 text-xs">
                  <div class="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                    <i class="fa-solid fa-circle-dot text-[10px]"></i>
                  </div>
                  <div class="flex-1">
                    <p class="font-bold text-slate-800 leading-snug">{evt.actionType}</p>
                    <p class="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{evt.description}</p>
                    <div class="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                      <span><i class="fa-solid fa-user text-[9px]"></i> {evt.user}</span>
                      <span>•</span>
                      <span>{window.formatDateTime(evt.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info Box */}
          <div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-xl shadow-md border border-slate-700">
            <h4 class="font-bold text-sm mb-1">Central de Ajuda & Diretrizes LGPD</h4>
            <p class="text-xs text-slate-300 leading-relaxed">
              Todos os documentos e fotos de sinistros contendo dados de terceiros e condutores são armazenados de forma restrita sob os princípios da Lei Geral de Proteção de Dados.
            </p>
            <button onClick={() => setCurrentView('activity')} class="mt-4 btn bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs px-3 py-1.5 rounded-lg font-semibold w-full">
              Ver Logs de Auditoria
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
