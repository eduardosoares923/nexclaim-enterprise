import React from 'react';
import { Link } from 'react-router-dom';
import { Claim, Fine, Term, Vehicle, Person, DocumentTemplate } from '../types';
import { formatarDataBr } from '../utils/dateUtils';

interface DashboardViewProps {
  claims: Claim[];
  fines: Fine[];
  terms: Term[];
  vehicles: Vehicle[];
  people: Person[];
  templates: DocumentTemplate[];
  onOpenTermGenerator: (claim: Claim) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  claims,
  fines,
  terms,
  vehicles,
  people,
  templates,
  onOpenTermGenerator,
}) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const totalClaimCost = claims.reduce((acc, c) => acc + (c.estimatedCost || 0), 0);
  const totalFineAmount = fines.reduce((acc, f) => acc + (f.amount || 0), 0);
  const signedTermsCount = terms.filter((t) => t.status === 'Assinado').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 p-6 rounded-2xl shadow-sm text-white">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Painel Corporativo • Trans Pinho Gravataí/RS
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <i className="fa-solid fa-chart-pie text-amber-400"></i>
            Gestão Integrada de Sinistros & Frotas
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Visão consolidada em tempo real de sinistros, infrações com NIC, termos de responsabilidade com desconto em folha e ordens de serviço.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenTermGenerator(claims[0])}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-xl shadow-md transition"
          >
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            <span>Emitir Termo Inteligente</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sinistros */}
        <Link
          to="/sinistros"
          className="group bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400 group-hover:text-amber-700 transition">
              Sinistros Ativos
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
              <i className="fa-solid fa-folder-closed"></i>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{claims.length}</span>
            <span className="text-[11px] font-semibold text-blue-600">{formatCurrency(totalClaimCost)}</span>
          </div>
        </Link>

        {/* Multas & NIC */}
        <Link
          to="/multas"
          className="group bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400 group-hover:text-amber-700 transition">
              Multas & NIC
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-xs">
              <i className="fa-solid fa-file-invoice-dollar"></i>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{fines.length}</span>
            <span className="text-[11px] font-semibold text-rose-600">{formatCurrency(totalFineAmount)}</span>
          </div>
        </Link>

        {/* Termos Oficiais */}
        <Link
          to="/termos"
          className="group bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400 group-hover:text-amber-700 transition">
              Termos Firmados
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
              <i className="fa-solid fa-file-pen"></i>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{terms.length}</span>
            <span className="text-[11px] font-semibold text-emerald-600">{signedTermsCount} assinados</span>
          </div>
        </Link>

        {/* Veículos & Prefixos */}
        <Link
          to="/frota"
          className="group bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400 group-hover:text-amber-700 transition">
              Frota Trans Pinho
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs">
              <i className="fa-solid fa-truck-front"></i>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{vehicles.length}</span>
            <span className="text-[11px] font-semibold text-amber-700">{people.length} condutores</span>
          </div>
        </Link>
      </div>

      {/* Quick Access Matrix */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <i className="fa-solid fa-compass text-amber-500"></i>
          Acesso Rápido aos Módulos
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          <Link
            to="/sinistros"
            className="p-3.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-400 rounded-xl flex flex-col items-center text-center gap-2 transition"
          >
            <i className="fa-solid fa-folder-closed text-amber-600 text-lg"></i>
            <span className="font-bold text-slate-800 text-xs">Sinistros</span>
          </Link>
          <Link
            to="/termos"
            className="p-3.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-400 rounded-xl flex flex-col items-center text-center gap-2 transition"
          >
            <i className="fa-solid fa-file-pen text-amber-600 text-lg"></i>
            <span className="font-bold text-slate-800 text-xs">Emitir Termos</span>
          </Link>
          <Link
            to="/multas"
            className="p-3.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-400 rounded-xl flex flex-col items-center text-center gap-2 transition"
          >
            <i className="fa-solid fa-file-invoice-dollar text-amber-600 text-lg"></i>
            <span className="font-bold text-slate-800 text-xs">Multas & NIC</span>
          </Link>
          <Link
            to="/os"
            className="p-3.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-400 rounded-xl flex flex-col items-center text-center gap-2 transition"
          >
            <i className="fa-solid fa-wrench text-amber-600 text-lg"></i>
            <span className="font-bold text-slate-800 text-xs">OS Chapeação</span>
          </Link>
          <Link
            to="/condutores"
            className="p-3.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-400 rounded-xl flex flex-col items-center text-center gap-2 transition"
          >
            <i className="fa-solid fa-users text-amber-600 text-lg"></i>
            <span className="font-bold text-slate-800 text-xs">Condutores</span>
          </Link>
          <Link
            to="/templates"
            className="p-3.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-400 rounded-xl flex flex-col items-center text-center gap-2 transition"
          >
            <i className="fa-solid fa-sliders text-amber-600 text-lg"></i>
            <span className="font-bold text-slate-800 text-xs">Templates</span>
          </Link>
        </div>
      </div>

      {/* Tables Row: Recent Claims & Recent Terms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Claims */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-folder-open text-amber-500"></i>
              Últimos Sinistros Cadastrados
            </h3>
            <Link to="/sinistros" className="text-xs font-bold text-amber-600 hover:underline">
              Ver Todos →
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {claims.slice(0, 3).map((c) => (
              <div key={c.id} className="p-4 hover:bg-slate-50 transition flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{c.claimNumber} • {c.vehiclePlate}</div>
                  <div className="text-[11px] text-slate-500">{c.occurrenceType}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Condutor: {c.driverName}</div>
                </div>
                <div className="text-right">
                  <span className="font-black text-slate-900">{formatCurrency(c.estimatedCost)}</span>
                  <div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      {c.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Terms */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-file-signature text-amber-500"></i>
              Termos Emitidos Recentemente
            </h3>
            <Link to="/termos" className="text-xs font-bold text-amber-600 hover:underline">
              Ver Todos →
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {terms.slice(0, 3).map((t) => (
              <div key={t.id} className="p-4 hover:bg-slate-50 transition flex items-center justify-between text-xs">
                <div className="min-w-0 flex-1 pr-2">
                  <div className="font-bold text-slate-900 truncate">{t.title}</div>
                  <div className="text-[11px] text-slate-500">Condutor: {t.involvedPerson} • {formatarDataBr(t.date)}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 whitespace-nowrap">
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
