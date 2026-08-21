import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Vehicle, Person } from '../types';

interface FrotaCondutoresViewProps {
  vehicles: Vehicle[];
  people: Person[];
  onSaveVehicle: (vehicle: Vehicle) => void;
  onUpdateVehicle?: (id: string, data: Partial<Vehicle>) => void;
  onDeleteVehicle?: (id: string) => void;
  onSavePerson: (person: Person) => void;
  onUpdatePerson?: (id: string, data: Partial<Person>) => void;
  onDeletePerson?: (id: string) => void;
}

export const FrotaCondutoresView: React.FC<FrotaCondutoresViewProps> = ({
  vehicles,
  people,
  onSaveVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  onSavePerson,
  onUpdatePerson,
  onDeletePerson,
}) => {
  // Aba ativa
  const [abaTab, setAbaTab] = useState<'veiculos' | 'condutores'>('veiculos');

  // ============================================================================
  // ESTADOS - VEÍCULOS
  // ============================================================================
  const [searchVehicles, setSearchVehicles] = useState('');
  const [statusFilterVehicle, setStatusFilterVehicle] = useState('');
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form de Veículo
  const [plate, setPlate] = useState('');
  const [prefix, setPrefix] = useState('');
  const [renavam, setRenavam] = useState('');
  const [chassis, setChassis] = useState('');
  const [brand, setBrand] = useState('Volkswagen');
  const [model, setModel] = useState('Constellation 24.280');
  const [year, setYear] = useState<number>(2024);
  const [color, setColor] = useState('Branco');
  const [owner, setOwner] = useState('Trans Pinho');
  const [defaultDriver, setDefaultDriver] = useState('');
  const [status, setStatus] = useState<Vehicle['status']>('Ativo');

  // Popula o formulário ao abrir para edição de veículo
  useEffect(() => {
    if (editingVehicle) {
      setPlate(editingVehicle.plate || '');
      setPrefix(editingVehicle.prefix || '');
      setRenavam(editingVehicle.renavam || '');
      setChassis(editingVehicle.chassis || '');
      setBrand(editingVehicle.brand || '');
      setModel(editingVehicle.model || '');
      setYear(editingVehicle.year || 2024);
      setColor(editingVehicle.color || '');
      setOwner(editingVehicle.owner || 'Trans Pinho');
      setDefaultDriver(editingVehicle.defaultDriver || '');
      setStatus(editingVehicle.status || 'Ativo');
    }
  }, [editingVehicle]);

  const handleCloseVehicleModal = () => {
    setShowVehicleModal(false);
    setEditingVehicle(null);
    setPlate('');
    setPrefix('');
    setRenavam('');
    setChassis('');
    setBrand('Volkswagen');
    setModel('Constellation 24.280');
    setYear(2024);
    setColor('Branco');
    setOwner('Trans Pinho');
    setDefaultDriver('');
    setStatus('Ativo');
  };

  const handleOpenEditVehicle = (v: Vehicle) => {
    setEditingVehicle(v);
    setShowVehicleModal(true);
  };

  const handleSaveVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingVehicle) {
      const dadosAtualizados: Partial<Vehicle> = {
        plate: plate.toUpperCase().trim(),
        prefix: prefix.trim() || undefined,
        renavam: renavam.trim(),
        chassis: chassis.trim() || undefined,
        brand: brand.trim(),
        model: model.trim(),
        year: Number(year) || 2024,
        color: color.trim(),
        owner: owner.trim() || undefined,
        defaultDriver: defaultDriver || undefined,
        status,
      };
      onUpdateVehicle?.(editingVehicle.id, dadosAtualizados);
    } else {
      const newVehicle: Vehicle = {
        id: `veh-${Date.now()}`,
        plate: plate.toUpperCase().trim(),
        prefix: prefix.trim() || undefined,
        renavam: renavam.trim(),
        chassis: chassis.trim() || undefined,
        brand: brand.trim(),
        model: model.trim(),
        year: Number(year) || 2024,
        color: color.trim(),
        owner: owner.trim() || undefined,
        defaultDriver: defaultDriver || undefined,
        status,
      };
      onSaveVehicle(newVehicle);
    }

    handleCloseVehicleModal();
  };

  // Filtragem de Veículos
  const filteredVehicles = vehicles.filter((v) => {
    const term = searchVehicles.toLowerCase();
    const matchesSearch =
      searchVehicles === '' ||
      v.plate.toLowerCase().includes(term) ||
      (v.prefix && v.prefix.toLowerCase().includes(term)) ||
      v.model.toLowerCase().includes(term) ||
      v.brand.toLowerCase().includes(term) ||
      v.renavam.toLowerCase().includes(term) ||
      (v.chassis && v.chassis.toLowerCase().includes(term)) ||
      (v.defaultDriver && v.defaultDriver.toLowerCase().includes(term));

    const matchesStatus = !statusFilterVehicle || v.status === statusFilterVehicle;
    return matchesSearch && matchesStatus;
  });

  // Estatísticas de Veículos
  const veiculosAtivos = vehicles.filter((v) => v.status === 'Ativo').length;
  const veiculosManutencao = vehicles.filter((v) => v.status === 'Em Manutenção').length;
  const veiculosInativos = vehicles.filter((v) => v.status === 'Inativo').length;

  // ============================================================================
  // ESTADOS - CONDUTORES / PESSOAS
  // ============================================================================
  const [searchPeople, setSearchPeople] = useState('');
  const [typeFilterPerson, setTypeFilterPerson] = useState('');
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  // Form de Pessoa
  const [name, setName] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('Gravataí/RS');
  const [type, setType] = useState<Person['type']>('Condutor');
  const [notes, setNotes] = useState('');

  // Popula o formulário ao abrir para edição de pessoa
  useEffect(() => {
    if (editingPerson) {
      setName(editingPerson.name || '');
      setDocNumber(editingPerson.docNumber || '');
      setPhone(editingPerson.phone || '');
      setEmail(editingPerson.email || '');
      setAddress(editingPerson.address || 'Gravataí/RS');
      setType(editingPerson.type || 'Condutor');
      setNotes(editingPerson.notes || '');
    }
  }, [editingPerson]);

  const handleClosePersonModal = () => {
    setShowPersonModal(false);
    setEditingPerson(null);
    setName('');
    setDocNumber('');
    setPhone('');
    setEmail('');
    setAddress('Gravataí/RS');
    setType('Condutor');
    setNotes('');
  };

  const handleOpenEditPerson = (p: Person) => {
    setEditingPerson(p);
    setShowPersonModal(true);
  };

  const handleSavePersonSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPerson) {
      const dadosAtualizados: Partial<Person> = {
        name: name.toUpperCase().trim(),
        docNumber: docNumber.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        type,
        notes: notes.trim() || undefined,
      };
      onUpdatePerson?.(editingPerson.id, dadosAtualizados);
    } else {
      const newPerson: Person = {
        id: `peo-${Date.now()}`,
        name: name.toUpperCase().trim(),
        docNumber: docNumber.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        type,
        notes: notes.trim() || undefined,
      };
      onSavePerson(newPerson);
    }

    handleClosePersonModal();
  };

  // Filtragem de Pessoas
  const filteredPeople = people.filter((p) => {
    const term = searchPeople.toLowerCase();
    const matchesSearch =
      searchPeople === '' ||
      p.name.toLowerCase().includes(term) ||
      p.docNumber.toLowerCase().includes(term) ||
      p.email.toLowerCase().includes(term) ||
      p.phone.toLowerCase().includes(term) ||
      (p.notes && p.notes.toLowerCase().includes(term));

    const matchesType = !typeFilterPerson || p.type === typeFilterPerson;
    return matchesSearch && matchesType;
  });

  // Estatísticas de Pessoas
  const condutoresCount = people.filter((p) => p.type === 'Condutor').length;
  const funcionariosCount = people.filter((p) => p.type === 'Funcionário').length;
  const terceirosCount = people.filter((p) => p.type === 'Terceiro' || p.type === 'Proprietário' || p.type === 'Testemunha').length;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded border border-amber-300 uppercase tracking-wider">
              Controle Patrimonial & Operacional • Trans Pinho
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <i className="fa-solid fa-users-gear text-amber-500"></i>
            <span>Frota & Condutores</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestão unificada de caminhões, prefixos operacionais, motoristas profissionais e terceiros.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Switch de Abas (Pill Toggle) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setAbaTab('veiculos')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                abaTab === 'veiculos'
                  ? 'bg-white text-slate-950 shadow-xs border border-slate-200/80 font-black'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/50'
              }`}
            >
              <i className="fa-solid fa-truck-front text-amber-500"></i>
              <span>Veículos</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  abaTab === 'veiculos' ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {vehicles.length}
              </span>
            </button>

            <button
              onClick={() => setAbaTab('condutores')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                abaTab === 'condutores'
                  ? 'bg-white text-slate-950 shadow-xs border border-slate-200/80 font-black'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/50'
              }`}
            >
              <i className="fa-solid fa-users text-amber-500"></i>
              <span>Condutores</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  abaTab === 'condutores' ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {people.length}
              </span>
            </button>
          </div>

          {/* Botão de Ação de Cadastro */}
          {abaTab === 'veiculos' ? (
            <button
              onClick={() => {
                handleCloseVehicleModal();
                setShowVehicleModal(true);
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <i className="fa-solid fa-plus text-xs"></i>
              <span>Novo Veículo</span>
            </button>
          ) : (
            <button
              onClick={() => {
                handleClosePersonModal();
                setShowPersonModal(true);
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <i className="fa-solid fa-user-plus text-xs"></i>
              <span>Novo Condutor</span>
            </button>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* ABA: VEÍCULOS */}
      {/* ==================================================================== */}
      {abaTab === 'veiculos' && (
        <div className="space-y-6">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total na Frota</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{vehicles.length}</span>
                <span className="text-[11px] font-semibold text-slate-500">veículos</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Veículos Ativos</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600">{veiculosAtivos}</span>
                <span className="text-[11px] font-semibold text-emerald-700">operacionais</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Em Manutenção</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-600">{veiculosManutencao}</span>
                <span className="text-[11px] font-semibold text-amber-700">na oficina</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Inativos / Reserva</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-700">{veiculosInativos}</span>
                <span className="text-[11px] font-semibold text-slate-500">parados</span>
              </div>
            </div>
          </div>

          {/* Filter & Search */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input
                type="text"
                value={searchVehicles}
                onChange={(e) => setSearchVehicles(e.target.value)}
                placeholder="Buscar por placa, prefixo, modelo, marca ou condutor..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={statusFilterVehicle}
                onChange={(e) => setStatusFilterVehicle(e.target.value)}
                className="w-full md:w-auto px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 cursor-pointer"
              >
                <option value="">Todos os Status</option>
                <option value="Ativo">Ativo</option>
                <option value="Em Manutenção">Em Manutenção</option>
                <option value="Inativo">Inativo</option>
              </select>

              {(searchVehicles || statusFilterVehicle) && (
                <button
                  onClick={() => {
                    setSearchVehicles('');
                    setStatusFilterVehicle('');
                  }}
                  className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 border border-slate-200 rounded-lg hover:border-rose-200 hover:bg-rose-50 transition flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  title="Limpar filtros"
                >
                  <i className="fa-solid fa-filter-circle-xmark"></i> Limpar
                </button>
              )}
            </div>
          </div>

          {/* Tabela de Veículos */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Inventário de Veículos & Prefixos</h3>
              <span className="text-xs text-slate-500">{filteredVehicles.length} veículo(s) listado(s)</span>
            </div>

            {filteredVehicles.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                Nenhum veículo encontrado com os filtros aplicados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Placa & Prefixo</th>
                      <th className="p-3.5">Modelo / Marca</th>
                      <th className="p-3.5">Ano / Cor</th>
                      <th className="p-3.5">Documentação</th>
                      <th className="p-3.5">Condutor Habitual</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredVehicles.map((v) => (
                      <tr key={v.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="p-3.5 font-bold">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-slate-900 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded shadow-2xs">
                              {v.plate}
                            </span>
                            {v.prefix && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                                PREF. {v.prefix}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 text-xs">{v.model}</div>
                          <div className="text-[11px] text-slate-500">{v.brand}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="text-slate-800 font-semibold">{v.year || '—'}</div>
                          <div className="text-[11px] text-slate-500">{v.color || '—'}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="text-[11px] text-slate-700">
                            <span className="text-slate-400 font-normal">RENAVAM: </span>
                            <span className="font-mono font-bold">{v.renavam || '—'}</span>
                          </div>
                          {v.chassis && (
                            <div className="text-[10px] text-slate-500 font-mono">
                              <span className="text-slate-400">CHASSI: </span>{v.chassis}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5">
                          {v.defaultDriver ? (
                            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                              <i className="fa-solid fa-user text-[10px] text-amber-600"></i>
                              <span>{v.defaultDriver}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Não vinculado</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${
                              v.status === 'Ativo'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : v.status === 'Em Manutenção'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                          >
                            {v.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditVehicle(v)}
                              className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition border border-slate-200 cursor-pointer"
                              title="Editar Veículo"
                            >
                              <i className="fa-solid fa-pen-to-square text-xs"></i>
                            </button>
                            {onDeleteVehicle && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Tem certeza que deseja excluir o veículo ${v.plate} (${v.model})?`)) {
                                    onDeleteVehicle(v.id);
                                  }
                                }}
                                className="w-7 h-7 flex items-center justify-center bg-white hover:bg-rose-50 border border-slate-200 text-rose-600 rounded-lg transition hover:border-rose-300 cursor-pointer"
                                title="Excluir Veículo"
                              >
                                <i className="fa-solid fa-trash-can text-xs"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA: CONDUTORES */}
      {/* ==================================================================== */}
      {abaTab === 'condutores' && (
        <div className="space-y-6">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total de Cadastros</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{people.length}</span>
                <span className="text-[11px] font-semibold text-slate-500">pessoas</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Condutores Oficiais</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-600">{condutoresCount}</span>
                <span className="text-[11px] font-semibold text-amber-800">motoristas</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Funcionários Internos</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-blue-600">{funcionariosCount}</span>
                <span className="text-[11px] font-semibold text-blue-700">cadastrados</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Terceiros & Outros</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-700">{terceirosCount}</span>
                <span className="text-[11px] font-semibold text-slate-500">envolvidos</span>
              </div>
            </div>
          </div>

          {/* Filter & Search */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input
                type="text"
                value={searchPeople}
                onChange={(e) => setSearchPeople(e.target.value)}
                placeholder="Buscar por nome, CPF/documento, telefone ou email..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={typeFilterPerson}
                onChange={(e) => setTypeFilterPerson(e.target.value)}
                className="w-full md:w-auto px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 cursor-pointer"
              >
                <option value="">Todos os Tipos / Funções</option>
                <option value="Condutor">Condutor</option>
                <option value="Funcionário">Funcionário</option>
                <option value="Proprietário">Proprietário</option>
                <option value="Terceiro">Terceiro</option>
                <option value="Testemunha">Testemunha</option>
                <option value="Responsável">Responsável</option>
              </select>

              {(searchPeople || typeFilterPerson) && (
                <button
                  onClick={() => {
                    setSearchPeople('');
                    setTypeFilterPerson('');
                  }}
                  className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 border border-slate-200 rounded-lg hover:border-rose-200 hover:bg-rose-50 transition flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  title="Limpar filtros"
                >
                  <i className="fa-solid fa-filter-circle-xmark"></i> Limpar
                </button>
              )}
            </div>
          </div>

          {/* Tabela de Pessoas */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Cadastro de Condutores & Pessoas Envolvidas</h3>
              <span className="text-xs text-slate-500">{filteredPeople.length} pessoa(s) listada(s)</span>
            </div>

            {filteredPeople.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                Nenhuma pessoa encontrada com os filtros aplicados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Nome / Identificação</th>
                      <th className="p-3.5">Tipo / Função</th>
                      <th className="p-3.5">Contatos</th>
                      <th className="p-3.5">Endereço</th>
                      <th className="p-3.5">Observações</th>
                      <th className="p-3.5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPeople.map((p) => (
                      <tr key={p.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                              {p.name ? p.name.charAt(0) : '?'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs">{p.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono font-semibold">
                                CPF/Doc: {p.docNumber || '—'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${
                              p.type === 'Condutor'
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : p.type === 'Funcionário'
                                ? 'bg-blue-50 text-blue-700 border-blue-300'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                          >
                            {p.type}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="space-y-0.5 text-[11px]">
                            {p.phone && (
                              <div className="flex items-center gap-1.5 text-slate-800">
                                <i className="fa-solid fa-phone text-[9px] text-slate-400 w-3"></i>
                                <span>{p.phone}</span>
                              </div>
                            )}
                            {p.email && (
                              <div className="flex items-center gap-1.5 text-slate-500">
                                <i className="fa-solid fa-envelope text-[9px] text-slate-400 w-3"></i>
                                <span className="truncate max-w-[180px]">{p.email}</span>
                              </div>
                            )}
                            {!p.phone && !p.email && <span className="text-slate-400 italic">Sem contato</span>}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="text-slate-700 max-w-[200px] truncate text-[11px]" title={p.address}>
                            {p.address || '—'}
                          </div>
                        </td>
                        <td className="p-3.5">
                          {p.notes ? (
                            <span className="text-[11px] text-slate-600 italic truncate max-w-[220px] block" title={p.notes}>
                              "{p.notes}"
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[10px]">—</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditPerson(p)}
                              className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition border border-slate-200 cursor-pointer"
                              title="Editar Cadastro"
                            >
                              <i className="fa-solid fa-pen-to-square text-xs"></i>
                            </button>
                            {onDeletePerson && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Tem certeza que deseja excluir o cadastro de ${p.name}?`)) {
                                    onDeletePerson(p.id);
                                  }
                                }}
                                className="w-7 h-7 flex items-center justify-center bg-white hover:bg-rose-50 border border-slate-200 text-rose-600 rounded-lg transition hover:border-rose-300 cursor-pointer"
                                title="Excluir Cadastro"
                              >
                                <i className="fa-solid fa-trash-can text-xs"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: CRIAR / EDITAR VEÍCULO */}
      {/* ==================================================================== */}
      {showVehicleModal &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-truck-front text-amber-500"></i>
                  <span>{editingVehicle ? 'Editar Veículo da Frota' : 'Novo Veículo da Frota'}</span>
                </h3>
                <button
                  onClick={handleCloseVehicleModal}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition"
                >
                  <i className="fa-solid fa-xmark text-base"></i>
                </button>
              </div>

              <form onSubmit={handleSaveVehicleSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Placa *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: JCO8C10"
                      value={plate}
                      onChange={(e) => setPlate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono font-bold uppercase"
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
                    placeholder="Ex: Constellation 24.280"
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
                      placeholder="Ex: Volkswagen"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ano</label>
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(parseInt(e.target.value) || 2024)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Cor</label>
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                      placeholder="Ex: Branco"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
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
                    <label className="block font-bold text-slate-700 mb-1">Chassi</label>
                    <input
                      type="text"
                      value={chassis}
                      onChange={(e) => setChassis(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono uppercase"
                      placeholder="9BWZZZ..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Proprietário</label>
                    <input
                      type="text"
                      value={owner}
                      onChange={(e) => setOwner(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                      placeholder="Ex: Trans Pinho"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Status Operacional</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as Vehicle['status'])}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-bold text-slate-800 cursor-pointer"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Em Manutenção">Em Manutenção</option>
                      <option value="Inativo">Inativo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Condutor Habitual</label>
                  <select
                    value={defaultDriver}
                    onChange={(e) => setDefaultDriver(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white cursor-pointer"
                  >
                    <option value="">Selecione um condutor (opcional)</option>
                    {people.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} {p.docNumber ? `(${p.docNumber})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCloseVehicleModal}
                    className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-5 py-2 rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    {editingVehicle ? 'Salvar Alterações' : 'Salvar Veículo'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* ==================================================================== */}
      {/* MODAL: CRIAR / EDITAR CONDUTOR */}
      {/* ==================================================================== */}
      {showPersonModal &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-user-plus text-amber-500"></i>
                  <span>{editingPerson ? 'Editar Condutor / Envolvido' : 'Novo Condutor / Envolvido'}</span>
                </h3>
                <button
                  onClick={handleClosePersonModal}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition"
                >
                  <i className="fa-solid fa-xmark text-base"></i>
                </button>
              </div>

              <form onSubmit={handleSavePersonSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white uppercase font-bold"
                    placeholder="Ex: CARLOS ALBERTO PINHO"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">CPF / CNPJ *</label>
                    <input
                      type="text"
                      required
                      value={docNumber}
                      onChange={(e) => setDocNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono"
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Função / Tipo</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as Person['type'])}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-semibold cursor-pointer"
                    >
                      <option value="Condutor">Condutor</option>
                      <option value="Funcionário">Funcionário</option>
                      <option value="Proprietário">Proprietário</option>
                      <option value="Terceiro">Terceiro</option>
                      <option value="Testemunha">Testemunha</option>
                      <option value="Responsável">Responsável</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                      placeholder="(051) 98266-0028"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">E-mail</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                      placeholder="motorista@transpinho.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Endereço Completo</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                    placeholder="Rua, Número, Bairro - Cidade/UF"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Observações Internas</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Informações adicionais, CNH, categoria, etc..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white resize-none"
                  ></textarea>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleClosePersonModal}
                    className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-5 py-2 rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    {editingPerson ? 'Salvar Alterações' : 'Salvar Condutor'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default FrotaCondutoresView;
