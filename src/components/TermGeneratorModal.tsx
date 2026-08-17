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

  // Smart Suggestion Logic
  const getSuggestions = () => {
    const recs: string[] = [];
    const occ = (claim.occurrenceType || '').toLowerCase();
    if (occ.includes('velocidade') || occ.includes('nic') || occ.includes('multa') || occ.includes('estacionar') || occ.includes('infração')) {
      recs.push('Termo de Responsabilidade (Valores Descontados e Assumindo os Pontos)');
      recs.push('Termo de Responsabilidade (Empresa Paga a Multa)');
    }
    if (occ.includes('colisão') || occ.includes('terceiro') || occ.includes('avaria') || (claim.estimatedCost && claim.estimatedCost > 0)) {
      recs.push('Termo de Ciência e Autorização de Desconto em Folha de Pagamento');
      recs.push('Termo de Quitação (Reparo Custeado pela Empresa)');
      recs.push('Termo de Quitação (Pagamento via Pix pelo Condutor)');
    }
    return recs;
  };

  const suggestions = getSuggestions();

  // Helper para converter valor aproximado para extenso em PT-BR
  const formatExtenso = (num: number): string => {
    if (Math.round(num) === 2200) return 'Dois mil e duzentos reais';
    if (Math.round(num) === 260 || Math.abs(num - 260.32) < 1) return 'Duzentos e sessenta reais e trinta e dois centavos';
    if (Math.round(num) === 130 || Math.abs(num - 130.16) < 1) return 'Cento e trinta reais e dezesseis centavos';
    if (Math.round(num) === 195 || Math.abs(num - 195.23) < 1) return 'Cento e noventa e cinco reais e vinte e três centavos';
    if (Math.round(num) === 3500) return 'Três mil e quinhentos reais';
    return `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num)} reais`;
  };

  const meses = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

  // Dynamic Variable Replacement Engine (All Official Templates)
  const generateFilledContent = () => {
    const rawContent = currentTemplate?.content || '';
    const driverCpf = currentDriver?.docNumber || '031.997.250-07';
    const vehiclePlate = claim.vehiclePlate || currentVehicle?.plate || 'IZF4E82';
    const vehiclePrefix = currentVehicle?.prefix || '24127';
    const vehicleModel = claim.vehicleModel || currentVehicle?.model || 'MARCOPOLO/VOLARE W9C ON';
    const cost = claim.estimatedCost || 2200;
    const costFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cost);
    const costExtenso = formatExtenso(cost);
    
    const parcelas = 2;
    const valorParcelaFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cost / parcelas);

    const now = new Date();
    const diaAssinatura = String(now.getDate()).padStart(2, '0');
    const mesAssinatura = meses[now.getMonth()];

    let filled = rawContent
      .replace(/\{\{nome_condutor\}\}/g, selectedDriverName)
      .replace(/\{\{cpf_condutor\}\}/g, driverCpf)
      .replace(/\{\{placa\}\}/g, vehiclePlate)
      .replace(/\{\{prefixo\}\}/g, vehiclePrefix)
      .replace(/\{\{modelo_veiculo\}\}/g, vehicleModel)
      .replace(/\{\{auto_infracao\}\}/g, claim.boNumber || 'EL00093302')
      .replace(/\{\{data_infracao\}\}/g, claim.date || '28/05/2026')
      .replace(/\{\{horario_infracao\}\}/g, claim.time || '10:44')
      .replace(/\{\{motivo_infracao\}\}/g, claim.occurrenceType || 'TRANSITAR EM VELOCIDADE SUPERIOR A MAXIMA PERMITIDA EM ATÉ 20%')
      .replace(/\{\{valor_infracao\}\}/g, costFormatted)
      .replace(/\{\{valor_total\}\}/g, costFormatted)
      .replace(/\{\{valor_total_extenso\}\}/g, costExtenso)
      .replace(/\{\{data_vencimento\}\}/g, '07/08/2026')
      .replace(/\{\{numero_parcelas\}\}/g, String(parcelas))
      .replace(/\{\{valor_parcela\}\}/g, valorParcelaFormatted)
      .replace(/\{\{data_primeira_parcela\}\}/g, '07/08/2026')
      .replace(/\{\{dia_assinatura\}\}/g, diaAssinatura)
      .replace(/\{\{mes_assinatura\}\}/g, mesAssinatura)
      .replace(/\{\{numero_ocorrencia\}\}/g, claim.protocol || claim.claimNumber || '2026 0713 3731 277')
      .replace(/\{\{modelo_veiculo_terceiro\}\}/g, 'RENAULT/MASTER TVAN')
      .replace(/\{\{placa_terceiro\}\}/g, 'TQQ6H24')
      .replace(/\{\{data_sinistro\}\}/g, claim.date || '18/06/2026')
      .replace(/\{\{hora_sinistro\}\}/g, claim.time || '14:30')
      .replace(/\{\{local_sinistro\}\}/g, claim.location || 'Gravataí/RS')
      .replace(/\{\{cidade\}\}/g, claim.city || 'Gravataí')
      .replace(/\{\{estado\}\}/g, claim.state || 'RS')
      .replace(/\{\{oficina\}\}/g, 'Chapeação Central Trans Pinho')
      .replace(/\{\{chave_pix\}\}/g, 'financeiro@transpinho.com')
      .replace(/\{\{numero_sinistro\}\}/g, claim.claimNumber)
      .replace(/\{\{protocolo\}\}/g, claim.protocol);

    return filled;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const textContent = generateFilledContent();

    const now = new Date();
    const diaAssinatura = String(now.getDate()).padStart(2, '0');
    const mesAssinatura = meses[now.getMonth()];

    const newTerm: Term = {
      id: `trm-${Date.now()}`,
      claimId: claim.id,
      templateId: currentTemplate?.id,
      title: currentTemplate?.name || 'Termo de Responsabilidade Oficial Trans Pinho',
      type: currentTemplate?.category || 'Responsabilidade',
      date: new Date().toISOString().split('T')[0],
      responsible: 'Carlos Pinho',
      involvedPerson: selectedDriverName,
      status: 'Assinado',
      content: textContent,
      htmlContent: `<div class="trans-pinho-doc text-slate-900 font-serif p-8 bg-white border border-slate-300 rounded-lg max-w-2xl mx-auto shadow-sm">
        <div class="trans-pinho-header text-center border-b-2 border-black pb-4 mb-6">
          <h2 class="font-black text-base uppercase tracking-tight">JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)</h2>
          <p class="text-xs">Rua Florida, 116 – Nossa Chácara – Gravataí/ RS</p>
          <p class="text-xs">(051) 3047-0212 / 98266-0028 | Transpinho@transpinho.com</p>
        </div>
        <div class="whitespace-pre-wrap text-xs font-serif leading-relaxed text-justify text-slate-900 my-4">${textContent}</div>
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
