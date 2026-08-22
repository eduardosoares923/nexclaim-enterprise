import { RoleType } from '../types';

export function usePermissions(role: RoleType | undefined, userEmail: string | undefined) {
  const ehProprietario = role === 'PROPRIETARIO';
  const ehAdminOuMais = ehProprietario || role === 'ADMINISTRADOR';
  const podeCriar = ehAdminOuMais || role === 'GESTOR' || role === 'OPERADOR';
  const podeExcluirTudo = ehAdminOuMais; // exclusão individual
  const podeGerenciarUsuarios = ehProprietario;
  const podeExclusaoEmMassa = ehProprietario;

  const podeEditarOuExcluir = (createdBy?: string | null): boolean | 'apenas-editar' => {
    if (ehAdminOuMais) return true;
    // GESTOR pode editar mas nunca excluir
    if (role === 'GESTOR') return 'apenas-editar';
    if (role === 'OPERADOR') return createdBy === userEmail;
    return false;
  };

  return {
    ehProprietario,
    ehAdminOuMais,
    podeCriar,
    podeExcluirTudo,
    podeGerenciarUsuarios,
    podeExclusaoEmMassa,
    podeEditarOuExcluir,
    role,
  };
}
