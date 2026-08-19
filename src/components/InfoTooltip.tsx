import React, { useState } from 'react';

export const InfoTooltip: React.FC<{ text: string }> = ({ text }) => {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block ml-1 align-middle">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="text-slate-400 hover:text-amber-500 transition"
      >
        <i className="fa-solid fa-circle-info text-[11px]"></i>
      </button>
      {open && (
        <span className="absolute z-20 left-1/2 -translate-x-1/2 bottom-full mb-1.5 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg shadow-lg leading-snug">
          {text}
        </span>
      )}
    </span>
  );
};
