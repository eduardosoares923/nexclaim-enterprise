const { React, useState, useEffect } = window;

window.GlobalSearchModal = function GlobalSearchModal({ onClose, selectClaim }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ claims: [], fines: [], documents: [], vehicles: [], people: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ claims: [], fines: [], documents: [], vehicles: [], people: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data || { claims: [], fines: [], documents: [], vehicles: [], people: [] });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const totalResults = results.claims.length + results.fines.length + results.documents.length + results.vehicles.length + results.people.length;

  return (
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-start justify-center pt-16 px-4" onClick={onClose}>
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden animate-fade-in border border-slate-200" onClick={(e) => e.stopPropagation()}>
        {/* Search Input Header */}
        <div class="p-4 border-b border-slate-200 flex items-center gap-3">
          <i class="fa-solid fa-magnifying-glass text-slate-400 text-lg"></i>
          <input 
            type="text"
            placeholder="Pesquisar por Sinistro #, Protocolo, Placa, CPF, Multa, RENAVAM..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            class="w-full text-sm font-medium focus:outline-none placeholder:text-slate-400"
          />
          <kbd class="bg-slate-100 border border-slate-300 rounded px-1.5 py-0.5 text-[10px] text-slate-500">ESC</kbd>
        </div>

        {/* Results Container */}
        <div class="max-h-96 overflow-y-auto p-4 space-y-4 text-xs">
          {loading ? (
            <div class="p-6 text-center text-slate-400">Buscando registros...</div>
          ) : !query.trim() ? (
            <div class="p-6 text-center text-slate-400">Digite algo para iniciar a busca global.</div>
          ) : totalResults === 0 ? (
            <div class="p-6 text-center text-slate-500">Nenhum resultado encontrado para "{query}".</div>
          ) : (
            <div class="space-y-4">
              {/* Claims Section */}
              {results.claims.length > 0 && (
                <div>
                  <h4 class="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-2">Sinistros ({results.claims.length})</h4>
                  <div class="space-y-1.5">
                    {results.claims.map(c => (
                      <div 
                        key={c.id} 
                        onClick={() => { selectClaim(c.id); onClose(); }}
                        class="p-2.5 hover:bg-blue-50 rounded-lg cursor-pointer flex justify-between items-center transition-colors"
                      >
                        <div>
                          <span class="font-bold text-blue-600">{c.claimNumber}</span> - <span class="font-semibold text-slate-800">{c.occurrenceType}</span>
                          <p class="text-[10px] text-slate-400">Placa: {c.vehiclePlate} | Condutor: {c.driverName}</p>
                        </div>
                        <span class={`badge ${window.getStatusBadgeClass(c.status)} px-2 py-0.5 rounded text-[9px] font-bold`}>{c.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fines Section */}
              {results.fines.length > 0 && (
                <div>
                  <h4 class="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-2">Multas ({results.fines.length})</h4>
                  <div class="space-y-1.5">
                    {results.fines.map(f => (
                      <div key={f.id} class="p-2.5 hover:bg-slate-50 rounded-lg flex justify-between items-center">
                        <div>
                          <span class="font-bold text-slate-900 font-mono">{f.infractionAuto}</span> - <span class="text-slate-700">{f.description}</span>
                          <p class="text-[10px] text-slate-400">Placa: {f.vehiclePlate} | Valor: {window.formatCurrency(f.amount)}</p>
                        </div>
                        <span class="badge bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded font-bold">{f.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
