import React, { useMemo, useState } from 'react';
import { Edit2, Trash2, Save, X, Plus, Play } from 'lucide-react';

export interface Task {
  id: string;
  numero: string;
  classificacao: string;
  categoria: string;
  fase: string;
  condicao: string; // '', 'Sempre', 'A', 'B', 'C'
  nome: string;
  duracao: string;
  percentualConcluido: number; // 0-100
  startDate?: string | null;
  endDate?: string | null;
}

interface ScheduleTableProps {
  tasks: Task[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;

  // Callbacks
  onTaskUpdate?: (task: Task) => void | Promise<void>;
  onTaskDelete?: (id: string) => void | Promise<void>;
  onTaskAdd?: () => void;
  onTaskStart?: (id: string) => void | Promise<void>;
  onTaskUnstart?: (id: string) => void | Promise<void>;

  // Opções (opcional)
  classificacaoOptions?: string[];
  categoriaOptions?: string[];
  faseOptions?: string[];
}

// Status derivado do percentual
function getStatusFromPercent(percent: number): { text: string; cls: string } {
  const p = Math.max(0, Math.min(100, Math.round(Number(percent) || 0)));
  if (p === 100) return { text: 'Concluído', cls: 'bg-green-100 text-green-800' };
  if (p === 0) return { text: 'Não iniciado', cls: 'bg-gray-100 text-gray-800' };
  return { text: 'Em Andamento', cls: 'bg-yellow-100 text-yellow-800' };
}

function uniqueNonEmpty(values: (string | undefined | null)[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  values.forEach((v) => {
    const s = String(v ?? '').trim();
    if (!s) return;
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  });
  return out;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({
  tasks,
  loading,
  error,
  onRefresh,
  onTaskUpdate,
  onTaskDelete,
  onTaskAdd,
  onTaskStart,
  onTaskUnstart,
  classificacaoOptions,
  categoriaOptions,
  faseOptions,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleteStage, setDeleteStage] = useState<0 | 2>(0); // 0=none, 2=modal delete
  const [pendingUnstartId, setPendingUnstartId] = useState<string | null>(null); // confirmar desfazer início

  const classificacaoOpts = useMemo(
    () => classificacaoOptions ?? uniqueNonEmpty(tasks.map((t) => t.classificacao)),
    [classificacaoOptions, tasks]
  );
  const categoriaOpts = useMemo(
    () => categoriaOptions ?? uniqueNonEmpty(tasks.map((t) => t.categoria)),
    [categoriaOptions, tasks]
  );
  const faseOpts = useMemo(
    () => faseOptions ?? uniqueNonEmpty(tasks.map((t) => t.fase)),
    [faseOptions, tasks]
  );

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditedTask({ ...task });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedTask(null);
  };

  const saveEdit = async () => {
    if (editedTask && onTaskUpdate) {
      const p = Math.max(0, Math.min(100, Math.round(Number(editedTask.percentualConcluido) || 0)));
      await Promise.resolve(onTaskUpdate({ ...editedTask, percentualConcluido: p }));
    }
    setEditingId(null);
    setEditedTask(null);
  };

  const handleField = <K extends keyof Task>(field: K, value: Task[K]) => {
    if (!editedTask) return;
    setEditedTask({ ...editedTask, [field]: value });
  };

  if (loading) {
    return <div className="text-center text-gray-500 mt-10">Carregando tarefas...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-600 mt-10">
        {error}
        {onRefresh && (
          <div className="mt-2">
            <button className="text-primary underline" onClick={onRefresh}>
              Tentar novamente
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden mt-6">
      <div className="flex justify-between items-center p-4 border-b dark:border-gray-800">
        <h3 className="font-medium text-lg">Cronograma de Tarefas</h3>
        {onTaskAdd && (
          <button
            type="button"
            onClick={onTaskAdd}
            className="btn btn-primary flex items-center text-sm"
          >
            <Plus size={16} className="mr-1" />
            Nova Tarefa
          </button>
        )}
      </div>

      {(!tasks || tasks.length === 0) ? (
        <div className="text-center text-gray-500 py-10">Nenhuma tarefa encontrada.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-200 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">Início</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">Número</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">Classificação</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">Categoria</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">Fase</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">Condição</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">Duração</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">% Concluído</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">Status</th>
                {(onTaskUpdate || onTaskDelete) && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">Ações</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {tasks.map((t) => {
                const isEditing = editingId === t.id;
                const row = isEditing && editedTask ? editedTask : t;
                const { text, cls } = getStatusFromPercent(row.percentualConcluido);

                const pct = row.percentualConcluido;
                const isCompleted = pct === 100;
                // Habilita "Desfazer" somente entre 1% e 99%. Nunca para 100%.
                const canUnstart = (pct > 0 && pct < 100) || (!!row.startDate && !isCompleted);

                return (
                  <tr key={t.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                    {/* Início */}
                    <td className="px-4 py-3 text-sm">
                      {canUnstart ? (
                        <button
                          type="button"
                          className="px-2 py-2 text-xs rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200 flex items-center gap-1"
                          onClick={() => setPendingUnstartId(t.id)}
                          title="Desfazer início"
                        >
                          <X size={14} /> Desfazer
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-primary flex items-center text-xs disabled:opacity-50 disabled:cursor-not-allowed gap-1"
                          onClick={async () => {
                            if (onTaskStart) {
                              await Promise.resolve(onTaskStart(t.id));
                              // Recarrega a visualização
                               if (onRefresh) await Promise.resolve(onRefresh());
                               else if (typeof window !== 'undefined') window.location.reload();
                           }
                          }}
                          disabled={isCompleted || !onTaskStart}
                          title={isCompleted ? 'Tarefa concluída' : 'Iniciar tarefa'}
                        >
                          <Play size={14} /> Iniciar
                        </button>
                      )}
                    </td>

                    {/* Número (não editável) */}
                    <td className="px-4 py-6 text-sm text-gray-900 dark:text-gray-100">
                      {row.numero}
                    </td>

                    {/* Classificação (select) */}
                    <td className="px-4 py-6 text-sm text-gray-900 dark:text-gray-100">
                      {isEditing ? (
                        <select
                          className="w-full p-1 border rounded dark:bg-gray-800 dark:border-gray-700"
                          value={row.classificacao || ''}
                          onChange={(e) => handleField('classificacao', e.target.value)}
                        >
                          <option value="">—</option>
                          {classificacaoOpts.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        row.classificacao
                      )}
                    </td>

                    {/* Categoria (select) */}
                    <td className="px-4 py-6 text-sm text-gray-900 dark:text-gray-100">
                      {isEditing ? (
                        <select
                          className="w-full p-1 border rounded dark:bg-gray-800 dark:border-gray-700"
                          value={row.categoria || ''}
                          onChange={(e) => handleField('categoria', e.target.value)}
                        >
                          <option value="">—</option>
                          {categoriaOpts.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        row.categoria
                      )}
                    </td>

                    {/* Fase (select) */}
                    <td className="px-4 py-6 text-sm text-gray-900 dark:text-gray-100">
                      {isEditing ? (
                        <select
                          className="w-full p-1 border rounded dark:bg-gray-800 dark:border-gray-700"
                          value={row.fase || ''}
                          onChange={(e) => handleField('fase', e.target.value)}
                        >
                          <option value="">—</option>
                          {faseOpts.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        row.fase
                      )}
                    </td>

                    {/* Condição (select) */}
                    <td className="px-4 py-6 text-sm text-gray-900 dark:text-gray-100">
                      {isEditing ? (
                        <select
                          className="w-full p-1 border rounded dark:bg-gray-800 dark:border-gray-700"
                          value={row.condicao || ''}
                          onChange={(e) => handleField('condicao', e.target.value)}
                        >
                          <option value="">—</option>
                          <option value="Sempre">Sempre</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                        </select>
                      ) : (
                        row.condicao
                      )}
                    </td>

                    {/* Nome */}
                    <td className="px-4 py-6 text-sm text-gray-900 dark:text-gray-100">
                      {isEditing ? (
                        <input
                          className="w-full p-1 border rounded dark:bg-gray-800 dark:border-gray-700"
                          value={row.nome}
                          onChange={(e) => handleField('nome', e.target.value)}
                        />
                      ) : (
                        row.nome
                      )}
                    </td>

                    {/* Duração */}
                    <td className="px-4 py-6 text-sm text-gray-900 dark:text-gray-100">
                      {isEditing ? (
                        <input
                          className="w-full p-1 border rounded dark:bg-gray-800 dark:border-gray-700"
                          value={row.duracao}
                          onChange={(e) => handleField('duracao', e.target.value)}
                        />
                      ) : (
                        row.duracao
                      )}
                    </td>

                    {/* % Concluído */}
                    <td className="px-4 py-6 text-sm text-gray-900 dark:text-gray-100">
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          max={100}
                          className="w-24 p-1 border rounded text-right dark:bg-gray-800 dark:border-gray-700"
                          value={row.percentualConcluido}
                          onChange={(e) => handleField('percentualConcluido', Number(e.target.value))}
                        />
                      ) : (
                        `${row.percentualConcluido}%`
                      )}
                    </td>

                    {/* Status (derivado) */}
                    <td className="px-4 py-6 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${cls}`}>{text}</span>
                    </td>

                    {/* Ações */}
                    {(onTaskUpdate || onTaskDelete) && (
                      <td className="px-4 py-6 text-sm">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={saveEdit}
                              className="text-green-600 hover:text-green-800"
                              title="Salvar"
                            >
                              <Save size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="text-gray-500 hover:text-gray-700"
                              title="Cancelar"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {onTaskUpdate && (
                              <button
                                type="button"
                                onClick={() => startEdit(t)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Editar"
                              >
                                <Edit2 size={18} />
                              </button>
                            )}
                            {onTaskDelete && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPendingDeleteId(t.id);
                                  setDeleteStage(2); // abre direto o modal final
                                }}
                                className="text-red-600 hover:text-red-800"
                                title="Excluir"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para confirmar desfazer início */}
      {pendingUnstartId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPendingUnstartId(null)} />
          <div className="relative z-50 w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-xl border dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">
              Cancelar tarefa iniciada
            </h4>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Confirma cancelar a tarefa? O progresso será perdido.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="px-3 py-2 text-sm border rounded dark:border-gray-600"
                onClick={() => setPendingUnstartId(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                onClick={async () => {
                  try {
                    if (onTaskUnstart && pendingUnstartId) {
                      await Promise.resolve(onTaskUnstart(pendingUnstartId));
                      if (onRefresh) await Promise.resolve(onRefresh());
                      else if (typeof window !== 'undefined') window.location.reload();
                    }
                  } finally {
                    setPendingUnstartId(null);
                  }
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmação: modal overlay (delete) */}
      {deleteStage === 2 && pendingDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteStage(0)} />
          <div className="relative z-50 w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-xl border dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-red-700 dark:text-red-400">
              Confirmação
            </h4>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Esta ação é irreversível. Deseja excluir a tarefa permanentemente?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="px-3 py-2 text-sm border rounded dark:border-gray-600"
                onClick={() => setDeleteStage(0)}
              >
                Voltar
              </button>
              <button
                type="button"
                className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                onClick={async () => {
                  try {
                    if (onTaskDelete && pendingDeleteId) {
                      await Promise.resolve(onTaskDelete(pendingDeleteId));
                      if (onRefresh) await Promise.resolve(onRefresh());
                      else if (typeof window !== 'undefined') window.location.reload();
                    }
                  } finally {
                    setDeleteStage(0);
                    setPendingDeleteId(null);
                  }
                }}
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Espaço extra no fim da página */}
      <div className="h-12" />
    </div>
  );
};

export default ScheduleTable;