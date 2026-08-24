import React from 'react';
import { BlocoDocumento, BlocoTipo } from '../types';
import { criarBloco } from '../utils/documentoBlocos';

interface BlocosEditorProps {
  blocos: BlocoDocumento[];
  onChange: (blocos: BlocoDocumento[]) => void;
  onFocoBloco?: (id: string) => void;
}

const TIPOS: { valor: BlocoTipo; rotulo: string; icone: string }[] = [
  { valor: 'titulo', rotulo: 'Título', icone: 'fa-heading' },
  { valor: 'secao', rotulo: 'Seção', icone: 'fa-bookmark' },
  { valor: 'paragrafo', rotulo: 'Parágrafo', icone: 'fa-align-left' },
  { valor: 'item', rotulo: 'Item', icone: 'fa-list-ul' },
  { valor: 'assinatura', rotulo: 'Assinatura', icone: 'fa-signature' },
];

export const BlocosEditor: React.FC<BlocosEditorProps> = ({ blocos, onChange, onFocoBloco }) => {
  const atualizar = (id: string, mudanca: Partial<BlocoDocumento>) => {
    onChange(blocos.map((b) => (b.id === id ? { ...b, ...mudanca } : b)));
  };

  const remover = (id: string) => {
    onChange(blocos.filter((b) => b.id !== id));
  };

  const mover = (index: number, direcao: -1 | 1) => {
    const destino = index + direcao;
    if (destino < 0 || destino >= blocos.length) return;
    const copia = [...blocos];
    [copia[index], copia[destino]] = [copia[destino], copia[index]];
    onChange(copia);
  };

  const inserirDepois = (index: number) => {
    const copia = [...blocos];
    copia.splice(index + 1, 0, criarBloco('paragrafo', ''));
    onChange(copia);
  };

  return (
    <div className="space-y-2">
      {blocos.length === 0 && (
        <p className="text-[11px] text-slate-400 italic p-3 border border-dashed border-slate-200 rounded-lg text-center">
          Nenhum bloco ainda. Use os botões abaixo para começar o documento.
        </p>
      )}

      {blocos.map((bloco, index) => (
        <div
          key={bloco.id}
          className={`group border-l-4 border border-slate-200 rounded-lg bg-white p-1.5 hover:border-amber-300 transition ${
            bloco.tipo === 'titulo'
              ? 'border-l-slate-900'
              : bloco.tipo === 'secao'
              ? 'border-l-amber-400'
              : bloco.tipo === 'item'
              ? 'border-l-blue-300'
              : bloco.tipo === 'assinatura'
              ? 'border-l-emerald-400'
              : 'border-l-slate-200'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <select
              value={bloco.tipo}
              onChange={(e) => atualizar(bloco.id, { tipo: e.target.value as BlocoTipo })}
              className="text-[9px] font-bold uppercase border border-slate-200 rounded px-1 py-0.5 bg-slate-50 cursor-pointer"
            >
              {TIPOS.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.rotulo}
                </option>
              ))}
            </select>

            {bloco.tipo === 'item' && (
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => atualizar(bloco.id, { nivel: Math.max((bloco.nivel || 0) - 1, 0) })}
                  className="w-6 h-6 rounded border border-slate-200 text-slate-500 hover:bg-slate-100 text-[10px] cursor-pointer"
                  title="Diminuir recuo"
                >
                  <i className="fa-solid fa-outdent"></i>
                </button>
                <button
                  type="button"
                  onClick={() => atualizar(bloco.id, { nivel: Math.min((bloco.nivel || 0) + 1, 2) })}
                  className="w-6 h-6 rounded border border-slate-200 text-slate-500 hover:bg-slate-100 text-[10px] cursor-pointer"
                  title="Aumentar recuo"
                >
                  <i className="fa-solid fa-indent"></i>
                </button>
                <span className="text-[9px] text-slate-400 ml-0.5">nível {(bloco.nivel || 0) + 1}</span>
              </div>
            )}

            <div className="ml-auto flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => mover(index, -1)}
                className="w-6 h-6 rounded border border-slate-200 text-slate-500 hover:bg-slate-100 text-[10px] cursor-pointer"
                title="Mover para cima"
              >
                <i className="fa-solid fa-arrow-up"></i>
              </button>
              <button
                type="button"
                onClick={() => mover(index, 1)}
                className="w-6 h-6 rounded border border-slate-200 text-slate-500 hover:bg-slate-100 text-[10px] cursor-pointer"
                title="Mover para baixo"
              >
                <i className="fa-solid fa-arrow-down"></i>
              </button>
              <button
                type="button"
                onClick={() => inserirDepois(index)}
                className="w-6 h-6 rounded border border-slate-200 text-slate-500 hover:bg-slate-100 text-[10px] cursor-pointer"
                title="Inserir bloco abaixo"
              >
                <i className="fa-solid fa-plus"></i>
              </button>
              <button
                type="button"
                onClick={() => remover(bloco.id)}
                className="w-6 h-6 rounded border border-rose-200 text-rose-500 hover:bg-rose-50 text-[10px] cursor-pointer"
                title="Excluir bloco"
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>

          {bloco.tipo !== 'espaco' && bloco.tipo !== 'assinatura' && (
            <textarea
              rows={bloco.tipo === 'paragrafo' ? 3 : 1}
              value={bloco.texto}
              onFocus={() => onFocoBloco?.(bloco.id)}
              onChange={(e) => atualizar(bloco.id, { texto: e.target.value })}
              placeholder={
                bloco.tipo === 'titulo'
                  ? 'TÍTULO DO DOCUMENTO'
                  : bloco.tipo === 'secao'
                  ? '1. NOME DA SEÇÃO'
                  : 'Escreva o texto aqui, use as variáveis acima'
              }
              className={`w-full px-2.5 py-1.5 border border-slate-200 rounded bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/40 text-[11px] resize-y ${
                bloco.tipo === 'titulo' || bloco.tipo === 'secao' ? 'font-bold uppercase' : ''
              }`}
            />
          )}

          {bloco.tipo === 'assinatura' && (
            <div className="border-t-2 border-slate-300 mx-1 my-1.5" />
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-1.5 pt-1">
        {TIPOS.map((t) => (
          <button
            key={t.valor}
            type="button"
            onClick={() => onChange([...blocos, criarBloco(t.valor, '')])}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-amber-300 text-[10px] font-bold text-slate-600 transition cursor-pointer flex items-center gap-1.5"
          >
            <i className={`fa-solid ${t.icone} text-amber-500`}></i>
            {t.rotulo}
          </button>
        ))}
      </div>
    </div>
  );
};
