import React, { useState } from 'react';
import { Claim, Person, Vehicle, Term, DocumentTemplate } from '../types';
import { NewClaimModal } from '../components/NewClaimModal';
import { ClaimDetailModal } from '../components/ClaimDetailModal';

interface ClaimsListViewProps {
  claims: Claim[];
  people: Person[];
  vehicles: Vehicle[];
  terms: Term[];
  templates: DocumentTemplate[];
  onSaveNewClaim: (claim: Claim) => void;
  onOpenTermGenerator: (claim: Claim) => void;
  onDeleteClaim?: (id: string) => void;
}

export const ClaimsListView: React.FC<ClaimsListViewProps> = ({
  claims,
  people,
  vehicles,
  terms,
  templates,
  onSaveNewClaim,
  onOpenTermGenerator,
  onDeleteClaim,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const [selectedClaimDetail, setSelectedClaimDetail] = useState<Claim | null>(null);
  const [showNewClaimModal, setShowNewClaimModal] = useState(false);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const filteredClaims = claims.filter((c) => {
    const matchesSearch =
      search === '' ||
      c.claimNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.protocol.toLowerCase().includes(search.toLowerCase()) ||
      c.vehiclePlate.toLowerCase().includes(search.toLowerCase()) ||
      c.driverName.toLowerCase().includes(search.toLowerCase()) ||
      (c.insurer && c.insurer.toLowerCase().includes(search.toLowerCase())) ||
      c.occurrenceType.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !statusFilter || c.status === statusFilter;
    const matchesPriority = !priorityFilter || c.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <span className="badge bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded border border-amber-300 uppercase tracking-wider">
            Módulo Operacional • Trans Pinho
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            Gestão de Sinistros & Ocorrências da Frota
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastre, acompanhe e gerencie todos os dossiês de ocorrências, avarias e processos de ressarcimento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewClaimModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition active:scale-95"
          >
            <i className="fa-solid fa-plus text-xs"></i>
            <span>Novo Sinistro</span>
          </button>
        </div>
      </div>

      {/* Filter and View Mode Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              placeholder="Buscar por nº sinistro, protocolo, placa, motorista ou seguradora..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              <option value="">Todos os Status</option>
              <option value="Novo">Novo</option>
              <option value="Em análise">Em análise</option>
              <option value="Aguardando documentos">Aguardando documentos</option>
              <option value="Aguardando seguradora">Aguardando seguradora</option>
              <option value="Em vistoria">Em vistoria</option>
              <option value="Em reparo">Em reparo</option>
              <option value="Resolvido">Resolvido</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
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
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Exibindo <strong>{filteredClaims.length}</strong> de {claims.length} sinistro(s)
          </span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'table' ? 'bg-white text-slate-950 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <i className="fa-solid fa-list text-xs"></i> Tabela
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'grid' ? 'bg-white text-slate-950 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <i className="fa-solid fa-grip text-xs"></i> Cards
            </button>
          </div>
        </div>
      </div>

      {/* Main Claims List View */}
      {filteredClaims.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
            <i className="fa-solid fa-folder-open"></i>
          </div>
          <p className="text-xs font-bold text-slate-700">Nenhum sinistro corresponde aos filtros selecionados</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Sinistro / Protocolo</th>
                  <th className="p-3.5">Veículo / Prefixo</th>
                  <th className="p-3.5">Condutor</th>
                  <th className="p-3.5">Ocorrência</th>
                  <th className="p-3.5">Data</th>
                  <th className="p-3.5">Custo Estimado</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{claim.claimNumber}</div>
                      <div className="text-[10px] text-slate-400">{claim.protocol}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-slate-800">{claim.vehiclePlate}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{claim.vehicleModel}</div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-800">{claim.driverName}</td>
                    <td className="p-3.5">
                      <span className="text-slate-700 truncate block max-w-[200px]">{claim.occurrenceType}</span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">{claim.date}</td>
                    <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(claim.estimatedCost)}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          claim.status === 'Resolvido'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : claim.status === 'Em análise'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-blue-50 text-blue-700 border-blue-300'
                        }`}
                      >
                        {claim.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedClaimDetail(claim)}
                        className="btn bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-[11px] px-2.5 py-1 rounded font-bold transition shadow-2xs"
                        title="Ver Dossiê"
                      >
                        <i className="fa-solid fa-folder-open text-amber-600 mr-1"></i> Dossiê
                      </button>
                      <button
                        onClick={() => onOpenTermGenerator(claim)}
                        className="btn bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] px-2.5 py-1 rounded font-extrabold transition shadow-2xs"
                        title="Emitir Termo"
                      >
                        <i className="fa-solid fa-wand-magic-sparkles mr-1"></i> Termo
                      </button>
                      {onDeleteClaim && (
                        <button
                          onClick={() => onDeleteClaim(claim.id)}
                          className="btn bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] px-2 py-1 rounded font-bold transition border border-rose-200"
                          title="Excluir Sinistro"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClaims.map((claim) => (
            <div
              key={claim.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{claim.claimNumber}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                      claim.priority === 'Alta' || claim.priority === 'Crítica'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {claim.priority}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 leading-snug">{claim.occurrenceType}</h4>
                <div className="text-xs text-slate-500 space-y-0.5 pt-1 border-t border-slate-100">
                  <p>
                    <strong>Placa:</strong> {claim.vehiclePlate} ({claim.vehicleModel})
                  </p>
                  <p>
                    <strong>Condutor:</strong> {claim.driverName}
                  </p>
                  <p>
                    <strong>Prejuízo:</strong>{' '}
                    <span className="font-bold text-slate-900">{formatCurrency(claim.estimatedCost)}</span>
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedClaimDetail(claim)}
                  className="flex-1 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-center transition"
                >
                  Ver Dossiê
                </button>
                <button
                  onClick={() => onOpenTermGenerator(claim)}
                  className="flex-1 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-center transition"
                >
                  Emitir Termo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedClaimDetail && (
        <ClaimDetailModal
          claim={selectedClaimDetail}
          people={people}
          vehicles={vehicles}
          terms={terms}
          onClose={() => setSelectedClaimDetail(null)}
          onOpenTermGenerator={(claim) => {
            setSelectedClaimDetail(null);
            onOpenTermGenerator(claim);
          }}
        />
      )}

      {/* New Claim Modal */}
      {showNewClaimModal && (
        <NewClaimModal
          people={people}
          vehicles={vehicles}
          onClose={() => setShowNewClaimModal(false)}
          onSaveClaim={(newClaim) => {
            onSaveNewClaim(newClaim);
            setShowNewClaimModal(false);
          }}
        />
      )}
    </div>
  );
};

export default ClaimsListView;
