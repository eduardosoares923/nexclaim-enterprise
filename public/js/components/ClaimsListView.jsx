const { React, useEffect, useState } = window;

window.ClaimsListView = function ClaimsListView({ selectClaim, onOpenNewClaimModal }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  useEffect(() => {
    fetchClaims();
  }, []);

  async function fetchClaims() {
    try {
      const res = await fetch('/api/claims');
      const data = await res.json();
      setClaims(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredClaims = claims.filter(c => {
    const matchesSearch = 
      c.claimNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.protocol.toLowerCase().includes(search.toLowerCase()) ||
      c.vehiclePlate.toLowerCase().includes(search.toLowerCase()) ||
      c.driverName.toLowerCase().includes(search.toLowerCase()) ||
      c.insurer.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !statusFilter || c.status === statusFilter;
    const matchesPriority = !priorityFilter || c.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div class="space-y-6">
      {/* Header & Actions */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight">Gestão de Sinistros & Ocorrências</h2>
          <p class="text-xs text-slate-500 mt-0.5">Cadastre, acompanhe e gerencie todos os dossiês de ocorrências da frota.</p>
        </div>
        <button 
          onClick={onOpenNewClaimModal}
          class="btn bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <i class="fa-solid fa-plus text-xs"></i> Cadastrar Novo Sinistro
        </button>
      </div>

      {/* Filter Bar & Controls */}
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div class="relative md:col-span-2">
            <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
            <input 
              type="text" 
              placeholder="Filtrar por número, protocolo, placa, condutor ou seguradora..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              class="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 bg-slate-50"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 bg-slate-50 font-medium text-slate-700"
            >
              <option value="">Todos os Status</option>
              <option value="Novo">Novo</option>
              <option value="Em análise">Em análise</option>
              <option value="Aguardando documentos">Aguardando documentos</option>
              <option value="Aguardando seguradora">Aguardando seguradora</option>
              <option value="Em vistoria">Em vistoria</option>
              <option value="Em reparo">Em reparo</option>
              <option value="Resolvido">Resolvido</option>
              <option value="Encerrado">Encerrado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 bg-slate-50 font-medium text-slate-700"
            >
              <option value="">Todas as Prioridades</option>
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Alta">Alta</option>
              <option value="Crítica">Crítica</option>
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>Exibindo <strong>{filteredClaims.length}</strong> sinistro(s)</span>
          <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('table')}
              class={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600'}`}
            >
              <i class="fa-solid fa-list text-xs"></i> Tabela
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              class={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600'}`}
            >
              <i class="fa-solid fa-grip text-xs"></i> Cards
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div class="p-8 text-center text-xs text-slate-400">Carregando sinistros...</div>
      ) : filteredClaims.length === 0 ? (
        <div class="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-xs">
          <i class="fa-solid fa-folder-open text-3xl text-slate-300 mb-3"></i>
          <h3 class="font-bold text-slate-700 text-sm">Nenhum sinistro encontrado</h3>
          <p class="text-xs text-slate-500 mt-1">Ajuste os filtros de pesquisa ou cadastre uma nova ocorrência.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th class="p-3.5">Número / Protocolo</th>
                  <th class="p-3.5">Data / Hora</th>
                  <th class="p-3.5">Ocorrência</th>
                  <th class="p-3.5">Veículo / Condutor</th>
                  <th class="p-3.5">Prioridade</th>
                  <th class="p-3.5">Status</th>
                  <th class="p-3.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                {filteredClaims.map(claim => (
                  <tr key={claim.id} class="hover:bg-slate-50/80 transition-colors">
                    <td class="p-3.5">
                      <span 
                        onClick={() => selectClaim(claim.id)} 
                        class="font-bold text-blue-600 hover:underline cursor-pointer text-sm"
                      >
                        {claim.claimNumber}
                      </span>
                      <div class="text-[10px] text-slate-400 font-mono">{claim.protocol}</div>
                    </td>
                    <td class="p-3.5 font-medium text-slate-700">
                      {window.formatDate(claim.date)}
                      <div class="text-[10px] text-slate-400">{claim.time}</div>
                    </td>
                    <td class="p-3.5">
                      <span class="font-semibold text-slate-800">{claim.occurrenceType}</span>
                      <div class="text-[10px] text-slate-400">{claim.city}/{claim.state}</div>
                    </td>
                    <td class="p-3.5">
                      <span class="font-bold text-slate-800">{claim.vehiclePlate}</span>
                      <div class="text-[10px] text-slate-500">{claim.driverName}</div>
                    </td>
                    <td class="p-3.5">
                      <span class={`badge ${window.getPriorityBadgeClass(claim.priority)} px-2 py-0.5 rounded text-[10px] font-bold border`}>
                        {claim.priority}
                      </span>
                    </td>
                    <td class="p-3.5">
                      <span class={`badge ${window.getStatusBadgeClass(claim.status)} px-2.5 py-1 rounded-full text-[10px] font-semibold border inline-block`}>
                        {claim.status}
                      </span>
                    </td>
                    <td class="p-3.5 text-right">
                      <button 
                        onClick={() => selectClaim(claim.id)}
                        class="btn bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs px-3 py-1.5 rounded-lg font-semibold"
                      >
                        Abrir Dossiê <i class="fa-solid fa-arrow-right text-[10px] ml-1"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Card View */
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClaims.map(claim => (
            <div key={claim.id} class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div class="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span class="font-black text-blue-600 text-base">{claim.claimNumber}</span>
                    <p class="text-[10px] text-slate-400 font-mono">{claim.protocol}</p>
                  </div>
                  <span class={`badge ${window.getStatusBadgeClass(claim.status)} px-2.5 py-0.5 rounded-full text-[10px] font-bold border`}>
                    {claim.status}
                  </span>
                </div>

                <h4 class="font-bold text-slate-900 text-sm mt-3">{claim.occurrenceType}</h4>
                <p class="text-xs text-slate-500 line-clamp-2 mt-1">{claim.description}</p>

                <div class="mt-4 p-3 bg-slate-50 rounded-lg text-xs space-y-1.5">
                  <div class="flex justify-between">
                    <span class="text-slate-500">Veículo:</span>
                    <span class="font-bold text-slate-800">{claim.vehiclePlate} ({claim.vehicleModel})</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-500">Condutor:</span>
                    <span class="font-semibold text-slate-800">{claim.driverName}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-500">Data da Ocorrência:</span>
                    <span class="font-medium text-slate-800">{window.formatDate(claim.date)} às {claim.time}</span>
                  </div>
                </div>
              </div>

              <div class="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span class={`badge ${window.getPriorityBadgeClass(claim.priority)} px-2 py-0.5 rounded text-[10px] font-bold border`}>
                  Prioridade: {claim.priority}
                </span>
                <button 
                  onClick={() => selectClaim(claim.id)}
                  class="btn bg-blue-600 hover:bg-blue-700 text-white text-xs px-3.5 py-1.5 rounded-lg font-semibold"
                >
                  Abrir Dossiê
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
