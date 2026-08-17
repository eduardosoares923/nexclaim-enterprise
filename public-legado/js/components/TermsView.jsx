const { React, useEffect, useState } = window;

window.TermsView = function TermsView({ onOpenTermGeneratorModal }) {
  const [terms, setTerms] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    loadTermsData();
  }, []);

  async function loadTermsData() {
    try {
      const [tRes, cRes] = await Promise.all([
        fetch('/api/terms').then(r => r.json()),
        fetch('/api/claims').then(r => r.json())
      ]);
      setTerms(tRes || []);
      setClaims(cRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredTerms = terms.filter(t => !filterType || t.type === filterType);

  return (
    <div class="space-y-6">
      {/* Header Banner */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white p-6 rounded-xl shadow-md">
        <div>
          <span class="badge bg-white/20 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider mb-1 inline-block">
            Mecanismo Inteligente (Requisito 35)
          </span>
          <h2 class="text-xl font-bold tracking-tight">Geração Automática de Termos & Declarações</h2>
          <p class="text-xs text-white/90 mt-1 max-w-xl">
            Crie termos de responsabilidade, entrega, ciência, declarações de condutor e acordos preenchidos automaticamente com os dados do sinistro sem redigitar informações.
          </p>
        </div>
        <button 
          onClick={() => onOpenTermGeneratorModal(claims[0])}
          class="btn bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <i class="fa-solid fa-wand-magic-sparkles text-amber-400"></i> Abrir Gerador de Termos
        </button>
      </div>

      {/* Filter & Templates Showcase */}
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 class="font-bold text-slate-900 text-sm">Modelos Oficiais Disponíveis</h3>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            class="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50"
          >
            <option value="">Todos os Tipos de Termo</option>
            <option value="Termo de Responsabilidade">Termo de Responsabilidade</option>
            <option value="Termo de entrega e recebimento">Termo de entrega e recebimento</option>
            <option value="Termo de ciência">Termo de ciência</option>
            <option value="Declaração do condutor">Declaração do condutor</option>
            <option value="Declaração de terceiro">Declaração de terceiro</option>
            <option value="Termo de acordo">Termo de acordo</option>
            <option value="Termo de autorização">Termo de autorização</option>
          </select>
        </div>

        {/* Template Badges Grid */}
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {[
            { title: 'Termo de Responsabilidade', icon: 'fa-shield-halved' },
            { title: 'Entrega e Recebimento', icon: 'fa-truck-ramp-box' },
            { title: 'Termo de Ciência', icon: 'fa-circle-check' },
            { title: 'Declaração do Condutor', icon: 'fa-user-pen' },
            { title: 'Declaração de Terceiro', icon: 'fa-users-viewfinder' },
            { title: 'Termo de Acordo', icon: 'fa-handshake' },
            { title: 'Termo de Autorização', icon: 'fa-file-signature' }
          ].map((item, idx) => (
            <div key={idx} class="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 hover:border-amber-400 cursor-pointer transition-colors" onClick={() => onOpenTermGeneratorModal(claims[0], item.title)}>
              <i class={`fa-solid ${item.icon} text-amber-600 text-sm`}></i>
              <span class="font-semibold text-slate-800 text-[11px]">{item.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Generated Terms History */}
      <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="p-4 border-b border-slate-200">
          <h3 class="font-bold text-slate-900 text-sm">Histórico de Termos Gerados no Sistema</h3>
        </div>

        {loading ? (
          <div class="p-8 text-center text-xs text-slate-400">Carregando termos...</div>
        ) : filteredTerms.length === 0 ? (
          <div class="p-8 text-center text-xs text-slate-500">Nenhum termo encontrado.</div>
        ) : (
          <div class="divide-y divide-slate-100">
            {filteredTerms.map(trm => (
              <div key={trm.id} class="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-slate-900 text-sm">{trm.title}</span>
                    <span class="badge bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded-full font-bold">
                      {trm.type}
                    </span>
                    <span class="badge bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded-full font-bold">
                      {trm.status}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500">
                    Gerado por <strong>{trm.responsible}</strong> para <strong>{trm.involvedPerson}</strong> em {window.formatDate(trm.date)}
                  </p>
                </div>

                <div class="flex items-center gap-2">
                  <button 
                    onClick={() => alert(trm.content)}
                    class="btn bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded font-semibold"
                  >
                    Visualizar Texto
                  </button>
                  <button 
                    onClick={() => window.print()}
                    class="btn bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded font-semibold"
                  >
                    Imprimir / PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
