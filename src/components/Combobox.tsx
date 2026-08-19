import React, { useState, useRef, useEffect } from 'react';

interface ComboboxOption {
  value: string;
  label?: string;
}

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  className?: string;
}

export const Combobox: React.FC<ComboboxProps> = ({ value, onChange, options, placeholder, className }) => {
  const [open, setOpen] = useState(false);
  const [texto, setTexto] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => setTexto(value), [value]);

  useEffect(() => {
    const handleClickFora = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  const filtradas = options.filter((o) =>
    (o.value + ' ' + (o.label || '')).toLowerCase().includes(texto.toLowerCase())
  );

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={texto}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setTexto(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        placeholder={placeholder}
        className={className}
      />
      {open && filtradas.length > 0 && (
        <ul className="absolute z-30 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg py-1">
          {filtradas.map((o) => (
            <li
              key={o.value}
              onMouseDown={() => {
                setTexto(o.value);
                onChange(o.value);
                setOpen(false);
              }}
              className="px-3 py-2 text-xs hover:bg-amber-50 cursor-pointer flex items-center justify-between gap-2"
            >
              <span className="font-medium text-slate-800">{o.value}</span>
              {o.label && <span className="text-slate-400 text-[10px]">{o.label}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
