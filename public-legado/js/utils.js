/* ==========================================================================
   NexClaim Enterprise - Helper Utilities (React Compatible)
   ========================================================================== */

window.formatCurrency = function(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
};

window.formatDate = function(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

window.formatDateTime = function(isoString) {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

window.maskCpfCnpj = function(val) {
  if (!val) return 'N/A';
  const clean = val.replace(/\D/g, '');
  if (clean.length === 11) {
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (clean.length === 14) {
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return val;
};

window.getStatusBadgeClass = function(status) {
  const map = {
    'Novo': 'bg-blue-100 text-blue-800 border-blue-200',
    'Em análise': 'bg-amber-100 text-amber-800 border-amber-200',
    'Aguardando documentos': 'bg-orange-100 text-orange-800 border-orange-200',
    'Aguardando seguradora': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Em vistoria': 'bg-purple-100 text-purple-800 border-purple-200',
    'Em reparo': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Resolvido': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Encerrado': 'bg-slate-100 text-slate-800 border-slate-200',
    'Cancelado': 'bg-rose-100 text-rose-800 border-rose-200',
    'Pendente': 'bg-amber-100 text-amber-800 border-amber-200',
    'Paga': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Contestada': 'bg-blue-100 text-blue-800 border-blue-200'
  };
  return map[status] || 'bg-slate-100 text-slate-700 border-slate-200';
};

window.getPriorityBadgeClass = function(priority) {
  const map = {
    'Baixa': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Média': 'bg-amber-50 text-amber-700 border-amber-200',
    'Alta': 'bg-orange-50 text-orange-700 border-orange-200',
    'Crítica': 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
  };
  return map[priority] || 'bg-slate-50 text-slate-700 border-slate-200';
};
