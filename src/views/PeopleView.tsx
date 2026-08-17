import React, { useState } from 'react';
import { Person } from '../types';

interface PeopleViewProps {
  people: Person[];
  onSavePerson: (person: Person) => void;
  onDeletePerson?: (id: string) => void;
}

export const PeopleView: React.FC<PeopleViewProps> = ({
  people,
  onSavePerson,
  onDeletePerson,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('Gravataí/RS');
  const [type, setType] = useState<Person['type']>('Condutor');
  const [notes, setNotes] = useState('');

  const filteredPeople = people.filter((p) => {
    const matchesSearch =
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.docNumber.includes(search) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.notes && p.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesType = !typeFilter || p.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    const newPerson: Person = {
      id: `peo-${Date.now()}`,
      name: name.toUpperCase(),
      docNumber,
      phone,
      email,
      address,
      type,
      notes,
    };

    onSavePerson(newPerson);
    setShowModal(false);
    setName('');
    setDocNumber('');
    setPhone('');
    setEmail('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <span className="badge bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded border border-amber-300 uppercase tracking-wider">
            Recursos Humanos & Frotas • Trans Pinho
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            Cadastro de Condutores & Envolvidos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestão de motoristas profissionais, proprietários, testemunhas e terceiros.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition active:scale-95"
        >
          <i className="fa-solid fa-user-plus text-xs"></i>
          <span>Cadastrar Condutor</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, CPF, telefone ou email..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          />
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          >
            <option value="">Todos os Tipos</option>
            <option value="Condutor">Condutor</option>
            <option value="Proprietário">Proprietário</option>
            <option value="Terceiro">Terceiro</option>
            <option value="Testemunha">Testemunha</option>
            <option value="Funcionário">Funcionário</option>
          </select>
        </div>
      </div>

      {/* Grid of Persons */}
      {filteredPeople.length === 0 ? (
        <div className="p-12 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-500">
          Nenhum condutor ou pessoa encontrada.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPeople.map((p) => (
            <div
              key={p.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3.5 hover:border-amber-400 transition"
            >
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  {p.type}
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs">
                    {p.name.charAt(0)}
                  </div>
                  {onDeletePerson && (
                    <button
                      onClick={() => onDeletePerson(p.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                      title="Excluir Cadastro"
                    >
                      <i className="fa-solid fa-trash-can text-xs"></i>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm leading-snug">{p.name}</h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5 font-semibold">CPF: {p.docNumber}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-700">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-phone text-slate-400 text-[10px] w-4 text-center"></i>
                  <span>{p.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-envelope text-slate-400 text-[10px] w-4 text-center"></i>
                  <span className="truncate">{p.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-location-dot text-slate-400 text-[10px] w-4 text-center"></i>
                  <span>{p.address}</span>
                </div>
              </div>

              {p.notes && (
                <p className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded border border-amber-100">
                  "{p.notes}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal New Person */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-user-plus text-amber-500"></i>
                Novo Condutor / Envolvido
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
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
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                  >
                    <option value="Condutor">Condutor</option>
                    <option value="Proprietário">Proprietário</option>
                    <option value="Terceiro">Terceiro</option>
                    <option value="Testemunha">Testemunha</option>
                    <option value="Funcionário">Funcionário</option>
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
                    placeholder="condutor@transpinho.com"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Endereço / Cidade</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observações / CNH / Prefixo</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                  placeholder="Ex: CNH Categoria D. Motorista habitual do Prefixo 24127"
                ></textarea>
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
                  Salvar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeopleView;
