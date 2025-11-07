import React, { useMemo, useState, useEffect } from 'react';
import { Edit2, Trash2, Save, X, Plus, Play, CheckCircle, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';

export interface Task {
  id: string;
  numero: string;
  classificacao: string;
  categoria: string;
  fase: string;
  condicao: string;
  nome: string;
  duracao: string;
  percentualConcluido: number;
  startDate?: string | null;
  endDate?: string | null;
  atraso?: number;
  responsavel?: string | null;
  userId?: string | null;
  // novos campos para a coluna "Como fazer"
  text?: string | null;
  reference?: string | null;
}

interface ScheduleTableProps {
  tasks: Task[];
  loading?: boolean;
  error?: string | null;
  onTaskUpdate?: (task: Task) => void | Promise<void>;
  onTaskDelete?: (id: string) => void | Promise<void>;
  onTaskAdd?: () => void;
  onTaskStart?: (id: string) => void | Promise<void>;
  classificacaoOptions?: string[];
  categoriaOptions?: string[];
  faseOptions?: string[];
  idFile?: string | null;
}

type Employee = { id: string; name: string };

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

function parseDateSafe(iso?: string | null): Date | null {
  if (!iso) return null;
  const s = String(iso).trim();

  if (/[zZ]$|[+\-]\d{2}:\d{2}$/.test(s)) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (m) {
    const [, Y, M, D, h, mi, sec] = m;
    return new Date(Number(Y), Number(M) - 1, Number(D), Number(h), Number(mi), Number(sec || '0'));
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function formatDateTime(iso?: string | null): string {
  const d = parseDateSafe(iso);
  if (!d) return '';
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Valor cru do responsável ('' quando não definido)
function getResponsibleRaw(t: any): string {
  return String(t?.responsavel ?? t?.responsible ?? '').trim();
}

// Formata para "Primeiro F. S."
function shortEmployeeName(full?: string | null): string {
  const s = String(full ?? '').trim();
  if (!s) return '';
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0];

  const firstName = parts[0];

  const stop = new Set(['da', 'de', 'do', 'das', 'dos', 'e', "d'", 'di', 'del', 'della', 'van', 'von', 'der']);
  const surnames = parts.slice(1).filter((p) => !stop.has(p.toLowerCase()));

  if (surnames.length === 0) return firstName;

  const firstSurname = surnames[0];
  const lastSurname = surnames[surnames.length - 1];

  const fi = (firstSurname[0] || '').toUpperCase();
  const li = (lastSurname[0] || '').toUpperCase();

  if (!fi && !li) return firstName;
  if (fi && li && fi !== li) return `${firstName} ${fi}. ${li}.`;
  return `${firstName} ${fi || li}.`;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({
  tasks,
  loading,
  error,
  onTaskUpdate,
  onTaskDelete,
  onTaskAdd,
  onTaskStart,
  classificacaoOptions,
  categoriaOptions,
  faseOptions,
  idFile,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleteStage, setDeleteStage] = useState<0 | 2>(0);
  const [confirmStartId, setConfirmStartId] = useState<string | null>(null);
  const [isCompletingProject, setIsCompletingProject] = useState<boolean>(false);
  const [showConfirmCompleteProject, setShowConfirmCompleteProject] = useState(false);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const res = await fetch('/api/team/employees', {
          method: 'GET',
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Falha ao carregar usuários da equipe');
        const data = await res.json();
        setEmployees(Array.isArray(data.employees) ? data.employees : []);
      } catch (e) {
        console.error(e);
        setEmployees([]);
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  // Mapas para resolver id <-> nome
  const employeesById = useMemo(() => {
    const m = new Map<string, string>();
    for (const e of employees) {
      if (!e) continue;
      m.set(String(e.id), e.name);
    }
    return m;
  }, [employees]);

  const employeesByName = useMemo(() => {
    const m = new Map<string, string>();
    for (const e of employees) {
      if (!e?.name) continue;
      m.set(e.name.trim().toLowerCase(), String(e.id));
    }
    return m;
  }, [employees]);

  const getUserIdByName = (name?: string | null): string | null => {
    if (!name) return null;
    const id = employeesByName.get(String(name).trim().toLowerCase());
    return id || null;
  };

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

  const allTasksCompleted = useMemo(() => {
    return tasks.every((task) => task.percentualConcluido === 100);
  }, [tasks]);

  const preserveScroll = async (fn: () => Promise<void> | void) => {
    const y = typeof window !== 'undefined' ? window.scrollY : 0;
    try {
      await Promise.resolve(fn());
    } finally {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: y, behavior: 'auto' });
      }
    }
  };

  const handleConfirmStart = async () => {
    if (confirmStartId && onTaskStart) {
      try {
        await preserveScroll(async () => {
          await Promise.resolve(onTaskStart(confirmStartId));
        });
      } catch (e) {
        console.error('Erro ao iniciar tarefa:', e);
      } finally {
        setConfirmStartId(null);
      }
    }
  };

  // Dispara conclusão do projeto no backend
  const handleConfirmCompleteProject = async () => {
    if (!idFile || idFile === 'null') {
      alert('Selecione um projeto específico para concluir.');
      setShowConfirmCompleteProject(false);
      return;
    }
    setIsCompletingProject(true);
    try {
      const res = await fetch('/api/projects/completed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id_file: idFile }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.mensagem || 'Falha ao concluir o projeto.');
      }
      // Backend pode responder 200 com mensagens de validação também
      alert(data?.mensagem || 'Projeto marcado como concluído com sucesso.');
      setShowConfirmCompleteProject(false);
    } catch (e) {
      console.error(e);
      alert('Não foi possível concluir o projeto.');
      // mantém o modal aberto para o usuário tentar novamente/ler
    } finally {
      setIsCompletingProject(false);
    }
  };

  const startEdit = (task: Task) => {
    const respRaw = getResponsibleRaw(task);
    const fallbackId = task.userId || getUserIdByName(respRaw);
    setEditingId(task.id);
    setEditedTask({ ...task, responsavel: respRaw, userId: fallbackId || null });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedTask(null);
  };

  const saveEdit = async () => {
    if (!editedTask) return;
    const p = Math.max(0, Math.min(100, Math.round(Number(editedTask.percentualConcluido) || 0)));

    // Garante que vamos enviar um userId válido se houver nome
    const ensuredUserId = editedTask.userId || getUserIdByName(editedTask.responsavel || '') || null;

    try {
      await preserveScroll(async () => {
        if (onTaskUpdate) {
          await Promise.resolve(
            onTaskUpdate({
              ...editedTask,
              userId: ensuredUserId,
              percentualConcluido: p,
            })
          );
        }
      });
    } catch (e) {
      console.error('Erro no salvar:', e);
    } finally {
      setEditingId(null);
      setEditedTask(null);
    }
  };

  const handleField = <K extends keyof Task>(field: K, value: Task[K]) => {
    if (!editedTask) return;
    setEditedTask({ ...editedTask, [field]: value });
  };

  type SortKey = 'numero' | 'categoria' | 'fase' | 'condicao' | 'nome' | 'percentualConcluido';

  const [sortKey, setSortKey] = useState<SortKey>('numero');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const toggleSort = (key: SortKey) => {
    setSortDir((prev) => (sortKey === key ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'));
    setSortKey(key);
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown size={14} className="inline-block opacity-60" />;
    return sortDir === 'asc' ? <ChevronUp size={14} className="inline-block" /> : <ChevronDown size={14} className="inline-block" />;
  };

  const cmpStr = (a?: string | null, b?: string | null) =>
    String(a ?? '').localeCompare(String(b ?? ''), 'pt-BR', { sensitivity: 'base', numeric: false });

  const cmpNum = (a?: number | null, b?: number | null) => {
    const na = Number.isFinite(Number(a)) ? Number(a) : NaN;
    const nb = Number.isFinite(Number(b)) ? Number(b) : NaN;
    if (isNaN(na) && isNaN(nb)) return 0;
    if (isNaN(na)) return 1;
    if (isNaN(nb)) return -1;
    return na - nb;
  };

  const sortedTasks = useMemo(() => {
    const arr = [...tasks];
    arr.sort((a, b) => {
      let r = 0;
      switch (sortKey) {
        case 'numero': {
          const na = Number(a.numero);
          const nb = Number(b.numero);
          r = cmpNum(isNaN(na) ? null : na, isNaN(nb) ? null : nb);
          break;
        }
        case 'categoria':
          r = cmpStr(a.categoria, b.categoria);
          break;
        case 'fase':
          r = cmpStr(a.fase, b.fase);
          break;
        case 'condicao':
          r = cmpStr(a.condicao, b.condicao);
          break;
        case 'nome':
          r = cmpStr(a.nome, b.nome);
          break;
        case 'percentualConcluido':
          r = cmpNum(a.percentualConcluido, b.percentualConcluido);
          break;
        default:
          r = 0;
      }
      return sortDir === 'asc' ? r : -r;
    });
    return arr;
  }, [tasks, sortKey, sortDir]);

  if (loading) {
    return <div className="text-center text-gray-500 mt-10">Carregando tarefas...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-600 mt-10">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden mt-6">
      <div className="flex justify-between items-center p-4 border-b dark:border-gray-800">
        <h3 className="font-medium text-lg">Lista de Tarefas</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowConfirmCompleteProject(true)}
            className={`btn flex items-center text-sm border ${
              tasks.every((task) => task.percentualConcluido === 100)
                ? 'btn-success border-green-600 text-black rounded hover:bg-green-400 dark:text-white dark:hover:text-black dark:hover:bg-green-200'
                : 'btn-disabled border-gray-400 opacity-50 cursor-not-allowed'
            }`}
            disabled={!tasks.every((task) => task.percentualConcluido === 100) || isCompletingProject}
          >
            <CheckCircle size={16} className="mr-1" />
            {isCompletingProject ? 'Concluindo...' : 'Concluir Projeto'}
          </button>
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
      </div>

      {(!tasks || tasks.length === 0) ? (
        <div className="text-center text-gray-500 py-10">Nenhuma tarefa encontrada.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-200 dark:bg-gray-800">
              <tr>
                <th className="px-10 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">
                  Início
                </th>
                <th className="px-2 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">
                  <button type="button" onClick={() => toggleSort('numero')} className="flex items-center gap-1" title="Ordenar por número">
                    Número {renderSortIcon('numero')}
                  </button>
                </th>
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">
                  Classificação
                </th>
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">
                  <button type="button" onClick={() => toggleSort('categoria')} className="flex items-center gap-1" title="Ordenar por categoria">
                    Categoria {renderSortIcon('categoria')}
                  </button>
                </th>
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">
                  <button type="button" onClick={() => toggleSort('fase')} className="flex items-center gap-1" title="Ordenar por fase">
                    Fase {renderSortIcon('fase')}
                  </button>
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">
                  <button type="button" onClick={() => toggleSort('condicao')} className="flex items-center gap-1" title="Ordenar por condição">
                    Condição {renderSortIcon('condicao')}
                  </button>
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">
                  <button type="button" onClick={() => toggleSort('nome')} className="flex items-center gap-1" title="Ordenar por nome">
                    Nome {renderSortIcon('nome')}
                  </button>
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">
                  Como fazer
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">
                  Duração
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">
                  <button
                    type="button"
                    onClick={() => toggleSort('percentualConcluido')}
                    className="flex items-center gap-1"
                    title="Ordenar por concluído"
                  >
                    Concluído {renderSortIcon('percentualConcluido')}
                  </button>
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">
                  Status
                </th>
                {(onTaskUpdate || onTaskDelete) && (
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">Ações</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {sortedTasks.map((t) => {
                const isEditing = editingId === t.id;
                const row = isEditing && editedTask ? editedTask : t;

                // Status label
                let text = 'Andamento';
                let cls = 'bg-yellow-100 text-yellow-800';
                const atraso = Number(row.atraso || 0);
                if (row.percentualConcluido === 100) {
                  text = 'Concluída';
                  cls = 'bg-green-100 text-green-800';
                } else if (atraso > 0) {
                  text = 'Atrasada';
                  cls = 'bg-red-100 text-red-800';
                } else if (row.percentualConcluido === 0) {
                  text = 'Não iniciada';
                  cls = 'bg-gray-100 text-gray-800';
                }

                const pct = row.percentualConcluido;
                const isCompleted = pct === 100;
                const canUnstart = (pct > 0 && pct < 100) || (!!row.startDate && !isCompleted);

                // Resolver nome e id para exibição/seleção
                const respRaw = getResponsibleRaw(row);
                const resolvedName = respRaw || (row.userId ? (employeesById.get(String(row.userId)) || '') : '');
                const showDisplayName = resolvedName ? shortEmployeeName(resolvedName) : 'Não definido';
                const selectValue = row.userId || getUserIdByName(respRaw) || '';

                return (
                  <tr key={t.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                    <td className="px-4 py-3 text-sm">
                      {canUnstart ? (
                        <div className="flex flex-col">
                          <div className="text-[12px] text-gray-600 dark:text-gray-300">Responsável:</div>
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <select
                                className="px-2 py-1 border rounded text-xs dark:bg-gray-800 dark:border-gray-700"
                                disabled={loadingEmployees || employees.length === 0}
                                value={selectValue}
                                onChange={(e) => {
                                  const uid = e.target.value;
                                  const empName = employeesById.get(uid) || '';
                                  // Sempre manter id (FK) e nome para exibição
                                  handleField('userId', (uid || null) as any);
                                  handleField('responsavel', empName as any);
                                }}
                              >
                                <option value="">{loadingEmployees ? 'Carregando...' : 'Selecionar'}</option>
                                {employees.map((u) => (
                                  <option key={u.id} value={u.id}>{shortEmployeeName(u.name)}</option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              {showDisplayName}
                            </div>
                          )}
                          {row.startDate && (
                            <div className="mt-1 text-[11px] text-gray-500 text-left">
                              Em: {formatDateTime(row.startDate)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-primary flex items-center text-xs disabled:opacity-50 disabled:cursor-not-allowed gap-1"
                          onClick={() => setConfirmStartId(t.id)}
                          disabled={isCompleted || !onTaskStart}
                          title={isCompleted ? 'Tarefa concluída' : 'Iniciar tarefa'}
                        >
                          <Play size={14} /> Iniciar
                        </button>
                      )}
                    </td>

                    <td className="px-2 py-6 text-sm text-gray-900 dark:text-gray-100">
                      {row.numero}
                    </td>

                    <td className="px-4 py-6 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
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

                    <td className="px-6 py-6 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
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

                    <td className="px-4 py-6 text-sm text-gray-900 dark:text-gray-100">
                      <div className="flex flex-col">
                        <span className="text-sm">{row.text || '-'}</span>
                        {row.reference ? (
                          <a
                            href={row.reference}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                            title="Abrir documento referência em uma nova aba"
                          >
                            Abrir
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 mt-1">Sem link</span>
                        )}
                      </div>
                    </td>

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

                    <td className="px-2 py-1 text-sm text-center whitespace-nowrap">
                      {(() => {
                        let s = 'Andamento';
                        let cls2 = 'bg-yellow-100 text-yellow-800';
                        const atraso2 = Number(row.atraso || 0);
                        if (row.percentualConcluido === 100) {
                          s = 'Concluída';
                          cls2 = 'bg-green-100 text-green-800';
                        } else if (atraso2 > 0) {
                          s = 'Atrasada';
                          cls2 = 'bg-red-100 text-red-800';
                        } else if (row.percentualConcluido === 0) {
                          s = 'Não iniciada';
                          cls2 = 'bg-gray-100 text-gray-800';
                        }
                        return (
                          <div className="flex flex-col items-center">
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${cls2}`}>{s}</span>
                            {Number(row.atraso || 0) > 0 && (
                              <span className="mt-1 text-[11px] text-red-600">
                                Atraso: {Number(row.atraso)} dia{Number(row.atraso) > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>

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
                                  setDeleteStage(2);
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

      {showConfirmCompleteProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowConfirmCompleteProject(false)} />
          <div className="relative z-50 w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-xl border dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Confirmação
            </h4>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Deseja realmente concluir este projeto? Esta ação não pode ser desfeita.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="px-3 py-2 text-sm border rounded dark:border-gray-600 disabled:opacity-60"
                onClick={() => setShowConfirmCompleteProject(false)}
                disabled={isCompletingProject}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
                onClick={handleConfirmCompleteProject}
                disabled={isCompletingProject}
              >
                {isCompletingProject ? 'Concluindo...' : 'Sim, concluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmStartId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmStartId(null)} />
          <div className="relative z-50 w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-xl border dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Confirmação
            </h4>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Deseja realmente iniciar esta tarefa?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="px-3 py-2 text-sm border rounded dark:border-gray-600"
                onClick={() => setConfirmStartId(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleConfirmStart}
              >
                Sim, iniciar
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteStage === 2 && pendingDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setDeleteStage(0); }} />
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
                    await preserveScroll(async () => {
                      if (onTaskDelete && pendingDeleteId) {
                        await Promise.resolve(onTaskDelete(pendingDeleteId));
                      }
                    });
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

      <div className="h-12" />
    </div>
  );
};

export default ScheduleTable;