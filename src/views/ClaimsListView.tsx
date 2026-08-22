import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Claim, Person, Vehicle, Term, DocumentTemplate, RoleType } from '../types';
import { NewClaimModal } from '../components/NewClaimModal';
import { ClaimDetailModal } from '../components/ClaimDetailModal';
import { ClaimsPdfReportModal } from '../components/ClaimsPdfReportModal';
import { lerPlanilhaSinistros, LinhaImportada, lerAbaDados, ResultadoAbaDados, exportarSinistrosParaExcel, COLUNAS_EXPORTACAO_SINISTROS } from '../services/claimsImport';
import { firebaseService } from '../services/firebase';
import { normalizarTipoOcorrencia } from '../utils/textNormalization';
import { formatarDataBr } from '../utils/dateUtils';
import { usePermissions } from '../hooks/usePermissions';
import { useConfirm } from '../contexts/ConfirmContext';

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
  userRole?: RoleType;
  userEmail?: string;
}

const formatarData = formatarDataBr;

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
  userRole,
  userEmail,
}) => {
  const queryClient = useQueryClient();
  const permissoes = usePermissions(userRole, userEmail);
  const confirmar = useConfirm();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [occurrenceTypeFilter, setOccurrenceTypeFilter] = useState('');
  const [caseDetailFilter, setCaseDetailFilter] = useState('');
  const [sortBy, setSortBy] = useState<'data-desc' | 'data-asc' | 'nome' | 'placa'>('data-desc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const [selectedClaimDetail, setSelectedClaimDetail] = useState<Claim | null>(null);
  const [showNewClaimModal, setShowNewClaimModal] = useState(false);
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null);

  // Estados da Importação de Planilha
  const [linhasParaImportar, setLinhasParaImportar] = useState<LinhaImportada[]>([]);
  const [resultadoDados, setResultadoDados] = useState<ResultadoAbaDados | null>(null);
  const [abasSelecionadas, setAbasSelecionadas] = useState<Set<string>>(new Set());
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Menu Mais Ações
  const [showMoreActions, setShowMoreActions] = useState(false);
  const moreActionsRef = useRef<HTMLDivElement>(null);

  // Estados de Exportação Customizada de Colunas
  const [colunasExportSelecionadas, setColunasExportSelecionadas] = useState<string[]>(
    COLUNAS_EXPORTACAO_SINISTROS.map((c) => c.chave)
  );
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  const handleToggleColuna = (chave: string) => {
    setColunasExportSelecionadas((prev) =>
      prev.includes(chave) ? prev.filter((c) => c !== chave) : [...prev, chave]
    );
  };
  const handleSelectAllColunas = () => {
    setColunasExportSelecionadas(COLUNAS_EXPORTACAO_SINISTROS.map((c) => c.chave));
  };
  const handleClearAllColunas = () => {
    setColunasExportSelecionadas([]);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreActionsRef.current && !moreActionsRef.current.contains(e.target as Node)) {
        setShowMoreActions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isAbaResumo = (aba: string) => {
    const norm = (aba ?? '').toString().trim().toUpperCase();
    return norm === '2026' || norm === 'DADOS' || norm === 'RESUMO' || /^\d{4}$/.test(norm);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Normalização e detecção de veículos/motoristas novos a partir da aba DADOS
  const existingPlates = new Set(vehicles.map((v) => (v.plate || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase()));
  const existingPeople = new Set(people.map((p) => (p.name || '').trim().toUpperCase()));

  const novosVeiculosMap = new Map<string, { placa: string; prefixo: string }>();
  if (resultadoDados) {
    resultadoDados.cadastros.forEach((cad) => {
      const cleanPlate = cad.placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      if (cleanPlate && !existingPlates.has(cleanPlate) && !novosVeiculosMap.has(cleanPlate)) {
        novosVeiculosMap.set(cleanPlate, { placa: cad.placa, prefixo: cad.prefixo });
      }
    });
  }
  const novosVeiculosParaSalvar = Array.from(novosVeiculosMap.values());

  const novosMotoristasMap = new Map<string, { motorista: string }>();
  if (resultadoDados) {
    resultadoDados.cadastros.forEach((cad) => {
      const cleanName = cad.motorista.trim().toUpperCase();
      if (cleanName && !existingPeople.has(cleanName) && !novosMotoristasMap.has(cleanName)) {
        novosMotoristasMap.set(cleanName, { motorista: cad.motorista });
      }
    });
  }
  const novosMotoristasParaSalvar = Array.from(novosMotoristasMap.values());

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const linhas = await lerPlanilhaSinistros(file);
      const dados = await lerAbaDados(file);

      if ((!linhas || linhas.length === 0) && (!dados || dados.cadastros.length === 0)) {
        alert('Não foi possível identificar as colunas da planilha. Verifique se ela tem uma coluna PLACA.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setLinhasParaImportar(linhas || []);
      setResultadoDados(dados);

      // Inicializa com todas as abas EXCETO as que são resumos/agregados ("2026", "DADOS", etc.)
      const todasAbas = Array.from(new Set((linhas || []).map((l) => l.aba)));
      const abasIniciais = new Set(todasAbas.filter((aba) => !isAbaResumo(aba)));
      setAbasSelecionadas(abasIniciais);

      setShowImportModal(true);
    } catch (err: any) {
      console.error('Erro ao ler planilha:', err);
      alert(`Erro ao processar planilha: ${err.message || err}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleToggleAba = (aba: string) => {
    setAbasSelecionadas((prev) => {
      const next = new Set(prev);
      if (next.has(aba)) {
        next.delete(aba);
      } else {
        next.add(aba);
      }
      return next;
    });
  };

  const handleSelectAllAbas = () => {
    const todasAbas = new Set(linhasParaImportar.map((l) => l.aba));
    setAbasSelecionadas(todasAbas);
  };

  const handleClearAllAbas = () => {
    setAbasSelecionadas(new Set());
  };

  const linhasFiltradas = linhasParaImportar.filter((l) => abasSelecionadas.has(l.aba));

  const handleConfirmImport = async () => {
    const totalItens =
      linhasFiltradas.length +
      novosVeiculosParaSalvar.length +
      novosMotoristasParaSalvar.length +
      (resultadoDados?.sinistros.length || 0);

    if (totalItens === 0) return;
    setIsImporting(true);
    setImportProgress({ current: 0, total: totalItens });

    let processados = 0;

    // 1. Gravar novos veículos da aba DADOS
    for (const v of novosVeiculosParaSalvar) {
      try {
        await firebaseService.saveVehicle({
          plate: v.placa,
          prefix: v.prefixo,
          renavam: '',
          brand: '',
          model: '',
          year: new Date().getFullYear(),
          color: '',
          status: 'Ativo',
        } as any);
      } catch (err) {
        console.warn('Erro ao salvar veículo importado:', err);
      }
      processados++;
      setImportProgress({ current: processados, total: totalItens });
    }

    // 2. Gravar novos motoristas da aba DADOS
    for (const p of novosMotoristasParaSalvar) {
      try {
        await firebaseService.savePerson({
          name: p.motorista,
          docNumber: '',
          phone: '',
          email: '',
          address: '',
          type: 'Condutor',
        } as any);
      } catch (err) {
        console.warn('Erro ao salvar condutor importado:', err);
      }
      processados++;
      setImportProgress({ current: processados, total: totalItens });
    }

    // 3. Gravar sinistros históricos da aba DADOS
    if (resultadoDados?.sinistros) {
      for (const s of resultadoDados.sinistros) {
        onSaveNewClaim(s.claim as Claim);
        processados++;
        setImportProgress({ current: processados, total: totalItens });
      }
    }

    // 4. Gravar sinistros das abas mensais selecionadas
    for (let i = 0; i < linhasFiltradas.length; i++) {
      const item = linhasFiltradas[i];
      onSaveNewClaim(item.claim as Claim);
      processados++;
      setImportProgress({ current: processados, total: totalItens });
      if (linhasFiltradas.length > 50 && i % 10 === 0) {
        await new Promise((r) => setTimeout(r, 10));
      }
    }

    // 5. Invalidar cache das queries de veículos e condutores
    await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    await queryClient.invalidateQueries({ queryKey: ['people'] });

    setIsImporting(false);
    setImportProgress(null);
    setShowImportModal(false);
    setLinhasParaImportar([]);
    setAbasSelecionadas(new Set());
    setResultadoDados(null);
  };

  const resumoPorAba = linhasParaImportar.reduce<Record<string, number>>((acc, l) => {
    acc[l.aba] = (acc[l.aba] || 0) + 1;
    return acc;
  }, {});

  const sinistrosDaAbaDados = claims.filter((c) => c.claimNumber?.startsWith('SIN-IMP-DADOS-'));

  const tiposOcorrenciaDisponiveis = Array.from(
    new Set(claims.map((c) => normalizarTipoOcorrencia(c.occurrenceType)).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, 'pt-BR'));

  const detalhamentosDisponiveis = Array.from(
    new Set(claims.map((c) => c.caseDetail).filter(Boolean))
  ).sort((a, b) => a!.localeCompare(b!, 'pt-BR'));

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
    const matchesDateFrom = !dateFrom || (c.date && c.date >= dateFrom);
    const matchesDateTo = !dateTo || (c.date && c.date <= dateTo);
    const matchesOccurrenceType = !occurrenceTypeFilter || normalizarTipoOcorrencia(c.occurrenceType) === occurrenceTypeFilter;
    const matchesCaseDetail = !caseDetailFilter || c.caseDetail === caseDetailFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesDateFrom && matchesDateTo && matchesOccurrenceType && matchesCaseDetail;
  });

  const sortedClaims = [...filteredClaims].sort((a, b) => {
    switch (sortBy) {
      case 'data-asc':
        return (a.date || '').localeCompare(b.date || '');
      case 'nome':
        return (a.driverName || '').localeCompare(b.driverName || '', 'pt-BR');
      case 'placa':
        return (a.vehiclePlate || '').localeCompare(b.vehiclePlate || '');
      case 'data-desc':
      default:
        return (b.date || '').localeCompare(a.date || '');
    }
  });

  const corrigirTiposExistentes = async () => {
    const paraCorrigir = claims.filter((c) => normalizarTipoOcorrencia(c.occurrenceType) !== c.occurrenceType);
    if (paraCorrigir.length === 0) {
      alert('Nenhum sinistro precisa de correção, todos já estão com o tipo padronizado.');
      return;
    }
    const ok = await confirmar({
      title: 'Padronizar Tipos de Ocorrência',
      message: `${paraCorrigir.length} sinistro(s) serão corrigidos para o formato padronizado (ex: "BATIDA FROTAL" vira "Batida Frontal"). Continuar?`,
      confirmLabel: 'Padronizar',
      danger: false,
    });
    if (!ok) return;
    for (const c of paraCorrigir) {
      await firebaseService.updateClaim(c.id, { occurrenceType: normalizarTipoOcorrencia(c.occurrenceType) });
    }
    queryClient.invalidateQueries({ queryKey: ['claims'] });
    alert(`${paraCorrigir.length} sinistro(s) corrigidos com sucesso.`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
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
          <div className="relative" ref={moreActionsRef}>
            <button
              onClick={() => setShowMoreActions((v) => !v)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition border border-slate-200 shadow-xs cursor-pointer"
            >
              <i className="fa-solid fa-ellipsis-vertical"></i>
              <span>Mais Ações</span>
              <i className="fa-solid fa-chevron-down text-[9px]"></i>
            </button>
            {showMoreActions && (
              <div className="absolute z-30 top-full mt-1 right-0 w-72 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5">
                <button
                  onClick={() => {
                    setShowPdfModal(true);
                    setShowMoreActions(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer border-b border-slate-100 pb-2 mb-1"
                >
                  <i className="fa-solid fa-file-pdf text-rose-500"></i> Relatório de Sinistros em PDF (A4)
                </button>

                <button
                  onClick={() => {
                    corrigirTiposExistentes();
                    setShowMoreActions(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-broom"></i> Corrigir Tipos de Ocorrência Duplicados
                </button>

                {onDeleteClaim && sinistrosDaAbaDados.length > 0 && permissoes.podeExclusaoEmMassa && (
                  <button
                    onClick={async () => {
                      const ok = await confirmar({
                        title: 'Excluir Sinistros Importados',
                        message: `Tem certeza que deseja excluir ${sinistrosDaAbaDados.length} sinistro(s) importado(s) da aba DADOS? Essa ação não pode ser desfeita.`,
                        confirmLabel: 'Excluir Importados',
                        danger: true,
                      });
                      if (ok) {
                        sinistrosDaAbaDados.forEach((c) => onDeleteClaim(c.id));
                      }
                      setShowMoreActions(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <i className="fa-solid fa-trash-can"></i> Excluir Importados da Aba DADOS ({sinistrosDaAbaDados.length})
                  </button>
                )}

                {onDeleteClaim && claims.length > 0 && permissoes.podeExclusaoEmMassa && (
                  <button
                    onClick={async () => {
                      const ok1 = await confirmar({
                        title: 'Excluir Todos os Sinistros',
                        message: `ATENÇÃO: isso vai excluir TODOS os ${claims.length} sinistros do sistema, sem exceção. Essa ação não pode ser desfeita. Tem certeza?`,
                        confirmLabel: 'Sim, continuar',
                        danger: true,
                      });
                      if (ok1) {
                        const ok2 = await confirmar({
                          title: 'Confirmação Final',
                          message: 'Confirme mais uma vez: excluir TODOS os sinistros agora?',
                          confirmLabel: 'Excluir Tudo Definitivamente',
                          danger: true,
                        });
                        if (ok2) {
                          claims.forEach((c) => onDeleteClaim(c.id));
                        }
                      }
                      setShowMoreActions(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100 mt-1 pt-2 cursor-pointer"
                  >
                    <i className="fa-solid fa-triangle-exclamation"></i> Excluir Todos os Sinistros ({claims.length})
                  </button>
                )}
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".xlsx, .xls"
            className="hidden"
          />
          {permissoes.podeCriar && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
              title="Importar sinistros de planilha Excel com múltiplas abas"
            >
              <i className="fa-solid fa-file-import text-xs"></i>
              <span>Importar (.xlsx)</span>
            </button>
          )}

          <button
            onClick={() => setShowExportModal(true)}
            className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-xs border border-slate-200 transition active:scale-95 cursor-pointer"
            title="Escolher colunas e exportar os sinistros atuais para Excel"
          >
            <i className="fa-solid fa-file-export text-xs"></i>
            <span>Exportar (.xlsx)</span>
          </button>

          {permissoes.podeCriar && (
            <button
              onClick={() => setShowNewClaimModal(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <i className="fa-solid fa-plus text-xs"></i>
              <span>Novo Sinistro</span>
            </button>
          )}
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

        {/* Linha 2 de Filtros: Data de / Data até / Tipo / Detalhamento / Ordenação / Limpar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data de</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data até</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tipo de Ocorrência</label>
            <select
              value={occurrenceTypeFilter}
              onChange={(e) => setOccurrenceTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              <option value="">Todos os Tipos</option>
              {tiposOcorrenciaDisponiveis.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Detalhamento do Caso</label>
            <select
              value={caseDetailFilter}
              onChange={(e) => setCaseDetailFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              <option value="">Todos os Detalhamentos</option>
              {detalhamentosDisponiveis.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ordenar por</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              <option value="data-desc">Mais recente primeiro</option>
              <option value="data-asc">Mais antigo primeiro</option>
              <option value="nome">Nome do Condutor (A-Z)</option>
              <option value="placa">Placa (A-Z)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setPriorityFilter('');
                setDateFrom('');
                setDateTo('');
                setOccurrenceTypeFilter('');
                setCaseDetailFilter('');
                setSortBy('data-desc');
              }}
              className="w-full px-3 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 border border-slate-200 rounded-lg hover:border-rose-200 hover:bg-rose-50 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-filter-circle-xmark"></i> Limpar Filtros
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Exibindo <strong>{sortedClaims.length}</strong> de {claims.length} sinistro(s)
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
      {sortedClaims.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
            <i className="fa-solid fa-folder-open"></i>
          </div>
          <p className="text-xs font-bold text-slate-700">Nenhum sinistro corresponde aos filtros selecionados</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs text-slate-600">
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
                {sortedClaims.map((claim) => (
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
                    <td className="p-3.5 whitespace-nowrap font-medium text-slate-700">{formatarData(claim.date)}</td>
                    <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(claim.estimatedCost)}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap ${
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
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {permissoes.podeEditarOuExcluir(claim.createdBy) && (
                          <button
                            onClick={() => setEditingClaim(claim)}
                            className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition border border-slate-200"
                            title="Editar Sinistro"
                          >
                            <i className="fa-solid fa-pen-to-square text-xs"></i>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedClaimDetail(claim)}
                          className="w-7 h-7 flex items-center justify-center bg-white hover:bg-slate-100 border border-slate-300 text-amber-600 rounded-lg transition"
                          title="Ver Dossiê"
                        >
                          <i className="fa-solid fa-folder-open text-xs"></i>
                        </button>
                        <button
                          onClick={() => onOpenTermGenerator(claim)}
                          className="w-7 h-7 flex items-center justify-center bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition"
                          title="Emitir Termo"
                        >
                          <i className="fa-solid fa-wand-magic-sparkles text-xs"></i>
                        </button>
                        {onDeleteClaim && permissoes.podeEditarOuExcluir(claim.createdBy) === true && (
                          <button
                            onClick={() => onDeleteClaim(claim.id)}
                            className="w-7 h-7 flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition border border-rose-200"
                            title="Excluir Sinistro"
                          >
                            <i className="fa-solid fa-trash-can text-xs"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedClaims.map((claim) => (
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
                {permissoes.podeEditarOuExcluir(claim.createdBy) && (
                  <button
                    onClick={() => setEditingClaim(claim)}
                    className="flex-1 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-center transition border border-slate-200"
                  >
                    <i className="fa-solid fa-pen-to-square mr-1"></i> Editar
                  </button>
                )}
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
                {onDeleteClaim && permissoes.podeEditarOuExcluir(claim.createdBy) === true && (
                  <button
                    onClick={() => onDeleteClaim(claim.id)}
                    className="py-1.5 px-2.5 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-center transition border border-rose-200"
                    title="Excluir Sinistro"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                )}
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
      {showImportModal && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full my-8 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-sm">
                  <i className="fa-solid fa-file-excel"></i>
                </div>
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                    Pré-visualização da Importação de Sinistros & Frota
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {linhasFiltradas.length + (resultadoDados?.sinistros.length || 0)} sinistros ({linhasFiltradas.length} abas mensais + {resultadoDados?.sinistros.length || 0} aba DADOS) • {novosVeiculosParaSalvar.length} veículos novos • {novosMotoristasParaSalvar.length} condutores novos
                  </span>
                </div>
              </div>
              {!isImporting && (
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setLinhasParaImportar([]);
                    setAbasSelecionadas(new Set());
                    setResultadoDados(null);
                  }}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                >
                  <i className="fa-solid fa-xmark text-base"></i>
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[70vh] space-y-4 text-xs">
              {/* Seção Fixa Automática: Aba DADOS */}
              {resultadoDados && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs">
                        <i className="fa-solid fa-id-card"></i>
                      </div>
                      <h4 className="font-bold text-blue-950 uppercase text-[11px]">
                        Aba DADOS (Cadastro Completo de Veículo / Motorista & Sinistros)
                      </h4>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-200/80 text-blue-900 border border-blue-300 uppercase">
                      Inclusão Automática
                    </span>
                  </div>
                  <p className="text-xs text-blue-900 leading-relaxed">
                    Identificados <strong>{resultadoDados.cadastros.length}</strong> cadastros de veículo/motorista (
                    <strong className="text-emerald-700 font-bold">{novosVeiculosParaSalvar.length} veículos novos</strong> e{' '}
                    <strong className="text-emerald-700 font-bold">{novosMotoristasParaSalvar.length} motoristas novos</strong> que serão cadastrados automaticamente na frota) e{' '}
                    <strong>{resultadoDados.sinistros.length}</strong> sinistros com dados preenchidos.
                  </p>
                </div>
              )}

              {/* Resumo e seleção por abas mensais identificadas */}
              <div>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <h4 className="font-bold text-slate-700 uppercase text-[11px]">
                    Abas / Meses Identificados na Planilha (Selecione as abas para importar):
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isImporting}
                      onClick={handleSelectAllAbas}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer disabled:opacity-50"
                    >
                      Selecionar Todas
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      disabled={isImporting}
                      onClick={handleClearAllAbas}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-700 hover:underline cursor-pointer disabled:opacity-50"
                    >
                      Limpar Seleção
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {Object.entries(resumoPorAba).map(([aba, count]) => {
                    const isSelected = abasSelecionadas.has(aba);
                    return (
                      <div
                        key={aba}
                        onClick={() => !isImporting && handleToggleAba(aba)}
                        className={`px-3 py-2 border rounded-lg flex items-center justify-between cursor-pointer transition select-none ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-2xs font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            disabled={isImporting}
                            className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 pointer-events-none"
                          />
                          <span className="truncate text-xs">{aba}</span>
                        </div>
                        <span
                          className={`font-black px-1.5 py-0.5 rounded text-[10px] shrink-0 ml-1 ${
                            isSelected ? 'bg-emerald-200/80 text-emerald-900' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Barra de Progresso quando estiver importando */}
              {isImporting && importProgress && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                    <span className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-notch fa-spin text-amber-600"></i>
                      Importando sinistros e cadastrando veículos/motoristas...
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

              {/* Tabela de Amostra dos Primeiros 20 Registros Filtrados */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-700 uppercase text-[11px]">
                    Amostra dos Registros Selecionados (exibindo até 20 de {linhasFiltradas.length}):
                  </h4>
                </div>
                {linhasFiltradas.length === 0 ? (
                  <div className="p-8 border border-dashed border-slate-300 rounded-lg text-center text-slate-500 bg-slate-50">
                    <i className="fa-solid fa-triangle-exclamation text-amber-500 mr-2"></i>
                    Nenhuma aba mensal selecionada.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-64">
                    <table className="w-full min-w-[700px] text-left text-xs">
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
                        {linhasFiltradas.slice(0, 20).map((item, idx) => (
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
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                {linhasFiltradas.length === 0 && !resultadoDados
                  ? 'Selecione pelo menos uma aba para importar.'
                  : `Pronto para importar ${linhasFiltradas.length + (resultadoDados?.sinistros.length || 0)} sinistros (${linhasFiltradas.length} abas mensais + ${resultadoDados?.sinistros.length || 0} aba DADOS) e ${novosVeiculosParaSalvar.length} veículos / ${novosMotoristasParaSalvar.length} motoristas novos.`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isImporting}
                  onClick={() => {
                    setShowImportModal(false);
                    setLinhasParaImportar([]);
                    setAbasSelecionadas(new Set());
                    setResultadoDados(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isImporting || (linhasFiltradas.length === 0 && (!resultadoDados || (novosVeiculosParaSalvar.length === 0 && novosMotoristasParaSalvar.length === 0 && resultadoDados.sinistros.length === 0)))}
                  onClick={handleConfirmImport}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-6 py-2.5 rounded-lg shadow-sm transition active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                  <span>
                    {isImporting
                      ? `Importando (${importProgress?.current || 0}/${importProgress?.total || 0})...`
                      : `Confirmar Importação (${linhasFiltradas.length + (resultadoDados?.sinistros.length || 0)} sinistros)`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Escolha de Colunas para Exportação */}
      {showExportModal && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full my-8 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm">
                  <i className="fa-solid fa-file-excel"></i>
                </div>
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                    Escolher Colunas para Exportar
                  </h3>
                  <span className="text-[10px] text-amber-400">
                    {colunasExportSelecionadas.length} de {COLUNAS_EXPORTACAO_SINISTROS.length} colunas selecionadas • {sortedClaims.length} sinistro(s)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh] space-y-4 text-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-slate-600 text-xs">
                  Marque as colunas que devem aparecer no relatório Excel:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllColunas}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    Selecionar Todas
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={handleClearAllColunas}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-700 hover:underline cursor-pointer"
                  >
                    Limpar Seleção
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COLUNAS_EXPORTACAO_SINISTROS.map((col) => {
                  const isChecked = colunasExportSelecionadas.includes(col.chave);
                  return (
                    <label
                      key={col.chave}
                      className={`p-2.5 rounded-lg border flex items-center gap-2.5 cursor-pointer transition select-none ${
                        isChecked
                          ? 'bg-amber-50/60 border-amber-300 text-slate-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleColuna(col.chave)}
                        className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4 cursor-pointer"
                      />
                      <span className="text-xs">{col.rotulo}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              >
                Cancelar
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={colunasExportSelecionadas.length === 0}
                  onClick={() => {
                    setShowPdfModal(true);
                    setShowExportModal(false);
                  }}
                  className="bg-white hover:bg-slate-100 text-rose-600 border border-rose-200 font-bold text-xs px-4 py-2.5 rounded-lg shadow-xs transition active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Gerar visualização em PDF pronta para impressão"
                >
                  <i className="fa-solid fa-file-pdf"></i>
                  <span>Relatório PDF</span>
                </button>
                <button
                  type="button"
                  disabled={colunasExportSelecionadas.length === 0}
                  onClick={() => {
                    exportarSinistrosParaExcel(sortedClaims, colunasExportSelecionadas);
                    setShowExportModal(false);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-lg shadow-sm transition active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fa-solid fa-file-excel"></i>
                  <span>Exportar Excel ({colunasExportSelecionadas.length} colunas)</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Relatório PDF */}
      {showPdfModal && (
        <ClaimsPdfReportModal
          claims={sortedClaims}
          colunas={COLUNAS_EXPORTACAO_SINISTROS.filter((c) => colunasExportSelecionadas.includes(c.chave))}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </div>
  );
};

export default ClaimsListView;
