import React, { useEffect, useMemo, useState } from 'react';
import FilterPanel from './FilterPanel';
import { ArrowLeft, Eye } from 'lucide-react';

type Employee = { id: string; name: string };

type ProjectOption = { id: string; label: string };

type Task = {
  id_file?: string;
  num?: number | string;
  name?: string;
  duration?: string | number;
  conclusion?: number; // 0..1
  start_date?: string | null;
  end_date?: string | null;
  atraso?: number | null;
};

type ViewMode = 'list' | 'detail';

// Formata ISO/RFC-1123 para dd/mm/aaaa
function formatDateBR(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const ProgressTable: React.FC = () => {
  const [view, setView] = useState<ViewMode>('list');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Detail view state
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [projectsMap, setProjectsMap] = useState<Record<string, string>>({});
  const [selectedProjectId, setSelectedProjectId] = useState<string>('null'); // 'null' = todos
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>(''); // 'Concluídas' | 'Em Andamento' | 'Atrasadas' | 'Não iniciada'

  // Load employees
  useEffect(() => {
    const loadEmployees = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/team/employees`, { credentials: 'include' });
        if (!res.ok) throw new Error('Falha ao carregar funcionários.');
        const json = await res.json();
        const employees: Employee[] = (json?.employees || []).map((emp: any) => ({
          id: emp.id, // Certifique-se de que o backend retorna o ID
          name: emp.name,
        }));
        setEmployees(employees);
      } catch {
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };
    loadEmployees();
  }, []);

  // Load projects for filter (suporta id ou id_file)
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await fetch(`/api/arquivos_usuario`, { credentials: 'include' });
        const data = await res.json();
        const opts: ProjectOption[] = (data.arquivos || [])
          .map((a: any) => {
            const id = String(a.id ?? a.id_file ?? '');
            const label = `${a.project ?? a.projeto ?? 'Projeto'} | ${a.name ?? a.nome ?? ''}`.trim();
            return { id, label };
          })
          .filter((o) => o.id);
        const map: Record<string, string> = {};
        opts.forEach((o) => (map[o.id] = o.label));
        setProjects([{ id: 'null', label: 'Todos os projetos' }, ...opts]);
        setProjectsMap(map);
      } catch {
        setProjects([{ id: 'null', label: 'Todos os projetos' }]);
        setProjectsMap({});
      }
    };
    loadProjects();
  }, []);

  const enterDetail = (emp: Employee) => {
    setSelectedEmployee(emp);
    setSelectedProjectId('null');
    setStatusFilter('');
    setView('detail');
  };

  const leaveDetail = () => {
    setView('list');
    setSelectedEmployee(null);
    setTasks([]);
    setStatusFilter('');
    setSelectedProjectId('null');
  };

  // Fetch tasks for selected employee/project
  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedEmployee || view !== 'detail') return;
      setTasksLoading(true);
      try {
        const idParam = selectedProjectId || 'null';
        const res = await fetch(`/api/employee/tasks/${selectedEmployee.id}/${encodeURIComponent(idParam)}`, {
          credentials: 'include',
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.mensagem || 'Falha ao carregar tarefas do funcionário.');
        const list: Task[] = Array.isArray(json?.tasks) ? json.tasks : [];
        setTasks(list);
      } catch {
        setTasks([]);
      } finally {
        setTasksLoading(false);
      }
    };
    fetchTasks();
  }, [selectedEmployee, selectedProjectId, view]);

  // Derived helpers
  const now = useMemo(() => new Date(), []);
  const isOverdue = (t: Task): boolean => {
    const end = t.end_date ? new Date(t.end_date) : null;
    return Number(t.atraso || 0) > 0 || (end && end < now && Number(t.conclusion ?? 0) < 1);
  };

  type StatusKey = 'done' | 'overdue' | 'not_started' | 'in_progress';
  const getStatusKey = (t: Task): StatusKey => {
    const conclusion = Number(t.conclusion ?? 0);
    if (conclusion === 1) return 'done';
    if (isOverdue(t)) return 'overdue';
    if (conclusion === 0) return 'not_started';
    return 'in_progress';
  };

  // Labels usados no FilterPanel
  const statusFilterLabelForKey = (k: StatusKey): 'Concluídas' | 'Atrasadas' | 'Não iniciada' | 'Em Andamento' => {
    switch (k) {
      case 'done':
        return 'Concluídas';
      case 'overdue':
        return 'Atrasadas';
      case 'not_started':
        return 'Não iniciada';
      default:
        return 'Em Andamento';
    }
  };

  // Exibição (badge) semelhante ao ScheduleTable
  const statusDisplayForKey = (k: StatusKey): { text: string; cls: string } => {
    switch (k) {
      case 'done':
        return { text: 'Concluída', cls: 'bg-green-100 text-green-800' };
      case 'overdue':
        return { text: 'Atrasada', cls: 'bg-red-100 text-red-800' };
      case 'not_started':
        return { text: 'Não iniciada', cls: 'bg-gray-100 text-gray-800' };
      default:
        return { text: 'Em andamento', cls: 'bg-yellow-100 text-yellow-800' };
    }
  };

  // Aplica o filtro usando os rótulos do FilterPanel
  const filteredTasks = useMemo(() => {
    if (!statusFilter) return tasks;
    return tasks.filter((t) => statusFilterLabelForKey(getStatusKey(t)) === statusFilter);
  }, [tasks, statusFilter, now]);

  const handleFiltersChange = (filters: Record<string, string[]>) => {
    const proj = (filters.classificacao && filters.classificacao[0]) || 'null';
    const stat = (filters.status && filters.status[0]) || '';
    setSelectedProjectId(proj || 'null');
    setStatusFilter(stat);
  };

  // Contadores do cabeçalho (para o funcionário/projeto atual)
  const counters = useMemo(() => {
    const c = { total: tasks.length, done: 0, in_progress: 0, overdue: 0, not_started: 0 };
    for (const t of tasks) {
      const k = getStatusKey(t);
      if (k === 'done') c.done++;
      else if (k === 'overdue') c.overdue++;
      else if (k === 'not_started') c.not_started++;
      else c.in_progress++;
    }
    return c;
  }, [tasks]);

  // Render list view
  if (view === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h3 className="font-medium text-lg">Progresso por Funcionário</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-200 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Funcionário
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-100" colSpan={2}>
                    Carregando...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-100" colSpan={2}>
                    Nenhum funcionário encontrado.
                  </td>
                </tr>
              ) : (
                employees.map((emp, idx) => (
                  <tr key={`${emp.id}-${idx}`} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {emp.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        type="button"
                        className="text-primary hover:text-primary-light text-sm font-medium flex justify-end items-center gap-2 w-full"
                        onClick={() => enterDetail(emp)}
                        title={`Ver progresso de ${emp.name}`}
                      >
                        <Eye size={18} />
                        <span>Detalhes</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Render detail view
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="p-6 border-b flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-medium text-lg">{selectedEmployee?.name ?? 'Funcionário'}</h3>
          <p className="text-xs text-gray-500 mt-1">
            {selectedProjectId === 'null' ? 'Todos os projetos' : projectsMap[selectedProjectId] ?? 'Projeto selecionado'}
          </p>
        </div>

        {/* Contadores centralizados */}
        <div className="flex-1 min-w-[280px] flex justify-center">
          <div className="flex items-stretch gap-3">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-lg px-3 py-2">
              <div className="text-[11px] text-green-700 dark:text-green-400">Concluídas</div>
              <div className="text-base font-semibold text-green-800 dark:text-green-300">
                {tasksLoading ? '...' : counters.done}
              </div>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg px-3 py-2">
              <div className="text-[11px] text-yellow-700 dark:text-yellow-400">Em andamento</div>
              <div className="text-base font-semibold text-yellow-800 dark:text-yellow-300">
                {tasksLoading ? '...' : counters.in_progress}
              </div>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 rounded-lg px-3 py-2">
              <div className="text-[11px] text-red-700 dark:text-red-400">Atrasadas</div>
              <div className="text-base font-semibold text-red-800 dark:text-red-300">
                {tasksLoading ? '...' : counters.overdue}
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
              <div className="text-[11px] text-gray-700 dark:text-gray-300">Não iniciadas</div>
              <div className="text-base font-semibold text-gray-800 dark:text-gray-200">
                {tasksLoading ? '...' : counters.not_started}
              </div>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg px-3 py-2">
              <div className="text-[11px] text-blue-700 dark:text-blue-400">Total</div>
              <div className="text-base font-semibold text-blue-800 dark:text-blue-300">
                {tasksLoading ? '...' : counters.total}
              </div>
            </div>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={leaveDetail}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
        </div>
      </div>

      <div className="p-4">
        <FilterPanel
          onFilterChange={handleFiltersChange}
          classificacaoOptions={projects}
          showClassificacao
          showStatus
          showCategory={false}
          showCondicao={false}
          showFase={false}
          classificacaoLabel="Projeto"
          statusLabel="Status"
          statusOptionsOverride={['Concluídas', 'Em Andamento', 'Atrasadas', 'Não iniciada']}
          addDefaultAllOption={false}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-200 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Projeto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Número
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Duração
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Iniciada em
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Finalizada em
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Concluída
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {tasksLoading ? (
              <tr>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-100" colSpan={8}>
                  Carregando...
                </td>
              </tr>
            ) : filteredTasks.length === 0 ? (
              <tr>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-100" colSpan={8}>
                  Nenhuma tarefa encontrada.
                </td>
              </tr>
            ) : (
              filteredTasks.map((t, idx) => {
                const projName =
                  selectedProjectId !== 'null'
                    ? projectsMap[selectedProjectId] ?? 'Projeto'
                    : (t.id_file && projectsMap[t.id_file]) || '——';
                const conclusionRaw = Number(t.conclusion ?? 0);
                const pct = conclusionRaw <= 1 ? Math.round(conclusionRaw * 100) : Math.round(conclusionRaw);

                const key = getStatusKey(t);
                const { text, cls } = statusDisplayForKey(key);
                const atrasoNum = Number(t.atraso || 0);

                return (
                  <tr key={`${t.id_file || 'all'}-${t.num || idx}`} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{projName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{t.num ?? '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{t.name ?? '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{t.duration ?? '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {formatDateBR(t.start_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {formatDateBR(t.end_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {isNaN(pct) ? '—' : `${pct}%`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <div className="flex flex-col items-start">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${cls}`}>{text}</span>
                        {key === 'overdue' && atrasoNum > 0 && (
                          <span className="mt-1 text-[11px] text-red-600">
                            Atraso: {atrasoNum} dia{atrasoNum > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProgressTable;