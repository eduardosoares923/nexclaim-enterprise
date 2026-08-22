import React, { useState } from 'react';
import { Term, Claim, Person, Vehicle, DocumentTemplate, RoleType } from '../types';
import { formatarDataBr } from '../utils/dateUtils';
import { usePermissions } from '../hooks/usePermissions';

interface TermsViewProps {
  terms: Term[];
  claims: Claim[];
  people: Person[];
  vehicles: Vehicle[];
  templates: DocumentTemplate[];
  onOpenTermGenerator: (claim?: Claim, templateName?: string) => void;
  onDeleteTerm?: (id: string) => void;
  userRole?: RoleType;
  userEmail?: string;
}

export const TermsView: React.FC<TermsViewProps> = ({
  terms,
  claims,
  people,
  vehicles,
  templates,
  onOpenTermGenerator,
  onDeleteTerm,
  userRole,
  userEmail,
}) => {
  const permissoes = usePermissions(userRole, userEmail);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewingTerm, setViewingTerm] = useState<Term | null>(null);

  // Template Quick-Launch cards (5 Modelos Oficiais Trans Pinho)
  const officialModels = [
    { title: 'Termo de Responsabilidade (Valores Descontados e Assumindo os Pontos)', icon: 'fa-shield-halved', category: 'Responsabilidade' },
    { title: 'Termo de Responsabilidade (Empresa Paga a Multa)', icon: 'fa-building-columns', category: 'Responsabilidade' },
    { title: 'Termo de Ciência e Autorização de Desconto em Folha de Pagamento', icon: 'fa-file-invoice-dollar', category: 'Ciência' },
    { title: 'Termo de Quitação (Reparo Custeado pela Empresa)', icon: 'fa-wrench', category: 'Declaração' },
    { title: 'Termo de Quitação (Pagamento via Pix pelo Condutor)', icon: 'fa-money-bill-transfer', category: 'Declaração' },
  ];

  const filteredTerms = terms.filter((term) => {
    const matchesSearch =
      searchTerm === '' ||
      term.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.involvedPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (term.claimId && term.claimId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = !selectedType || term.type === selectedType;
    const matchesStatus = !selectedStatus || term.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 p-4 sm:p-6 rounded-2xl shadow-sm text-white">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Automação Trans Pinho • Jurídico & Frotas
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <i className="fa-solid fa-file-signature text-amber-400"></i>
            Emissão Oficial de Termos & Declarações
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Geração de termos de responsabilidade, confissão de dívida, ciência de avarias e autorização de desconto em folha com preenchimento dinâmico de dados da frota e condutores.
          </p>
        </div>

        {permissoes.podeCriar && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenTermGenerator(claims[0])}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-xl shadow-md transition"
            >
              <i className="fa-solid fa-wand-magic-sparkles"></i>
              <span>Emitir Termo Inteligente</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Launch Template Cards */}
      {permissoes.podeCriar && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-layer-group text-amber-500"></i>
              Modelos Rápidos de Documentos
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Clique para emitir direto</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {officialModels.map((m, idx) => (
              <div
                key={idx}
                onClick={() => onOpenTermGenerator(claims[0], m.title)}
                className="group p-3.5 bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-400/80 rounded-xl cursor-pointer transition-all duration-150 flex items-start gap-3 shadow-2xs hover:shadow-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 group-hover:bg-amber-500 text-amber-600 group-hover:text-slate-950 flex items-center justify-center text-sm font-bold transition">
                  <i className={`fa-solid ${m.icon}`}></i>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-amber-950 leading-snug truncate">
                    {m.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 group-hover:text-amber-700/80 font-medium">
                    {m.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por condutor, título, sinistro..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/50 bg-slate-50 focus:bg-white transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          >
            <option value="">Todos os Tipos</option>
            <option value="Responsabilidade">Responsabilidade</option>
            <option value="Ciência">Ciência & Desconto</option>
            <option value="Entrega">Entrega & Recebimento</option>
            <option value="Declaração">Declarações</option>
            <option value="Acordo">Acordo</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          >
            <option value="">Todos os Status</option>
            <option value="Assinado">Assinado</option>
            <option value="Gerado">Gerado</option>
            <option value="Rascunho">Rascunho</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Terms Table / Feed */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm">Histórico de Termos Oficiais Emitidos</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              {filteredTerms.length} termo(s)
            </span>
          </div>
        </div>

        {filteredTerms.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
              <i className="fa-solid fa-folder-open"></i>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">Nenhum termo encontrado</p>
              <p className="text-[11px] text-slate-400">
                {searchTerm || selectedType || selectedStatus
                  ? 'Tente ajustar os filtros de busca acima.'
                  : 'Gere o primeiro termo oficial utilizando o botão Emitir Termo Inteligente.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTerms.map((term) => (
              <div
                key={term.id}
                className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm tracking-tight truncate">
                      {term.title}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      {term.type}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                        term.status === 'Assinado'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : term.status === 'Gerado'
                          ? 'bg-blue-50 text-blue-700 border-blue-300'
                          : 'bg-slate-100 text-slate-600 border-slate-300'
                      }`}
                    >
                      {term.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <i className="fa-solid fa-user text-[10px] text-amber-600"></i>
                      <strong>{term.involvedPerson}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <i className="fa-solid fa-calendar text-[10px] text-slate-400"></i>
                      {formatarDataBr(term.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <i className="fa-solid fa-user-shield text-[10px] text-slate-400"></i>
                      Responsável: {term.responsible}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setViewingTerm(term)}
                    className="btn bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 shadow-2xs transition"
                  >
                    <i className="fa-solid fa-eye text-amber-600"></i>
                    <span>Ver Documento</span>
                  </button>
                  <button
                    onClick={() => {
                      setViewingTerm(term);
                      setTimeout(() => window.print(), 200);
                    }}
                    className="btn bg-slate-900 hover:bg-slate-800 text-white text-xs px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 shadow-2xs transition"
                  >
                    <i className="fa-solid fa-print text-amber-400"></i>
                    <span>Imprimir / PDF</span>
                  </button>
                  {onDeleteTerm && permissoes.podeEditarOuExcluir(term.createdBy) === true && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Tem certeza que deseja excluir o termo "${term.title}"?`)) {
                          onDeleteTerm(term.id);
                        }
                      }}
                      className="btn bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs p-2 rounded-lg font-bold transition"
                      title="Excluir Termo"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document View / Print Modal */}
      {viewingTerm && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:static print:p-0 print:bg-white print:overflow-visible">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-3xl w-full my-8 flex flex-col overflow-hidden print:overflow-visible print:border-none print:shadow-none print:my-0 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="print:hidden p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shrink-0">
                  TP
                </div>
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                    Visualizador de Documento Oficial
                  </h3>
                  <span className="text-[10px] text-amber-400">{viewingTerm.title}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <i className="fa-solid fa-print"></i> Imprimir
                </button>
                <button
                  onClick={() => setViewingTerm(null)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                >
                  <i className="fa-solid fa-xmark text-base"></i>
                </button>
              </div>
            </div>

            {/* Document Sheet (Standard Trans Pinho Format) */}
            <div className="trans-pinho-doc p-4 sm:p-8 md:p-12 overflow-y-auto max-h-[75vh] bg-white print:p-0 print:max-h-none font-serif text-slate-900 leading-relaxed">
              {/* Content Body */}
              <div className="text-xs sm:text-sm font-serif text-slate-900 leading-relaxed">
                {(() => {
                  const lines = (viewingTerm.content || '').split('\n');
                  return lines.map((line, idx) => {
                    const trimmed = line.trim();

                    // Título principal (primeira linha, ex: "TERMO DE RESPONSABILIDADE")
                    if (idx === 0 && trimmed === trimmed.toUpperCase() && trimmed.length > 5) {
                      return (
                        <h2
                          key={idx}
                          className="text-center font-black text-sm sm:text-base uppercase tracking-wide mb-4 pb-2 border-b-2 border-slate-900"
                        >
                          {trimmed}
                        </h2>
                      );
                    }

                    // Cabeçalho de seção numerada, ex: "1. IDENTIFICAÇÃO DO CONDUTOR" ou "I – Da ciência"
                    if (/^\d+\.\s+[A-ZÀ-Ú\s]+$/.test(trimmed) || /^[IVX]+\s*[-–]\s+/.test(trimmed)) {
                      return (
                        <h3
                          key={idx}
                          className="font-black text-xs sm:text-sm uppercase mt-5 mb-2 pb-1 border-b border-slate-400"
                        >
                          {trimmed}
                        </h3>
                      );
                    }

                    // Linha de assinatura (sublinhado)
                    if (/^_{10,}$/.test(trimmed)) {
                      return <div key={idx} className="border-t border-slate-900 mt-8 pt-1" />;
                    }

                    // Linha vazia
                    if (trimmed === '') {
                      return <div key={idx} className="h-3" />;
                    }

                    // Parágrafo normal
                    return (
                      <p key={idx} className="text-justify mb-2">
                        {line}
                      </p>
                    );
                  });
                })()}
              </div>

              {/* Official Trans Pinho Footer (Mover de cima para rodapé) */}
              <div className="text-center border-t-2 border-slate-900 pt-4 mt-8">
                <h1 className="text-sm sm:text-base font-black uppercase tracking-tight text-slate-950">
                  JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)
                </h1>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Rua Florida, 116 – Nossa Chácara – Gravataí/ RS
                </p>
                <p className="text-[11px] text-slate-600">
                  Telefone: (051) 3047-0212 / (051) 98266-0028 • E-mail: Transpinho@transpinho.com
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TermsView;
