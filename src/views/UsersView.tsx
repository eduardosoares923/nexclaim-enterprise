import React from 'react';

export const UsersView: React.FC = () => {
  return (
    <div className="p-8 max-w-lg mx-auto text-center mt-12 bg-white rounded-2xl border border-slate-200 shadow-xs">
      <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto text-2xl mb-4 shadow-2xs">
        <i className="fa-solid fa-users-gear"></i>
      </div>
      <h2 className="text-lg font-bold text-slate-900">Gerenciar Usuários</h2>
      <p className="text-sm text-slate-500 mt-2 leading-relaxed">
        Essa área está em construção. Em breve você vai poder criar acessos, redefinir senhas e definir o perfil de cada pessoa da equipe por aqui.
      </p>
    </div>
  );
};

export default UsersView;
