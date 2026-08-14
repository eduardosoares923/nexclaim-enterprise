const { React, useEffect, useState } = window;

window.AuditLogView = function AuditLogView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/audit-log')
      .then(r => r.json())
      .then(data => setLogs(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight">Rastreabilidade & Logs de Auditoria LGPD</h2>
          <p class="text-xs text-slate-500 mt-0.5">Registro imutável de acessos, downloads, alterações de status e permissões.</p>
        </div>
        <span class="badge bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold border border-emerald-200">
          <i class="fa-solid fa-shield-check mr-1"></i> LGPD Compliant
        </span>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div class="p-8 text-center text-xs text-slate-400">Carregando logs de auditoria...</div>
        ) : (
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th class="p-3.5">Data / Hora</th>
                  <th class="p-3.5">Usuário / Perfil</th>
                  <th class="p-3.5">Ação Registrada</th>
                  <th class="p-3.5">Detalhamento</th>
                  <th class="p-3.5">IP de Origem</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                {logs.map(log => (
                  <tr key={log.id} class="hover:bg-slate-50 transition-colors">
                    <td class="p-3.5 font-mono text-[11px] text-slate-500">{window.formatDateTime(log.timestamp)}</td>
                    <td class="p-3.5">
                      <span class="font-bold text-slate-800">{log.user}</span>
                      <div class="text-[10px] text-blue-600 font-semibold">{log.userRole}</div>
                    </td>
                    <td class="p-3.5">
                      <span class="badge bg-slate-100 text-slate-800 border border-slate-300 font-mono text-[10px] px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td class="p-3.5 text-slate-700 font-medium">{log.detail}</td>
                    <td class="p-3.5 font-mono text-[11px] text-slate-400">{log.ip}</td>
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
