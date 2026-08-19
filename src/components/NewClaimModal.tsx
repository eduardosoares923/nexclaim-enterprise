import React, { useState } from 'react';
import { Claim, Person, Vehicle, ClaimStatus, PriorityType } from '../types';
import { InfoTooltip } from './InfoTooltip';
import { Combobox } from './Combobox';
import { normalizarTipoOcorrencia } from '../utils/textNormalization';

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
  const [occurrenceType, setOccurrenceType] = useState(claim ? claim.occurrenceType : '');
  const [date, setDate] = useState(claim ? claim.date : new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(claim ? claim.time : '14:30');
  const [location, setLocation] = useState(claim ? claim.location : 'BR-116, km 270');
  const [city, setCity] = useState(claim ? claim.city : 'Gravataí');
  const [state, setState] = useState(claim ? claim.state : 'RS');
  const [vehiclePlate, setVehiclePlate] = useState(claim ? claim.vehiclePlate : '');
  const [driverName, setDriverName] = useState(claim ? claim.driverName : '');
  const [priority, setPriority] = useState<PriorityType>(claim ? claim.priority : 'Média');
  const [status, setStatus] = useState<ClaimStatus>(claim ? claim.status : 'Em análise');
  const [boNumber, setBoNumber] = useState(claim ? (claim.boNumber || '') : '');
  const [description, setDescription] = useState(claim ? claim.description : '');

  // Custos e Supervisor
  const [ownVehicleRepairCost, setOwnVehicleRepairCost] = useState<string>(claim?.ownVehicleRepairCost?.toString() || '');
  const [supervisorName, setSupervisorName] = useState(claim?.supervisorName || '');
  const [caseDetail, setCaseDetail] = useState(claim?.caseDetail || '');

  // Estados de Terceiro & Responsabilidade
  const [thirdPartyName, setThirdPartyName] = useState(claim?.thirdPartyName || '');
  const [thirdPartyVehicleDescription, setThirdPartyVehicleDescription] = useState(claim?.thirdPartyVehicleDescription || '');
  const [thirdPartyPlate, setThirdPartyPlate] = useState(claim?.thirdPartyPlate || '');
  const [atFault, setAtFault] = useState(claim?.atFault || '');
  const [paymentDirection, setPaymentDirection] = useState<'Pagar' | 'Cobrar' | ''>(claim?.paymentDirection || '');
  const [thirdPartyRepairCost, setThirdPartyRepairCost] = useState<string>(claim?.thirdPartyRepairCost?.toString() || '');
  const [thirdPartyDocument, setThirdPartyDocument] = useState(claim?.thirdPartyDocument || '');

  const valorTotalCalculado = (
    (parseFloat(thirdPartyRepairCost) || 0) + (parseFloat(ownVehicleRepairCost) || 0)
  );

  const parseNum = (val: string) => {
    if (!val || val.trim() === '') return undefined;
    const n = parseFloat(val);
    return isNaN(n) ? undefined : n;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedVehicle = vehiclePlate ? vehicles.find((v) => v.plate.toUpperCase() === vehiclePlate.toUpperCase()) : undefined;
    const selectedPerson = driverName ? people.find((p) => p.name.trim().toUpperCase() === driverName.trim().toUpperCase()) : undefined;

    if (claim && onUpdateClaim) {
      onUpdateClaim(claim.id, {
        status,
        priority,
        occurrenceType: normalizarTipoOcorrencia(occurrenceType),
        date,
        time,
        location,
        city,
        state,
        description,
        vehicleId: selectedVehicle?.id || claim.vehicleId,
        vehiclePlate,
        vehiclePrefix: selectedVehicle?.prefix || claim.vehiclePrefix || '',
        vehicleModel: selectedVehicle ? `${selectedVehicle.model} (Prefixo ${selectedVehicle.prefix})` : vehiclePlate,
        driverId: selectedPerson?.id || claim.driverId,
        driverName,
        boNumber,
        estimatedCost: valorTotalCalculado,
        approvedCost: valorTotalCalculado,
        supervisorName: supervisorName || undefined,
        caseDetail: caseDetail || undefined,
        thirdPartyName: thirdPartyName || undefined,
        thirdPartyVehicleDescription: thirdPartyVehicleDescription || undefined,
        thirdPartyPlate: thirdPartyPlate || undefined,
        thirdPartyDocument: thirdPartyDocument || undefined,
        atFault: atFault || undefined,
        paymentDirection: paymentDirection || undefined,
        thirdPartyRepairCost: parseNum(thirdPartyRepairCost),
        ownVehicleRepairCost: parseNum(ownVehicleRepairCost),
        totalValue: valorTotalCalculado > 0 ? valorTotalCalculado : undefined,
        updatedAt: new Date().toISOString(),
      });
    } else {
      const newClaim: Claim = {
        id: `claim-${Date.now()}`,
        claimNumber,
        protocol,
        status,
        priority,
        occurrenceType: normalizarTipoOcorrencia(occurrenceType),
        date,
        time,
        location,
        city,
        state,
        description,
        vehicleId: selectedVehicle?.id,
        vehiclePlate,
        vehiclePrefix: selectedVehicle?.prefix || '',
        vehicleModel: selectedVehicle ? `${selectedVehicle.model} (Prefixo ${selectedVehicle.prefix})` : vehiclePlate,
        driverId: selectedPerson?.id,
        driverName,
        boNumber,
        assignedUser: 'Carlos Pinho',
        estimatedCost: valorTotalCalculado,
        approvedCost: valorTotalCalculado,
        supervisorName: supervisorName || undefined,
        caseDetail: caseDetail || undefined,
        thirdPartyName: thirdPartyName || undefined,
        thirdPartyVehicleDescription: thirdPartyVehicleDescription || undefined,
        thirdPartyPlate: thirdPartyPlate || undefined,
        thirdPartyDocument: thirdPartyDocument || undefined,
        atFault: atFault || undefined,
        paymentDirection: paymentDirection || undefined,
        thirdPartyRepairCost: parseNum(thirdPartyRepairCost),
        ownVehicleRepairCost: parseNum(ownVehicleRepairCost),
        totalValue: valorTotalCalculado > 0 ? valorTotalCalculado : undefined,
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
                Tipo de Ocorrência
              </label>
              <Combobox
                value={occurrenceType}
                onChange={setOccurrenceType}
                placeholder="Selecione da lista ou digite um novo tipo"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                options={[
                  'Avaria em Manobra de Pátio',
                  'Colisão Lateral / Cruzamento',
                  'Colisão Traseira com Avarias',
                  'Dano em Pneu / Roda / Suspensão',
                  'Estacionamento Proibido',
                  'Infração por Velocidade + NIC Duplicada',
                  'Quebra Mecânica / Guincho',
                ].sort((a, b) => a.localeCompare(b, 'pt-BR')).map((t) => ({ value: t }))}
              />
            </div>

            {/* Veículo / Prefixo */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Veículo & Prefixo Trans Pinho
              </label>
              <Combobox
                value={vehiclePlate}
                onChange={(v) => setVehiclePlate(v.toUpperCase())}
                placeholder="Selecione da lista ou digite a placa"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 uppercase font-mono"
                options={[...vehicles].sort((a, b) => a.plate.localeCompare(b.plate, 'pt-BR')).map((v) => ({
                  value: v.plate,
                  label: `Prefixo ${v.prefix} (${v.model})`,
                }))}
              />
            </div>

            {/* Condutor */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Condutor Responsável
              </label>
              <Combobox
                value={driverName}
                onChange={setDriverName}
                placeholder="Selecione da lista ou digite o nome"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                options={[...people].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')).map((p) => ({
                  value: p.name,
                  label: p.docNumber || '',
                }))}
              />
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

            {/* Detalhamento do Caso */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Detalhamento do Caso
              </label>
              <Combobox
                value={caseDetail}
                onChange={setCaseDetail}
                placeholder="Selecione ou digite"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                options={['Resguardo Próprio', 'Seguro Próprio', 'Seguro do Terceiro', 'Sem Cobertura'].map((v) => ({ value: v }))}
              />
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

            {/* Valor Total (R$) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center">
                Valor Total (R$)
                <InfoTooltip text="Soma automática de Custo do Terceiro + Custo do Nosso Veículo, preenchidos abaixo." />
              </label>
              <input
                type="text"
                readOnly
                value={valorTotalCalculado > 0 ? valorTotalCalculado.toFixed(2).replace('.', ',') : ''}
                placeholder="0,00"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed font-bold"
              />
            </div>

            {/* Custo do Nosso Veículo (R$) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Custo do Nosso Veículo (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={ownVehicleRepairCost}
                onChange={(e) => setOwnVehicleRepairCost(e.target.value)}
                placeholder="0,00"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
              />
            </div>

            {/* Supervisor Responsável */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Supervisor Responsável
              </label>
              <input
                type="text"
                value={supervisorName}
                onChange={(e) => setSupervisorName(e.target.value)}
                placeholder="Nome do supervisor"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
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
                placeholder="Ex: BO-RS-48912/2026"
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
              placeholder="Descreva detalhadamente o ocorrido, avarias e circunstâncias do evento..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            ></textarea>
          </div>

          {/* Seção: Dados do Terceiro Envolvido & Responsabilidade */}
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
            <h4 className="text-xs font-bold uppercase text-slate-600 flex items-center gap-1.5 mb-3">
              <i className="fa-solid fa-car-burst text-amber-500"></i>
              Dados do Terceiro Envolvido & Responsabilidade
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Nome do Responsável Envolvido</label>
                <input
                  type="text"
                  value={thirdPartyName}
                  onChange={(e) => setThirdPartyName(e.target.value)}
                  placeholder="Nome da pessoa envolvida (terceiro)"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Veículo do Terceiro</label>
                <input
                  type="text"
                  value={thirdPartyVehicleDescription}
                  onChange={(e) => setThirdPartyVehicleDescription(e.target.value)}
                  placeholder="Ex: Fiat Palio Prata"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Placa do Terceiro</label>
                <input
                  type="text"
                  value={thirdPartyPlate}
                  onChange={(e) => setThirdPartyPlate(e.target.value.toUpperCase())}
                  placeholder="Ex: ABC1D23"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">CPF / Documento do Terceiro</label>
                <input
                  type="text"
                  value={thirdPartyDocument}
                  onChange={(e) => setThirdPartyDocument(e.target.value)}
                  placeholder="Ex: 000.000.000-00"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Culpado / Responsável</label>
                <select
                  value={atFault}
                  onChange={(e) => setAtFault(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                >
                  <option value="">Selecione</option>
                  <option value="Terceiro">Terceiro</option>
                  <option value="Motorista Trans Pinho">Motorista Trans Pinho</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Direção do Pagamento</label>
                <select
                  value={paymentDirection}
                  onChange={(e) => setPaymentDirection(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                >
                  <option value="">Selecione (Pagar / Cobrar)</option>
                  <option value="Pagar">Pagar</option>
                  <option value="Cobrar">Cobrar</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Custo do Carro do Envolvido (R$)</label>
                <p className="text-[10px] text-slate-400 mb-1">Custo do carro do envolvido (terceiro).</p>
                <input
                  type="number"
                  step="0.01"
                  value={thirdPartyRepairCost}
                  onChange={(e) => setThirdPartyRepairCost(e.target.value)}
                  placeholder="0,00"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                />
              </div>
            </div>
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
