import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';

type ToastTipo = 'sucesso' | 'erro' | 'aviso' | 'info';

interface Toast {
  id: number;
  tipo: ToastTipo;
  mensagem: string;
}

interface ToastContextValue {
  notificar: (mensagem: string, tipo?: ToastTipo) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const ESTILOS: Record<ToastTipo, { cor: string; icone: string }> = {
  sucesso: { cor: 'bg-emerald-600 border-emerald-500', icone: 'fa-circle-check' },
  erro: { cor: 'bg-rose-600 border-rose-500', icone: 'fa-circle-exclamation' },
  aviso: { cor: 'bg-amber-500 border-amber-400', icone: 'fa-triangle-exclamation' },
  info: { cor: 'bg-slate-800 border-slate-700', icone: 'fa-circle-info' },
};

let proximoId = 0;

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remover = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notificar = useCallback((mensagem: string, tipo: ToastTipo = 'info') => {
    proximoId += 1;
    const id = proximoId;
    setToasts((prev) => [...prev, { id, tipo, mensagem }]);
    const duracao = tipo === 'erro' ? 8000 : 4500;
    setTimeout(() => remover(id), duracao);
  }, [remover]);

  return (
    <ToastContext.Provider value={{ notificar }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] sm:w-auto print:hidden">
          {toasts.map((t) => {
            const estilo = ESTILOS[t.tipo];
            return (
              <div
                key={t.id}
                className={`${estilo.cor} text-white rounded-xl shadow-2xl border px-4 py-3 flex items-start gap-3 animate-in slide-in-from-bottom-4 fade-in duration-200`}
              >
                <i className={`fa-solid ${estilo.icone} mt-0.5 shrink-0`}></i>
                <p className="text-xs font-semibold leading-relaxed flex-1">{t.mensagem}</p>
                <button
                  type="button"
                  onClick={() => remover(t.id)}
                  className="text-white/70 hover:text-white shrink-0 cursor-pointer"
                >
                  <i className="fa-solid fa-xmark text-xs"></i>
                </button>
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue['notificar'] => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast precisa estar dentro de um ToastProvider');
  return ctx.notificar;
};
