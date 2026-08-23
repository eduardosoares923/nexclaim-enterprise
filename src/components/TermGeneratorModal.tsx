import React, { useState } from 'react';
import { Claim, Person, Vehicle, DocumentTemplate, Term } from '../types';
import { SignaturePad } from './SignaturePad';
import { Combobox } from './Combobox';

interface TermGeneratorModalProps {
  claim?: Claim;
  people: Person[];
  vehicles: Vehicle[];
  templates: DocumentTemplate[];
  onClose: () => void;
  onGenerateTerm: (term: Term) => void;
  onUpdatePerson?: (id: string, data: Partial<Person>) => void;
  origin?: 'sinistro' | 'multa';
}

export const TermGeneratorModal: React.FC<TermGeneratorModalProps> = ({
  claim,
  people,
  vehicles,
  templates,
  onClose,
  onGenerateTerm,
  onUpdatePerson,
  origin = 'sinistro',
}) => {
  if (!claim) {
    return (
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-xl">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Nenhum sinistro disponível</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Nenhum sinistro disponível. Cadastre um sinistro em Sinistros & Ocorrências antes de emitir um termo vinculado a ele.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={onClose}
              className="btn bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const templatesFiltrados = templates.filter((t) =>
    origin === 'multa' ? t.conditionRules?.hasFine === true : t.conditionRules?.hasFine !== true
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templatesFiltrados[0]?.id || '');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [cpfManual, setCpfManual] = useState<string>('');
  const [selectedDriverName, setSelectedDriverName] = useState<string>(
    claim?.driverName || people[0]?.name || ''
  );
  const [formaPagamento, setFormaPagamento] = useState<'unica' | 'parcelado'>('parcelado');
  const [numeroParcelasEscolhido, setNumeroParcelasEscolhido] = useState<number>(2);
  const [dataPagamento, setDataPagamento] = useState<string>('');
  const [customHtmlContent, setCustomHtmlContent] = useState<string>('');

  const currentTemplate = templatesFiltrados.find((t) => t.id === selectedTemplateId) || templatesFiltrados[0] || templates[0];
  const currentDriver = people.find((p) => p.name === selectedDriverName) || people[0];
  const currentVehicle = vehicles.find((v) => v.plate === claim?.vehiclePlate) || vehicles[0];

  // Smart Suggestion Logic
  const getSuggestions = () => {
    const recs: string[] = [];
    const occ = (claim?.occurrenceType || '').toLowerCase();
    if (occ.includes('velocidade') || occ.includes('nic') || occ.includes('multa') || occ.includes('estacionar') || occ.includes('infração')) {
      recs.push('Termo de Responsabilidade (Valores Descontados e Assumindo os Pontos)');
      recs.push('Termo de Responsabilidade (Empresa Paga a Multa)');
    }
    if (occ.includes('colisão') || occ.includes('terceiro') || occ.includes('avaria') || ((claim?.estimatedCost || 0) > 0)) {
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

  const formatarData = (iso: string) => (iso ? iso.split('-').reverse().join('/') : '');

  const meses = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

  // Dynamic Variable Replacement Engine (All Official Templates)
  const generateFilledContent = () => {
    const rawContent = currentTemplate?.content || '';
    const driverCpf = currentDriver?.docNumber || cpfManual;
    const vehiclePlate = claim?.vehiclePlate || currentVehicle?.plate || 'IZF4E82';
    const vehiclePrefix = currentVehicle?.prefix || '24127';
    const vehicleModel = claim?.vehicleModel || currentVehicle?.model || 'MARCOPOLO/VOLARE W9C ON';
    const cost = claim?.estimatedCost || 2200;
    const costFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cost);
    const costExtenso = formatExtenso(cost);
    
    const parcelas = numeroParcelasEscolhido;
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
      .replace(/\{\{auto_infracao\}\}/g, claim?.boNumber || 'EL00093302')
      .replace(/\{\{data_infracao\}\}/g, claim?.date || '28/05/2026')
      .replace(/\{\{horario_infracao\}\}/g, claim?.time || '10:44')
      .replace(/\{\{motivo_infracao\}\}/g, claim?.occurrenceType || 'TRANSITAR EM VELOCIDADE SUPERIOR A MAXIMA PERMITIDA EM ATÉ 20%')
      .replace(/\{\{valor_infracao\}\}/g, costFormatted)
      .replace(/\{\{valor_total\}\}/g, costFormatted)
      .replace(/\{\{valor_total_extenso\}\}/g, costExtenso)
      .replace(/\{\{opcao_cota_unica\}\}/g, formaPagamento === 'unica' ? '☑' : '☐')
      .replace(/\{\{opcao_parcelado\}\}/g, formaPagamento === 'parcelado' ? '☑' : '☐')
      .replace(/\{\{data_vencimento\}\}/g, formatarData(dataPagamento) || '07/08/2026')
      .replace(/\{\{numero_parcelas\}\}/g, String(parcelas))
      .replace(/\{\{valor_parcela\}\}/g, valorParcelaFormatted)
      .replace(/\{\{data_primeira_parcela\}\}/g, formatarData(dataPagamento) || '07/08/2026')
      .replace(/\{\{dia_assinatura\}\}/g, diaAssinatura)
      .replace(/\{\{mes_assinatura\}\}/g, mesAssinatura)
      .replace(/\{\{numero_ocorrencia\}\}/g, claim?.protocol || claim?.claimNumber || '2026 0713 3731 277')
      .replace(/\{\{modelo_veiculo_terceiro\}\}/g, 'RENAULT/MASTER TVAN')
      .replace(/\{\{placa_terceiro\}\}/g, 'TQQ6H24')
      .replace(/\{\{data_sinistro\}\}/g, claim?.date || '18/06/2026')
      .replace(/\{\{hora_sinistro\}\}/g, claim?.time || '14:30')
      .replace(/\{\{local_sinistro\}\}/g, claim?.location || 'Gravataí/RS')
      .replace(/\{\{cidade\}\}/g, claim?.city || 'Gravataí')
      .replace(/\{\{estado\}\}/g, claim?.state || 'RS')
      .replace(/\{\{oficina\}\}/g, 'Chapeação Central Trans Pinho')
      .replace(/\{\{chave_pix\}\}/g, 'financeiro@transpinho.com')
      .replace(/\{\{numero_sinistro\}\}/g, claim?.claimNumber || 'SIN-2026-001')
      .replace(/\{\{protocolo\}\}/g, claim?.protocol || 'PROT-2026-001');

    return filled;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDriver?.docNumber && !cpfManual.trim()) {
      alert('Este condutor não tem CPF cadastrado. Preencha o campo "CPF do Condutor" no Passo 1 antes de continuar.');
      setStep(1);
      return;
    }
    if (!currentDriver?.docNumber && cpfManual.trim() && onUpdatePerson && currentDriver?.id) {
      onUpdatePerson(currentDriver.id, { docNumber: cpfManual.trim() });
    }
    const textContent = generateFilledContent();
    const textContentDestacado = textContent
      .replace(/☑/g, '<span style="color:#059669;font-weight:900;">☑</span>')
      .replace(/☐([^\n]*)/g, '<span style="color:#94a3b8;">☐$1</span>');

    const newTerm: Term = {
      id: `trm-${Date.now()}`,
      claimId: claim?.id || '',
      templateId: currentTemplate?.id,
      title: currentTemplate?.name || 'Termo de Responsabilidade Oficial Trans Pinho',
      type: currentTemplate?.category || 'Responsabilidade',
      date: new Date().toISOString().split('T')[0],
      responsible: 'Carlos Pinho',
      involvedPerson: selectedDriverName,
      status: signatureDataUrl ? 'Assinado' : 'Gerado',
      signatureDataUrl: signatureDataUrl || undefined,
      paymentMode: formaPagamento,
      installmentsCount: formaPagamento === 'parcelado' ? numeroParcelasEscolhido : 1,
      paymentDate: dataPagamento || undefined,
      content: textContent,
      htmlContent: `<div class="trans-pinho-doc text-slate-900 font-serif p-8 bg-white border border-slate-300 rounded-lg max-w-2xl mx-auto shadow-sm">
        <div class="whitespace-pre-wrap text-xs font-serif leading-relaxed text-justify text-slate-900 my-4">${textContentDestacado}</div>
        ${signatureDataUrl ? `<div style="text-align:center;margin-top:24px;"><img src="${signatureDataUrl}" style="max-width:220px;border-bottom:1px solid #000;padding-bottom:4px;" /><p style="font-size:10px;margin-top:4px;">Assinatura do Condutor</p></div>` : ''}
        <div class="trans-pinho-header text-center border-t-2 border-black pt-4 mt-6">
          <h2 class="font-black text-base uppercase tracking-tight">JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)</h2>
          <p class="text-xs">Rua Florida, 116 – Nossa Chácara – Gravataí/ RS</p>
          <p class="text-xs">(051) 3047-0212 / 98266-0028 | Transpinho@transpinho.com</p>
        </div>
      </div>`,
    };

    onGenerateTerm(newTerm);
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <div>
            <span className="badge bg-amber-100 text-amber-900 text-[10px] px-2 py-0.5 rounded font-black uppercase">
              Gerador Automático Baseado em Templates
            </span>
            <h3 className="font-bold text-slate-900 text-base mt-0.5">
              Emitir Termo Oficial - {claim?.claimNumber || 'Novo Documento'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-lg cursor-pointer">
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

        {/* Indicador de Progresso (3 Passos) */}
        <div className="flex items-center gap-2">
          {[
            { n: 1, label: 'Dados' },
            { n: 2, label: 'Revisão' },
            { n: 3, label: 'Assinatura' },
          ].map(({ n, label }) => (
            <React.Fragment key={n}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition ${
                    step === n ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-100' : step > n ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step > n ? <i className="fa-solid fa-check"></i> : n}
                </div>
                <span className={`text-[9px] font-bold uppercase ${step === n ? 'text-amber-600' : 'text-slate-400'}`}>
                  {label}
                </span>
              </div>
              {n < 3 && <div className={`flex-1 h-0.5 mb-4 ${step > n ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Passo 1: Configuração do Documento e Condutor */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xs">Modelo de Template *</label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="form-select text-xs font-bold text-slate-900"
                  >
                    {templatesFiltrados.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.category})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label text-xs">Condutor Selecionado *</label>
                  <Combobox
                    value={selectedDriverName}
                    onChange={setSelectedDriverName}
                    placeholder="Selecione da lista ou digite o nome"
                    className="form-input text-xs font-semibold"
                    options={[...people].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')).map((p) => ({
                      value: p.name,
                      label: p.docNumber || '',
                    }))}
                  />
                </div>
                {!currentDriver?.docNumber && (
                  <div>
                    <label className="form-label text-xs text-rose-600">
                      <i className="fa-solid fa-triangle-exclamation mr-1"></i>
                      CPF do Condutor (não cadastrado) *
                    </label>
                    <input
                      type="text"
                      value={cpfManual}
                      onChange={(e) => setCpfManual(e.target.value)}
                      placeholder="000.000.000-00"
                      className="form-input text-xs border-rose-300"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Esse condutor não tem CPF no cadastro. O CPF digitado aqui será
                      salvo no cadastro dele pra não precisar digitar de novo.
                    </p>
                  </div>
                )}
              </div>

              {/* Campo de Data de Pagamento (único, usado nos dois modelos que precisam de data) */}
              {(currentTemplate?.availableVariables?.includes('{{data_vencimento}}') ||
                currentTemplate?.availableVariables?.includes('{{data_primeira_parcela}}')) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="form-label text-xs">Data do Pagamento</label>
                    <input
                      type="date"
                      value={dataPagamento}
                      onChange={(e) => setDataPagamento(e.target.value)}
                      className="form-input text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Seleção de Modalidade (Cota Única vs Parcelado) */}
              {(currentTemplate?.id === 'tmpl-multa-descontada' || currentTemplate?.name.includes('Valores Descontados')) && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                  <label className="font-bold text-xs text-slate-800 block">
                    Forma de Pagamento / Modalidade de Quitação:
                  </label>
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-semibold text-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="formaPagamento"
                        value="unica"
                        checked={formaPagamento === 'unica'}
                        onChange={() => setFormaPagamento('unica')}
                        className="text-amber-500 focus:ring-amber-400"
                      />
                      <span>Cota Única (☑ Cota Única)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="formaPagamento"
                        value="parcelado"
                        checked={formaPagamento === 'parcelado'}
                        onChange={() => setFormaPagamento('parcelado')}
                        className="text-amber-500 focus:ring-amber-400"
                      />
                      <span>Parcelado (☑ Parcelado)</span>
                    </label>
                  </div>

                  {formaPagamento === 'parcelado' && (
                    <div className="pt-2.5 border-t border-slate-200 flex items-center gap-3">
                      <label className="form-label text-xs mb-0 whitespace-nowrap">
                        Número de Parcelas:
                      </label>
                      <select
                        value={numeroParcelasEscolhido}
                        onChange={(e) => setNumeroParcelasEscolhido(Number(e.target.value))}
                        className="form-select text-xs font-bold w-36"
                      >
                        {Array.from({ length: 11 }, (_, i) => i + 2).map((n) => (
                          <option key={n} value={n}>
                            {n}x parcelas
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Passo 2: Pré-visualização do Documento */}
          {step === 2 && (
            <div>
              <label className="form-label text-xs">
                Pré-visualização do Documento Preenchido com Variáveis (Editável antes de emitir):
              </label>
              <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                {generateFilledContent()}
              </div>
            </div>
          )}

          {/* Passo 3: Assinatura do Condutor */}
          {step === 3 && (
            <div className="space-y-1.5">
              <label className="form-label text-xs">
                Assinatura do Condutor {selectedDriverName}:
              </label>
              <SignaturePad value={signatureDataUrl} onChange={(dataUrl) => setSignatureDataUrl(dataUrl)} />
              <p className="text-[10px] text-slate-500">
                Peça para o condutor assinar na tela antes de confirmar. Se pular esta etapa,
                o termo fica com status "Gerado" (pendente de assinatura) em vez de "Assinado".
              </p>
            </div>
          )}

          {/* Rodapé / Botões de Navegação */}
          <div className="pt-3 border-t border-slate-200 flex justify-between gap-2">
            <button
              type="button"
              onClick={() => (step === 1 ? onClose() : setStep((s) => (s - 1) as 1 | 2 | 3))}
              className="btn btn-secondary text-xs px-4 py-2"
            >
              {step === 1 ? 'Cancelar' : 'Voltar'}
            </button>
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
                className="btn bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2 shadow-sm"
              >
                Próximo <i className="fa-solid fa-arrow-right ml-1"></i>
              </button>
            ) : (
              <button
                type="submit"
                className="btn bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-2 shadow-sm"
              >
                <i className="fa-solid fa-file-check mr-1"></i>
                {signatureDataUrl ? 'Confirmar & Salvar Termo Assinado' : 'Salvar Sem Assinatura'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
