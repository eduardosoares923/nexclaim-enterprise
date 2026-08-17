const { React, useState, useEffect } = window;

window.TermGeneratorModal = function TermGeneratorModal({ claims, initialClaim, onClose, onGenerated }) {
  const [selectedClaimId, setSelectedClaimId] = useState(initialClaim ? initialClaim.id : (claims[0] ? claims[0].id : ''));
  const [templateType, setTemplateType] = useState('Termo de Responsabilidade');
  const [title, setTitle] = useState('');
  const [involvedPerson, setInvolvedPerson] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedClaim = claims.find(c => c.id === selectedClaimId) || initialClaim;

  useEffect(() => {
    if (selectedClaim) {
      updateGeneratedText(templateType, selectedClaim, involvedPerson);
    }
  }, [selectedClaimId, templateType, involvedPerson]);

  function updateGeneratedText(type, claim, person) {
    if (!claim) return;
    const formattedDate = new Date().toLocaleDateString('pt-BR');
    const pName = person || claim.driverName;

    let text = '';
    if (type === 'Termo de Responsabilidade') {
      text = `TERMO DE RESPONSABILIDADE E VERACIDADE DE INFORMAÇÕES\n\n` +
        `Eu, ${pName}, declaro para os devidos fins de direito que conduzia o veículo ${claim.vehicleModel}, ` +
        `Placa ${claim.vehiclePlate}, referente ao sinistro nº ${claim.claimNumber} (Protocolo ${claim.protocol}), ` +
        `ocorrido em ${claim.date} às ${claim.time} no local ${claim.location}, ${claim.city}/${claim.state}.\n\n` +
        `Declaro que todas as informações prestadas são a mais pura expressão da verdade, assumindo integral responsabilidade ` +
        `civil e criminal por quaisquer omissões ou falsidades perante a seguradora ${claim.insurer} (Apólice ${claim.policyNumber}).\n\n` +
        `Data da Emissão: ${formattedDate}`;
    } else if (type === 'Termo de entrega e recebimento') {
      text = `TERMO DE ENTREGA E RECEBIMENTO DE VEÍCULO\n\n` +
        `Pelo presente termo, a empresa AUTO FROTA BRASIL LTDA entrega o veículo ${claim.vehicleModel}, ` +
        `Placa ${claim.vehiclePlate}, para vistoria e reparos referentes ao sinistro nº ${claim.claimNumber}.\n\n` +
        `Recebido por: ${pName}\n` +
        `Data: ${formattedDate}\n` +
        `Oficina / Seguradora: ${claim.insurer}`;
    } else if (type === 'Termo de ciência') {
      text = `TERMO DE CIÊNCIA E DECLARAÇÃO DE SINISTRO\n\n` +
        `Tomamos ciência formal da ocorrência nº ${claim.claimNumber} referente ao veículo Placa ${claim.vehiclePlate}.\n\n` +
        `Condutor Declarado: ${claim.driverName}\n` +
        `Data do Evento: ${claim.date}\n` +
        `Data da Ciência: ${formattedDate}`;
    } else if (type === 'Declaração do condutor') {
      text = `DECLARAÇÃO DETALHADA DO CONDUTOR\n\n` +
        `Eu, ${claim.driverName}, condutor do veículo ${claim.vehiclePlate}, declaro que no dia ${claim.date} às ${claim.time}, ` +
        `na cidade de ${claim.city}/${claim.state}, ocorreu o seguinte fato:\n\n` +
        `"${claim.description}"\n\n` +
        `Por ser verdade, assino a presente declaração em ${formattedDate}.`;
    } else {
      text = `DOCUMENTO OFICIAL - ${type.toUpperCase()}\n\n` +
        `Referente ao sinistro nº ${claim.claimNumber} (Placa ${claim.vehiclePlate}).\n\n` +
        `Envolvido: ${pName}\n` +
        `Data: ${formattedDate}`;
    }

    setGeneratedText(text);
    setTitle(`${type} - ${claim.claimNumber}`);
  }

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/terms/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimId: selectedClaimId,
          templateType,
          title,
          customContent: generatedText,
          involvedPerson: involvedPerson || (selectedClaim ? selectedClaim.driverName : 'N/A')
        })
      });
      if (res.ok) {
        onGenerated();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div class="p-6 space-y-4">
      <div class="flex justify-between items-center border-b border-slate-200 pb-3">
        <div>
          <span class="badge bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
            Automação de Documentos (Requisito 35)
          </span>
          <h3 class="font-bold text-slate-900 text-base">Gerador Inteligente de Termos</h3>
        </div>
        <button onClick={onClose} class="text-slate-400 hover:text-slate-700 text-lg">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <form onSubmit={handleGenerate} class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="form-label text-xs">Sinistro Relacionado *</label>
            <select 
              value={selectedClaimId}
              onChange={(e) => setSelectedClaimId(e.target.value)}
              class="form-select text-xs font-semibold"
              required
            >
              {claims.map(c => (
                <option key={c.id} value={c.id}>
                  {c.claimNumber} - Placa {c.vehiclePlate} ({c.occurrenceType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label class="form-label text-xs">Modelo de Termo / Declaração *</label>
            <select 
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value)}
              class="form-select text-xs font-semibold"
              required
            >
              <option value="Termo de Responsabilidade">Termo de Responsabilidade</option>
              <option value="Termo de entrega e recebimento">Termo de entrega e recebimento</option>
              <option value="Termo de ciência">Termo de ciência</option>
              <option value="Declaração do condutor">Declaração do condutor</option>
              <option value="Declaração de terceiro">Declaração de terceiro</option>
              <option value="Termo de acordo">Termo de acordo</option>
              <option value="Termo de autorização">Termo de autorização</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="form-label text-xs">Título do Documento</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              class="form-input text-xs" 
              required 
            />
          </div>
          <div>
            <label class="form-label text-xs">Pessoa / Envolvido Declarado</label>
            <input 
              type="text" 
              value={involvedPerson} 
              onChange={(e) => setInvolvedPerson(e.target.value)}
              placeholder={selectedClaim ? selectedClaim.driverName : 'Nome do envolvido'}
              class="form-input text-xs" 
            />
          </div>
        </div>

        {/* Live Text Preview Editor */}
        <div>
          <label class="form-label text-xs flex justify-between">
            <span>Texto Gerado (Editável em Tempo Real)</span>
            <span class="text-[10px] text-blue-600 font-normal">Preenchimento automático ativo</span>
          </label>
          <textarea 
            rows="8"
            value={generatedText}
            onChange={(e) => setGeneratedText(e.target.value)}
            class="form-textarea text-xs font-mono bg-slate-50 border border-slate-300 p-3 leading-relaxed"
          ></textarea>
        </div>

        <div class="pt-3 border-t border-slate-200 flex justify-end gap-2">
          <button type="button" onClick={onClose} class="btn btn-secondary text-xs px-4 py-2">
            Cancelar
          </button>
          <button type="submit" disabled={loading} class="btn bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-5 py-2">
            {loading ? 'Gerando...' : 'Salvar & Vincular ao Dossiê'}
          </button>
        </div>
      </form>
    </div>
  );
};
