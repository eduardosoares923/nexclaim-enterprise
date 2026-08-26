import React, { useEffect, useRef } from 'react';
import { renderAsync } from 'docx-preview';

interface DocxViewerProps {
  docxBase64: string;
  onTextoSelecionado?: (texto: string) => void;
}

function base64ParaUint8Array(base64: string): Uint8Array {
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return bytes;
}

export const DocxViewer: React.FC<DocxViewerProps> = ({ docxBase64, onTextoSelecionado }) => {
  const container = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!container.current || !docxBase64) return;
    container.current.innerHTML = '';
    const bytes = base64ParaUint8Array(docxBase64);
    const blob = new Blob([bytes.buffer as ArrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    renderAsync(blob, container.current, undefined, {
      className: 'docx-render',
      inWrapper: true,
      ignoreWidth: false,
      ignoreHeight: true,
    }).catch((err) => {
      console.error('Erro ao renderizar o .docx:', err);
      if (container.current) {
        container.current.innerHTML =
          '<p style="padding:16px;color:#64748b;font-size:12px">Não foi possível exibir este documento.</p>';
      }
    });
  }, [docxBase64]);

  const capturarSelecao = () => {
    if (!onTextoSelecionado) return;
    const texto = window.getSelection()?.toString().trim() || '';
    if (texto) onTextoSelecionado(texto);
  };

  return (
    <div
      ref={container}
      onMouseUp={capturarSelecao}
      className="bg-slate-100 overflow-auto max-h-[600px] rounded-lg border border-slate-200 select-text"
    />
  );
};
