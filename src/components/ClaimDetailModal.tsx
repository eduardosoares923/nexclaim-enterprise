import React, { useState } from 'react';
import { Claim, Person, Vehicle, Term } from '../types';

interface ClaimDetailModalProps {
  claim: Claim;
  people: Person[];
  vehicles: Vehicle[];
  terms: Term[];
  onClose: () => void;
  onOpenTermGenerator: (claim: Claim) => void;
}

export const ClaimDetailModal: React.FC<ClaimDetailModalProps> = ({
  claim,
  people,
  vehicles,
  terms,
  onClose,
  onOpenTermGenerator,
}) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'avarias' | 'termos' | 'documentos'>('geral');

  const relatedTerms = terms.filter((t) => t.claimId === claim.id);
  const matchedVehicle = vehicles.find((v) => v.plate === claim.vehiclePlate);
  const matchedDriver = people.find((p) => p.name === claim.driverName);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full my-8 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header */}
        <div className="print:hidden p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-base shadow-sm">
              <i className="fa-solid fa-folder-closed"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white tracking-tight">{claim.claimNumber}</h3>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                  {claim.protocol}
                </span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase border ${
                    claim.priority === 'Alta' || claim.priority === 'Crítica'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  }`}
                >
                  Prioridade {claim.priority}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{claim.occurrenceType}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => onOpenTermGenerator(claim)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <i className="fa-solid fa-wand-magic-sparkles"></i>
              <span>Emitir Termo</span>
            </button>
            <button
              onClick={() => window.print()}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 border border-slate-700 transition"
            >
              <i className="fa-solid fa-print"></i>
              <span>Dossiê PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
            >
              <i className="fa-solid fa-xmark text-base"></i>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="print:hidden flex border-b border-slate-200 bg-slate-50 px-6 text-xs font-bold gap-6">
          <button
            onClick={() => setActiveTab('geral')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'geral'
                ? 'border-amber-500 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Visão Geral & Veículo
          </button>
          <button
            onClick={() => setActiveTab('avarias')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'avarias'
                ? 'border-amber-500 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Descrição das Avarias & B.O.
          </button>
          <button
            onClick={() => setActiveTab('termos')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'termos'
                ? 'border-amber-500 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>Termos Emitidos</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 text-amber-900">
              {relatedTerms.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('documentos')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'documentos'
                ? 'border-amber-500 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Fotos & Anexos
          </button>
        </div>

        {/* Modal Tab Content */}
        <div className="trans-pinho-doc p-6 overflow-y-auto max-h-[65vh] space-y-6">
          {activeTab === 'geral' && (
            <div className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Prejuízo Estimado</span>
                  <p className="text-base font-black text-slate-900 mt-1">
                    {formatCurrency(claim.estimatedCost)}
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Status do Dossiê</span>
                  <p className="text-xs font-bold text-blue-700 mt-1">{claim.status}</p>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Data & Hora</span>
                  <p className="text-xs font-bold text-slate-800 mt-1">
                    {claim.date} às {claim.time}
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Responsável</span>
                  <p className="text-xs font-bold text-slate-800 mt-1">{claim.assignedUser}</p>
                </div>
              </div>

              {/* Vehicle & Driver Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <i className="fa-solid fa-truck-front text-amber-500"></i> Veículo da Frota
                  </h4>
                  <div className="text-xs space-y-1">
                    <p>
                      <strong>Placa:</strong> <span className="font-mono font-bold text-slate-900">{claim.vehiclePlate}</span>
                    </p>
                    <p>
                      <strong>Prefixo Trans Pinho:</strong>{' '}
                      <span className="font-bold text-amber-600">{matchedVehicle?.prefix || claim.vehiclePrefix || 'Não informado'}</span>
                    </p>
                    <p>
                      <strong>Modelo:</strong> {claim.vehicleModel}
                    </p>
                    <p>
                      <strong>Renavam:</strong> {matchedVehicle?.renavam || 'Não informado'}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <i className="fa-solid fa-user-tie text-amber-500"></i> Condutor Envolvido
                  </h4>
                  <div className="text-xs space-y-1">
                    <p>
                      <strong>Nome:</strong> <span className="font-bold text-slate-900">{claim.driverName}</span>
                    </p>
                    <p>
                      <strong>CPF / Doc:</strong> {matchedDriver?.docNumber || 'Não informado'}
                    </p>
                    <p>
                      <strong>Telefone:</strong> {matchedDriver?.phone || 'Não informado'}
                    </p>
                    <p>
                      <strong>Email:</strong> {matchedDriver?.email || 'Não informado'}
                    </p>
                    {claim.supervisorName && (
                      <p>
                        <strong>Supervisor Responsável:</strong> {claim.supervisorName}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Seção: Dados do Terceiro Envolvido & Responsabilidade */}
              {Boolean(claim.thirdPartyVehicleDescription || claim.thirdPartyPlate || claim.thirdPartyDocument || claim.atFault || claim.paymentDirection || claim.thirdPartyRepairCost || claim.ownVehicleRepairCost || claim.totalValue) && (
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <i className="fa-solid fa-car-burst text-blue-600"></i> Dados do Terceiro Envolvido & Responsabilidade
                    </span>
                    {claim.atFault && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                        Culpado: {claim.atFault}
                      </span>
                    )}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    {claim.thirdPartyVehicleDescription && (
                      <div>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase">Veículo do Terceiro</span>
                        <p className="font-bold text-slate-900">{claim.thirdPartyVehicleDescription}</p>
                      </div>
                    )}
                    {claim.thirdPartyPlate && (
                      <div>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase">Placa do Terceiro</span>
                        <p className="font-mono font-bold text-slate-900">{claim.thirdPartyPlate}</p>
                      </div>
                    )}
                    {claim.thirdPartyDocument && (
                      <div>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase">CPF / Doc do Terceiro</span>
                        <p className="font-semibold text-slate-800">{claim.thirdPartyDocument}</p>
                      </div>
                    )}
                    {claim.paymentDirection && (
                      <div>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase">Direção do Pagamento</span>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          claim.paymentDirection === 'Pagar' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {claim.paymentDirection}
                        </span>
                      </div>
                    )}
                    {claim.thirdPartyRepairCost !== undefined && claim.thirdPartyRepairCost !== null && (
                      <div>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase">Custo do Terceiro</span>
                        <p className="font-bold text-slate-900">{formatCurrency(claim.thirdPartyRepairCost)}</p>
                      </div>
                    )}
                    {claim.ownVehicleRepairCost !== undefined && claim.ownVehicleRepairCost !== null && (
                      <div>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase">Custo do Nosso Veículo</span>
                        <p className="font-bold text-slate-900">{formatCurrency(claim.ownVehicleRepairCost)}</p>
                      </div>
                    )}
                    {claim.totalValue !== undefined && claim.totalValue !== null && (
                      <div>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase">Valor Total</span>
                        <p className="font-black text-blue-950">{formatCurrency(claim.totalValue)}</p>
                      </div>
                    )}
                    {claim.chargeAmount !== undefined && claim.chargeAmount !== null && (
                      <div>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase">Quanto Cobrar</span>
                        <p className="font-bold text-slate-900">{formatCurrency(claim.chargeAmount)}</p>
                      </div>
                    )}
                    {claim.firstDiscountMonth && (
                      <div>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase">Mês 1º Desconto</span>
                        <p className="font-semibold text-slate-800">{claim.firstDiscountMonth}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'avarias' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">Dinâmica dos Fatos & Descrição da Ocorrência</h4>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{claim.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Localização Exata</span>
                  <p className="font-bold text-slate-800">{claim.location}</p>
                  <p className="text-slate-500">
                    {claim.city} - {claim.state}
                  </p>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Boletim de Ocorrência & Seguro</span>
                  <p className="font-bold text-slate-800">B.O.: {claim.boNumber || 'BO-RS-48912/2026'}</p>
                  <p className="text-slate-500">
                    {claim.insurer} (Apólice: {claim.policyNumber})
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'termos' && (
            <div className="space-y-4">
              {relatedTerms.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-3">
                  <p className="text-xs text-slate-500">Nenhum termo vinculado a este sinistro até o momento.</p>
                  <button
                    onClick={() => onOpenTermGenerator(claim)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition"
                  >
                    <i className="fa-solid fa-wand-magic-sparkles mr-1"></i> Emitir Termo de Responsabilidade Agora
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {relatedTerms.map((t) => (
                    <div key={t.id} className="p-4 hover:bg-slate-50 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{t.title}</h4>
                        <p className="text-[11px] text-slate-500">
                          {t.involvedPerson} • {t.date} • Status: <strong>{t.status}</strong>
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'documentos' && (
            <div className="space-y-4">
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
                <i className="fa-solid fa-cloud-arrow-up text-3xl text-slate-400"></i>
                <p className="text-xs font-bold text-slate-700">Galeria de Mídias & Evidências do Sinistro</p>
                <p className="text-[11px] text-slate-400">
                  Fotos das avarias, comprovantes e cópia do Boletim de Ocorrência sincronizados com o Firebase Storage.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
