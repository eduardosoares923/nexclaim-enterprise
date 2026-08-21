import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Claim, Fine, Vehicle, Person } from '../types';

interface Props {
  claims: Claim[];
  fines: Fine[];
  vehicles: Vehicle[];
  people: Person[];
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<Props> = ({ claims, fines, vehicles, people, onClose }) => {
  const [termo, setTermo] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const t = termo.trim().toLowerCase();
  const matches = (...campos: (string | undefined)[]) =>
    t.length > 0 && campos.some((c) => c && c.toLowerCase().includes(t));

  const resultadosSinistros = t ? claims.filter((c) =>
    matches(c.claimNumber, c.protocol, c.vehiclePlate, c.driverName, c.occurrenceType)
  ).slice(0, 6) : [];

  const resultadosMultas = t ? fines.filter((f) =>
    matches(f.infractionAuto, f.vehiclePlate, f.driverName, f.description)
  ).slice(0, 6) : [];

  const resultadosVeiculos = t ? vehicles.filter((v) =>
    matches(v.plate, v.prefix, v.model, v.brand)
  ).slice(0, 6) : [];

  const resultadosCondutores = t ? people.filter((p) =>
    matches(p.name, p.docNumber, p.phone)
  ).slice(0, 6) : [];

  const totalResultados = resultadosSinistros.length + resultadosMultas.length + resultadosVeiculos.length + resultadosCondutores.length;

  const irPara = (caminho: string) => {
    navigate(caminho);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-start justify-center px-4 py-16 sm:py-24" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 p-3 border-b border-slate-200">
          <i className="fa-solid fa-magnifying-glass text-slate-400 ml-1"></i>
          <input
            ref={inputRef}
            type="text"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Buscar por condutor, placa, prefixo, auto de infração..."
            className="flex-1 outline-none text-sm py-1.5"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 px-2 cursor-pointer">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {!t && (
            <p className="text-xs text-slate-400 text-center py-8">Digite para buscar em Sinistros, Multas, Veículos e Condutores.</p>
          )}
          {t && totalResultados === 0 && (
            <p className="text-xs text-slate-400 text-center py-8">Nenhum resultado encontrado para "{termo}".</p>
          )}

          {resultadosSinistros.length > 0 && (
            <div className="p-2">
              <p className="text-[10px] font-bold uppercase text-slate-400 px-2 mb-1">Sinistros</p>
              {resultadosSinistros.map((c) => (
                <button key={c.id} onClick={() => irPara('/sinistros')} className="w-full text-left px-2 py-2 rounded-lg hover:bg-amber-50 flex items-center gap-2 text-xs cursor-pointer">
                  <i className="fa-solid fa-folder-closed text-amber-500"></i>
                  <span className="font-bold">{c.claimNumber}</span>
                  <span className="text-slate-400">{c.vehiclePlate} • {c.driverName}</span>
                </button>
              ))}
            </div>
          )}

          {resultadosMultas.length > 0 && (
            <div className="p-2 border-t border-slate-100">
              <p className="text-[10px] font-bold uppercase text-slate-400 px-2 mb-1">Multas</p>
              {resultadosMultas.map((f) => (
                <button key={f.id} onClick={() => irPara('/multas')} className="w-full text-left px-2 py-2 rounded-lg hover:bg-amber-50 flex items-center gap-2 text-xs cursor-pointer">
                  <i className="fa-solid fa-file-invoice-dollar text-rose-500"></i>
                  <span className="font-bold font-mono">{f.infractionAuto}</span>
                  <span className="text-slate-400">{f.vehiclePlate} • {f.driverName}</span>
                </button>
              ))}
            </div>
          )}

          {resultadosVeiculos.length > 0 && (
            <div className="p-2 border-t border-slate-100">
              <p className="text-[10px] font-bold uppercase text-slate-400 px-2 mb-1">Veículos</p>
              {resultadosVeiculos.map((v) => (
                <button key={v.id} onClick={() => irPara('/frota-condutores')} className="w-full text-left px-2 py-2 rounded-lg hover:bg-amber-50 flex items-center gap-2 text-xs cursor-pointer">
                  <i className="fa-solid fa-truck text-blue-500"></i>
                  <span className="font-bold font-mono">{v.plate}</span>
                  <span className="text-slate-400">Prefixo {v.prefix} • {v.model}</span>
                </button>
              ))}
            </div>
          )}

          {resultadosCondutores.length > 0 && (
            <div className="p-2 border-t border-slate-100">
              <p className="text-[10px] font-bold uppercase text-slate-400 px-2 mb-1">Condutores</p>
              {resultadosCondutores.map((p) => (
                <button key={p.id} onClick={() => irPara('/frota-condutores')} className="w-full text-left px-2 py-2 rounded-lg hover:bg-amber-50 flex items-center gap-2 text-xs cursor-pointer">
                  <i className="fa-solid fa-user text-emerald-500"></i>
                  <span className="font-bold">{p.name}</span>
                  <span className="text-slate-400">{p.docNumber}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default GlobalSearchModal;
