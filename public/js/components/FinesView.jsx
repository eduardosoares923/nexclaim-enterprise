const { React, useEffect, useState } = window;

window.FinesView = function FinesView() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFines();
  }, []);

  async function fetchFines() {
    try {
      const res = await fetch('/api/fines');
      const data = await res.json();
      setFines(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const pendingCount = fines.filter(f => f.status === 'Pendente').length;
  const paidCount = fines.filter(f => f.status === 'Paga').length;
  const totalAmount = fines.reduce((acc, f) => acc + (f.amount || 0), 0);

  return (
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight">Módulo de Controle de Multas & Infrações</h2>
          <p class="text-xs text-slate-500 mt-0.5">Gerenciamento de autos de infração, pontos na CNH, prazos e pagamentos.</p>
        </div>
      </div>

      {/* KPI Indicator Cards */}
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Total de Multas</span>
          <p class="text-xl font-black text-slate-900 mt-1">{fines.length}</p>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span class="text-[10px] font-bold text-amber-600 uppercase">Pendentes</span>
          <p class="text-xl font-black text-amber-600 mt-1">{pendingCount}</p>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span class="text-[10px] font-bold text-emerald-600 uppercase">Pagas / Liquidadas</span>
          <p class="text-xl font-black text-emerald-600 mt-1">{paidCount}</p>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Valor Financeiro Acumulado</span>
          <p class="text-xl font-black text-slate-900 mt-1">{window.formatCurrency(totalAmount)}</p>
        </div>
      </div>

      {/* Fines Data Table */}
      <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 class="font-bold text-slate-900 text-sm">Registros de Auto de Infração</h3>
        </div>
        {loading ? (
          <div class="p-8 text-center text-xs text-slate-400">Carregando multas...</div>
        ) : (
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th class="p-3.5">Auto de Infração</th>
                  <th class="p-3.5">Veículo / Condutor</th>
                  <th class="p-3.5">Código & Descrição</th>
                  <th class="p-3.5">Valor / Pontos</th>
                  <th class="p-3.5">Vencimento</th>
                  <th class="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                {fines.map(fine => (
                  <tr key={fine.id} class="hover:bg-slate-50 transition-colors">
                    <td class="p-3.5 font-bold text-slate-900 font-mono">{fine.infractionAuto}</td>
                    <td class="p-3.5">
                      <span class="font-bold text-slate-800">{fine.vehiclePlate}</span>
                      <div class="text-[10px] text-slate-500">{fine.driverName}</div>
                    </td>
                    <td class="p-3.5">
                      <span class="font-bold text-slate-800">{fine.infractionCode}</span>
                      <div class="text-[10px] text-slate-500">{fine.description}</div>
                    </td>
                    <td class="p-3.5 font-bold text-slate-900">
                      {window.formatCurrency(fine.amount)}
                      <div class="text-[10px] text-amber-600 font-semibold">{fine.points} pontos</div>
                    </td>
                    <td class="p-3.5 font-medium text-slate-700">{window.formatDate(fine.dueDate)}</td>
                    <td class="p-3.5">
                      <span class={`badge ${window.getStatusBadgeClass(fine.status)} px-2.5 py-0.5 rounded-full text-[10px] font-bold border`}>
                        {fine.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
