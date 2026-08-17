const { React, useEffect, useState } = window;

window.PeopleView = function PeopleView() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/people')
      .then(r => r.json())
      .then(data => setPeople(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div class="space-y-6">
      <div>
        <h2 class="text-xl font-bold text-slate-900 tracking-tight">Cadastro de Pessoas & Envolvidos</h2>
        <p class="text-xs text-slate-500 mt-0.5">Condutores, proprietários, terceiros, testemunhas e gestores corporativos.</p>
      </div>

      {loading ? (
        <div class="p-8 text-center text-xs text-slate-400">Carregando pessoas...</div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {people.map(p => (
            <div key={p.id} class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div class="flex justify-between items-start">
                <span class="badge bg-blue-100 text-blue-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                  {p.type}
                </span>
                <i class="fa-solid fa-id-card text-slate-400 text-lg"></i>
              </div>

              <div>
                <h4 class="font-bold text-slate-900 text-base">{p.name}</h4>
                <p class="text-xs text-slate-500 font-mono mt-0.5">CPF/CNPJ: {window.maskCpfCnpj(p.docNumber)}</p>
              </div>

              <div class="p-3 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-600">
                <div><i class="fa-solid fa-phone text-slate-400 text-[10px] w-4"></i> {p.phone}</div>
                <div><i class="fa-solid fa-envelope text-slate-400 text-[10px] w-4"></i> {p.email}</div>
                <div><i class="fa-solid fa-location-dot text-slate-400 text-[10px] w-4"></i> {p.address}</div>
              </div>

              <p class="text-[11px] text-slate-500 italic">"{p.notes || 'Sem observações.'}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

window.VehiclesView = function VehiclesView() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/vehicles')
      .then(r => r.json())
      .then(data => setVehicles(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div class="space-y-6">
      <div>
        <h2 class="text-xl font-bold text-slate-900 tracking-tight">Cadastro de Veículos da Frota</h2>
        <p class="text-xs text-slate-500 mt-0.5">Placas, RENAVAM, chassi e histórico de sinistros vinculados.</p>
      </div>

      {loading ? (
        <div class="p-8 text-center text-xs text-slate-400">Carregando veículos...</div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vehicles.map(v => (
            <div key={v.id} class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div class="flex justify-between items-start">
                <span class="font-black text-xl text-slate-900 tracking-wider bg-amber-100 border border-amber-300 px-3 py-1 rounded font-mono">
                  {v.plate}
                </span>
                <span class={`badge ${v.status === 'Ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'} text-[10px] px-2 py-0.5 rounded font-bold`}>
                  {v.status}
                </span>
              </div>

              <div>
                <h4 class="font-bold text-slate-900 text-sm">{v.brand} {v.model}</h4>
                <p class="text-xs text-slate-500">{v.year} • Cor {v.color}</p>
              </div>

              <div class="p-3 bg-slate-50 rounded-lg text-xs space-y-1.5 text-slate-700">
                <div class="flex justify-between">
                  <span class="text-slate-400">RENAVAM:</span>
                  <span class="font-mono font-semibold">{v.renavam}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Chassi:</span>
                  <span class="font-mono text-[11px]">{v.chassis}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Condutor Habitual:</span>
                  <span class="font-semibold">{v.defaultDriver}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
