import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { InfractionType } from '../types';
import { useConfirm } from '../contexts/ConfirmContext';
import { useToast } from '../contexts/ToastContext';

export const CATALOGO_PADRAO_INICIAL: Omit<InfractionType, 'id'>[] = [
  { description: 'AVANÇAR O SINAL VERMELHO DO SEMAFORO - EXC HOUVER SINALIZ PERM LIVRE CONV A DIREITA FISC ELETRONICA', amount: 293.47, points: 7 },
  { description: 'CONDUZIR O VEICULO COM EQUIPAMENTO OBRIGATORIO EM DESACORDO COM ESTAB PELO CONTRAN', amount: 195.23, points: 5 },
  { description: 'ESTACIONAR O VEÍCULO NO PASSEIO', amount: 195.23, points: 5 },
  { description: 'CONDUZIR O VEÍCULO COM A COR ALTERADA', amount: 195.23, points: 5 },
  { description: 'CONDUZIR O VEÍCULO EM MAU ESTADO DE CONSERVAÇÃO, COMPROMETENDO A SEGURANÇA', amount: 195.23, points: 5 },
  { description: 'CONDUZIR O VEICULO COM EQUIPAMENTO OBRIGATORIO INEFICIENTE/ INOPERANTE', amount: 195.23, points: 5 },
  { description: 'CONDUZIR VEIC C/DEFEITO NO SIST DE ILUMICAÇÃO, SINALIZ OU LAMPADAS QUEIMADAS', amount: 130.16, points: 4 },
  { description: 'DEIXA DE EFETUAR PAGAMENTO PELO USO DE RODOVIAS E VIAS URBANAS NA FORMA ESTABELECIDA', amount: 195.23, points: 5 },
  { description: 'DEIXA O CONDUTOR DE USAR O CINTO SEGURANÇA', amount: 195.23, points: 5 },
  { description: 'PARAR SOBRE FAIXA DE PEDESTRES NA MUDANÇA DE SINAL LUMINOSO', amount: 130.16, points: 4 },
  { description: 'DEIXAR DE DESLOCAR C/ANTECENDENCIA VEIC P/ FAIXA DA ESQUERDA QDO FOR MANOBRAR', amount: 130.16, points: 4 },
  { description: 'DIRIGIR VEICULO SEGURANDO O CELULAR', amount: 293.47, points: 7 },
  { description: 'EM MOV DEIXA DE MANTER ACESA A LUZ BAIXA DE DIA EM ROD, PISTA SIMPL, SIT FORA PERIM URB, VEIC DESP DE LUZ ROBÔ', amount: 130.16, points: 4 },
  { description: 'ESTACIONAR AO LADO OU SOBRE CANTEIRO CENTRAL/DIVISORES DE PISTA DE ROLAMENTO', amount: 195.23, points: 5 },
  { description: 'ESTACIONAR EM LOCAL/HORARIO PROIBIDO ESPECIFICAMENTE PELA SINALIZAÇÃO', amount: 130.16, points: 4 },
  { description: 'ESTACIONAR NAS ESQUINAS E A MENOS DE 5M DO ALINHAMENTO DA VIA TRANSVERSAL', amount: 130.16, points: 4 },
  { description: 'MULTA POR NÃO IDENTIFICAÇÃO DO CONDUTOR INFRATOR, IMPOSTA À PESSOA JURÍDICA (1ª)', amount: 260.32, points: 0 },
  { description: 'MULTA POR NÃO IDENTIFICAÇÃO DO CONDUTOR INFRATOR, IMPOSTA À PESSOA JURÍDICA (2ª)', amount: 390.46, points: 0 },
  { description: 'MULTA POR NÃO IDENTIFICAÇÃO DO CONDUTOR INFRATOR, IMPOSTA À PESSOA JURÍDICA (3ª)', amount: 586.94, points: 0 },
  { description: 'TRANSITAR EM VELOCIDADE SUPERIOR A MAXIMA PERMITIDA EM ATE 20%', amount: 130.16, points: 4 },
  { description: 'TRANSITAR EM VELOCIDADE SUPERIOR A MAXIMA PERMITIDA EM MAIS DE 20% ATÉ 50%', amount: 195.23, points: 5 },
  { description: 'TRANSITAR NA FAIXA OU VIA EXCLUSIVA REGULAM. P/ TRANSP. PUBL. COLETIVO PASSAGEIROS', amount: 293.47, points: 7 },
];

