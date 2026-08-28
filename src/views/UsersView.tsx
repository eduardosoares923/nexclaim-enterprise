import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { deleteDoc } from '@firebase/firestore';
import { auth, db } from '../services/firebase';
import { User, RoleType } from '../types';
import { useConfirm } from '../contexts/ConfirmContext';
import { useToast } from '../contexts/ToastContext';

export const UsersView: React.FC = () => {
  const confirmar = useConfirm();
  const notificar = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<RoleType>('OPERADOR');
  const [department, setDepartment] = useState('');
  const [senha, setSenha] = useState('');

  // Status State
  const [criandoLogin, setCriandoLogin] = useState(false);
  const [erroLogin, setErroLogin] = useState('');

  const carregarUsuarios = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const lista: User[] = snap.docs.map((d: any) => ({
        id: d.id,
        ...(d.data() as Omit<User, 'id'>),
      }));
      setUsers(lista);
    } catch (err) {
      console.warn('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const resetForm = () => {
    setName('');
    setEmail('');
    setRole('OPERADOR');
    setDepartment('');
    setSenha('');
    setErroLogin('');
    setEditingUser(null);
  };

  const handleOpenNew = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setDepartment(user.department || '');
    setSenha('');
    setErroLogin('');
    setShowModal(true);
  };

  const handleCriarUsuarioComLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroLogin('');

    if (!name.trim() || !email.trim()) {
      setErroLogin('Nome e e-mail são obrigatórios.');
      return;
    }

    if (!editingUser) {
      if (!senha || senha.length < 6) {
        setErroLogin('A senha precisa ter pelo menos 6 caracteres.');
        return;
      }
    }

    setCriandoLogin(true);

    try {
      if (!editingUser) {
        // 1. Criação no Firebase Auth via Endpoint no Servidor com Admin SDK
        const idToken = await auth.currentUser?.getIdToken();
        const resposta = await fetch('/api/create-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password: senha,
            name: name.trim(),
            role,
          }),
        });

        const json = await resposta.json();
        if (!resposta.ok) {
          setErroLogin(json.error || 'Erro ao criar login do usuário.');
          setCriandoLogin(false);
          return;
        }

        // 2. Gravação dos dados no Firestore
        const avatarLetters =
          name
            .trim()
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase() || 'U';

        const novoDoc = {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          department: department.trim() || 'Operacional',
          avatar: avatarLetters,
          authUid: json.uid || '',
          createdAt: new Date().toISOString(),
        };

        await addDoc(collection(db, 'users'), novoDoc);
      } else {
        // Edição de dados no Firestore
        const avatarLetters =
          name
            .trim()
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase() || 'U';

        await updateDoc(doc(db, 'users', editingUser.id), {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          department: department.trim() || 'Operacional',
          avatar: avatarLetters,
          updatedAt: new Date().toISOString(),
        });

        if (editingUser?.authUid) {
          const idToken = await auth.currentUser?.getIdToken();
          await fetch('/api/set-user-role', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
            },
            body: JSON.stringify({ uid: editingUser.authUid, role }),
          });
        }
      }

      setShowModal(false);
      resetForm();
      await carregarUsuarios();
    } catch (err: any) {
      console.error('Erro ao salvar usuário:', err);
      setErroLogin(err.message || 'Erro inesperado ao salvar usuário.');
    } finally {
      setCriandoLogin(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (user.email === auth.currentUser?.email) {
      notificar('Você não pode excluir o seu próprio usuário conectado.', 'aviso');
      return;
    }
    const ok = await confirmar({
      title: 'Remover Usuário',
      message: `Tem certeza que deseja remover o usuário ${user.name} (${user.email})?`,
      confirmLabel: 'Remover Usuário',
      danger: true,
    });
    if (ok) {
      try {
        await deleteDoc(doc(db, 'users', user.id));
        await carregarUsuarios();
      } catch (e: any) {
        notificar(`Erro ao excluir: ${e.message}`, 'erro');
      }
    }
  };

  const getRoleBadge = (r: RoleType) => {
    switch (r) {
      case 'PROPRIETARIO':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'ADMINISTRADOR':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'GESTOR':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'OPERADOR':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'VISUALIZADOR':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.department?.toLowerCase().includes(search.toLowerCase());

    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <span className="badge bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded border border-amber-300 uppercase tracking-wider">
            Gestão Corporativa • Trans Pinho
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            Gerenciamento de Usuários & Acessos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastre novos membros da equipe com credenciais de login no Firebase Auth e controle seus perfis de permissão.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="btn bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <i className="fa-solid fa-user-plus text-xs"></i>
          <span>Novo Usuário</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              placeholder="Buscar usuário por nome, e-mail ou setor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              <option value="">Todos os Perfis</option>
              <option value="PROPRIETARIO">Proprietário</option>
              <option value="ADMINISTRADOR">Administrador</option>
              <option value="GESTOR">Gestor</option>
              <option value="OPERADOR">Operador</option>
              <option value="VISUALIZADOR">Visualizador</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <i className="fa-solid fa-circle-notch fa-spin text-2xl text-amber-500 mb-2"></i>
          <p className="text-xs text-slate-500 font-semibold">Carregando usuários cadastrados...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <i className="fa-solid fa-users-slash text-3xl text-slate-300 mb-2"></i>
          <h3 className="font-bold text-slate-700 text-sm">Nenhum usuário encontrado</h3>
          <p className="text-xs text-slate-400 mt-1">
            {search || roleFilter
              ? 'Tente ajustar os filtros de busca acima.'
              : 'Clique em "Novo Usuário" para cadastrar o primeiro acesso ao sistema.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-black text-sm flex items-center justify-center shadow-inner shrink-0">
                      {user.avatar || (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{user.name}</h4>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border shrink-0 ${getRoleBadge(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Setor: <strong className="text-slate-700">{user.department || 'Geral'}</strong>
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(user)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <i className="fa-solid fa-pen-to-square text-[10px]"></i>
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDeleteUser(user)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <i className="fa-solid fa-trash-can text-[10px]"></i>
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
            onClick={() => setShowModal(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-4 sm:p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
                <div>
                  <span className="badge bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                    {editingUser ? 'Atualização Cadastral' : 'Novo Acesso Firebase'}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-1">
                    {editingUser ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-700 text-lg cursor-pointer"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              {erroLogin && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation text-rose-600"></i>
                  <span>{erroLogin}</span>
                </div>
              )}

              <form onSubmit={handleCriarUsuarioComLogin} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Eduardo Pinho"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">E-mail Corporativo *</label>
                  <input
                    type="email"
                    required
                    disabled={!!editingUser}
                    placeholder="Ex: carlos@transpinho.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium ${
                      editingUser ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-400/50'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Perfil de Permissão *</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as RoleType)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-xs font-semibold"
                    >
                      <option value="PROPRIETARIO">Proprietário</option>
                      <option value="ADMINISTRADOR">Administrador</option>
                      <option value="GESTOR">Gestor</option>
                      <option value="OPERADOR">Operador</option>
                      <option value="VISUALIZADOR">Visualizador</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Setor / Departamento</label>
                    <input
                      type="text"
                      placeholder="Ex: Gestão de Frotas"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Aviso na Edição */}
                {editingUser && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] flex items-center gap-2">
                    <i className="fa-solid fa-circle-info text-amber-600 shrink-0"></i>
                    <span>A pessoa precisa sair e entrar de novo no sistema para o novo papel valer.</span>
                  </div>
                )}

                {/* Senha Inicial visível APENAS no modo de criação */}
                {!editingUser && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Senha Inicial (mínimo 6 caracteres) *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-xs"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Esta senha será usada pelo colaborador para entrar no sistema via Firebase Auth.
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                  <button
                    type="button"
                    disabled={criandoLogin}
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={criandoLogin}
                    className="btn bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2 rounded-lg flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {criandoLogin ? (
                      <>
                        <i className="fa-solid fa-circle-notch fa-spin text-xs"></i>
                        <span>Criando Acesso...</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-check text-xs"></i>
                        <span>{editingUser ? 'Salvar Alterações' : 'Criar Usuário & Login'}</span>
                      </>
                    )}
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

export default UsersView;
