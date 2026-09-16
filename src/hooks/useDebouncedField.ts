import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Mantém um valor local que atualiza a tela na hora, e só chama "onCommit"
 * (a gravação de verdade) depois que o usuário parar de digitar por um tempo.
 */
export function useDebouncedField<T>(valorExterno: T, onCommit: (v: T) => void, atrasoMs = 600) {
  const [valorLocal, setValorLocal] = useState(valorExterno);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ultimoExternoRef = useRef(valorExterno);

  useEffect(() => {
    if (valorExterno !== ultimoExternoRef.current) {
      ultimoExternoRef.current = valorExterno;
      setValorLocal(valorExterno);
    }
  }, [valorExterno]);

  const atualizar = useCallback(
    (novo: T) => {
      setValorLocal(novo);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        ultimoExternoRef.current = novo;
        onCommit(novo);
      }, atrasoMs);
    },
    [onCommit, atrasoMs]
  );

  return [valorLocal, atualizar] as const;
}
