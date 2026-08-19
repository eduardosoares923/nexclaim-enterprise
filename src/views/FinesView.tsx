import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Fine, Vehicle, Person, FineStatus } from '../types';

interface FinesViewProps {
  fines: Fine[];
  vehicles: Vehicle[];
  people: Person[];
  onSaveFine: (fine: Fine) => void;
  onUpdateFineStatus: (id: string, newStatus: FineStatus) => void;
  onDeleteFine?: (id: string) => void;
  onOpenTermForFine?: (fine: Fine) => void;
}

export const FinesView: React.FC<FinesViewProps> = ({
  fines,
  vehicles,
  people,
  onSaveFine,
  onUpdateFineStatus,
  onDeleteFine,
  onOpenTermForFine,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showNewFineModal, setShowNewFineModal] = useState(false);

  // New fine form state
  const [infractionAuto, setInfractionAuto] = useState('');
  const [infractionCode, setInfractionCode] = useState('745-5-0');
  const [vehiclePlate, setVehiclePlate] = useState(vehicles[0]?.plate || 'JCO8C10');
  const [driverName, setDriverName] = useState(people[0]?.name || 'ANDREIA MERCEDES ROCHA DE ARAUJO');
  const [description, setDescription] = useState('TRANSITAR EM VELOCIDADE SUPERIOR A MAXIMA PERMITIDA EM ATE 20%');
  const [amount, setAmount] = useState<number>(130.16);
  const [points, setPoints] = useState<number>(4);
  const [dueDate, setDueDate] = useState('2026-07-20');
  const [isNic, setIsNic] = useState(false);

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
    const finalDescription = isNic ? `${description} (COM NÃO INDICAÇÃO - NIC DUPLICADA)` : description;

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
    setShowNewFineModal(false);
    setInfractionAuto('');
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
            onClick={() => setShowNewFineModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition active:scale-95"
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
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
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
                      {fine.status === 'Pendente' ? (
                        <button
                          onClick={() => onUpdateFineStatus(fine.id, 'Paga')}
                          className="btn bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] px-2.5 py-1 rounded font-bold shadow-2xs transition"
                          title="Marcar como Paga"
                        >
                          <i className="fa-solid fa-check mr-1"></i> Pagar
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateFineStatus(fine.id, 'Pendente')}
                          className="btn bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] px-2.5 py-1 rounded font-bold transition"
                          title="Reabrir como Pendente"
                        >
                          Reabrir
                        </button>
                      )}
                      {onDeleteFine && (
                        <button
                          onClick={() => onDeleteFine(fine.id)}
                          className="btn bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] px-2 py-1 rounded font-bold transition border border-rose-200"
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

      {/* New Fine Modal */}
      {showNewFineModal && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-file-invoice-dollar text-amber-500"></i>
                Cadastrar Infração de Trânsito
              </h3>
              <button
                onClick={() => setShowNewFineModal(false)}
                className="text-slate-400 hover:text-slate-700 text-base"
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
                  <select
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.plate}>
                        {v.plate} ({v.prefix})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Condutor *</label>
                  <select
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                  >
                    {people.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
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
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <label htmlFor="nicCheckbox" className="text-xs text-amber-950 font-bold cursor-pointer select-none">
                  Não Indicação de Condutor (NIC - Valor em Dobro: {formatCurrency(amount * 2)})
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewFineModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-5 py-2 rounded-lg shadow-sm"
                >
                  Salvar Infração
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

export default FinesView;
