/* ==========================================================================
   NexClaim Enterprise - Authentication Guard & Login Controller (Vanilla JS)
   ========================================================================== */

import {
  loginComEmailSenha,
  logoutUsuario,
  observarAutenticacao
} from './firebase.js';

// Expor função de logout globalmente para o app.js
window.nexclaimLogout = logoutUsuario;

function initAuthGuard() {
  const loginScreen = document.getElementById('login-screen');
  const appEl = document.getElementById('app');
  const modalRoot = document.getElementById('modal-root');
  const loginEmailInput = document.getElementById('login-email');
  const loginSenhaInput = document.getElementById('login-senha');
  const loginBtn = document.getElementById('login-btn');
  const loginErro = document.getElementById('login-erro');
  const loginForm = document.getElementById('login-form');

  function mostrarErro(msg) {
    if (!loginErro) return;
    loginErro.innerHTML = `
      <i class="fa-solid fa-circle-exclamation text-rose-500 shrink-0"></i>
      <span>${msg}</span>
    `;
    loginErro.classList.remove('hidden');
  }

  function limparErro() {
    if (!loginErro) return;
    loginErro.innerHTML = '';
    loginErro.classList.add('hidden');
  }

  async function executarLogin(e) {
    if (e) e.preventDefault();
    limparErro();

    const email = (loginEmailInput?.value || '').trim();
    const senha = loginSenhaInput?.value || '';

    if (!email || !senha) {
      mostrarErro('Por favor, preencha o e-mail e a senha.');
      return;
    }

    if (loginBtn) {
      loginBtn.disabled = true;
      loginBtn.innerHTML = `
        <i class="fa-solid fa-circle-notch fa-spin text-xs"></i>
        <span>Entrando...</span>
      `;
    }

    try {
      const resultado = await loginComEmailSenha(email, senha);
      if (!resultado.ok) {
        mostrarErro(resultado.erro || 'Erro ao realizar login.');
        if (loginBtn) {
          loginBtn.disabled = false;
          loginBtn.innerHTML = `
            <span>Entrar no Sistema</span>
            <i class="fa-solid fa-arrow-right"></i>
          `;
        }
      } else {
        // Sucesso: limpar senha por segurança
        if (loginSenhaInput) loginSenhaInput.value = '';
      }
    } catch (err) {
      console.error('Erro inesperado no login:', err);
      mostrarErro('Ocorreu um erro ao conectar. Tente novamente.');
      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.innerHTML = `
          <span>Entrar no Sistema</span>
          <i class="fa-solid fa-arrow-right"></i>
        `;
      }
    }
  }

  if (loginForm) {
    loginForm.addEventListener('submit', executarLogin);
  } else if (loginBtn) {
    loginBtn.addEventListener('click', executarLogin);
  }

  // Permitir submissão com a tecla Enter
  [loginEmailInput, loginSenhaInput].forEach((input) => {
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          executarLogin(e);
        }
      });
    }
  });

  // Observador de estado de autenticação em tempo real
  observarAutenticacao((user) => {
    if (user) {
      // Usuário autenticado: ocultar tela de login e exibir aplicação
      if (loginScreen) loginScreen.classList.add('hidden');
      if (appEl) appEl.classList.remove('hidden');

      // Restaurar botão de login
      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.innerHTML = `
          <span>Entrar no Sistema</span>
          <i class="fa-solid fa-arrow-right"></i>
        `;
      }
      limparErro();

      // Notificar app.js se disponível para atualizar perfil
      if (typeof window.nexclaimSetUser === 'function') {
        window.nexclaimSetUser(user);
      }
    } else {
      // Usuário deslogado: exibir tela de login e ocultar aplicação
      if (loginScreen) loginScreen.classList.remove('hidden');
      if (appEl) appEl.classList.add('hidden');
      if (modalRoot) modalRoot.classList.add('hidden');

      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.innerHTML = `
          <span>Entrar no Sistema</span>
          <i class="fa-solid fa-arrow-right"></i>
        `;
      }
    }
  });
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuthGuard);
} else {
  initAuthGuard();
}
