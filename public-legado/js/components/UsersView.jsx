const { React, useEffect, useState } = window;

window.UsersView = function UsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(data => setUsers(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const rolesMatrix = [
    { role: 'ADMINISTRADOR', desc: 'Acesso total, exclusão, auditoria e configurações de sistema', create: true, edit: true, delete: true, config: true },
    { role: 'GESTOR', desc: 'Gerenciamento operacional de casos, alteração de status e geração de termos', create: true, edit: true, delete: false, config: false },
    { role: 'OPERADOR', desc: 'Cadastra novos sinistros, realiza uploads e atualiza observações', create: true, edit: true, delete: false, config: false },
    { role: 'VISUALIZADOR', desc: 'Acesso somente leitura. Não possui permissão para cadastrar ou editar', create: false, edit: false, delete: false, config: false }
  ];

  return (
    <div class="space-y-6">
      <div>
        <h2 class="text-xl font-bold text-slate-900 tracking-tight">Usuários & Matriz de Permissões (RBAC)</h2>
        <p class="text-xs text-slate-500 mt-0.5">Controle de acessos baseado em papéis no frontend e backend.</p>
      </div>

      {/* Users List */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {users.map(u => (
          <div key={u.id} class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div class="w-11 h-11 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-inner">
              {u.avatar}
            </div>
            <div class="min-w-0 flex-1">
              <h4 class="font-bold text-slate-900 text-sm truncate">{u.name}</h4>
              <p class="text-[11px] text-slate-400 truncate">{u.email}</p>
              <span class="badge bg-blue-100 text-blue-800 text-[9px] px-2 py-0.5 rounded font-bold mt-1 inline-block">
                {u.role}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Permissions Matrix */}
      <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="p-4 border-b border-slate-200">
          <h3 class="font-bold text-slate-900 text-sm">Matriz de Autorização por Perfil</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th class="p-3.5">Perfil</th>
                <th class="p-3.5">Descrição</th>
                <th class="p-3.5 text-center">Cadastrar</th>
                <th class="p-3.5 text-center">Editar / Status</th>
                <th class="p-3.5 text-center">Excluir</th>
                <th class="p-3.5 text-center">Configurações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              {rolesMatrix.map((item, idx) => (
                <tr key={idx} class="hover:bg-slate-50 transition-colors">
                  <td class="p-3.5 font-bold text-blue-600">{item.role}</td>
                  <td class="p-3.5 text-slate-600">{item.desc}</td>
                  <td class="p-3.5 text-center">{item.create ? <i class="fa-solid fa-circle-check text-emerald-600 text-sm"></i> : <i class="fa-solid fa-circle-xmark text-slate-300 text-sm"></i>}</td>
                  <td class="p-3.5 text-center">{item.edit ? <i class="fa-solid fa-circle-check text-emerald-600 text-sm"></i> : <i class="fa-solid fa-circle-xmark text-slate-300 text-sm"></i>}</td>
                  <td class="p-3.5 text-center">{item.delete ? <i class="fa-solid fa-circle-check text-emerald-600 text-sm"></i> : <i class="fa-solid fa-circle-xmark text-slate-300 text-sm"></i>}</td>
                  <td class="p-3.5 text-center">{item.config ? <i class="fa-solid fa-circle-check text-emerald-600 text-sm"></i> : <i class="fa-solid fa-circle-xmark text-slate-300 text-sm"></i>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
