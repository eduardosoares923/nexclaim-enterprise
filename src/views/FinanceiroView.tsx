import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { FinancialEntry, FinancialEntryStatus, FinancialEntryOrigin, Claim, Fine, Term, Person, RoleType } from '../types';
import { Combobox } from '../components/Combobox';
import { formatarDataBr } from '../utils/dateUtils';
import { usePermissions } from '../hooks/usePermissions';

interface FinanceiroViewProps {
  financialEntries: FinancialEntry[];
  claims: Claim[];
  fines: Fine[];
  terms?: Term[];
  people: Person[];
  onSaveEntry: (data: Omit<FinancialEntry, 'id'>) => void;
  onUpdateEntry: (id: string, data: Partial<FinancialEntry>) => void;
  onDeleteEntry: (id: string) => void;
  userRole?: RoleType;
  userEmail?: string;
}

export const FinanceiroView: React.FC<FinanceiroViewProps> = ({
  financialEntries = [],
  claims = [],
  fines = [],
  terms = [],
  people = [],
  onSaveEntry,
  onUpdateEntry,
  onDeleteEntry,
  userRole,
  userEmail,
}) => {
  const permissoes = usePermissions(userRole, userEmail);

  // Estados de Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [directionFilter, setDirectionFilter] = useState<string>('');
  const [originFilter, setOriginFilter] = useState<string>('');

  // Controle de sanfona (motoristas expandidos)
  const [expandedDrivers, setExpandedDrivers] = useState<Set<string>>(new Set());

  // Modal de Criação / Edição de Lançamento Manual
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FinancialEntry | null>(null);

  // Formulário Modal
  const [formDriver, setFormDriver] = useState('');
  const [formOriginType, setFormOriginType] = useState<FinancialEntryOrigin>('Outro');
  const [formOriginLabel, setFormOriginLabel] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDirection, setFormDirection] = useState<'Cobrar' | 'Pagar'>('Cobrar');
  const [formTotalAmount, setFormTotalAmount] = useState<number>(0);
  const [formInstallmentsCount, setFormInstallmentsCount] = useState<number>(1);
  const [formPaidInstallments, setFormPaidInstallments] = useState<number>(0);
  const [formFirstDueDate, setFormFirstDueDate] = useState('');
  const [formStatus, setFormStatus] = useState<FinancialEntryStatus>('Pendente');
  const [formNotes, setFormNotes] = useState('');

  // Estado de confirmação do gerador automático
  const [isGeneratingAuto, setIsGeneratingAuto] = useState(false);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  // ============================================================================
  // CÁLCULO DE ESTATÍSTICAS / KPIS DO TOPO
  // ============================================================================
  const stats = useMemo(() => {
    let aCobrarPendente = 0;
    let aPagarPendente = 0;
    let jaRecebidoDescontado = 0;

    financialEntries.forEach((entry) => {
      const pago = (entry.installmentValue || 0) * (entry.paidInstallments || 0);
      const saldoRestante = Math.max(0, (entry.totalAmount || 0) - pago);

      if (entry.status !== 'Quitado' && entry.status !== 'Cancelado') {
        if (entry.direction === 'Cobrar') {
          aCobrarPendente += saldoRestante;
        } else if (entry.direction === 'Pagar') {
          aPagarPendente += saldoRestante;
        }
      }

      if (entry.direction === 'Cobrar') {
        jaRecebidoDescontado += pago;
      }
    });

    const multasPendentesValor = fines
      .filter((f) => f.status === 'Pendente')
      .reduce((acc, f) => acc + (f.amount || 0), 0);

    return {
      aCobrarPendente,
      aPagarPendente,
      jaRecebidoDescontado,
      multasPendentesValor,
    };
  }, [financialEntries, fines]);

  // ============================================================================
  // IDENTIFICAÇÃO DE CANDIDATOS PARA GERAÇÃO AUTOMÁTICA
  // ============================================================================
  const candidatosAuto = useMemo(() => {
    const existingOriginIds = new Set(
      financialEntries.filter((e) => e.originId).map((e) => e.originId)
    );

    const claimsComTermo = new Set(terms.filter((t) => t.claimId).map((t) => t.claimId));
    const finesComTermo = new Set(terms.filter((t) => t.fineId).map((t) => t.fineId));

    const claimsCandidatos = claims.filter((c) => {
      if (existingOriginIds.has(c.id)) return false;
      if (!claimsComTermo.has(c.id)) return false;
      const valor = c.totalValue || c.approvedCost || c.estimatedCost || 0;
      const direction = c.paymentDirection || 'Cobrar';
      return valor > 0 && (direction === 'Cobrar' || direction === 'Pagar');
    });

    const finesCandidatos = fines.filter((f) => {
      if (existingOriginIds.has(f.id)) return false;
      if (!finesComTermo.has(f.id)) return false;
      return f.status === 'Pendente' && (f.amount || 0) > 0;
    });

    return {
      claims: claimsCandidatos,
      fines: finesCandidatos,
      total: claimsCandidatos.length + finesCandidatos.length,
    };
  }, [financialEntries, claims, fines, terms]);

  const handleGerarAutomatico = async () => {
    if (candidatosAuto.total === 0) {
      alert('Não há novos sinistros ou multas pendentes para gerar lançamentos automáticos.');
      return;
    }

    const confirmou = window.confirm(
      `Foram encontrados ${candidatosAuto.total} registro(s) pendente(s):\n` +
      `• ${candidatosAuto.claims.length} Sinistro(s)\n` +
      `• ${candidatosAuto.fines.length} Multa(s)\n\n` +
      `Deseja gerar os lançamentos financeiros automaticamente agora?`
    );

    if (!confirmou) return;

    setIsGeneratingAuto(true);
    try {
      // 1. Gera para Claims
      for (const claim of candidatosAuto.claims) {
        const total = claim.totalValue || claim.approvedCost || claim.estimatedCost || 0;
        const dir = (claim.paymentDirection as 'Cobrar' | 'Pagar') || 'Cobrar';
        await onSaveEntry({
          driverName: claim.driverName || 'Condutor Não Informado',
          originType: 'Sinistro',
          originId: claim.id,
          originLabel: claim.claimNumber,
          description: `Sinistro ${claim.claimNumber} - ${claim.occurrenceType || 'Ocorrência'}`,
          direction: dir,
          totalAmount: total,
          installmentsCount: 1,
          installmentValue: total,
          paidInstallments: 0,
          firstDueDate: claim.date || new Date().toISOString().split('T')[0],
          status: 'Pendente',
          notes: claim.description ? `Sinistro: ${claim.description.slice(0, 150)}` : undefined,
        });
      }

      // 2. Gera para Fines
      for (const fine of candidatosAuto.fines) {
        const total = fine.amount || 0;
        await onSaveEntry({
          driverName: fine.driverName || 'Condutor Não Informado',
          originType: 'Multa',
          originId: fine.id,
          originLabel: fine.infractionAuto || fine.infractionCode || 'Multa',
          description: `Multa ${fine.infractionAuto || fine.infractionCode || ''} - ${fine.description || 'Infração de Trânsito'}`,
          direction: 'Cobrar',
          totalAmount: total,
          installmentsCount: 1,
          installmentValue: total,
          paidInstallments: 0,
          firstDueDate: fine.dueDate || new Date().toISOString().split('T')[0],
          status: 'Pendente',
          notes: `Placa: ${fine.vehiclePlate} | Vencimento: ${formatarDataBr(fine.dueDate)}`,
        });
      }

      alert(`Sucesso! ${candidatosAuto.total} lançamento(s) financeiro(s) gerado(s).`);
    } catch (err: any) {
      alert(`Erro ao gerar lançamentos: ${err?.message || err}`);
    } finally {
      setIsGeneratingAuto(false);
    }
  };

  // ============================================================================
  // FILTRAGEM E AGRUPAMENTO POR CONDUTOR
  // ============================================================================
  const filteredEntries = useMemo(() => {
    return financialEntries.filter((entry) => {
      const matchesSearch =
        !searchTerm ||
        entry.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.originLabel && entry.originLabel.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = !statusFilter || entry.status === statusFilter;
      const matchesDirection = !directionFilter || entry.direction === directionFilter;
      const matchesOrigin = !originFilter || entry.originType === originFilter;

      return matchesSearch && matchesStatus && matchesDirection && matchesOrigin;
    });
  }, [financialEntries, searchTerm, statusFilter, directionFilter, originFilter]);

  // Agrupamento por motorista
  const groupedByDriver = useMemo(() => {
    const map = new Map<string, FinancialEntry[]>();
    filteredEntries.forEach((entry) => {
      const driver = entry.driverName || 'Sem Condutor Definido';
      if (!map.has(driver)) map.set(driver, []);
      map.get(driver)!.push(entry);
    });

    // Converte para array ordenado alfabeticamente
    return Array.from(map.entries())
      .map(([driverName, entries]) => {
        const saldoCobrar = entries
          .filter((e) => e.direction === 'Cobrar' && e.status !== 'Cancelado')
          .reduce((acc, e) => acc + (e.totalAmount - (e.installmentValue * e.paidInstallments)), 0);

        const saldoPagar = entries
          .filter((e) => e.direction === 'Pagar' && e.status !== 'Cancelado')
          .reduce((acc, e) => acc + (e.totalAmount - (e.installmentValue * e.paidInstallments)), 0);

        return {
          driverName,
          entries,
          saldoCobrar,
          saldoPagar,
          totalEntries: entries.length,
        };
      })
      .sort((a, b) => a.driverName.localeCompare(b.driverName));
  }, [filteredEntries]);

  const toggleDriver = (driverName: string) => {
    setExpandedDrivers((prev) => {
      const next = new Set(prev);
      if (next.has(driverName)) next.delete(driverName);
      else next.add(driverName);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedDrivers(new Set(groupedByDriver.map((g) => g.driverName)));
  };

  const collapseAll = () => {
    setExpandedDrivers(new Set());
  };

  // ============================================================================
  // AÇÃO: MARCAR +1 PARCELA PAGA
  // ============================================================================
  const handlePagarParcela = (entry: FinancialEntry) => {
    if (entry.paidInstallments >= entry.installmentsCount) return;

    const newPaid = entry.paidInstallments + 1;
    const newStatus: FinancialEntryStatus =
      newPaid >= entry.installmentsCount ? 'Quitado' : 'Em Desconto';

    onUpdateEntry(entry.id, {
      paidInstallments: newPaid,
      status: newStatus,
    });
  };

  const handleDesfazerParcelas = (entry: FinancialEntry, quantidade: number) => {
    const novoPago = Math.max(entry.paidInstallments - quantidade, 0);
    if (novoPago === entry.paidInstallments) return;

    const newStatus: FinancialEntryStatus =
      novoPago === 0 ? 'Pendente' : 'Em Desconto';

    onUpdateEntry(entry.id, {
      paidInstallments: novoPago,
      status: newStatus,
    });
  };

  // ============================================================================
  // MODAL: CRIAR / EDITAR
  // ============================================================================
  const handleOpenCreateModal = () => {
    setEditingEntry(null);
    setFormDriver(people[0]?.name || '');
    setFormOriginType('Outro');
    setFormOriginLabel('');
    setFormDescription('');
    setFormDirection('Cobrar');
    setFormTotalAmount(0);
    setFormInstallmentsCount(1);
    setFormPaidInstallments(0);
    setFormFirstDueDate(new Date().toISOString().split('T')[0]);
    setFormStatus('Pendente');
    setFormNotes('');
    setShowModal(true);
  };

  const handleOpenEditModal = (entry: FinancialEntry) => {
    setEditingEntry(entry);
    setFormDriver(entry.driverName);
    setFormOriginType(entry.originType);
    setFormOriginLabel(entry.originLabel || '');
    setFormDescription(entry.description);
    setFormDirection(entry.direction);
    setFormTotalAmount(entry.totalAmount);
    setFormInstallmentsCount(entry.installmentsCount || 1);
    setFormPaidInstallments(entry.paidInstallments || 0);
    setFormFirstDueDate(entry.firstDueDate || '');
    setFormStatus(entry.status);
    setFormNotes(entry.notes || '');
    setShowModal(true);
  };

  const handleSaveModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const instCount = Math.max(1, Number(formInstallmentsCount) || 1);
    const total = Math.max(0, Number(formTotalAmount) || 0);
    const instValue = instCount > 0 ? total / instCount : 0;
    const paid = Math.min(instCount, Math.max(0, Number(formPaidInstallments) || 0));

    let finalStatus = formStatus;
    if (paid >= instCount && finalStatus !== 'Cancelado') {
      finalStatus = 'Quitado';
    } else if (paid > 0 && finalStatus === 'Pendente') {
      finalStatus = 'Em Desconto';
    }

    const driver = formDriver ? formDriver.toUpperCase().trim() : 'NÃO INFORMADO';
    const desc = formDescription ? formDescription.trim() : 'Lançamento Avulso';

    if (editingEntry) {
      onUpdateEntry(editingEntry.id, {
        driverName: driver,
        originType: formOriginType,
        originLabel: formOriginLabel.trim() || undefined,
        description: desc,
        direction: formDirection,
        totalAmount: total,
        installmentsCount: instCount,
        installmentValue: instValue,
        paidInstallments: paid,
        firstDueDate: formFirstDueDate || undefined,
        status: finalStatus,
        notes: formNotes.trim() || undefined,
      });
    } else {
      onSaveEntry({
        driverName: driver,
        originType: formOriginType,
        originLabel: formOriginLabel.trim() || undefined,
        description: desc,
        direction: formDirection,
        totalAmount: total,
        installmentsCount: instCount,
        installmentValue: instValue,
        paidInstallments: paid,
        firstDueDate: formFirstDueDate || undefined,
        status: finalStatus,
        notes: formNotes.trim() || undefined,
      });
    }

    setShowModal(false);
  };

  const peopleOptions = people.map((p) => ({
    value: p.name,
    label: `${p.name} (${p.type})`,
  }));

  const getStatusBadgeClass = (status: FinancialEntryStatus) => {
    switch (status) {
      case 'Quitado':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'Em Desconto':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'Pendente':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'Cancelado':
        return 'bg-slate-100 text-slate-500 border-slate-300 line-through';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getOriginBadge = (originType: FinancialEntryOrigin) => {
    switch (originType) {
      case 'Sinistro':
        return {
          icon: 'fa-triangle-exclamation',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      case 'Multa':
        return {
          icon: 'fa-file-invoice-dollar',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      default:
        return {
          icon: 'fa-receipt',
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded border border-amber-300 uppercase tracking-wider">
              Controle de Descontos & Cobranças • Trans Pinho
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <i className="fa-solid fa-sack-dollar text-amber-500"></i>
            <span>Gestão Financeira por Condutor</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralização de cobranças de sinistros, multas de trânsito e parcelamentos em folha por motorista.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {permissoes.podeCriar && (
            <button
              onClick={handleGerarAutomatico}
              disabled={isGeneratingAuto || candidatosAuto.total === 0}
              className={`font-bold text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-2 transition cursor-pointer shadow-xs ${
                candidatosAuto.total > 0
                  ? 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
              title="Detecta sinistros e multas com saldo e cria lançamentos automaticamente"
            >
              <i className={`fa-solid ${isGeneratingAuto ? 'fa-circle-notch fa-spin' : 'fa-wand-magic-sparkles'} text-amber-300`}></i>
              <span>Gerar Lançamentos Auto</span>
              {candidatosAuto.total > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  {candidatosAuto.total}
                </span>
              )}
            </button>
          )}

          {permissoes.podeCriar && (
            <button
              onClick={handleOpenCreateModal}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <i className="fa-solid fa-plus text-xs"></i>
              <span>Novo Lançamento Avulso</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards de Resumo Geral */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* A Cobrar (Pendente) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              A Cobrar (Pendente)
            </span>
            <div className="mt-2 text-2xl font-black text-slate-900">
              {formatCurrency(stats.aCobrarPendente)}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Saldo a receber dos condutores
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg border border-amber-200">
            <i className="fa-solid fa-hand-holding-dollar"></i>
          </div>
        </div>

        {/* Já Recebido / Descontado */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Já Recebido / Descontado
            </span>
            <div className="mt-2 text-2xl font-black text-emerald-600">
              {formatCurrency(stats.jaRecebidoDescontado)}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Parcelas pagas acumuladas
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg border border-emerald-200">
            <i className="fa-solid fa-circle-check"></i>
          </div>
        </div>

        {/* A Pagar (Empresa) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              A Pagar (Empresa)
            </span>
            <div className="mt-2 text-2xl font-black text-indigo-600">
              {formatCurrency(stats.aPagarPendente)}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Indenizações / Terceiros
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg border border-indigo-200">
            <i className="fa-solid fa-money-bill-transfer"></i>
          </div>
        </div>

        {/* Multas Pendentes */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Multas Pendentes (Geral)
            </span>
            <div className="mt-2 text-2xl font-black text-rose-600">
              {formatCurrency(stats.multasPendentesValor)}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {fines.filter((f) => f.status === 'Pendente').length} multa(s) em aberto
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg border border-rose-200">
            <i className="fa-solid fa-file-circle-exclamation"></i>
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por condutor, descrição, protocolo..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/50 bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50"
          >
            <option value="">Todos os Status</option>
            <option value="Pendente">Pendente</option>
            <option value="Em Desconto">Em Desconto</option>
            <option value="Quitado">Quitado</option>
            <option value="Cancelado">Cancelado</option>
          </select>

          <select
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50"
          >
            <option value="">Todas as Direções</option>
            <option value="Cobrar">Cobrar (Condutor/Terceiro)</option>
            <option value="Pagar">Pagar (Empresa)</option>
          </select>

          <select
            value={originFilter}
            onChange={(e) => setOriginFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50"
          >
            <option value="">Todas as Origens</option>
            <option value="Sinistro">Sinistros</option>
            <option value="Multa">Multas</option>
            <option value="Outro">Outros / Avulsos</option>
          </select>

          <button
            onClick={expandedDrivers.size === groupedByDriver.length ? collapseAll : expandAll}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2 rounded-lg border border-slate-300 transition cursor-pointer"
            title="Expandir ou recolher todos os grupos de condutores"
          >
            <i className={`fa-solid ${expandedDrivers.size === groupedByDriver.length ? 'fa-compress' : 'fa-expand'} mr-1.5`}></i>
            {expandedDrivers.size === groupedByDriver.length ? 'Recolher Todos' : 'Expandir Todos'}
          </button>
        </div>
      </div>

      {/* Listagem Agrupada por Condutor */}
      {groupedByDriver.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
            <i className="fa-solid fa-folder-open"></i>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">Nenhum lançamento financeiro encontrado</p>
            <p className="text-xs text-slate-400 mt-1">
              {candidatosAuto.total > 0
                ? 'Clique em "Gerar Lançamentos Auto" no topo para importar cobranças de sinistros e multas.'
                : 'Utilize o botão "Novo Lançamento Avulso" para registrar uma nova cobrança ou pagamento.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByDriver.map(({ driverName, entries, saldoCobrar, saldoPagar, totalEntries }) => {
            const isExpanded = expandedDrivers.has(driverName);

            return (
              <div
                key={driverName}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition"
              >
                {/* Header do Accordion por Motorista */}
                <button
                  type="button"
                  onClick={() => toggleDriver(driverName)}
                  className="w-full p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left hover:bg-slate-50/80 transition cursor-pointer border-b border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shrink-0 shadow-2xs">
                      {driverName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                        <span>{driverName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                          {totalEntries} lançamento(s)
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Condutor da Frota Trans Pinho
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900">
                        Saldo a Cobrar: <span className="text-amber-700 font-extrabold">{formatCurrency(saldoCobrar)}</span>
                      </div>
                      {saldoPagar > 0 && (
                        <div className="text-[11px] text-indigo-700 font-semibold">
                          A Pagar pela Empresa: {formatCurrency(saldoPagar)}
                        </div>
                      )}
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs">
                      <i className={`fa-solid fa-chevron-down transition-transform ${isExpanded ? 'rotate-180' : ''}`}></i>
                    </div>
                  </div>
                </button>

                {/* Conteúdo da Tabela do Condutor */}
                {isExpanded && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50/90 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3.5">Origem</th>
                          <th className="p-3.5">Descrição & Referência</th>
                          <th className="p-3.5">Direção</th>
                          <th className="p-3.5 text-right">Valor Total</th>
                          <th className="p-3.5 min-w-[200px]">Parcelas & Progresso</th>
                          <th className="p-3.5 text-center">Status</th>
                          <th className="p-3.5 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {entries.map((entry) => {
                          const orig = getOriginBadge(entry.originType);
                          const perc = Math.min(
                            100,
                            Math.round(((entry.paidInstallments || 0) / (entry.installmentsCount || 1)) * 100)
                          );
                          const isFullyPaid = (entry.paidInstallments || 0) >= (entry.installmentsCount || 1);

                          return (
                            <tr key={entry.id} className="hover:bg-amber-50/30 transition-colors">
                              {/* Origem */}
                              <td className="p-3.5 whitespace-nowrap">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border flex items-center gap-1.5 w-fit ${orig.bg}`}>
                                  <i className={`fa-solid ${orig.icon}`}></i>
                                  <span>{entry.originType}</span>
                                </span>
                              </td>

                              {/* Descrição & Ref */}
                              <td className="p-3.5">
                                <div className="font-bold text-slate-900 text-xs">
                                  {entry.description}
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5 space-x-2">
                                  {entry.originLabel && (
                                    <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 text-slate-700">
                                      {entry.originLabel}
                                    </span>
                                  )}
                                  {entry.firstDueDate && (
                                    <span>
                                      <i className="fa-regular fa-calendar mr-1"></i>
                                      Vencimento: {formatarDataBr(entry.firstDueDate)}
                                    </span>
                                  )}
                                </div>
                                {entry.notes && (
                                  <div className="text-[10px] text-slate-500 italic mt-0.5 truncate max-w-xs" title={entry.notes}>
                                    "{entry.notes}"
                                  </div>
                                )}
                              </td>

                              {/* Direção */}
                              <td className="p-3.5 whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  entry.direction === 'Cobrar'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                    : 'bg-indigo-50 text-indigo-700 border-indigo-300'
                                }`}>
                                  {entry.direction === 'Cobrar' ? 'Cobrar (Receber)' : 'Pagar (Empresa)'}
                                </span>
                              </td>

                              {/* Valor Total */}
                              <td className="p-3.5 text-right font-black text-slate-900 whitespace-nowrap">
                                {formatCurrency(entry.totalAmount)}
                              </td>

                              {/* Parcelas & Progresso */}
                              <td className="p-3.5">
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                                    <span>{entry.paidInstallments} de {entry.installmentsCount} pagas</span>
                                    <span className="text-slate-500 font-semibold">{perc}%</span>
                                  </div>
                                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                                    <div
                                      className={`h-full rounded-full transition-all duration-300 ${
                                        perc >= 100 ? 'bg-emerald-500' : perc > 0 ? 'bg-blue-500' : 'bg-slate-300'
                                      }`}
                                      style={{ width: `${perc}%` }}
                                    ></div>
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    {entry.installmentsCount > 1
                                      ? `${formatCurrency(entry.installmentValue)} / parcela`
                                      : 'Parcela única'}
                                  </div>
                                </div>
                              </td>

                              {/* Status */}
                              <td className="p-3.5 text-center whitespace-nowrap">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(entry.status)}`}>
                                  {entry.status}
                                </span>
                              </td>

                              {/* Ações */}
                              <td className="p-3.5 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Botão +1 Parcela */}
                                  {permissoes.podeEditarOuExcluir(entry.createdBy) && (
                                    <button
                                      type="button"
                                      disabled={isFullyPaid || entry.status === 'Cancelado'}
                                      onClick={() => handlePagarParcela(entry)}
                                      className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg flex items-center gap-1 transition shadow-2xs ${
                                        isFullyPaid || entry.status === 'Cancelado'
                                          ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                          : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95 cursor-pointer'
                                      }`}
                                      title="Registrar pagamento de +1 parcela"
                                    >
                                      <i className="fa-solid fa-plus text-[10px]"></i>
                                      <span>1 Parcela</span>
                                    </button>
                                  )}

                                  {permissoes.podeEditarOuExcluir(entry.createdBy) && entry.paidInstallments > 0 && (
                                    <div className="flex items-center gap-1 ml-1 pl-1.5 border-l border-slate-200">
                                      <button type="button" onClick={() => handleDesfazerParcelas(entry, 1)} className="text-[10px] font-bold px-1.5 py-1 rounded border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer" title="Desfazer 1 parcela paga">-1</button>
                                      <button type="button" onClick={() => handleDesfazerParcelas(entry, 5)} className="text-[10px] font-bold px-1.5 py-1 rounded border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer" title="Desfazer 5 parcelas pagas">-5</button>
                                      <button type="button" onClick={() => handleDesfazerParcelas(entry, 10)} className="text-[10px] font-bold px-1.5 py-1 rounded border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer" title="Desfazer 10 parcelas pagas">-10</button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const valor = window.prompt('Quantas parcelas desfazer?', '1');
                                          const n = parseInt(valor || '0');
                                          if (n > 0) handleDesfazerParcelas(entry, n);
                                        }}
                                        className="text-[10px] font-bold px-1.5 py-1 rounded border border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100 cursor-pointer"
                                        title="Desfazer outra quantidade"
                                      >
                                        Outro
                                      </button>
                                    </div>
                                  )}

                                  {/* Editar */}
                                  {permissoes.podeEditarOuExcluir(entry.createdBy) && (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditModal(entry)}
                                      className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition border border-slate-200 cursor-pointer"
                                      title="Editar Lançamento"
                                    >
                                      <i className="fa-solid fa-pen-to-square text-xs"></i>
                                    </button>
                                  )}

                                  {/* Excluir */}
                                  {permissoes.podeEditarOuExcluir(entry.createdBy) === true && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (window.confirm(`Tem certeza que deseja excluir o lançamento "${entry.description}"? Essa ação não pode ser desfeita.`)) {
                                          onDeleteEntry(entry.id);
                                        }
                                      }}
                                      className="w-7 h-7 flex items-center justify-center bg-white hover:bg-rose-50 border border-slate-200 text-rose-600 rounded-lg transition hover:border-rose-300 cursor-pointer"
                                      title="Excluir Lançamento"
                                    >
                                      <i className="fa-solid fa-trash-can text-xs"></i>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: CRIAR / EDITAR LANÇAMENTO FINANCEIRO */}
      {/* ==================================================================== */}
      {showModal &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-4 sm:p-6 space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-sack-dollar text-amber-500"></i>
                  <span>{editingEntry ? 'Editar Lançamento Financeiro' : 'Novo Lançamento Financeiro Avulso'}</span>
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition"
                >
                  <i className="fa-solid fa-xmark text-base"></i>
                </button>
              </div>

              <form onSubmit={handleSaveModalSubmit} className="space-y-3 text-xs">
                {/* Condutor */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Condutor / Responsável</label>
                  <Combobox
                    value={formDriver}
                    onChange={setFormDriver}
                    options={peopleOptions}
                    placeholder="Selecione ou digite o nome do condutor..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-bold text-slate-900"
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Descrição do Lançamento</label>
                  <input
                    type="text"
                    placeholder="Descreva o motivo do lançamento"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-slate-900"
                  />
                </div>

                {/* Origem e Direção */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tipo de Origem</label>
                    <select
                      value={formOriginType}
                      onChange={(e) => setFormOriginType(e.target.value as FinancialEntryOrigin)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-semibold"
                    >
                      <option value="Outro">Outro / Avulso</option>
                      <option value="Sinistro">Sinistro</option>
                      <option value="Multa">Multa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Direção Financeira</label>
                    <select
                      value={formDirection}
                      onChange={(e) => setFormDirection(e.target.value as 'Cobrar' | 'Pagar')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-bold text-slate-900"
                    >
                      <option value="Cobrar">Cobrar do Condutor (Receber)</option>
                      <option value="Pagar">Pagar pela Empresa (Despesa)</option>
                    </select>
                  </div>
                </div>

                {/* Valor Total e Parcelas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Valor Total (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formTotalAmount || ''}
                      onChange={(e) => setFormTotalAmount(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-black text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Qtd. de Parcelas</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={formInstallmentsCount}
                      onChange={(e) => setFormInstallmentsCount(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Valor p/ Parcela</label>
                    <div className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 font-bold text-slate-800">
                      {formatCurrency(
                        (formTotalAmount || 0) / Math.max(1, formInstallmentsCount || 1)
                      )}
                    </div>
                  </div>
                </div>

                {/* Parcelas Pagas e 1º Vencimento */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Parcelas Já Pagas</label>
                    <input
                      type="number"
                      min="0"
                      max={formInstallmentsCount}
                      value={formPaidInstallments}
                      onChange={(e) => setFormPaidInstallments(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Data 1º Vencimento</label>
                    <input
                      type="date"
                      value={formFirstDueDate}
                      onChange={(e) => setFormFirstDueDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-semibold text-slate-900"
                    />
                  </div>
                </div>

                {/* Status e Ref/Protocolo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as FinancialEntryStatus)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-bold text-slate-900"
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Em Desconto">Em Desconto</option>
                      <option value="Quitado">Quitado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Rótulo / Protocolo (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Opcional"
                      value={formOriginLabel}
                      onChange={(e) => setFormOriginLabel(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-slate-900 font-mono"
                    />
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Observações Internas</label>
                  <textarea
                    rows={2}
                    placeholder="Detalhes adicionais sobre o desconto, autorização ou negociação..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-slate-900"
                  />
                </div>

                {/* Botões do Modal */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg cursor-pointer transition shadow-sm"
                  >
                    {editingEntry ? 'Salvar Alterações' : 'Criar Lançamento'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

