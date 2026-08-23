import React from 'react';
import { BlocoDocumento } from '../types';

interface BlocosPreviewProps {
  blocos: BlocoDocumento[];
  signatureDataUrl?: string;
}

export const BlocosPreview: React.FC<BlocosPreviewProps> = ({ blocos, signatureDataUrl }) => {
  return (
    <div className="text-xs sm:text-sm font-serif text-slate-900 leading-relaxed">
      {blocos.map((bloco) => {
        switch (bloco.tipo) {
          case 'titulo':
            return (
              <h2
                key={bloco.id}
                className="text-center font-black text-sm sm:text-base uppercase tracking-wide mb-4 pb-2 border-b-2 border-slate-900"
              >
                {bloco.texto}
              </h2>
            );

          case 'secao':
            return (
              <h3
                key={bloco.id}
                className="font-black text-xs sm:text-sm uppercase mt-5 mb-2 pb-1 border-b border-slate-400"
              >
                {bloco.texto}
              </h3>
            );

          case 'item': {
            const nivel = bloco.nivel || 0;
            const marcador = nivel === 0 ? '•' : nivel === 1 ? '◦' : '▪';
            return (
              <p
                key={bloco.id}
                className="text-justify mb-1.5 relative"
                style={{ paddingLeft: `${1.25 + nivel * 1.25}rem` }}
              >
                <span className="absolute text-slate-500" style={{ left: `${0.25 + nivel * 1.25}rem` }}>
                  {marcador}
                </span>
                {bloco.texto}
              </p>
            );
          }

          case 'assinatura':
            return <div key={bloco.id} className="border-t border-slate-900 mt-8 pt-1" />;

          case 'espaco':
            return <div key={bloco.id} className="h-3" />;

          default:
            return (
              <p key={bloco.id} className="text-justify mb-3 indent-6">
                {bloco.texto}
              </p>
            );
        }
      })}

      {signatureDataUrl && (
        <div className="text-center mt-8">
          <img src={signatureDataUrl} alt="Assinatura" className="max-w-[220px] mx-auto border-b border-slate-900 pb-1" />
          <p className="text-[10px] text-slate-600 mt-1">Assinatura do Condutor</p>
        </div>
      )}
    </div>
  );
};
