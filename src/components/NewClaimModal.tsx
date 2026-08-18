import React, { useState } from 'react';
import { Claim, Person, Vehicle, ClaimStatus, PriorityType } from '../types';

interface NewClaimModalProps {
  people: Person[];
  vehicles: Vehicle[];
  claim?: Claim;
  onClose: () => void;
  onSaveClaim: (claim: Claim) => void;
  onUpdateClaim?: (id: string, data: Partial<Claim>) => void;
}

export const NewClaimModal: React.FC<NewClaimModalProps> = ({
  people,
  vehicles,
  claim,
  onClose,
  onSaveClaim,
  onUpdateClaim,
}) => {
  const [claimNumber] = useState(claim ? claim.claimNumber : `SIN-2026-${Math.floor(10000 + Math.random() * 90000)}`);
  const [protocol] = useState(claim ? claim.protocol : `PROT-2026-${Math.floor(100000 + Math.random() * 900000)}`);
  const [occurrenceType, setOccurrenceType] = useState(claim ? claim.occurrenceType : 'Colisão Traseira com Avarias');
  const [date, setDate] = useState(claim ? claim.date : new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(claim ? claim.time : '14:30');
  const [location, setLocation] = useState(claim ? claim.location : 'BR-116, km 270');
  const [city, setCity] = useState(claim ? claim.city : 'Gravataí');
  const [state, setState] = useState(claim ? claim.state : 'RS');
  const [vehiclePlate, setVehiclePlate] = useState(claim ? claim.vehiclePlate : (vehicles[0]?.plate || 'JCO8C10'));
  const [driverName, setDriverName] = useState(claim ? claim.driverName : (people[0]?.name || 'ANDREIA MERCEDES ROCHA DE ARAUJO'));
  const [priority, setPriority] = useState<PriorityType>(claim ? claim.priority : 'Alta');
  const [status, setStatus] = useState<ClaimStatus>(claim ? claim.status : 'Em análise');
  const [estimatedCost, setEstimatedCost] = useState<number>(claim ? claim.estimatedCost : 3500);
  const [insurer, setInsurer] = useState(claim ? (claim.insurer || '') : 'Porto Seguro Cia de Seguros');
  const [policyNumber, setPolicyNumber] = useState(claim ? (claim.policyNumber || '') : 'AP-99201928-01');
  const [boNumber, setBoNumber] = useState(claim ? (claim.boNumber || '') : 'BO-RS-48912/2026');
  const [description, setDescription] = useState(
    claim
      ? claim.description
      : 'Ocorrência com avarias materiais no veículo durante trajeto operacional. Condutor ciente dos fatos.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedVehicle = vehicles.find((v) => v.plate === vehiclePlate);
    const selectedPerson = people.find((p) => p.name === driverName);

    if (claim && onUpdateClaim) {
      onUpdateClaim(claim.id, {
        status,
        priority,
        occurrenceType,
        date,
        time,
        location,
        city,
        state,
        description,
        vehicleId: selectedVehicle?.id || claim.vehicleId,
        vehiclePlate,
        vehicleModel: selectedVehicle ? `${selectedVehicle.model} (Prefixo ${selectedVehicle.prefix})` : vehiclePlate,
        driverId: selectedPerson?.id || claim.driverId,
        driverName,
        insurer,
        policyNumber,
        boNumber,
        estimatedCost: Number(estimatedCost) || 0,
        approvedCost: Number(estimatedCost) || 0,
        updatedAt: new Date().toISOString(),
      });
    } else {
      const newClaim: Claim = {
        id: `claim-${Date.now()}`,
        claimNumber,
        protocol,
        status,
        priority,
        occurrenceType,
        date,
        time,
        location,
        city,
        state,
        description,
        vehicleId: selectedVehicle?.id,
        vehiclePlate,
        vehicleModel: selectedVehicle ? `${selectedVehicle.model} (Prefixo ${selectedVehicle.prefix})` : vehiclePlate,
        driverId: selectedPerson?.id,
        driverName,
        insurer,
        policyNumber,
        boNumber,
        assignedUser: 'Carlos Pinho',
        estimatedCost: Number(estimatedCost) || 0,
        approvedCost: Number(estimatedCost) || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: 'Cadastrado no novo portal React Trans Pinho.',
      };

      onSaveClaim(newClaim);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full my-8 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm">
              <i className={claim ? "fa-solid fa-pen-to-square" : "fa-solid fa-folder-plus"}></i>
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                {claim ? `Editar Sinistro ${claim.claimNumber}` : 'Cadastrar Novo Sinistro / Ocorrência'}
              </h3>
              <span className="text-[10px] text-amber-400">
                {claimNumber} • {protocol}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <i className="fa-solid fa-xmark text-base"></i>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[75vh] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo de Ocorrência */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Tipo de Ocorrência *
              </label>
              <select
                value={occurrenceType}
                onChange={(e) => setOccurrenceType(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              >
                <option value="Colisão Traseira com Avarias">Colisão Traseira com Avarias</option>
                <option value="Colisão Lateral / Cruzamento">Colisão Lateral / Cruzamento</option>
                <option value="Infração por Velocidade + NIC Duplicada">Infração por Velocidade + NIC Duplicada</option>
                <option value="Estacionamento Proibido">Estacionamento Proibido</option>
                <option value="Avaria em Manobra de Pátio">Avaria em Manobra de Pátio</option>
                <option value="Dano em Pneu / Roda / Suspensão">Dano em Pneu / Roda / Suspensão</option>
                <option value="Quebra Mecânica / Guincho">Quebra Mecânica / Guincho</option>
              </select>
            </div>

            {/* Veículo / Prefixo */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Veículo & Prefixo Trans Pinho *
              </label>
              <select
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.plate}>
                    {v.plate} • Prefixo {v.prefix} ({v.model})
                  </option>
                ))}
              </select>
            </div>

            {/* Condutor */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Condutor Responsável *
              </label>
              <select
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              >
                {people.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} ({p.docNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Prioridade & Status */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Prioridade
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityType)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                  <option value="Crítica">Crítica</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ClaimStatus)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                >
                  <option value="Novo">Novo</option>
                  <option value="Em análise">Em análise</option>
                  <option value="Aguardando documentos">Aguardando documentos</option>
                  <option value="Em reparo">Em reparo</option>
                  <option value="Resolvido">Resolvido</option>
                </select>
              </div>
            </div>

            {/* Data e Hora */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Data do Sinistro
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Horário
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Local */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Local / Endereço da Ocorrência
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
              />
            </div>

            {/* Custo Estimado */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Prejuízo Estimado (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-bold text-slate-900"
              />
            </div>

            {/* Boletim de Ocorrência */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Nº Boletim de Ocorrência (B.O.)
              </label>
              <input
                type="text"
                value={boNumber}
                onChange={(e) => setBoNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Descrição Detalhada */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Descrição dos Danos & Dinâmica dos Fatos
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            ></textarea>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-6 py-2.5 rounded-lg shadow-sm transition active:scale-95 flex items-center gap-2"
            >
              <i className="fa-solid fa-check"></i>
              <span>{claim ? 'Salvar Alterações' : 'Salvar Sinistro'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
