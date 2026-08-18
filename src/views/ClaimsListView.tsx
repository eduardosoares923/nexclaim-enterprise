import React, { useState, useRef } from 'react';
import { Claim, Person, Vehicle, Term, DocumentTemplate } from '../types';
import { NewClaimModal } from '../components/NewClaimModal';
import { ClaimDetailModal } from '../components/ClaimDetailModal';
import { lerPlanilhaSinistros, LinhaImportada } from '../services/claimsImport';

interface ClaimsListViewProps {
  claims: Claim[];
  people: Person[];
  vehicles: Vehicle[];
  terms: Term[];
  templates: DocumentTemplate[];
  onSaveNewClaim: (claim: Claim) => void;
  onOpenTermGenerator: (claim: Claim) => void;
  onDeleteClaim?: (id: string) => void;
  onUpdateClaim?: (id: string, data: Partial<Claim>) => void;
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
  onUpdateClaim,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const [selectedClaimDetail, setSelectedClaimDetail] = useState<Claim | null>(null);
  const [showNewClaimModal, setShowNewClaimModal] = useState(false);
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null);

  // Estados da Importação de Planilha
  const [linhasParaImportar, setLinhasParaImportar] = useState<LinhaImportada[]>([]);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const linhas = await lerPlanilhaSinistros(file);
      if (!linhas || linhas.length === 0) {
        alert('Não foi possível identificar as colunas da planilha. Verifique se ela tem uma coluna PLACA.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setLinhasParaImportar(linhas);
      setShowImportModal(true);
    } catch (err: any) {
      console.error('Erro ao ler planilha:', err);
      alert(`Erro ao processar planilha: ${err.message || err}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = async () => {
    if (linhasParaImportar.length === 0) return;
    setIsImporting(true);
    setImportProgress({ current: 0, total: linhasParaImportar.length });

    for (let i = 0; i < linhasParaImportar.length; i++) {
      const item = linhasParaImportar[i];
      onSaveNewClaim(item.claim as Claim);
      setImportProgress({ current: i + 1, total: linhasParaImportar.length });
      if (linhasParaImportar.length > 50 && i % 10 === 0) {
        await new Promise((r) => setTimeout(r, 10));
      }
    }

    setIsImporting(false);
    setImportProgress(null);
    setShowImportModal(false);
    setLinhasParaImportar([]);
  };

  const resumoPorAba = linhasParaImportar.reduce<Record<string, number>>((acc, l) => {
    acc[l.aba] = (acc[l.aba] || 0) + 1;
    return acc;
  }, {});

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

        <div className="flex items-center gap-2 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition active:scale-95"
            title="Importar sinistros de planilha Excel com múltiplas abas"
          >
            <i className="fa-solid fa-file-excel text-xs"></i>
            <span>Importar Planilha (.xlsx)</span>
          </button>
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
                        onClick={() => setEditingClaim(claim)}
                        className="btn bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] px-2.5 py-1 rounded font-bold transition shadow-2xs border border-slate-200"
                        title="Editar Sinistro"
                      >
                        <i className="fa-solid fa-pen-to-square mr-1"></i> Editar
                      </button>
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

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                <button
                  onClick={() => setEditingClaim(claim)}
                  className="flex-1 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-center transition border border-slate-200"
                >
                  <i className="fa-solid fa-pen-to-square mr-1"></i> Editar
                </button>
                <button
                  onClick={() => setSelectedClaimDetail(claim)}
                  className="flex-1 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-center transition"
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

      {/* New / Edit Claim Modal */}
      {(showNewClaimModal || editingClaim !== null) && (
        <NewClaimModal
          claim={editingClaim || undefined}
          people={people}
          vehicles={vehicles}
          onClose={() => {
            setShowNewClaimModal(false);
            setEditingClaim(null);
          }}
          onSaveClaim={(newClaim) => {
            onSaveNewClaim(newClaim);
            setShowNewClaimModal(false);
          }}
          onUpdateClaim={(id, data) => {
            if (onUpdateClaim) {
              onUpdateClaim(id, data);
            }
            setEditingClaim(null);
          }}
        />
      )}

      {/* Modal de Pré-visualização da Importação */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full my-8 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-sm">
                  <i className="fa-solid fa-file-excel"></i>
                </div>
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                    Pré-visualização da Importação de Sinistros
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {linhasParaImportar.length} sinistro(s) encontrado(s) na planilha
                  </span>
                </div>
              </div>
              {!isImporting && (
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setLinhasParaImportar([]);
                  }}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
                >
                  <i className="fa-solid fa-xmark text-base"></i>
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4 text-xs">
              {/* Resumo por abas identificadas */}
              <div>
                <h4 className="font-bold text-slate-700 uppercase text-[11px] mb-2">
                  Abas / Meses Identificados na Planilha:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(resumoPorAba).map(([aba, count]) => (
                    <div
                      key={aba}
                      className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950 flex items-center gap-2"
                    >
                      <i className="fa-solid fa-table text-emerald-600"></i>
                      <span className="font-bold">{aba}:</span>
                      <span className="font-black bg-emerald-200/70 text-emerald-900 px-1.5 py-0.5 rounded text-[10px]">
                        {count} sinistro{count > 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Barra de Progresso quando estiver importando */}
              {isImporting && importProgress && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                    <span className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-notch fa-spin text-amber-600"></i>
                      Importando sinistros para o sistema...
                    </span>
                    <span>
                      {importProgress.current} de {importProgress.total} ({Math.round((importProgress.current / importProgress.total) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-amber-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-600 h-2 rounded-full transition-all duration-150"
                      style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Tabela de Amostra dos Primeiros 20 Registros */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-700 uppercase text-[11px]">
                    Amostra dos Primeiros Registros (exibindo até 20 de {linhasParaImportar.length}):
                  </h4>
                </div>
                <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-64">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase text-[10px] font-bold sticky top-0">
                      <tr>
                        <th className="p-2.5">Aba / Mês</th>
                        <th className="p-2.5">Placa</th>
                        <th className="p-2.5">Prefixo</th>
                        <th className="p-2.5">Condutor</th>
                        <th className="p-2.5">Data</th>
                        <th className="p-2.5">Ocorrência</th>
                        <th className="p-2.5">Terceiro / Placa</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {linhasParaImportar.slice(0, 20).map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-emerald-800 whitespace-nowrap">{item.aba}</td>
                          <td className="p-2.5 font-mono font-bold text-slate-900">{item.claim.vehiclePlate || '-'}</td>
                          <td className="p-2.5 text-slate-600">{item.claim.vehiclePrefix || '-'}</td>
                          <td className="p-2.5 font-medium text-slate-800">{item.claim.driverName || '-'}</td>
                          <td className="p-2.5 text-slate-600 whitespace-nowrap">{item.claim.date || '-'}</td>
                          <td className="p-2.5 text-slate-700 max-w-[180px] truncate" title={item.claim.occurrenceType}>
                            {item.claim.occurrenceType}
                          </td>
                          <td className="p-2.5 text-slate-700 max-w-[150px] truncate">
                            {item.claim.thirdPartyVehicleDescription || item.claim.thirdPartyPlate ? `${item.claim.thirdPartyVehicleDescription || ''} ${item.claim.thirdPartyPlate || ''}`.trim() : '-'}
                          </td>
                          <td className="p-2.5">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {item.claim.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Os sinistros serão gravados no banco de dados e sincronizados em tempo real.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isImporting}
                  onClick={() => {
                    setShowImportModal(false);
                    setLinhasParaImportar([]);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isImporting || linhasParaImportar.length === 0}
                  onClick={handleConfirmImport}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-6 py-2.5 rounded-lg shadow-sm transition active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                  <span>
                    {isImporting
                      ? `Importando (${importProgress?.current || 0}/${importProgress?.total || 0})...`
                      : `Confirmar Importação (${linhasParaImportar.length} sinistros)`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimsListView;
