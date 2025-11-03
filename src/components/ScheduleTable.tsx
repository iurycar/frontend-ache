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
  onRefresh?: () => void;
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

  // Remove partículas comuns dos sobrenomes
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

// Texto para exibição (fallback “Não definido”)
function displayResponsible(t: any): string {
  const raw = getResponsibleRaw(t);
  return raw ? shortEmployeeName(raw) : 'Não definido';
}

// Pode editar? Somente se vazio ou “Não definido”
function canEditResponsible(t: any): boolean {
  const raw = getResponsibleRaw(t);
  if (!raw) return true;
  return raw.toLowerCase() === 'não definido';
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

  const handleCompleteProject = async () => {
    if (!idFile) return;
    try {
      setIsCompletingProject(true);
      const res = await fetch(`/api/projects/completed/${idFile}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Falha ao concluir o projeto');
      const data = await res.json();
      alert(data.mensagem || 'Projeto concluído com sucesso!');
      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error('Erro ao concluir projeto:', error);
      alert('Não foi possível concluir o projeto.');
    } finally {
      setIsCompletingProject(false);
      setShowConfirmCompleteProject(false);
    }
  };

  const handleConfirmCompleteProject = () => {
    setShowConfirmCompleteProject(true);
  };

  const handleCancelCompleteProject = () => {
    setShowConfirmCompleteProject(false);
  };

  const handleConfirmStart = async () => {
    if (confirmStartId && onTaskStart) {
      try {
        await Promise.resolve(onTaskStart(confirmStartId));
        if (onRefresh) await Promise.resolve(onRefresh());
        else if (typeof window !== 'undefined') window.location.reload();
      } catch (e) {
        console.error('Erro ao iniciar tarefa:', e);
      } finally {
        setConfirmStartId(null);
      }
    }
  };

  const handleCancelStart = () => {
    setConfirmStartId(null);
  };

  const startEdit = (task: Task) => {
    const respRaw = getResponsibleRaw(task);
    setEditingId(task.id);
    setEditedTask({ ...task, responsavel: respRaw, userId: task.userId || task.userId });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedTask(null);
  };

  const saveEdit = async () => {
    if (!editedTask) return;
    const p = Math.max(0, Math.min(100, Math.round(Number(editedTask.percentualConcluido) || 0)));
    try {
      if (onTaskUpdate) {
        await Promise.resolve(
          onTaskUpdate({
            ...editedTask,
            percentualConcluido: p,
          })
        );
      }
      if (onRefresh) await Promise.resolve(onRefresh());
      else if (typeof window !== 'undefined') window.location.reload();
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

  // Ordenação ativa somente nas colunas: Número, Categoria, Fase, Condição, Nome e Concluído
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
    if (isNaN(na)) return 1; // NaN vai pro fim
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
        <h3 className="font-medium text-lg">Lista de Tarefas</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleConfirmCompleteProject}
            className={`btn flex items-center text-sm border ${
              allTasksCompleted
                ? 'btn-success border-green-600 text-black rounded hover:bg-green-400 dark:text-white dark:hover:text-black dark:hover:bg-green-200'
                : 'btn-disabled border-gray-400 opacity-50 cursor-not-allowed'
            }`}
            disabled={!allTasksCompleted || isCompletingProject}
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
                {/* Início - sem ordenação */}
                <th className="px-10 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">
                  Início
                </th>

                {/* Número - com ordenação */}
                <th className="px-2 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">
                  <button type="button" onClick={() => toggleSort('numero')} className="flex items-center gap-1" title="Ordenar por número">
                    Número {renderSortIcon('numero')}
                  </button>
                </th>

                {/* Classificação - sem ordenação */}
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">
                  Classificação
                </th>

                {/* Categoria - com ordenação */}
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">
                  <button type="button" onClick={() => toggleSort('categoria')} className="flex items-center gap-1" title="Ordenar por categoria">
                    Categoria {renderSortIcon('categoria')}
                  </button>
                </th>

                {/* Fase - com ordenação */}
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">
                  <button type="button" onClick={() => toggleSort('fase')} className="flex items-center gap-1" title="Ordenar por fase">
                    Fase {renderSortIcon('fase')}
                  </button>
                </th>

                {/* Condição - com ordenação */}
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">
                  <button type="button" onClick={() => toggleSort('condicao')} className="flex items-center gap-1" title="Ordenar por condição">
                    Condição {renderSortIcon('condicao')}
                  </button>
                </th>

                {/* Nome - com ordenação */}
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">
                  <button type="button" onClick={() => toggleSort('nome')} className="flex items-center gap-1" title="Ordenar por nome">
                    Nome {renderSortIcon('nome')}
                  </button>
                </th>

                {/* Como fazer - sem ordenação */}
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">
                  Como fazer
                </th>

                {/* Duração - sem ordenação */}
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">
                  Duração
                </th>

                {/* Concluído - com ordenação */}
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

                {/* Status - sem ordenação */}
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

                const respRaw = getResponsibleRaw(row);
                const editableResp = canEditResponsible(row);

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
                                disabled={!editableResp || loadingEmployees || employees.length === 0}
                                value={row.userId || ''}
                                onChange={(e) => handleField('userId', e.target.value)}
                                title={
                                  !editableResp
                                    ? 'Responsável já designado, não pode ser alterado'
                                    : 'Selecionar responsável'
                                }
                              >
                                <option value="">
                                  {loadingEmployees ? 'Carregando...' : 'Selecionar'}
                                </option>
                                {employees.map((u) => (
                                  <option key={u.id ?? u.name} value={u.id}>
                                    {shortEmployeeName(u.name)}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              {displayResponsible(row)}
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

                    {/* Como fazer */}
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
                        return (
                          <div className="flex flex-col items-center">
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${cls}`}>{text}</span>
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

      {/* Modal de confirmação para concluir projeto */}
      {showConfirmCompleteProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleCancelCompleteProject} />
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
                className="px-3 py-2 text-sm border rounded dark:border-gray-600"
                onClick={handleCancelCompleteProject}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                onClick={handleCompleteProject}
              >
                Sim, concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação para iniciar tarefa */}
      {confirmStartId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleCancelStart} />
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
                onClick={handleCancelStart}
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

      <div className="h-12" />
    </div>
  );
};

export default ScheduleTable;