interface InfractionCatalogModalProps {
  infractionTypes: InfractionType[];
  onSave: (data: Omit<InfractionType, 'id'>) => void;
  onUpdate: (id: string, data: Partial<InfractionType>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const InfractionCatalogModal: React.FC<InfractionCatalogModalProps> = ({
  infractionTypes,
  onSave,
  onUpdate,
  onDelete,
  onClose,
}) => {
  const confirmar = useConfirm();
  const notificar = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);
  const [isImportingDefault, setIsImportingDefault] = useState(false);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handleStartEdit = (type: InfractionType) => {
    setEditingId(type.id);
    setDescription(type.description);
    setAmount(type.amount);
    setPoints(type.points);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setDescription('');
    setAmount(0);
    setPoints(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    if (editingId) {
      onUpdate(editingId, {
        description: description.trim().toUpperCase(),
        amount: Number(amount) || 0,
        points: Number(points) || 0,
      });
    } else {
      onSave({
        description: description.trim().toUpperCase(),
        amount: Number(amount) || 0,
        points: Number(points) || 0,
      });
    }

    handleCancelEdit();
  };

  const handleImportDefaultCatalog = async () => {
    const ok = await confirmar({
      title: 'Importar Catálogo Padrão',
      message: 'Deseja importar os 22 tipos de infração do catálogo padrão da Trans Pinho para o Firestore?',
      confirmLabel: 'Importar Catálogo',
      danger: false,
    });
    if (!ok) {
      return;
    }
    try {
      setIsImportingDefault(true);
      for (const item of CATALOGO_PADRAO_INICIAL) {
        await onSave(item);
      }
      notificar('Catálogo padrão de infrações importado com sucesso!', 'sucesso');
    } catch (e: any) {
      console.error('Erro ao importar catálogo padrão:', e);
      notificar(`Erro ao importar catálogo: ${e.message || e}`, 'erro');
    } finally {
      setIsImportingDefault(false);
    }
  };

  const sortedTypes = [...infractionTypes]
    .filter((t) =>
      searchTerm === '' ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.amount.toString().includes(searchTerm)
    )
    .sort((a, b) => a.description.localeCompare(b.description, 'pt-BR'));

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full my-8 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shrink-0">
              <i className="fa-solid fa-list-check"></i>
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                Catálogo de Tipos de Infração
              </h3>
              <span className="text-[10px] text-amber-400">
                {infractionTypes.length} infração(ões) cadastrada(s) no Firestore
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-base"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-4 sm:space-y-5 text-xs">
          {/* Botão de Importação Inicial quando vazio */}
          {infractionTypes.length === 0 && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                  <i className="fa-solid fa-triangle-exclamation text-amber-600"></i>
                  Nenhum tipo de infração cadastrado no banco de dados
                </h4>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Importe os 22 tipos de infrações mais comuns com valores e pontuação já configurados.
                </p>
              </div>
              <button
                type="button"
                disabled={isImportingDefault}
                onClick={handleImportDefaultCatalog}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 transition active:scale-95 cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {isImportingDefault ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    <span>Importando...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-cloud-arrow-down"></i>
                    <span>Importar Catálogo Padrão</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Formulário de Adicionar / Editar */}
          <form
            onSubmit={handleSubmit}
            className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <i className={`fa-solid ${editingId ? 'fa-pen-to-square text-amber-600' : 'fa-plus text-emerald-600'}`}></i>
                <span>{editingId ? 'Editar Tipo de Infração' : 'Cadastrar Novo Tipo de Infração'}</span>
              </span>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancelar Edição
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
              <div className="md:col-span-7">
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Descrição do Enquadramento *
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: TRANSITAR EM VELOCIDADE SUPERIOR A MAXIMA..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400/50 uppercase"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Valor Base (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount || ''}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Pontos CNH
                </label>
                <input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-lg shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <i className={`fa-solid ${editingId ? 'fa-check' : 'fa-plus'}`}></i>
                <span>{editingId ? 'Salvar Alterações' : 'Adicionar ao Catálogo'}</span>
              </button>
            </div>
          </form>

          {/* Busca na lista */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
            <div className="relative w-full sm:w-80">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar infração cadastrada..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
            </div>
            <span className="text-[11px] text-slate-500 self-end sm:self-auto">
              Exibindo {sortedTypes.length} de {infractionTypes.length}
            </span>
          </div>

          {/* Tabela de Infrações */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            {sortedTypes.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Nenhum tipo de infração encontrado.
              </div>
            ) : (
              <div className="max-h-72 overflow-x-auto overflow-y-auto">
                <table className="w-full min-w-[520px] text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px] sticky top-0">
                    <tr>
                      <th className="p-3">Descrição do Enquadramento</th>
                      <th className="p-3 whitespace-nowrap">Valor Base</th>
                      <th className="p-3 text-center whitespace-nowrap">Pontos</th>
                      <th className="p-3 text-right whitespace-nowrap">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedTypes.map((type) => (
                      <tr
                        key={type.id}
                        className={`hover:bg-amber-50/40 transition-colors ${
                          editingId === type.id ? 'bg-amber-50/70' : ''
                        }`}
                      >
                        <td className="p-3">
                          <span className="font-semibold text-slate-900 block leading-snug">
                            {type.description}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                          {formatCurrency(type.amount)}
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {type.points} pts
                          </span>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleStartEdit(type)}
                              className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition border border-slate-200 cursor-pointer"
                              title="Editar Tipo"
                            >
                              <i className="fa-solid fa-pen-to-square text-xs"></i>
                            </button>
                            <button
                              onClick={async () => {
                                const ok = await confirmar({
                                  title: 'Excluir Tipo de Infração',
                                  message: `Tem certeza que deseja remover o tipo "${type.description}" do catálogo?`,
                                  confirmLabel: 'Excluir Tipo',
                                  danger: true,
                                });
                                if (ok) {
                                  onDelete(type.id);
                                  if (editingId === type.id) handleCancelEdit();
                                }
                              }}
                              className="w-7 h-7 flex items-center justify-center bg-white hover:bg-rose-50 border border-slate-200 text-rose-600 rounded-lg transition hover:border-rose-300 cursor-pointer"
                              title="Excluir Tipo"
                            >
                              <i className="fa-solid fa-trash-can text-xs"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 font-bold text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer text-xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default InfractionCatalogModal;
