import React, { useState } from 'react';
import { Claim, Person, Vehicle, DocumentTemplate, Term } from '../types';

interface TermGeneratorModalProps {
  claim: Claim;
  people: Person[];
  vehicles: Vehicle[];
  templates: DocumentTemplate[];
  onClose: () => void;
  onGenerateTerm: (term: Term) => void;
}

export const TermGeneratorModal: React.FC<TermGeneratorModalProps> = ({
  claim,
  people,
  vehicles,
  templates,
  onClose,
  onGenerateTerm,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const [selectedDriverName, setSelectedDriverName] = useState<string>(
    claim.driverName || 'ANDREIA MERCEDES ROCHA DE ARAUJO'
  );
  const [customHtmlContent, setCustomHtmlContent] = useState<string>('');

  const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
  const currentDriver = people.find((p) => p.name === selectedDriverName) || people[0];
  const currentVehicle = vehicles.find((v) => v.plate === claim.vehiclePlate) || vehicles[0];

  // Smart Suggestion Logic (Requirements 14 & 16)
  const getSuggestions = () => {
    const recs: string[] = [];
    if (claim.occurrenceType.toLowerCase().includes('velocidade') || claim.occurrenceType.toLowerCase().includes('nic')) {
      recs.push('Termo de Responsabilidade - Multas & NIC Duplicada');
    }
    if (claim.occurrenceType.toLowerCase().includes('estacionamento')) {
      recs.push('Termo de Responsabilidade - Infração Direta');
    }
    if (claim.occurrenceType.toLowerCase().includes('colisão') || claim.estimatedCost > 0) {
      recs.push('Termo de Ciência e Autorização de Desconto em Folha');
    }
    return recs;
  };

  const suggestions = getSuggestions();

  // Dynamic Variable Replacement Engine (Requirement 15)
  const generateFilledContent = () => {
    const rawContent = currentTemplate?.content || '';
    const driverCpf = currentDriver?.docNumber || '002.574.880-73';
    const vehiclePlate = claim.vehiclePlate || 'JCO8C10';
    const vehiclePrefix = currentVehicle?.prefix || '24127';
    const costFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(claim.estimatedCost || 260.32);

    let filled = rawContent
      .replace(/\{\{nome_condutor\}\}/g, selectedDriverName)
      .replace(/\{\{cpf_condutor\}\}/g, driverCpf)
      .replace(/\{\{placa\}\}/g, vehiclePlate)
      .replace(/\{\{prefixo\}\}/g, vehiclePrefix)
      .replace(/\{\{data_sinistro\}\}/g, claim.date)
      .replace(/\{\{hora_sinistro\}\}/g, claim.time)
      .replace(/\{\{local_sinistro\}\}/g, claim.location)
      .replace(/\{\{cidade\}\}/g, claim.city || 'Gravataí')
      .replace(/\{\{estado\}\}/g, claim.state || 'RS')
      .replace(/\{\{valor_total\}\}/g, costFormatted)
      .replace(/\{\{numero_sinistro\}\}/g, claim.claimNumber)
      .replace(/\{\{protocolo\}\}/g, claim.protocol);

    return filled;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const textContent = generateFilledContent();

    const newTerm: Term = {
      id: `trm-${Date.now()}`,
      claimId: claim.id,
      templateId: currentTemplate?.id,
      title: currentTemplate?.name || 'Termo de Responsabilidade Oficial Trans Pinho',
      type: currentTemplate?.category || 'Termo de Responsabilidade',
      date: new Date().toISOString().split('T')[0],
      responsible: 'Carlos Pinho',
      involvedPerson: selectedDriverName,
      status: 'Assinado',
      content: textContent,
      htmlContent: `<div class="trans-pinho-doc text-slate-900 font-serif p-6 bg-white border border-slate-300 rounded-lg">
        <div class="trans-pinho-header text-center border-b-2 border-black pb-4 mb-6">
          <h2 class="font-black text-sm uppercase">JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)</h2>
          <p class="text-[11px]">Rua Florida, 116 – Nossa Chácara – Gravataí/ RS</p>
          <p class="text-[11px]">(051) 3047-0212 / 98266-0028 | Transpinho@transpinho.com</p>
        </div>
        <h3 class="trans-pinho-title text-center font-bold text-base my-4 uppercase">${currentTemplate?.name}</h3>
        <div class="whitespace-pre-wrap text-xs font-mono leading-relaxed p-4 bg-slate-50 border border-slate-200 rounded-lg my-4">${textContent}</div>
        <p class="text-xs my-6">GRAVATAÍ, ${new Date().getDate()} de Junho de 2026.</p>
        <div class="text-center pt-8 border-t border-black w-72 mx-auto">
          <p class="font-bold text-xs">${selectedDriverName}</p>
          <p class="text-[10px] text-slate-500">Condutor Responsável</p>
        </div>
      </div>`,
    };

    onGenerateTerm(newTerm);
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <div>
            <span className="badge bg-amber-100 text-amber-900 text-[10px] px-2 py-0.5 rounded font-black uppercase">
              Gerador Automático Baseado em Templates (Requisitos 13 - 20)
            </span>
            <h3 className="font-bold text-slate-900 text-base mt-0.5">
              Emitir Termo Oficial - {claim.claimNumber}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-lg">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Smart Rule Suggestions Box (Requirement 14 & 16) */}
        {suggestions.length > 0 && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <i className="fa-solid fa-wand-magic-sparkles text-amber-600"></i>
              <span>Documentos Recomendados pelo Motor de Regras:</span>
            </div>
            <ul className="list-disc pl-6 text-amber-800 text-[11px]">
              {suggestions.map((s, idx) => (
                <li key={idx} className="font-semibold">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label text-xs">Modelo de Template *</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="form-select text-xs font-bold text-slate-900"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.category})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label text-xs">Condutor Selecionado *</label>
              <select
                value={selectedDriverName}
                onChange={(e) => setSelectedDriverName(e.target.value)}
                className="form-select text-xs font-semibold"
              >
                {people.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} ({p.docNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label text-xs">
              Pré-visualização do Documento Preenchido com Variáveis (Editável antes de emitir):
            </label>
            <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
              {generateFilledContent()}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn btn-secondary text-xs px-4 py-2">
              Cancelar
            </button>
            <button
              type="submit"
              className="btn bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-2 shadow-sm"
            >
              <i className="fa-solid fa-file-check mr-1"></i> Confirmar & Salvar Termo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
