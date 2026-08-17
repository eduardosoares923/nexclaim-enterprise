import React, { useState } from 'react';
import { Vehicle, Person } from '../types';

interface VehiclesViewProps {
  vehicles: Vehicle[];
  people: Person[];
  onSaveVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle?: (id: string) => void;
}

export const VehiclesView: React.FC<VehiclesViewProps> = ({
  vehicles,
  people,
  onSaveVehicle,
  onDeleteVehicle,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [plate, setPlate] = useState('');
  const [prefix, setPrefix] = useState('');
  const [renavam, setRenavam] = useState('');
  const [brand, setBrand] = useState('Volkswagen');
  const [model, setModel] = useState('Constellation 24.280');
  const [year, setYear] = useState<number>(2024);
  const [color, setColor] = useState('Branco');
  const [defaultDriver, setDefaultDriver] = useState(people[0]?.name || '');
  const [status, setStatus] = useState<Vehicle['status']>('Ativo');

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      search === '' ||
      v.plate.toLowerCase().includes(search.toLowerCase()) ||
      (v.prefix && v.prefix.toLowerCase().includes(search.toLowerCase())) ||
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      (v.defaultDriver && v.defaultDriver.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = !statusFilter || v.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[DIAG] handleCreate iniciado', { plate, model });

    const newVehicle: Vehicle = {
      id: `veh-${Date.now()}`,
      plate: plate.toUpperCase().trim(),
      prefix: prefix.trim(),
      renavam: renavam.trim(),
      brand,
      model,
      year: Number(year) || 2024,
      color,
      defaultDriver,
      status,
    };

    console.log('[DIAG] chamando onSaveVehicle com:', newVehicle);
    onSaveVehicle(newVehicle);
    setShowModal(false);
    setPlate('');
    setPrefix('');
    setRenavam('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <span className="badge bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded border border-amber-300 uppercase tracking-wider">
            Controle de Patrimônio • Trans Pinho
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            Gestão da Frota, Prefixos & Unidades
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastro de caminhões, micro-ônibus e utilitários vinculados aos prefixos operacionais.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition active:scale-95"
        >
          <i className="fa-solid fa-truck-front text-xs"></i>
          <span>Cadastrar Veículo</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por placa, prefixo, modelo ou motorista..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          >
            <option value="">Todos os Status</option>
            <option value="Ativo">Ativo</option>
            <option value="Em Manutenção">Em Manutenção</option>
            <option value="Inativo">Inativo</option>
          </select>
        </div>
      </div>

      {/* Grid of Vehicles */}
      {filteredVehicles.length === 0 ? (
        <div className="p-12 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-500">
          Nenhum veículo encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((v) => (
            <div
              key={v.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3.5 hover:border-amber-400 transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono font-black text-base text-slate-900 bg-slate-100 border border-slate-300 px-2.5 py-1 rounded shadow-2xs">
                    {v.plate}
                  </span>
                  {v.prefix && (
                    <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                      PREF. {v.prefix}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      v.status === 'Ativo'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    {v.status}
                  </span>
                  {onDeleteVehicle && (
                    <button
                      onClick={() => onDeleteVehicle(v.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                      title="Excluir Veículo"
                    >
                      <i className="fa-solid fa-trash-can text-xs"></i>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm">{v.model}</h4>
                <p className="text-xs text-slate-500">
                  {v.brand} • Ano {v.year} • Cor {v.color}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1.5 text-slate-700 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">RENAVAM:</span>
                  <span className="font-mono font-bold text-slate-900">{v.renavam}</span>
                </div>
                {v.defaultDriver && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Condutor Habitual:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[170px]">{v.defaultDriver}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal New Vehicle */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-truck-front text-amber-500"></i>
                Novo Veículo da Frota
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Placa *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: JCO8C10"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prefixo Trans Pinho</label>
                  <input
                    type="text"
                    placeholder="Ex: 24127"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Modelo / Versão *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: VW Constellation 24.280"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Marca</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ano</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value) || 2024)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cor</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">RENAVAM</label>
                <input
                  type="text"
                  value={renavam}
                  onChange={(e) => setRenavam(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono"
                  placeholder="01293847561"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Condutor Habitual</label>
                <select
                  value={defaultDriver}
                  onChange={(e) => setDefaultDriver(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                >
                  <option value="">Selecione um condutor</option>
                  {people.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-5 py-2 rounded-lg shadow-sm"
                >
                  Salvar Veículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclesView;
