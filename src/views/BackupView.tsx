import React, { useRef, useState } from 'react';
import { RoleType } from '../types';
import { usePermissions } from '../hooks/usePermissions';
import { useConfirm } from '../contexts/ConfirmContext';
import { useToast } from '../contexts/ToastContext';
import { gerarBackupCompleto, lerArquivoBackup, restaurarBackup } from '../services/backup';

interface BackupViewProps {
  userRole?: RoleType;
  userEmail?: string;
}

export const BackupView: React.FC<BackupViewProps> = ({ userRole, userEmail }) => {
  const permissoes = usePermissions(userRole, userEmail);
  const confirmar = useConfirm();
  const notificar = useToast();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [progresso, setProgresso] = useState({ feitos: 0, total: 0 });

  const handleBaixar = async () => {
    setOcupado(true);
    try {
      const total = await gerarBackupCompleto(userEmail || 'desconhecido');
      notificar(`Backup gerado com ${total} registros.`, 'sucesso');
    } catch (err: any) {
      notificar(err?.message || 'Não foi possível gerar o backup.', 'erro');
    } finally {
      setOcupado(false);
    }
  };

  const handleRestaurar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const backup = await lerArquivoBackup(file);
      const total = Object.values(backup.dados).reduce((s: number, l: any) => s + l.length, 0);

      const ok = await confirmar({
        title: 'Restaurar Backup',
        message: `Este backup tem ${total} registros, gerado em ${new Date(backup.geradoEm).toLocaleString('pt-BR')}.\n\nATENÇÃO: os registros serão ADICIONADOS aos que já existem, podendo criar duplicatas. Use apenas para recuperar dados perdidos.\n\nContinuar?`,
        confirmLabel: 'Restaurar',
        danger: true,
      });
      if (!ok) return;

      setOcupado(true);
      setProgresso({ feitos: 0, total });
      const r = await restaurarBackup(backup, (feitos, t) => setProgresso({ feitos, total: t }));
      notificar(`${r.restaurados} registro(s) restaurado(s). ${r.ignorados} falharam.`, 'sucesso');
    } catch (err: any) {
      notificar(err?.message || 'Não foi possível restaurar o backup.', 'erro');
    } finally {
      setOcupado(false);
      setProgresso({ feitos: 0, total: 0 });
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 p-6 rounded-xl text-white">
        <h2 className="text-lg font-black">Backup e Restauração</h2>
        <p className="text-blue-300/80 text-xs mt-1">
          Guarde uma cópia de todos os dados do sistema e recupere se algo for apagado por engano.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <i className="fa-solid fa-download"></i>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Baixar Backup</h3>
              <p className="text-[11px] text-slate-500">Um arquivo com todos os dados do sistema.</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Guarde esse arquivo em local seguro. Recomendado fazer pelo menos uma vez por semana,
            e sempre antes de importar planilhas grandes ou excluir registros em massa.
          </p>
          <button
            onClick={handleBaixar}
            disabled={ocupado}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <i className={`fa-solid ${ocupado ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
            {ocupado ? 'Gerando...' : 'Baixar Backup Agora'}
          </button>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <i className="fa-solid fa-upload"></i>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Restaurar Backup</h3>
              <p className="text-[11px] text-slate-500">Recuperar dados de um arquivo salvo.</p>
            </div>
          </div>
          <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 leading-relaxed">
            A restauração ADICIONA os registros do arquivo aos que já existem. Se os dados ainda
            estiverem no sistema, isso cria duplicatas. Use só para recuperar o que foi perdido.
          </p>

          {progresso.total > 0 && (
            <div className="space-y-1">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{ width: `${(progresso.feitos / progresso.total) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 text-center">
                {progresso.feitos} de {progresso.total} registros
              </p>
            </div>
          )}

          <input type="file" ref={inputRef} onChange={handleRestaurar} accept=".json" className="hidden" />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={ocupado || !permissoes.ehProprietario}
            className="w-full py-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer transition disabled:opacity-50 flex items-center justify-center gap-2"
            title={permissoes.ehProprietario ? 'Selecionar arquivo de backup' : 'Apenas o proprietário pode restaurar'}
          >
            <i className="fa-solid fa-upload"></i>
            Selecionar Arquivo de Backup
          </button>
        </div>
      </div>
    </div>
  );
};
