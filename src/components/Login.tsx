import React, { useState } from 'react';
import { loginComEmailSenha } from '../services/firebase';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !senha.trim()) {
      setErro('Por favor, preencha o e-mail e a senha.');
      return;
    }

    setCarregando(true);
    setErro(null);

    const resultado = await loginComEmailSenha(email.trim(), senha);
    setCarregando(false);

    if (resultado.ok) {
      onLoginSuccess();
    } else {
      setErro(resultado.erro || 'Erro ao realizar login.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-200 p-8 space-y-6">
        
        {/* Header / Brand */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <span className="badge bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-1 rounded border border-amber-300 tracking-wider">
              TRANS PINHO GRAVATAÍ/RS
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              NexClaim Enterprise
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Gestão de Sinistros, Termos Oficiais e Chapeação
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {erro && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3 rounded-lg flex items-center gap-2.5 animate-fadeIn">
            <i className="fa-solid fa-circle-exclamation text-rose-500 shrink-0"></i>
            <span>{erro}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">
              E-mail de Acesso
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <i className="fa-solid fa-envelope"></i>
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@transpinho.com"
                disabled={carregando}
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-xs text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">
              Senha
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <i className="fa-solid fa-lock"></i>
              </span>
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                disabled={carregando}
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-xs text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full mt-2 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-slate-950 font-extrabold text-xs py-3 rounded-lg shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-60 cursor-pointer"
          >
            {carregando ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin"></i>
                <span>Entrando no Sistema...</span>
              </>
            ) : (
              <>
                <span>Entrar no Sistema</span>
                <i className="fa-solid fa-arrow-right"></i>
              </>
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Acesso restrito aos colaboradores autorizados da Trans Pinho.
          </p>
        </div>
      </div>
    </div>
  );
};
