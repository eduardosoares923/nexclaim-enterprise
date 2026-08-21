import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Fine, Vehicle, Person, FineStatus, InfractionType } from '../types';
import { firebaseService } from '../services/firebase';
import {
  lerPlanilhaMultas,
  exportarMultasParaExcel,
  LinhaMultaImportada,
  COLUNAS_EXPORTACAO_MULTAS,
} from '../services/finesImport';
import { Combobox } from '../components/Combobox';
import { FinesPdfReportModal } from '../components/FinesPdfReportModal';
import { InfractionCatalogModal } from '../components/InfractionCatalogModal';
import { formatarDataBr, formatarDataHoraBr } from '../utils/dateUtils';

interface FinesViewProps {
  fines: Fine[];
  vehicles: Vehicle[];
  people: Person[];
  infractionTypes: InfractionType[];
  onSaveFine: (fine: Fine) => void;
  onUpdateFineStatus: (id: string, newStatus: FineStatus) => void;
  onUpdateFine?: (id: string, data: Partial<Fine>) => void;
  onDeleteFine?: (id: string) => void;
  onOpenTermForFine?: (fine: Fine) => void;
  onSaveInfractionType?: (data: Omit<InfractionType, 'id'>) => void;
  onUpdateInfractionType?: (id: string, data: Partial<InfractionType>) => void;
  onDeleteInfractionType?: (id: string) => void;
}

