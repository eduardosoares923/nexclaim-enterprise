import React, { useState, useRef } from 'react';
import { DocumentTemplate, RoleType } from '../types';
import { usePermissions } from '../hooks/usePermissions';
import { rotuloDaVariavel } from '../utils/variaveisDocumento';
import { garantirHtml } from '../utils/documentoBlocos';
import { DocxViewer } from '../components/DocxViewer';
import { arquivoParaBase64, marcarVariavelNoDocx, listarVariaveisDoDocx } from '../services/docxTemplate';

interface TemplateEditorViewProps {
  templates: DocumentTemplate[];
  onSaveTemplate: (template: DocumentTemplate) => void;
  onToggleTemplateStatus: (templateId: string) => void;
  userRole?: RoleType;
  userEmail?: string;
}

export const TemplateEditorView: React.FC<TemplateEditorViewProps> = ({
  templates,
  onSaveTemplate,
  onToggleTemplateStatus,
  userRole,
  userEmail,
}) => {
  const permissoes = usePermissions(userRole, userEmail);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(templates[0] || null);
  const [isEditing, setIsEditing] = useState(false);
  const [textoSelecionado, setTextoSelecionado] = useState('');
  const docxInputRef = useRef<HTMLInputElement | null>(null);
  const [editForm, setEditForm] = useState<Partial<DocumentTemplate>>({
    name: '',
    category: 'Responsabilidade',
    content: '',
    isActive: true,
    availableVariables: [
      '{{nome_condutor}}',
      '{{cpf_condutor}}',
      '{{placa}}',
      '{{prefixo}}',
      '{{data_sinistro}}',
      '{{hora_sinistro}}',
      '{{local_sinistro}}',
      '{{cidade}}',
      '{{estado}}',
      '{{valor_total}}',
      '{{motivo_infracao}}',
      '{{nome_terceiro}}',
      '{{cpf_terceiro}}',
      '{{placa_terceiro}}',
      '{{modelo_veiculo_terceiro}}',
    ],
  });

  const handleImportarWord = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await arquivoParaBase64(file);

      if (base64.length > 900000) {
        alert('Esse arquivo Word é grande demais para ser salvo. Tente reduzir as imagens dentro dele.');
        return;
      }

      setEditForm({
        id: `tmpl-${Date.now()}`,
        name: file.name.replace(/\.docx?$/i, ''),
        category: 'Responsabilidade',
        content: '',
        docxBase64: base64,
        docxFileName: file.name,
        isActive: true,
        availableVariables: [
          '{{nome_condutor}}', '{{cpf_condutor}}', '{{placa}}', '{{prefixo}}',
          '{{auto_infracao}}', '{{data_infracao}}', '{{horario_infracao}}',
          '{{motivo_infracao}}', '{{valor_infracao}}', '{{valor_total}}',
          '{{valor_total_extenso}}', '{{data_vencimento}}', '{{numero_parcelas}}',
          '{{valor_parcela}}', '{{data_primeira_parcela}}', '{{dia_assinatura}}',
          '{{mes_assinatura}}', '{{nome_terceiro}}', '{{cpf_terceiro}}',
          '{{placa_terceiro}}', '{{modelo_veiculo_terceiro}}', '{{data_sinistro}}',
          '{{hora_sinistro}}', '{{local_sinistro}}', '{{cidade}}', '{{estado}}',
        ],
        conditionRules: {},
      });
      setTextoSelecionado('');
      setIsEditing(true);
    } catch (err: any) {
      alert(`Não foi possível ler o arquivo Word: ${err?.message || err}`);
    } finally {
      if (docxInputRef.current) docxInputRef.current.value = '';
    }
  };

  const handleStartCreate = () => {
    setEditForm({
      id: `tmpl-${Date.now()}`,
      name: 'Novo Termo de Responsabilidade Customizado',
      category: 'Responsabilidade',
      content: `JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)\nRua Florida, 116 – Nossa Chácara – Gravataí/ RS\n\nTERMO DE RESPONSABILIDADE\n\nEu, {{nome_condutor}}, inscrito no CPF sob nº {{cpf_condutor}}, condutor do veículo Placa: {{placa}}, Prefixo: {{prefixo}}, declaro para os devidos fins que...\n\nGravataí, {{data_sinistro}}.`,
      htmlContent: `<h1>JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)</h1><p>Rua Florida, 116 – Nossa Chácara – Gravataí/ RS</p><h1>TERMO DE RESPONSABILIDADE</h1><p>Eu, {{nome_condutor}}, inscrito no CPF sob nº {{cpf_condutor}}, condutor do veículo Placa: {{placa}}, Prefixo: {{prefixo}}, declaro para os devidos fins que...</p><p>Gravataí, {{data_sinistro}}.</p>`,
      isActive: true,
      availableVariables: [
        '{{nome_condutor}}',
        '{{cpf_condutor}}',
        '{{placa}}',
        '{{prefixo}}',
        '{{data_sinistro}}',
        '{{valor_total}}',
      ],
      conditionRules: { occurrenceType: 'Colisão' },
    });
    setTextoSelecionado('');
    setIsEditing(true);
  };

  const handleStartEdit = (t: DocumentTemplate) => {
    setSelectedTemplate(t);
    setEditForm({ ...t, htmlContent: t.htmlContent || (t.docxBase64 ? undefined : garantirHtml(t)) });
    setTextoSelecionado('');
    setIsEditing(true);
  };

  const handleInsertVariable = (v: string) => {
    if (!editForm.docxBase64) {
      alert('Importe um arquivo Word primeiro.');
      return;
    }
    if (!textoSelecionado) {
      alert('Selecione com o mouse, no documento abaixo, o texto que essa variável deve substituir.');
      return;
    }
    try {
      const novoBase64 = marcarVariavelNoDocx(editForm.docxBase64, textoSelecionado, v);
      setEditForm((prev) => ({ ...prev, docxBase64: novoBase64 }));
      setTextoSelecionado('');
    } catch (err: any) {
      alert(`Não foi possível marcar a variável: ${err?.message || err}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name) return;
    if (!editForm.docxBase64 && !editForm.htmlContent) {
      alert('Importe um arquivo Word antes de salvar o modelo.');
      return;
    }
    const newTmpl: DocumentTemplate = {
      id: editForm.id || `tmpl-${Date.now()}`,
      name: editForm.name,
      category: editForm.category || 'Responsabilidade',
      conditionRules: editForm.conditionRules || {},
      isActive: editForm.isActive !== undefined ? editForm.isActive : true,
      content: editForm.content || '',
      htmlContent: editForm.htmlContent,
      docxBase64: editForm.docxBase64,
      docxFileName: editForm.docxFileName,
      availableVariables: editForm.availableVariables || [],
    };
    onSaveTemplate(newTmpl);
    setSelectedTemplate(newTmpl);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white p-4 sm:p-6 rounded-xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="badge bg-amber-500 text-slate-950 text-[10px] px-2.5 py-0.5 rounded font-black uppercase mb-1 inline-block">
            Módulo Administrativo
          </span>
          <h2 className="text-xl font-bold tracking-tight">Editor de Modelos de Documentos</h2>
          <p className="text-xs text-slate-300 mt-1">
            Cadastre modelos de termos com variáveis dinâmicas e regras automáticas de recomendação.
          </p>
        </div>
        {permissoes.podeCriar && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <input
              type="file"
              ref={docxInputRef}
              onChange={handleImportarWord}
              accept=".docx"
              className="hidden"
            />
            <button
              onClick={() => docxInputRef.current?.click()}
              className="bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm border border-slate-200 cursor-pointer transition"
              title="Importar um arquivo Word (.docx) como novo modelo"
            >
              <i className="fa-solid fa-file-word text-blue-600"></i> Importar Word
            </button>
            <button
              onClick={handleStartCreate}
              className="btn bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <i className="fa-solid fa-plus"></i> Criar Novo Modelo
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates List */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Modelos Cadastrados</h3>
          <div className="space-y-2 text-xs">
            {templates.map((t) => {
              const isSel = selectedTemplate?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTemplate(t);
                    setIsEditing(false);
                  }}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSel
                      ? 'bg-amber-50 border-amber-300 text-slate-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="badge bg-slate-200 text-slate-800 text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                      {t.category}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTemplateStatus(t.id);
                      }}
                      className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                        t.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {t.isActive ? 'Ativo' : 'Inativo'}
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-2">{t.name}</h4>
                  <div className="mt-3 flex justify-between items-center text-[10px] text-slate-500">
                    <span>{t.availableVariables.length} Variáveis</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(t);
                      }}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Editar →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Template Detail / Form */}
        <div className="lg:col-span-2">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Formulário de Edição do Modelo</h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xs">Nome do Modelo *</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="form-input text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Categoria *</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value as any })}
                    className="form-select text-xs font-semibold"
                  >
                    <option value="Responsabilidade">Responsabilidade</option>
                    <option value="Ciência">Ciência</option>
                    <option value="Entrega">Entrega</option>
                    <option value="Acordo">Acordo</option>
                    <option value="Declaração">Declaração</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <label className="form-label text-xs flex items-center gap-1.5 mb-0">
                  <i className="fa-solid fa-filter text-amber-500"></i>
                  Quando este modelo deve aparecer
                </label>
                <p className="text-[10px] text-slate-500">
                  Deixe em branco para o modelo aparecer sempre. Preencha para ele
                  aparecer só na situação certa.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Origem</label>
                    <select
                      value={editForm.conditionRules?.hasFine ? 'multa' : 'sinistro'}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          conditionRules: {
                            ...editForm.conditionRules,
                            hasFine: e.target.value === 'multa' ? true : undefined,
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="sinistro">Sinistro</option>
                      <option value="multa">Multa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Culpado</label>
                    <select
                      value={editForm.conditionRules?.atFault || ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          conditionRules: {
                            ...editForm.conditionRules,
                            atFault: e.target.value || undefined,
                          },
                        })
                      }
                      disabled={!!editForm.conditionRules?.hasFine}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white disabled:opacity-50"
                    >
                      <option value="">Qualquer</option>
                      <option value="Motorista Trans Pinho">Motorista Trans Pinho</option>
                      <option value="Terceiro">Terceiro</option>
                      <option value="Motorista não assume a culpa">Motorista não assume a culpa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Direção do Pagamento</label>
                    <select
                      value={editForm.conditionRules?.paymentDirection || ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          conditionRules: {
                            ...editForm.conditionRules,
                            paymentDirection: (e.target.value || undefined) as 'Pagar' | 'Cobrar' | undefined,
                          },
                        })
                      }
                      disabled={!!editForm.conditionRules?.hasFine}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white disabled:opacity-50"
                    >
                      <option value="">Qualquer</option>
                      <option value="Pagar">Pagar (empresa paga o terceiro)</option>
                      <option value="Cobrar">Cobrar (empresa recebe)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Quem assina</label>
                    <select
                      value={editForm.conditionRules?.signatario || 'condutor'}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          conditionRules: {
                            ...editForm.conditionRules,
                            signatario: e.target.value as 'condutor' | 'terceiro',
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="condutor">Condutor</option>
                      <option value="terceiro">Terceiro</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label text-xs mb-1.5 block flex items-center gap-1.5">
                  <i className="fa-solid fa-wand-magic-sparkles text-amber-500"></i>
                  Variáveis Disponíveis
                  <span className="text-slate-400 font-normal normal-case">
                    — selecione um texto no documento e clique pra substituir, ou clique pra inserir no cursor
                  </span>
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  {editForm.availableVariables?.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleInsertVariable(v)}
                      title={`Insere ${v} — selecione um texto antes pra substituir`}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 hover:border-amber-400 shadow-2xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-plus text-[8px]"></i>
                      {rotuloDaVariavel(v)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label text-xs flex items-center gap-1.5 mb-1.5">
                  <i className="fa-solid fa-file-word text-blue-600"></i>
                  Documento do Modelo
                </label>

                {editForm.docxBase64 ? (
                  <>
                    <div className={`mb-2 px-3 py-2 rounded-lg border text-xs ${
                      textoSelecionado
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                      {textoSelecionado ? (
                        <>
                          <i className="fa-solid fa-hand-pointer mr-1.5"></i>
                          Selecionado: <strong>"{textoSelecionado}"</strong> — agora clique na variável correspondente lá em cima.
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-circle-info mr-1.5"></i>
                          Selecione com o mouse, no documento abaixo, o dado que deve virar variável (ex: o nome da pessoa), depois clique na variável correspondente.
                        </>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-500 mb-1.5">
                      Variáveis já marcadas neste documento:{' '}
                      <strong>{listarVariaveisDoDocx(editForm.docxBase64).join(', ') || 'nenhuma ainda'}</strong>
                    </p>

                    <DocxViewer
                      docxBase64={editForm.docxBase64}
                      onTextoSelecionado={setTextoSelecionado}
                    />
                  </>
                ) : (
                  <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                    <i className="fa-solid fa-file-word text-3xl text-slate-300"></i>
                    <p className="text-xs font-bold text-slate-600 mt-2">Nenhum documento Word neste modelo</p>
                    <p className="text-[11px] text-slate-400">Use o botão "Importar Word" no topo da tela.</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-secondary text-xs px-4 py-2"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn bg-amber-500 text-slate-950 font-black text-xs px-5 py-2">
                  Salvar Modelo
                </button>
              </div>
            </form>
          ) : selectedTemplate ? (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div>
                  <span className="badge bg-slate-100 text-slate-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                    {selectedTemplate.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-1">{selectedTemplate.name}</h3>
                </div>
                <button
                  onClick={() => handleStartEdit(selectedTemplate)}
                  className="btn bg-slate-900 text-white text-xs px-4 py-2 font-bold rounded-lg"
                >
                  Editar Modelo
                </button>
              </div>

              <div>
                <label className="form-label text-xs flex items-center gap-1.5 mb-1.5">
                  <i className="fa-solid fa-eye text-amber-500"></i>
                  Pré-visualização do Modelo com Variáveis
                </label>
                <div className="border border-slate-200 rounded-lg bg-white p-6 max-h-[500px] overflow-y-auto trans-pinho-doc">
                  {selectedTemplate.docxBase64 ? (
                    <DocxViewer docxBase64={selectedTemplate.docxBase64} />
                  ) : (
                    <div
                      className="prose-documento"
                      dangerouslySetInnerHTML={{ __html: garantirHtml(selectedTemplate) }}
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
              Selecione um modelo à esquerda para editar ou clique em Novo Modelo.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
