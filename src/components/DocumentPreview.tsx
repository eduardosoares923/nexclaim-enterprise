import React from 'react';

interface DocumentPreviewProps {
  content: string;
  signatureDataUrl?: string;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ content, signatureDataUrl }) => {
  const lines = (content || '').split('\n');

  return (
    <div className="text-xs sm:text-sm font-serif text-slate-900 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (idx === 0 && trimmed === trimmed.toUpperCase() && trimmed.length > 5) {
          return (
            <h2
              key={idx}
              className="text-center font-black text-sm sm:text-base uppercase tracking-wide mb-4 pb-2 border-b-2 border-slate-900"
            >
              {trimmed}
            </h2>
          );
        }

        if (/^\d+\.\s+[A-ZÀ-Ú\s]+$/.test(trimmed) || /^[IVX]+\s*[-–]\s+/.test(trimmed)) {
          return (
            <h3
              key={idx}
              className="font-black text-xs sm:text-sm uppercase mt-5 mb-2 pb-1 border-b border-slate-400"
            >
              {trimmed}
            </h3>
          );
        }

        if (/^_{10,}$/.test(trimmed)) {
          return <div key={idx} className="border-t border-slate-900 mt-8 pt-1" />;
        }

        if (trimmed === '') {
          return <div key={idx} className="h-3" />;
        }

        if (/^-\s+/.test(trimmed)) {
          const espacosAntes = line.length - line.trimStart().length;
          const nivel = Math.min(Math.floor(espacosAntes / 2), 3);
          const paddingClasses = ['pl-5', 'pl-9', 'pl-13', 'pl-17'];
          const marcador = nivel > 0 ? '◦' : '•';
          return (
            <p
              key={idx}
              className={`text-justify mb-1.5 relative before:content-['${marcador}'] before:absolute before:text-slate-500 ${paddingClasses[nivel]}`}
              style={{ paddingLeft: `${1.25 + nivel * 1}rem` }}
            >
              <span
                className="absolute text-slate-500"
                style={{ left: `${0.25 + nivel * 1}rem` }}
              >
                {marcador}
              </span>
              {trimmed.replace(/^-\s+/, '')}
            </p>
          );
        }

        return (
          <p key={idx} className="text-justify mb-3 indent-6">
            {line}
          </p>
        );
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
