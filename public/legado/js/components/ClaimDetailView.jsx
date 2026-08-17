const { React, useEffect, useState } = window;

window.ClaimDetailView = function ClaimDetailView({ claimId, setCurrentView, onOpenExportModal, onOpenTermGeneratorModal }) {
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('visao-geral');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [notesList, setNotesList] = useState([]);

  useEffect(() => {
    fetchDossier();
  }, [claimId]);

  async function fetchDossier() {
    setLoading(true);
    try {
      const res = await fetch(`/api/claims/${claimId}/dossier`);
      const data = await res.json();
      setDossier(data);
      if (data && data.claim && data.claim.notes) {
        setNotesList([data.claim.notes]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(newStatus) {
    try {
      await fetch(`/api/claims/${claimId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchDossier();
    } catch (err) {
      console.error(err);
    }
  }

  function handleAddNote(e) {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotesList([newNote.trim(), ...notesList]);
    setNewNote('');
  }

  if (loading) {
    return <div class="p-12 text-center text-xs text-slate-400 animate-pulse">Carregando dossiê digital do sinistro...</div>;
  }

  if (!dossier || !dossier.claim) {
    return (
      <div class="bg-white p-12 text-center rounded-xl border border-slate-200">
        <h3 class="font-bold text-slate-800 text-sm mb-2">Sinistro não encontrado</h3>
        <button onClick={() => setCurrentView('claims')} class="btn btn-primary text-xs">
          Voltar para Lista de Sinistros
        </button>
      </div>
    );
  }

  const { claim, timeline, documents, media, fines, terms, vehicle, driver } = dossier;

  const tabs = [
    { id: 'visao-geral', label: 'Visão Geral', icon: 'fa-table-cells-large' },
    { id: 'timeline', label: `Timeline (${timeline.length})`, icon: 'fa-clock-rotate-left' },
    { id: 'documentos', label: `Documentos (${documents.length})`, icon: 'fa-file-contract' },
    { id: 'fotos', label: `Fotos & Mídias (${media.length})`, icon: 'fa-camera' },
    { id: 'multas', label: `Multas (${fines.length})`, icon: 'fa-file-invoice-dollar' },
    { id: 'termos', label: `Termos & Declarações (${terms.length})`, icon: 'fa-file-pen' },
    { id: 'pessoas', label: 'Pessoas Envolvidas', icon: 'fa-users' },
    { id: 'veiculos', label: 'Veículos', icon: 'fa-car' },
    { id: 'orcamentos', label: 'Orçamentos', icon: 'fa-calculator' },
    { id: 'observacoes', label: 'Observações', icon: 'fa-comments' }
  ];

  return (
    <div class="space-y-6">
      {/* Top Navigation & Breadcrumb */}
      <div class="flex items-center justify-between text-xs text-slate-500">
        <button 
          onClick={() => setCurrentView('claims')} 
          class="flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          <i class="fa-solid fa-arrow-left text-xs"></i> Voltar para Sinistros
        </button>
        <span class="font-mono text-[11px]">Dossiê Digital • LGPD Compliance Active</span>
      </div>

      {/* Main Dossier Header Banner */}
      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div class="flex items-center gap-3 flex-wrap">
              <h2 class="text-2xl font-black text-slate-900 tracking-tight">{claim.claimNumber}</h2>
              <span class={`badge ${window.getStatusBadgeClass(claim.status)} px-3 py-1 rounded-full text-xs font-bold border`}>
                {claim.status}
              </span>
              <span class={`badge ${window.getPriorityBadgeClass(claim.priority)} px-2.5 py-0.5 rounded text-xs font-bold border`}>
                Prioridade: {claim.priority}
              </span>
            </div>
            
            <p class="text-xs text-slate-500 font-mono mt-1">
              Protocolo: <strong>{claim.protocol}</strong> | B.O.: <strong>{claim.boNumber}</strong> | Data: <strong>{window.formatDate(claim.date)} às {claim.time}</strong>
            </p>

            <div class="mt-4 flex flex-wrap gap-4 text-xs">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-car text-blue-600"></i>
                <span class="text-slate-600">Veículo: <strong>{claim.vehiclePlate} ({claim.vehicleModel})</strong></span>
              </div>
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-user text-indigo-600"></i>
                <span class="text-slate-600">Condutor: <strong>{claim.driverName}</strong></span>
              </div>
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-building-shield text-amber-600"></i>
                <span class="text-slate-600">Seguradora: <strong>{claim.insurer} (Apólice: {claim.policyNumber})</strong></span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div class="flex flex-wrap gap-2 self-start lg:self-center">
            {/* Status Change Selector */}
            <select 
              value={claim.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              class="bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold px-3 py-2 text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="Novo">Status: Novo</option>
              <option value="Em análise">Status: Em análise</option>
              <option value="Aguardando documentos">Status: Aguardando documentos</option>
              <option value="Aguardando seguradora">Status: Aguardando seguradora</option>
              <option value="Em vistoria">Status: Em vistoria</option>
              <option value="Em reparo">Status: Em reparo</option>
              <option value="Resolvido">Status: Resolvido</option>
              <option value="Encerrado">Status: Encerrado</option>
              <option value="Cancelado">Status: Cancelado</option>
            </select>

            <button 
              onClick={() => onOpenTermGeneratorModal(claim)}
              class="btn bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <i class="fa-solid fa-file-pen text-xs"></i> Gerar Termo
            </button>

            <button 
              onClick={() => onOpenExportModal(claim)}
              class="btn bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <i class="fa-solid fa-file-pdf text-xs text-rose-400"></i> Exportar Dossiê
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Header */}
      <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="flex border-b border-slate-200 overflow-x-auto px-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              class={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <i class={`fa-solid ${tab.icon} text-xs`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Container */}
        <div class="p-6">
          
          {/* TAB 1: VISÃO GERAL */}
          {activeTab === 'visao-geral' && (
            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="md:col-span-2 space-y-4">
                  <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 text-blue-600">Descrição Detalhada do Evento</h4>
                    <p class="text-xs text-slate-700 leading-relaxed">{claim.description}</p>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span class="text-[10px] uppercase font-bold text-slate-400">Local da Ocorrência</span>
                      <p class="text-xs font-bold text-slate-800 mt-1">{claim.location}</p>
                      <p class="text-[11px] text-slate-500">{claim.city} / {claim.state}</p>
                    </div>

                    <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span class="text-[10px] uppercase font-bold text-slate-400">Responsável Interno</span>
                      <p class="text-xs font-bold text-slate-800 mt-1">{claim.assignedUser}</p>
                      <p class="text-[11px] text-slate-500">Gestão Operacional</p>
                    </div>
                  </div>
                </div>

                {/* Costs Summary Sidebar */}
                <div class="space-y-4">
                  <div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-xl border border-slate-700 shadow-sm">
                    <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Custo Estimado x Aprovado</span>
                    <div class="mt-3 space-y-3">
                      <div>
                        <span class="text-[11px] text-slate-400">Estimado:</span>
                        <p class="text-lg font-bold text-slate-200">{window.formatCurrency(claim.estimatedCost)}</p>
                      </div>
                      <div>
                        <span class="text-[11px] text-slate-400">Aprovado pela Seguradora:</span>
                        <p class="text-xl font-black text-emerald-400">{window.formatCurrency(claim.approvedCost)}</p>
                      </div>
                    </div>
                  </div>

                  <div class="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                    <h5 class="font-bold text-amber-900 mb-1"><i class="fa-solid fa-circle-info"></i> Notas Operacionais</h5>
                    <p class="text-amber-800 leading-relaxed text-[11px]">{claim.notes}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TIMELINE */}
          {activeTab === 'timeline' && (
            <div class="space-y-6">
              <h4 class="font-bold text-slate-900 text-sm">Linha do Tempo Cronológica do Caso</h4>
              <div class="relative border-l-2 border-slate-200 ml-4 space-y-6 pl-6 py-2">
                {timeline.map((evt, idx) => (
                  <div key={evt.id || idx} class="relative">
                    <div class="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shadow-sm">
                      <i class="fa-solid fa-check"></i>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="font-bold text-xs text-slate-900">{evt.actionType}</span>
                        <span class="text-[10px] text-slate-400">{window.formatDateTime(evt.timestamp)}</span>
                      </div>
                      <p class="text-xs text-slate-600">{evt.description}</p>
                      <span class="text-[10px] text-blue-600 font-semibold inline-block pt-1">
                        <i class="fa-solid fa-user text-[9px]"></i> {evt.user}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENTOS */}
          {activeTab === 'documentos' && (
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <h4 class="font-bold text-slate-900 text-sm">Documentos Digitalizados</h4>
                <button class="btn bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold">
                  <i class="fa-solid fa-upload"></i> Anexar Documento
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map(doc => (
                  <div key={doc.id} class="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                    <div class="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center text-lg flex-shrink-0">
                      <i class="fa-solid fa-file-pdf"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h5 class="font-bold text-xs text-slate-800 truncate">{doc.title}</h5>
                      <span class="badge bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[9px] font-bold mt-1 inline-block">
                        {doc.category}
                      </span>
                      <p class="text-[10px] text-slate-400 mt-1">Enviado por {doc.uploadedBy} em {window.formatDate(doc.uploadDate)} ({doc.fileSize})</p>
                      <p class="text-[11px] text-slate-600 mt-1 italic">{doc.notes}</p>
                    </div>
                    <a href={doc.filePath || '#'} target="_blank" class="btn bg-white border border-slate-300 text-slate-700 text-xs px-2.5 py-1 rounded">
                      Ver
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: FOTOS & MÍDIAS */}
          {activeTab === 'fotos' && (
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <h4 class="font-bold text-slate-900 text-sm">Galeria de Fotografias e Registros Visuais</h4>
                <button class="btn bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold">
                  <i class="fa-solid fa-camera"></i> Adicionar Fotos
                </button>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {media.map(med => (
                  <div 
                    key={med.id} 
                    onClick={() => setLightboxImage(med)}
                    class="group relative bg-slate-900 rounded-xl overflow-hidden shadow-xs cursor-pointer aspect-square"
                  >
                    <img src={med.url} alt={med.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                      <span class="badge bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded w-fit mb-1 font-bold">{med.category}</span>
                      <p class="text-white font-bold text-xs truncate">{med.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: MULTAS */}
          {activeTab === 'multas' && (
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <h4 class="font-bold text-slate-900 text-sm">Multas e Infrações Vinculadas</h4>
                <button onClick={() => setCurrentView('fines')} class="btn bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold">
                  Cadastrar Multa
                </button>
              </div>

              {fines.length === 0 ? (
                <p class="text-xs text-slate-500">Nenhuma multa registrada para este sinistro.</p>
              ) : (
                <div class="overflow-x-auto border border-slate-200 rounded-xl">
                  <table class="w-full text-left text-xs">
                    <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[10px]">
                      <tr>
                        <th class="p-3">Auto de Infração</th>
                        <th class="p-3">Código / Descrição</th>
                        <th class="p-3">Valor / Pontos</th>
                        <th class="p-3">Vencimento</th>
                        <th class="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      {fines.map(fine => (
                        <tr key={fine.id}>
                          <td class="p-3 font-bold text-slate-900">{fine.infractionAuto}</td>
                          <td class="p-3">
                            <span class="font-semibold text-slate-800">{fine.infractionCode}</span>
                            <div class="text-[10px] text-slate-500">{fine.description}</div>
                          </td>
                          <td class="p-3 font-bold text-slate-900">
                            {window.formatCurrency(fine.amount)}
                            <div class="text-[10px] text-amber-600 font-semibold">{fine.points} pontos</div>
                          </td>
                          <td class="p-3 font-medium text-slate-700">{window.formatDate(fine.dueDate)}</td>
                          <td class="p-3">
                            <span class={`badge ${window.getStatusBadgeClass(fine.status)} px-2 py-0.5 rounded text-[10px] font-bold`}>
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
          )}

          {/* TAB 6: TERMOS */}
          {activeTab === 'termos' && (
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <h4 class="font-bold text-slate-900 text-sm">Termos e Declarações Geradas (Requisito 35)</h4>
                <button onClick={() => onOpenTermGeneratorModal(claim)} class="btn bg-amber-500 hover:bg-amber-600 text-white text-xs px-3.5 py-1.5 rounded-lg font-semibold">
                  <i class="fa-solid fa-file-pen"></i> Gerar Novo Termo
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {terms.map(trm => (
                  <div key={trm.id} class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div class="flex justify-between items-start">
                      <h5 class="font-bold text-xs text-slate-900">{trm.title}</h5>
                      <span class="badge bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded-full font-bold">
                        {trm.status}
                      </span>
                    </div>
                    <p class="text-[11px] text-slate-600 font-mono bg-white p-3 rounded border border-slate-200 whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {trm.content}
                    </p>
                    <div class="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                      <span>Gerado em {window.formatDate(trm.date)}</span>
                      <button onClick={() => alert(trm.content)} class="text-blue-600 font-bold hover:underline">
                        Visualizar Completo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: PESSOAS ENVOLVIDAS */}
          {activeTab === 'pessoas' && (
            <div class="space-y-4">
              <h4 class="font-bold text-slate-900 text-sm">Envolvidos no Sinistro</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span class="badge bg-blue-100 text-blue-800 text-[9px] px-2 py-0.5 rounded font-bold">Condutor Principal</span>
                  <h5 class="font-bold text-sm text-slate-900 mt-2">{claim.driverName}</h5>
                  <p class="text-xs text-slate-500 mt-1">CPF: <strong>{window.maskCpfCnpj('12345678900')}</strong></p>
                  <p class="text-xs text-slate-500">Telefone: (11) 98765-4321</p>
                </div>
                <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span class="badge bg-purple-100 text-purple-800 text-[9px] px-2 py-0.5 rounded font-bold">Terceiro Envolvido</span>
                  <h5 class="font-bold text-sm text-slate-900 mt-2">Eduardo Santos</h5>
                  <p class="text-xs text-slate-500 mt-1">Veículo Terceiro: Honda Civic (Placa JKL-9988)</p>
                  <p class="text-xs text-slate-500">Telefone: (11) 91234-5678</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: VEÍCULOS */}
          {activeTab === 'veiculos' && (
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <h4 class="font-bold text-slate-900 text-sm">Ficha Técnica do Veículo Envolvido</h4>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div><span class="text-slate-400">Placa:</span><p class="font-bold text-slate-800">{claim.vehiclePlate}</p></div>
                <div><span class="text-slate-400">Modelo:</span><p class="font-bold text-slate-800">{claim.vehicleModel}</p></div>
                <div><span class="text-slate-400">Proprietário:</span><p class="font-bold text-slate-800">Auto Frota Brasil Ltda</p></div>
                <div><span class="text-slate-400">RENAVAM:</span><p class="font-bold text-slate-800">01928374650</p></div>
              </div>
            </div>
          )}

          {/* TAB 9: ORÇAMENTOS */}
          {activeTab === 'orcamentos' && (
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <h4 class="font-bold text-slate-900 text-sm">Detalhamento Financeiro e Funilaria</h4>
              <div class="space-y-2">
                <div class="flex justify-between p-2.5 bg-white rounded border border-slate-200">
                  <span>Mão de Obra Funilaria & Pintura</span>
                  <span class="font-bold">R$ 4.500,00</span>
                </div>
                <div class="flex justify-between p-2.5 bg-white rounded border border-slate-200">
                  <span>Peças Originais (Para-choque & Lanterna)</span>
                  <span class="font-bold">R$ 3.400,00</span>
                </div>
                <div class="flex justify-between p-3 bg-blue-50 rounded border border-blue-200 font-bold text-blue-900">
                  <span>VALOR TOTAL APROVADO:</span>
                  <span>{window.formatCurrency(claim.approvedCost)}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: OBSERVAÇÕES */}
          {activeTab === 'observacoes' && (
            <div class="space-y-4">
              <form onSubmit={handleAddNote} class="space-y-2">
                <textarea 
                  rows="3"
                  placeholder="Adicionar nova observação interna para o dossiê..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  class="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                ></textarea>
                <button type="submit" class="btn bg-blue-600 text-white text-xs px-4 py-1.5 rounded-lg font-semibold">
                  Adicionar Nota
                </button>
              </form>

              <div class="space-y-2">
                {notesList.map((note, i) => (
                  <div key={i} class="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                    <div class="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Mariana Souza (Gestor)</span>
                      <span>Recente</span>
                    </div>
                    {note}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
          <div class="max-w-4xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImage.url} alt={lightboxImage.title} class="max-h-[80vh] w-auto rounded-lg object-contain" />
            <div class="text-white mt-3 text-center">
              <h4 class="font-bold text-sm">{lightboxImage.title}</h4>
              <p class="text-xs text-slate-300">{lightboxImage.description}</p>
            </div>
            <button onClick={() => setLightboxImage(null)} class="absolute -top-10 right-0 text-white text-xl">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
