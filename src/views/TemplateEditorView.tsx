import React, { useState } from 'react';
import { DocumentTemplate, RoleType } from '../types';
import { usePermissions } from '../hooks/usePermissions';
import { BlocosPreview } from '../components/BlocosPreview';
import { BlocosEditor } from '../components/BlocosEditor';
import { garantirBlocos, blocosParaTexto } from '../utils/documentoBlocos';

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
  const [blocoFocado, setBlocoFocado] = useState<string | null>(null);
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
    ],
  });

  const handleStartCreate = () => {
    setEditForm({
      id: `tmpl-${Date.now()}`,
      name: 'Novo Termo de Responsabilidade Customizado',
      category: 'Responsabilidade',
      content: `JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)\nRua Florida, 116 – Nossa Chácara – Gravataí/ RS\n\nTERMO DE RESPONSABILIDADE\n\nEu, {{nome_condutor}}, inscrito no CPF sob nº {{cpf_condutor}}, condutor do veículo Placa: {{placa}}, Prefixo: {{prefixo}}, declaro para os devidos fins que...\n\nGravataí, {{data_sinistro}}.`,
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
    setIsEditing(true);
  };

  const handleStartEdit = (t: DocumentTemplate) => {
    setSelectedTemplate(t);
    setEditForm({ ...t, blocos: garantirBlocos(t) });
    setIsEditing(true);
  };

  const handleInsertVariable = (v: string) => {
    setEditForm((prev) => {
      const blocosAtuais = garantirBlocos({ blocos: prev.blocos, content: prev.content || '' });
      const alvo = blocoFocado || blocosAtuais[blocosAtuais.length - 1]?.id;
      const novos = blocosAtuais.map((b) =>
        b.id === alvo ? { ...b, texto: `${b.texto}${b.texto ? ' ' : ''}${v}` } : b
      );
      return { ...prev, blocos: novos, content: blocosParaTexto(novos) };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name) return;
    const blocosFinais = garantirBlocos({ blocos: editForm.blocos, content: editForm.content || '' });
    const textoFinal = blocosParaTexto(blocosFinais);
    if (!textoFinal.trim()) return;
    const newTmpl: DocumentTemplate = {
      id: editForm.id || `tmpl-${Date.now()}`,
      name: editForm.name,
      category: editForm.category || 'Responsabilidade',
      conditionRules: editForm.conditionRules || {},
      isActive: editForm.isActive !== undefined ? editForm.isActive : true,
      content: textoFinal,
      blocos: blocosFinais,
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
          <button
            onClick={handleStartCreate}
            className="btn bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <i className="fa-solid fa-plus"></i> Criar Novo Modelo
          </button>
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

              <div>
                <label className="form-label text-xs mb-1.5 block flex items-center gap-1.5">
                  <i className="fa-solid fa-wand-magic-sparkles text-amber-500"></i>
                  Variáveis Disponíveis
                  <span className="text-slate-400 font-normal normal-case">— clique pra inserir no cursor</span>
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  {editForm.availableVariables?.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleInsertVariable(v)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 text-amber-800 font-mono text-[10px] font-bold border border-amber-200 hover:border-amber-400 shadow-2xs transition cursor-pointer flex items-center gap-1"
                    >
                      <i className="fa-solid fa-plus text-[8px]"></i>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
                <div className="xl:col-span-3">
                  <label className="form-label text-xs flex items-center gap-1.5">
                    <i className="fa-solid fa-layer-group text-amber-500"></i>
                    Blocos do Documento
                  </label>
                  <div className="border border-slate-200 rounded-lg bg-slate-50/50 p-2.5 max-h-[480px] overflow-y-auto">
                    <BlocosEditor
                      blocos={garantirBlocos({ blocos: editForm.blocos, content: editForm.content || '' })}
                      onChange={(novos) =>
                        setEditForm({ ...editForm, blocos: novos, content: blocosParaTexto(novos) })
                      }
                      onFocoBloco={setBlocoFocado}
                    />
                  </div>
                </div>
                <div className="xl:col-span-2">
                  <label className="form-label text-xs flex items-center gap-1.5">
                    <i className="fa-solid fa-eye text-amber-500"></i>
                    Pré-visualização ao Vivo
                  </label>
                  <div className="border border-slate-200 rounded-lg bg-white p-4 min-h-[380px] max-h-[420px] overflow-y-auto trans-pinho-doc">
                    <BlocosPreview blocos={garantirBlocos({ blocos: editForm.blocos, content: editForm.content || '' })} />
                  </div>
                </div>
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
                  <BlocosPreview blocos={garantirBlocos(selectedTemplate)} />
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
