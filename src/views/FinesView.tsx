import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Fine, Vehicle, Person, FineStatus } from '../types';

interface FinesViewProps {
  fines: Fine[];
  vehicles: Vehicle[];
  people: Person[];
  onSaveFine: (fine: Fine) => void;
  onUpdateFineStatus: (id: string, newStatus: FineStatus) => void;
  onUpdateFine?: (id: string, data: Partial<Fine>) => void;
  onDeleteFine?: (id: string) => void;
  onOpenTermForFine?: (fine: Fine) => void;
}

export const FinesView: React.FC<FinesViewProps> = ({
  fines,
  vehicles,
  people,
  onSaveFine,
  onUpdateFineStatus,
  onUpdateFine,
  onDeleteFine,
  onOpenTermForFine,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showNewFineModal, setShowNewFineModal] = useState(false);
  const [editingFine, setEditingFine] = useState<Fine | null>(null);
  const [viewingFine, setViewingFine] = useState<Fine | null>(null);

  // New fine form state
  const [infractionAuto, setInfractionAuto] = useState('');
  const [infractionCode, setInfractionCode] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);
  const [dueDate, setDueDate] = useState('');
  const [isNic, setIsNic] = useState(false);

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
      setIsNic(editingFine.description?.includes('(COM NÃO INDICAÇÃO - NIC DUPLICADA)') || false);
    }
  }, [editingFine]);

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
    setIsNic(false);
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

    return matchesSearch && matchesStatus;
  });

  const handleCreateFine = (e: React.FormEvent) => {
    e.preventDefault();

    const finalAmount = isNic ? amount * 2 : amount;
    const finalDescription = isNic
      ? (description.includes('(COM NÃO INDICAÇÃO - NIC DUPLICADA)') ? description : `${description} (COM NÃO INDICAÇÃO - NIC DUPLICADA)`)
      : description.replace(' (COM NÃO INDICAÇÃO - NIC DUPLICADA)', '');

    if (editingFine) {
      const dadosAtualizados: Partial<Fine> = {
        infractionAuto,
        infractionCode,
        vehiclePlate,
        driverName,
        description: finalDescription,
        amount: finalAmount,
        points: isNic ? 0 : points,
        dueDate,
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
        description: finalDescription,
        amount: finalAmount,
        points: isNic ? 0 : points,
        dueDate,
        status: 'Pendente',
      };

      onSaveFine(newFine);
      handleCloseModal();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <span className="badge bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded border border-amber-300 uppercase tracking-wider">
            Gestão de Trânsito • Trans Pinho
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            Controle de Multas, Infrações & NIC
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerenciamento de autos de infração, pontuação de CNH, controle de não indicação (NIC) e quitações.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
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

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Registros de Autos de Infração</h3>
          <span className="text-xs text-slate-500">{filteredFines.length} multa(s) listada(s)</span>
        </div>

        {filteredFines.length === 0 ? (
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
                  <th className="p-3.5">Vencimento</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFines.map((fine) => (
                  <tr key={fine.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-slate-900">{fine.infractionAuto}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{fine.vehiclePlate}</div>
                      <div className="text-[11px] text-slate-500">{fine.driverName}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-800">{fine.infractionCode}</span>
                      <div className="text-[10px] text-slate-500 max-w-[280px] truncate">{fine.description}</div>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(fine.amount)}
                      <div className="text-[10px] text-amber-600 font-semibold">{fine.points} pontos</div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700 whitespace-nowrap">{fine.dueDate}</td>
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
                  <label className="block font-bold text-slate-700 mb-1">Código da Infração</label>
                  <input
                    type="text"
                    placeholder="Ex: 745-5-0"
                    value={infractionCode}
                    onChange={(e) => setInfractionCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Veículo (Placa) *</label>
                  <select
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                    required
                  >
                    <option value="">Selecione o Veículo</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.plate}>
                        {v.plate} ({v.prefix})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Condutor *</label>
                <select
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                  required
                >
                  <option value="">Selecione o Condutor</option>
                  {people.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
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
                  <label className="block font-bold text-slate-700 mb-1">Vencimento</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrição do Enquadramento</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: TRANSITAR EM VELOCIDADE SUPERIOR A MAXIMA PERMITIDA"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                />
              </div>

              {/* NIC Duplicada Checkbox */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                <input
                  type="checkbox"
                  id="nicCheckbox"
                  checked={isNic}
                  onChange={(e) => setIsNic(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                />
                <label htmlFor="nicCheckbox" className="text-xs text-amber-950 font-bold cursor-pointer select-none">
                  Não Indicação de Condutor (NIC - Valor em Dobro: {formatCurrency(amount * 2)})
                </label>
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
                <div><span className="text-slate-400 uppercase font-bold text-[10px] block">Código</span>{viewingFine.infractionCode || '—'}</div>
                <div><span className="text-slate-400 uppercase font-bold text-[10px] block">Placa</span>{viewingFine.vehiclePlate}</div>
                <div><span className="text-slate-400 uppercase font-bold text-[10px] block">Condutor</span>{viewingFine.driverName}</div>
                <div><span className="text-slate-400 uppercase font-bold text-[10px] block">Data</span>{viewingFine.infractionDate || '—'}</div>
                <div><span className="text-slate-400 uppercase font-bold text-[10px] block">Horário</span>{viewingFine.infractionTime || '—'}</div>
                <div><span className="text-slate-400 uppercase font-bold text-[10px] block">Vencimento</span>{viewingFine.dueDate}</div>
                <div><span className="text-slate-400 uppercase font-bold text-[10px] block">Local</span>{viewingFine.location || '—'}</div>
              </div>

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
    </div>
  );
};

export default FinesView;
