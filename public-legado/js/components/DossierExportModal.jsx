const { React, useEffect, useState } = window;

window.DossierExportModal = function DossierExportModal({ claim, onClose }) {
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (claim) {
      fetch(`/api/claims/${claim.id}/dossier`)
        .then(r => r.json())
        .then(setDossier)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [claim]);

  function handlePrint() {
    window.print();
  }

  if (loading || !dossier) {
    return <div class="p-8 text-center text-xs text-slate-400">Gerando relatório de dossiê...</div>;
  }

  const { claim: cData, timeline, documents, media, fines, terms } = dossier;

  return (
    <div class="p-6 space-y-6 max-h-[90vh] overflow-y-auto">
      {/* Action Header */}
      <div class="flex justify-between items-center border-b border-slate-200 pb-3 print:hidden">
        <div>
          <span class="badge bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Relatório Oficial de Dossiê</span>
          <h3 class="font-bold text-slate-900 text-base">Dossiê Unificado do Sinistro {cData.claimNumber}</h3>
        </div>
        <div class="flex items-center gap-2">
          <button onClick={handlePrint} class="btn bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm">
            <i class="fa-solid fa-print"></i> Imprimir / Salvar PDF
          </button>
          <button onClick={onClose} class="text-slate-400 hover:text-slate-700 text-lg ml-2">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      {/* Printable Report Document Body */}
      <div class="bg-white p-8 border border-slate-300 rounded-xl space-y-6 text-slate-900 font-sans text-xs">
        
        {/* Document Header */}
        <div class="flex justify-between items-start border-b-2 border-slate-900 pb-4">
          <div>
            <h1 class="text-xl font-black tracking-tight">NEXCLAIM ENTERPRISE</h1>
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Relatório Unificado de Dossiê Digital de Sinistro</p>
          </div>
          <div class="text-right">
            <span class="font-mono font-bold text-sm text-blue-700">{cData.claimNumber}</span>
            <p class="text-[10px] text-slate-500">Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        {/* Section 1: Claim Header Info */}
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div><span class="text-slate-400 text-[10px]">Protocolo:</span><p class="font-bold">{cData.protocol}</p></div>
          <div><span class="text-slate-400 text-[10px]">Status do Caso:</span><p class="font-bold text-blue-700">{cData.status}</p></div>
          <div><span class="text-slate-400 text-[10px]">Data & Hora:</span><p class="font-bold">{cData.date} às {cData.time}</p></div>
          <div><span class="text-slate-400 text-[10px]">Boletim de Ocorrência:</span><p class="font-bold">{cData.boNumber}</p></div>
        </div>

        {/* Section 2: Occurrence Description */}
        <div>
          <h4 class="font-bold text-xs uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-2">1. Resumo da Ocorrência</h4>
          <p class="leading-relaxed text-slate-800 bg-slate-50/50 p-3 rounded border border-slate-100">{cData.description}</p>
        </div>

        {/* Section 3: Technical & Insurance Details */}
        <div class="grid grid-cols-2 gap-4">
          <div class="p-3 bg-slate-50 rounded border border-slate-200">
            <h5 class="font-bold text-[11px] text-slate-800 mb-1">Veículo & Condutor</h5>
            <p>Placa: <strong>{cData.vehiclePlate}</strong> ({cData.vehicleModel})</p>
            <p>Condutor Declarado: <strong>{cData.driverName}</strong></p>
            <p>Local: {cData.location}, {cData.city}/{cData.state}</p>
          </div>
          <div class="p-3 bg-slate-50 rounded border border-slate-200">
            <h5 class="font-bold text-[11px] text-slate-800 mb-1">Seguradora & Cobertura</h5>
            <p>Seguradora: <strong>{cData.insurer}</strong></p>
            <p>Apólice: <strong>{cData.policyNumber}</strong></p>
            <p>Orçamento Aprovado: <strong>{window.formatCurrency(cData.approvedCost)}</strong></p>
          </div>
        </div>

        {/* Section 4: Timeline Summary */}
        <div>
          <h4 class="font-bold text-xs uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-2">2. Histórico da Linha do Tempo ({timeline.length} Eventos)</h4>
          <div class="space-y-1.5 text-[11px]">
            {timeline.map((evt, idx) => (
              <div key={idx} class="flex justify-between p-2 bg-slate-50 rounded border border-slate-100">
                <span><strong>{evt.actionType}</strong> - {evt.description} (por {evt.user})</span>
                <span class="text-slate-400 font-mono">{window.formatDateTime(evt.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Documents & Terms List */}
        <div>
          <h4 class="font-bold text-xs uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-2">3. Anexos & Termos Digitalizados</h4>
          <div class="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <h5 class="font-bold text-[10px] text-slate-500 mb-1">Documentos ({documents.length}):</h5>
              <ul class="list-disc pl-4 space-y-0.5">
                {documents.map(d => <li key={d.id}>{d.title} ({d.category})</li>)}
              </ul>
            </div>
            <div>
              <h5 class="font-bold text-[10px] text-slate-500 mb-1">Termos Gerados ({terms.length}):</h5>
              <ul class="list-disc pl-4 space-y-0.5">
                {terms.map(t => <li key={t.id}>{t.title} ({t.status})</li>)}
              </ul>
            </div>
          </div>
        </div>

        {/* Signatures Footer */}
        <div class="pt-12 grid grid-cols-2 gap-8 text-center text-[10px] border-t border-slate-200 mt-8">
          <div>
            <div class="border-t border-slate-400 w-3/4 mx-auto pt-1 font-bold">{cData.driverName}</div>
            <span class="text-slate-500">Condutor Declarado</span>
          </div>
          <div>
            <div class="border-t border-slate-400 w-3/4 mx-auto pt-1 font-bold">{cData.assignedUser}</div>
            <span class="text-slate-500">Gestão Operacional de Sinistros</span>
          </div>
        </div>

      </div>
    </div>
  );
};
