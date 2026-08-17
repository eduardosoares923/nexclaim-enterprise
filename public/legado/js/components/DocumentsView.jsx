const { React, useEffect, useState } = window;

window.DocumentsView = function DocumentsView() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetch('/api/documents')
      .then(r => r.json())
      .then(data => setDocuments(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = ['CNH', 'CRLV', 'B.O.', 'Apólice', 'Orçamento', 'Laudo', 'Nota fiscal', 'Termo', 'Comprovante', 'Outros'];
  const filteredDocs = documents.filter(d => !categoryFilter || d.category === categoryFilter);

  return (
    <div class="space-y-6">
      <div>
        <h2 class="text-xl font-bold text-slate-900 tracking-tight">Repositório de Documentos Digitalizados</h2>
        <p class="text-xs text-slate-500 mt-0.5">Pesquise, filtre e acesse arquivos oficiais vinculados aos sinistros.</p>
      </div>

      {/* Category Filter Pills */}
      <div class="flex items-center gap-2 overflow-x-auto pb-2">
        <button 
          onClick={() => setCategoryFilter('')}
          class={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${!categoryFilter ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          Todos ({documents.length})
        </button>
        {categories.map(cat => {
          const count = documents.filter(d => d.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              class={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${categoryFilter === cat ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div class="p-8 text-center text-xs text-slate-400">Carregando documentos...</div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map(doc => (
            <div key={doc.id} class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-400 transition-colors">
              <div>
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center text-xl flex-shrink-0">
                    <i class="fa-solid fa-file-pdf"></i>
                  </div>
                  <div class="min-w-0 flex-1">
                    <span class="badge bg-slate-100 text-slate-700 text-[9px] px-2 py-0.5 rounded font-bold uppercase mb-1 inline-block">
                      {doc.category}
                    </span>
                    <h4 class="font-bold text-xs text-slate-900 truncate">{doc.title}</h4>
                    <p class="text-[10px] text-slate-400 mt-0.5">Tamanho: {doc.fileSize} | Tipo: {doc.fileType}</p>
                  </div>
                </div>

                <div class="mt-3 p-2.5 bg-slate-50 rounded text-[11px] text-slate-600 italic">
                  "{doc.notes || 'Sem observações adicionais.'}"
                </div>
              </div>

              <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Enviado em {window.formatDate(doc.uploadDate)}</span>
                <button onClick={() => alert(`Download iniciado: ${doc.title}`)} class="text-blue-600 font-bold hover:underline">
                  <i class="fa-solid fa-download"></i> Baixar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
