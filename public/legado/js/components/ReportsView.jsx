const { React, useState } = window;

window.ReportsView = function ReportsView({ onOpenExportModal }) {
  const [reportType, setReportType] = useState('sinistros-periodo');
  const [format, setFormat] = useState('pdf');

  function handleGenerateReport() {
    if (format === 'pdf') {
      window.print();
    } else if (format === 'csv') {
      const csvContent = "data:text/csv;charset=utf-8,Sinistro,Status,Data,Veiculo,Valor\nSIN-2026-00124,Em analise,2026-08-10,ABC-8E19,7900.00\nSIN-2026-00125,Aguardando seguradora,2026-08-08,GHY-4K20,3200.00";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `relatorio_${reportType}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  return (
    <div class="space-y-6">
      <div>
        <h2 class="text-xl font-bold text-slate-900 tracking-tight">Central de Relatórios & Exportação de Dossiê</h2>
        <p class="text-xs text-slate-500 mt-0.5">Gere relatórios executivos para diretoria, seguradoras e auditoria interna.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Report Controls Card */}
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 md:col-span-2">
          <h3 class="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Configurar Relatório Sintético</h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label class="form-label text-xs">Tipo de Relatório *</label>
              <select value={reportType} onChange={(e) => setReportType(e.target.value)} class="form-select text-xs">
                <option value="sinistros-periodo">Sinistros por Período & Status</option>
                <option value="sinistros-seguradora">Sinistros por Seguradora & Apólice</option>
                <option value="multas-situacao">Multas & Autos de Infração por Veículo</option>
                <option value="custos-reparos">Consolidado de Custos e Orçamentos</option>
              </select>
            </div>

            <div>
              <label class="form-label text-xs">Formato de Exportação *</label>
              <select value={format} onChange={(e) => setFormat(e.target.value)} class="form-select text-xs">
                <option value="pdf">Documento PDF Impresso (A4)</option>
                <option value="csv">Planilha Excel / CSV</option>
              </select>
            </div>
          </div>

          <div class="pt-2 flex justify-end">
            <button onClick={handleGenerateReport} class="btn bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-2">
              <i class="fa-solid fa-download"></i> Gerar & Exportar Relatório
            </button>
          </div>
        </div>

        {/* Dossier Exporter Quick Card */}
        <div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-xl border border-slate-700 shadow-md flex flex-col justify-between">
          <div>
            <span class="badge bg-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 rounded font-bold uppercase mb-2 inline-block">
              Dossiê Completo
            </span>
            <h3 class="font-bold text-base mb-1">Exportação de Dossiê Unificado</h3>
            <p class="text-xs text-slate-300 leading-relaxed mt-2">
              Reúna absolutamente todas as informações do caso: cabeçalho, timeline, documentos listados, multas, termos e mídias em um único relatório A4 oficial.
            </p>
          </div>

          <button 
            onClick={() => onOpenExportModal()}
            class="btn bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-lg w-full mt-6 flex items-center justify-center gap-2"
          >
            <i class="fa-solid fa-file-pdf"></i> Exportar Dossiê do Sinistro
          </button>
        </div>
      </div>
    </div>
  );
};