export const FinesView: React.FC<FinesViewProps> = ({
  fines,
  vehicles,
  people,
  infractionTypes,
  onSaveFine,
  onUpdateFineStatus,
  onUpdateFine,
  onDeleteFine,
  onOpenTermForFine,
  onSaveInfractionType,
  onUpdateInfractionType,
  onDeleteInfractionType,
}) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<'data-desc' | 'data-asc' | 'nome' | 'placa'>('data-desc');
  const [showNewFineModal, setShowNewFineModal] = useState(false);
  const [editingFine, setEditingFine] = useState<Fine | null>(null);
  const [viewingFine, setViewingFine] = useState<Fine | null>(null);

  // Estados de Exportação e Mais Ações
  const [colunasExportSelecionadas, setColunasExportSelecionadas] = useState<string[]>(
    COLUNAS_EXPORTACAO_MULTAS.map((c) => c.chave)
  );
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const moreActionsRef = useRef<HTMLDivElement | null>(null);

  // Estados de Importação
  const [linhasParaImportar, setLinhasParaImportar] = useState<LinhaMultaImportada[]>([]);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fine form state
  const [infractionAuto, setInfractionAuto] = useState('');
  const [infractionCode, setInfractionCode] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);
  const [dueDate, setDueDate] = useState('');
  const [infractionDate, setInfractionDate] = useState('');
  const [infractionTime, setInfractionTime] = useState('');
  const [indicationStatus, setIndicationStatus] = useState('');
  const [duplicateOfAuto, setDuplicateOfAuto] = useState('');

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreActionsRef.current && !moreActionsRef.current.contains(e.target as Node)) {
        setShowMoreActions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (editingFine) {
      setInfractionAuto(editingFine.infractionAuto || '');
      setInfractionCode(editingFine.infractionCode || '');
      setVehiclePlate(editingFine.vehiclePlate || '');
      setDriverName(editingFine.driverName || '');
      setDescription(editingFine.description || '');
      setAmount(editingFine.amount || 0);
      setPoints(editingFine.points || 0);
      setDueDate(editingFine.dueDate || '');
      setInfractionDate(editingFine.infractionDate || '');
      setInfractionTime(editingFine.infractionTime || '');
      setIndicationStatus(editingFine.indicationStatus || '');
      setDuplicateOfAuto(editingFine.duplicateOfAuto || '');
    }
  }, [editingFine]);

  useEffect(() => {
    if (duplicateOfAuto) {
      const original = fines.find((f) => f.infractionAuto === duplicateOfAuto);
      if (original) {
        setVehiclePlate(original.vehiclePlate);
        setDriverName(original.driverName);
      }
    }
  }, [duplicateOfAuto, fines]);

  const handleCloseModal = () => {
    setShowNewFineModal(false);
    setEditingFine(null);
    setInfractionAuto('');
    setInfractionCode('');
    setVehiclePlate('');
    setDriverName('');
    setDescription('');
    setAmount(0);
    setPoints(0);
    setDueDate('');
    setInfractionDate('');
    setInfractionTime('');
    setIndicationStatus('');
    setDuplicateOfAuto('');
  };

  const handleToggleColuna = (chave: string) => {
    setColunasExportSelecionadas((prev) =>
      prev.includes(chave) ? prev.filter((k) => k !== chave) : [...prev, chave]
    );
  };

  const handleSelectAllColunas = () => {
    setColunasExportSelecionadas(COLUNAS_EXPORTACAO_MULTAS.map((c) => c.chave));
  };

  const handleClearAllColunas = () => {
    setColunasExportSelecionadas([]);
  };

  const handleSelecionarInfracao = (desc: string) => {
    setDescription(desc);
    const encontrada = infractionTypes.find(
      (i) => i.description.toUpperCase() === desc.toUpperCase()
    );
    if (encontrada) {
      setAmount(encontrada.amount);
      setPoints(encontrada.points);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const pendingCount = fines.filter((f) => f.status === 'Pendente').length;
  const paidCount = fines.filter((f) => f.status === 'Paga').length;
  const totalAmount = fines.reduce((acc, f) => acc + (f.amount || 0), 0);

  const filteredFines = fines.filter((f) => {
    const matchesSearch =
      search === '' ||
      f.infractionAuto.toLowerCase().includes(search.toLowerCase()) ||
      (f.infractionCode && f.infractionCode.toLowerCase().includes(search.toLowerCase())) ||
      f.vehiclePlate.toLowerCase().includes(search.toLowerCase()) ||
      f.driverName.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !statusFilter || f.status === statusFilter;
    const matchesDateFrom = !dateFrom || (f.infractionDate && f.infractionDate >= dateFrom);
    const matchesDateTo = !dateTo || (f.infractionDate && f.infractionDate <= dateTo);

    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  const sortedFines = [...filteredFines].sort((a, b) => {
    switch (sortBy) {
      case 'data-asc':
        return (a.infractionDate || '').localeCompare(b.infractionDate || '');
      case 'nome':
        return (a.driverName || '').localeCompare(b.driverName || '', 'pt-BR');
      case 'placa':
        return (a.vehiclePlate || '').localeCompare(b.vehiclePlate || '');
      case 'data-desc':
      default:
        return (b.infractionDate || '').localeCompare(a.infractionDate || '');
    }
  });

  const multasImportadas = fines.filter(
    (f) => f.infractionAuto.startsWith('IMP-') || !!f.duplicateInfo || !!f.duplicateOfAuto
  );

  const handleCreateFine = (e: React.FormEvent) => {
    e.preventDefault();

    const dadosLimpos = duplicateOfAuto
      ? { points: 0, dueDate: '', infractionTime: undefined, indicationStatus: undefined }
      : { points, dueDate, infractionTime: infractionTime || undefined, indicationStatus: indicationStatus || undefined };

    if (editingFine) {
      const dadosAtualizados: Partial<Fine> = {
        infractionAuto,
        infractionCode,
        vehiclePlate,
        driverName,
        description,
        amount,
        infractionDate,
        duplicateOfAuto: duplicateOfAuto || undefined,
        ...dadosLimpos,
      };
      onUpdateFine?.(editingFine.id, dadosAtualizados);
      handleCloseModal();
    } else {
      const newFine: Fine = {
        id: `fine-${Date.now()}`,
        infractionAuto: infractionAuto || `AUTO-${Math.floor(10000000 + Math.random() * 90000000)}`,
        infractionCode,
        vehiclePlate,
        driverName,
        description,
        amount,
        infractionDate,
        duplicateOfAuto: duplicateOfAuto || undefined,
        status: 'Pendente',
        ...dadosLimpos,
      };

      onSaveFine(newFine);
      handleCloseModal();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const linhas = await lerPlanilhaMultas(file);
      if (linhas.length === 0) {
        alert('Nenhuma multa válida encontrada na planilha.');
        return;
      }
      setLinhasParaImportar(linhas);
      setShowImportModal(true);
    } catch (err: any) {
      console.error('Erro ao ler planilha de multas:', err);
      alert(`Erro ao ler a planilha: ${err.message || err}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = async () => {
    if (linhasParaImportar.length === 0) return;

    setIsImporting(true);
    setImportProgress({ current: 0, total: linhasParaImportar.length });

    const BATCH_SIZE = 50;
    const total = linhasParaImportar.length;
    let processados = 0;

    try {
      for (let i = 0; i < total; i += BATCH_SIZE) {
        const lote = linhasParaImportar.slice(i, i + BATCH_SIZE);
        await Promise.all(
          lote.map((item) =>
            firebaseService.saveFine(item.fine).catch((err) => {
              console.error(`Erro ao salvar multa ${item.fine.infractionAuto}:`, err);
            })
          )
        );
        processados += lote.length;
        setImportProgress({ current: Math.min(processados, total), total });
      }

      await queryClient.invalidateQueries({ queryKey: ['fines'] });
      setShowImportModal(false);
      setLinhasParaImportar([]);
      alert(`Importação concluída com sucesso! ${total} multas processadas.`);
    } catch (err: any) {
      console.error('Erro durante a importação de multas:', err);
      alert(`Erro durante a importação: ${err.message || err}`);
    } finally {
      setIsImporting(false);
      setImportProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input de Arquivo Oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx, .xls, .xlsm, .csv"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <span className="badge bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded border border-amber-300 uppercase tracking-wider">
            Gestão de Trânsito • Trans Pinho
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            Controle de Multas & Infrações de Trânsito
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerenciamento de autos de infração, pontuação de CNH, controle de duplicidades e quitações.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Menu Mais Ações */}
          <div className="relative" ref={moreActionsRef}>
            <button
              onClick={() => setShowMoreActions((v) => !v)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2.5 rounded-lg flex items-center gap-1.5 transition border border-slate-300 shadow-2xs cursor-pointer"
            >
              <i className="fa-solid fa-ellipsis-vertical"></i>
              <span>Mais Ações</span>
              <i className="fa-solid fa-chevron-down text-[9px]"></i>
            </button>
            {showMoreActions && (
              <div className="absolute z-30 top-full mt-1 right-0 w-72 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    setShowPdfModal(true);
                    setShowMoreActions(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer border-b border-slate-100 pb-2 mb-1"
                >
                  <i className="fa-solid fa-file-pdf text-rose-500"></i> Relatório de Multas em PDF (A4)
                </button>

                {onDeleteFine && multasImportadas.length > 0 && (
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Tem certeza que deseja excluir ${multasImportadas.length} multa(s) importada(s)? Essa ação não pode ser desfeita.`
                        )
                      ) {
                        multasImportadas.forEach((f) => onDeleteFine(f.id));
                      }
                      setShowMoreActions(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <i className="fa-solid fa-trash-can"></i> Excluir Multas Importadas ({multasImportadas.length})
                  </button>
                )}

                {onDeleteFine && fines.length > 0 && (
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `ATENÇÃO: isso vai excluir TODAS as ${fines.length} multas do sistema, sem exceção. Essa ação não pode ser desfeita. Tem certeza?`
                        )
                      ) {
                        if (window.confirm('Confirme mais uma vez: excluir TODAS as multas agora?')) {
                          fines.forEach((f) => onDeleteFine(f.id));
                        }
                      }
                      setShowMoreActions(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100 mt-1 pt-2 cursor-pointer"
                  >
                    <i className="fa-solid fa-triangle-exclamation"></i> Excluir Todas as Multas ({fines.length})
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-2 border border-slate-300 transition active:scale-95 cursor-pointer shadow-2xs"
            title="Importar multas a partir de planilha Excel (.xlsx)"
          >
            <i className="fa-solid fa-file-excel text-emerald-600"></i>
            <span>Importar (.xlsx)</span>
          </button>

          <button
            onClick={() => setShowCatalogModal(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-2 border border-slate-300 transition active:scale-95 cursor-pointer shadow-2xs"
            title="Gerenciar catálogo de tipos de infração"
          >
            <i className="fa-solid fa-list-check text-amber-600"></i>
            <span>Tipos de Infração</span>
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-2 border border-slate-300 transition active:scale-95 cursor-pointer shadow-2xs"
            title="Exportar multas (Excel ou PDF)"
          >
            <i className="fa-solid fa-download text-slate-600"></i>
            <span>Exportar</span>
          </button>

          <button
            onClick={() => {
              handleCloseModal();
              setShowNewFineModal(true);
            }}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <i className="fa-solid fa-plus text-xs"></i>
            <span>Nova Infração / Multa</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total de Infrações</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{fines.length}</span>
            <span className="text-[11px] font-semibold text-slate-500">registradas</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Multas Pendentes</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{pendingCount}</span>
            <span className="text-[11px] font-semibold text-amber-700">a liquidar</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Pagas / Regularizadas</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{paidCount}</span>
            <span className="text-[11px] font-semibold text-emerald-700">quitadas</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor Financeiro Total</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por auto, placa, motorista, código..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              <option value="">Todos os Status</option>
              <option value="Pendente">Pendente</option>
              <option value="Paga">Paga</option>
              <option value="Em análise">Em análise</option>
              <option value="Contestada">Contestada</option>
              <option value="Vencida">Vencida</option>
            </select>
          </div>
        </div>

        {/* Segunda Linha de Filtros: Data e Ordenação */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data de</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data até</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ordenar por</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
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
                setDateFrom('');
                setDateTo('');
              }}
              className="w-full px-3 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 border border-slate-200 rounded-lg hover:border-rose-200 hover:bg-rose-50 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-filter-circle-xmark"></i> Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Registros de Autos de Infração</h3>
          <span className="text-xs text-slate-500">{sortedFines.length} multa(s) listada(s)</span>
        </div>

        {sortedFines.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">Nenhuma infração encontrada.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Auto de Infração</th>
                  <th className="p-3.5">Veículo / Condutor</th>
                  <th className="p-3.5">Código & Descrição</th>
                  <th className="p-3.5">Valor / Pontos</th>
                  <th className="p-3.5">Venc. Indicação</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedFines.map((fine) => (
                  <tr key={fine.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-slate-900">
                      <div>{fine.infractionAuto}</div>
                      {fine.duplicateOfAuto && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const original = fines.find((f) => f.infractionAuto === fine.duplicateOfAuto);
                            if (original) setViewingFine(original);
                          }}
                          className="text-[9px] text-amber-600 hover:text-amber-800 hover:underline font-semibold mt-0.5 font-sans flex items-center gap-1 cursor-pointer"
                          title="Ver multa original"
                        >
                          <i className="fa-solid fa-clone text-[8px]"></i>
                          <span>Duplicidade de {fine.duplicateOfAuto}</span>
                        </button>
                      )}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{fine.vehiclePlate}</div>
                      <div className="text-[11px] text-slate-500">{fine.driverName}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-[11px] font-semibold text-slate-800 max-w-[280px] truncate" title={fine.description}>{fine.description}</div>
                      {fine.indicationStatus && !fine.duplicateOfAuto && (
                        <span className="inline-block mt-0.5 text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          {fine.indicationStatus}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(fine.amount)}
                      <div className="text-[10px] text-amber-600 font-semibold">{fine.points} pontos</div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700 whitespace-nowrap">{formatarDataBr(fine.dueDate)}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap ${
                          fine.status === 'Paga'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : fine.status === 'Pendente'
                            ? 'bg-rose-50 text-rose-700 border-rose-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        {fine.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setViewingFine(fine)}
                        className="btn bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] px-2 py-1 rounded font-bold transition cursor-pointer"
                        title="Ver / Imprimir Auto de Infração"
                      >
                        <i className="fa-solid fa-file-lines"></i>
                      </button>
                      <button
                        onClick={() => setEditingFine(fine)}
                        className="btn bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] px-2 py-1 rounded font-bold transition cursor-pointer"
                        title="Editar Multa"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      {fine.status === 'Pendente' ? (
                        <button
                          onClick={() => onUpdateFineStatus(fine.id, 'Paga')}
                          className="btn bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] px-2.5 py-1 rounded font-bold shadow-2xs transition cursor-pointer"
                          title="Marcar como Paga"
                        >
                          <i className="fa-solid fa-check mr-1"></i> Pagar
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateFineStatus(fine.id, 'Pendente')}
                          className="btn bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] px-2.5 py-1 rounded font-bold transition cursor-pointer"
                          title="Reabrir como Pendente"
                        >
                          Reabrir
                        </button>
                      )}
                      {onDeleteFine && (
                        <button
                          onClick={() => onDeleteFine(fine.id)}
                          className="btn bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] px-2 py-1 rounded font-bold transition border border-rose-200 cursor-pointer"
                          title="Excluir Multa"
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
        )}
      </div>

      {/* New / Edit Fine Modal */}
      {(showNewFineModal || editingFine !== null) && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-file-invoice-dollar text-amber-500"></i>
                {editingFine ? `Editar Multa ${editingFine.infractionAuto}` : 'Cadastrar Infração de Trânsito'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-700 text-base cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleCreateFine} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nº do Auto de Infração *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: EL00093302"
                  value={infractionAuto}
                  onChange={(e) => setInfractionAuto(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Veículo (Placa) *</label>
                  <Combobox
                    value={vehiclePlate}
                    onChange={(v) => setVehiclePlate(v.toUpperCase())}
                    placeholder="Selecione da lista ou digite a placa"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white uppercase font-mono text-xs"
                    options={[...vehicles].sort((a, b) => a.plate.localeCompare(b.plate, 'pt-BR')).map((v) => ({
                      value: v.plate,
                      label: `Prefixo ${v.prefix}`,
                    }))}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Condutor *</label>
                  <Combobox
                    value={driverName}
                    onChange={setDriverName}
                    placeholder="Selecione da lista ou digite o nome"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-xs"
                    options={[...people].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')).map((p) => ({
                      value: p.name,
                      label: p.docNumber || '',
                    }))}
                  />
                </div>
              </div>

              <div className={duplicateOfAuto ? "grid grid-cols-1 gap-2" : "grid grid-cols-3 gap-2"}>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data da Multa</label>
                  <input
                    type="date"
                    value={infractionDate}
                    onChange={(e) => setInfractionDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-xs"
                  />
                </div>
                {!duplicateOfAuto && (
                  <>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Horário</label>
                      <input
                        type="time"
                        value={infractionTime}
                        onChange={(e) => setInfractionTime(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Indicação do Condutor</label>
                      <select
                        value={indicationStatus}
                        onChange={(e) => setIndicationStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-xs"
                      >
                        <option value="">Selecione</option>
                        <option value="INDICADO">Indicado</option>
                        <option value="NÃO INDICADO">Não Indicado</option>
                        <option value="INDICADO/DOBRADO">Indicado/Dobrado</option>
                        <option value="INDICADO/TRANS PINHO">Indicado/Trans Pinho</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrição do Enquadramento *</label>
                <Combobox
                  value={description}
                  onChange={handleSelecionarInfracao}
                  options={[...infractionTypes]
                    .sort((a, b) => a.description.localeCompare(b.description, 'pt-BR'))
                    .map((inf) => ({
                      value: inf.description,
                      label: `${formatCurrency(inf.amount)} • ${inf.points} pts`,
                    }))}
                  placeholder="Selecione da lista de infrações ou digite..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Multa Original (se esta for duplicidade de outra)
                </label>
                <Combobox
                  value={duplicateOfAuto}
                  onChange={setDuplicateOfAuto}
                  placeholder="Selecione a multa original, se houver"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono text-xs"
                  options={fines
                    .filter((f) => f.id !== editingFine?.id)
                    .map((f) => ({ value: f.infractionAuto, label: `${f.vehiclePlate} • ${f.driverName}` }))}
                />
              </div>

              <div className={duplicateOfAuto ? "grid grid-cols-1 gap-2" : "grid grid-cols-3 gap-2"}>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-bold"
                  />
                </div>
                {!duplicateOfAuto && (
                  <>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Pontos</label>
                      <input
                        type="number"
                        value={points}
                        onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Vencimento da Indicação</label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-xs"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-5 py-2 rounded-lg shadow-sm cursor-pointer"
                >
                  {editingFine ? 'Salvar Alterações' : 'Salvar Infração'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Viewing / Printing Fine Modal */}
      {viewingFine && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-start justify-center px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-2xl w-full my-4 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-file-lines text-amber-400"></i>
                <span className="font-bold text-sm">Auto de Infração {viewingFine.infractionAuto}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-print"></i> Imprimir
                </button>
                <button onClick={() => setViewingFine(null)} className="text-slate-300 hover:text-white px-2 cursor-pointer">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>

            <div className="trans-pinho-doc p-8 overflow-y-auto print:p-0 print:overflow-visible font-serif text-slate-900">
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-4">
                <div>
                  <h1 className="text-base font-black uppercase">Auto de Infração de Trânsito</h1>
                  <p className="text-[11px] text-slate-500">JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  viewingFine.status === 'Paga'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-rose-50 text-rose-700 border-rose-300'
                }`}>
                  {viewingFine.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                <div><span className="text-slate-400 uppercase font-bold text-[10px] block">Auto de Infração</span>{viewingFine.infractionAuto}</div>
                <div><span className="text-slate-400 uppercase font-bold text-[10px] block">Placa</span>{viewingFine.vehiclePlate}</div>
                <div><span className="text-slate-400 uppercase font-bold text-[10px] block">Condutor</span>{viewingFine.driverName}</div>
                <div><span className="text-slate-400 uppercase font-bold text-[10px] block">Data da Multa</span>{formatarDataHoraBr(viewingFine.infractionDate, viewingFine.infractionTime)}</div>
                <div><span className="text-slate-400 uppercase font-bold text-[10px] block">Vencimento Indicação</span>{formatarDataBr(viewingFine.dueDate)}</div>
                {!viewingFine.duplicateOfAuto && (
                  <div><span className="text-slate-400 uppercase font-bold text-[10px] block">Indicação do Condutor</span>{viewingFine.indicationStatus || '—'}</div>
                )}
              </div>

              {viewingFine.duplicateOfAuto && (
                <div className="mb-4 p-2.5 bg-amber-50 rounded-lg border border-amber-200 print:hidden">
                  <span className="text-amber-900 uppercase font-bold text-[10px] block">Duplicidade da Multa</span>
                  <button
                    onClick={() => {
                      const original = fines.find((f) => f.infractionAuto === viewingFine.duplicateOfAuto);
                      if (original) setViewingFine(original);
                    }}
                    className="font-mono font-bold text-xs text-amber-950 hover:text-amber-700 hover:underline cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Auto Original: {viewingFine.duplicateOfAuto}</span>
                    <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                  </button>
                </div>
              )}
              {viewingFine.duplicateOfAuto && (
                <div className="hidden print:block mb-4 p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="text-amber-900 uppercase font-bold text-[10px] block">Duplicidade da Multa</span>
                  <span className="font-mono font-bold text-xs text-amber-950">Auto Original: {viewingFine.duplicateOfAuto}</span>
                </div>
              )}

              <div className="mb-4">
                <span className="text-slate-400 uppercase font-bold text-[10px] block mb-1">Descrição da Infração</span>
                <p className="text-xs leading-relaxed">{viewingFine.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-3">
                <div><span className="text-slate-400 uppercase font-bold text-[10px] block">Valor</span><span className="text-lg font-black">{formatCurrency(viewingFine.amount)}</span></div>
                <div><span className="text-slate-400 uppercase font-bold text-[10px] block">Pontos na CNH</span><span className="text-lg font-black">{viewingFine.points}</span></div>
              </div>

              {viewingFine.notes && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-slate-400 uppercase font-bold text-[10px] block mb-1">Observações</span>
                  <p className="text-xs">{viewingFine.notes}</p>
                </div>
              )}

              <p className="text-center text-[10px] text-slate-400 pt-6 mt-6 border-t border-slate-200">
                JOÃO BATISTA DE SOUZA PINHO EPP - TRANS PINHO • Rua Florida, 116 – Nossa Chácara – Gravataí/RS
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Pré-visualização da Importação de Multas */}
      {showImportModal && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-file-excel text-emerald-600 text-lg"></i>
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                  Importar Multas da Planilha
                </h3>
              </div>
              {!isImporting && (
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-slate-400 hover:text-slate-700 text-base cursor-pointer"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-circle-check text-emerald-600"></i>
                <span className="text-xs font-bold text-emerald-950">
                  {linhasParaImportar.length} multas encontradas na planilha
                </span>
              </div>
              <span className="text-[11px] text-emerald-700 font-medium">
                Pronto para cadastrar no sistema
              </span>
            </div>

            {/* Tabela de Amostra das primeiras 15 multas */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="p-2.5 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 flex justify-between items-center">
                <span>Amostra das primeiras 15 multas da planilha:</span>
                <span className="text-[10px] text-slate-400 font-normal">Total no arquivo: {linhasParaImportar.length}</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px] sticky top-0">
                    <tr>
                      <th className="p-2">#</th>
                      <th className="p-2">Auto</th>
                      <th className="p-2">Placa</th>
                      <th className="p-2">Motorista</th>
                      <th className="p-2">Tipo / Infração</th>
                      <th className="p-2">Valor</th>
                      <th className="p-2">Pontos</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {linhasParaImportar.slice(0, 15).map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="p-2 font-mono text-[10px] text-slate-400">{idx + 1}</td>
                        <td className="p-2 font-mono font-bold text-slate-800">{item.fine.infractionAuto}</td>
                        <td className="p-2 font-bold text-slate-900">{item.fine.vehiclePlate}</td>
                        <td className="p-2">{item.fine.driverName || '—'}</td>
                        <td className="p-2 max-w-[200px] truncate" title={item.fine.description}>
                          {item.fine.description}
                        </td>
                        <td className="p-2 font-bold text-slate-900 whitespace-nowrap">
                          {formatCurrency(item.fine.amount)}
                        </td>
                        <td className="p-2 text-center">{item.fine.points}</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                              item.fine.status === 'Paga'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-rose-50 text-rose-700 border-rose-300'
                            }`}
                          >
                            {item.fine.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {linhasParaImportar.length > 15 && (
                <div className="p-2 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 font-medium">
                  ... e mais {linhasParaImportar.length - 15} multas que serão importadas.
                </div>
              )}
            </div>

            {/* Barra de Progresso durante a Importação */}
            {isImporting && importProgress && (
              <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Gravando multas no banco de dados...</span>
                  <span>
                    {importProgress.current} de {importProgress.total} ({Math.round((importProgress.current / importProgress.total) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-150"
                    style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Rodapé / Ações */}
            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                disabled={isImporting}
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isImporting}
                onClick={handleConfirmImport}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-5 py-2 rounded-lg shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isImporting ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    <span>Importando...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                    <span>Confirmar Importação ({linhasParaImportar.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Escolha de Colunas para Exportação */}
      {showExportModal && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full my-8 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm">
                  <i className="fa-solid fa-file-export"></i>
                </div>
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                    Escolher Colunas para Exportar
                  </h3>
                  <span className="text-[10px] text-amber-400">
                    {colunasExportSelecionadas.length} de {COLUNAS_EXPORTACAO_MULTAS.length} colunas selecionadas • {sortedFines.length} multa(s)
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
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4 text-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-slate-600 text-xs">
                  Marque as colunas que devem aparecer no relatório:
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
                {COLUNAS_EXPORTACAO_MULTAS.map((col) => {
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
                    exportarMultasParaExcel(sortedFines, colunasExportSelecionadas);
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
        <FinesPdfReportModal
          fines={sortedFines}
          colunas={COLUNAS_EXPORTACAO_MULTAS.filter((c) => colunasExportSelecionadas.includes(c.chave))}
          onClose={() => setShowPdfModal(false)}
        />
      )}

      {/* Modal do Catálogo de Tipos de Infração */}
      {showCatalogModal && (
        <InfractionCatalogModal
          infractionTypes={infractionTypes}
          onSave={(data) => onSaveInfractionType?.(data)}
          onUpdate={(id, data) => onUpdateInfractionType?.(id, data)}
          onDelete={(id) => onDeleteInfractionType?.(id)}
          onClose={() => setShowCatalogModal(false)}
        />
      )}
    </div>
  );
};

export default FinesView;
