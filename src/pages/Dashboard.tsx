import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { useLocale } from '../contexts/LocaleContext';
import { useSpreadsheet } from '../contexts/SpreadsheetContext';
import FilterPanel from '../components/FilterPanel';
import ScheduleTable, { Task } from '../components/ScheduleTable';

const Dashboard: React.FC = () => {
  const { t } = useLocale();
  const { importedSpreadsheets, addSpreadsheet } = useSpreadsheet();

  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState<string>('');
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);

  // Carrega lista de planilhas disponíveis no backend
  useEffect(() => {
    const fetchFromBackend = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/arquivos_usuario', {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) return;
        const result = await response.json();
        (result.arquivos || []).forEach((file: any) => {
          if (!importedSpreadsheets.some((s) => s.id === file.id)) {
            addSpreadsheet({
              id: file.id,
              name: file.name,
              type: 'outros',
              data: [],
              importedAt: new Date(file.importedAt || Date.now()),
              totalRows: 0,
              completedRows: 0,
            });
          }
        });
      } catch {
        // silencioso
      }
    };
    fetchFromBackend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Busca dados da planilha selecionada e mapeia para tarefas
  const fetchSpreadsheetTasks = async (spreadsheetId: string) => {
    if (!spreadsheetId) {
      setTasks([]);
      return;
    }
    try {
      setLoadingTasks(true);
      setTasksError(null);
      const res = await fetch(`http://127.0.0.1:5000/arquivo/${spreadsheetId}/dados`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Falha ao buscar dados da planilha');
      const result = await res.json();
      const dados: any[] = result.dados || [];
      const mapped: Task[] = dados.map((row: any, idx: number) => {
        const pctRaw = row?.conclusion;
        let pct = 0;
        if (typeof pctRaw === 'number') pct = Math.round(pctRaw * 100);
        else {
          const n = parseFloat(pctRaw);
          pct = isNaN(n) ? 0 : Math.round(n * 100);
        }
        return {
          id: String(row?.num ?? idx),
          numero: String(row?.num ?? ''),
          classificacao: String(row?.classe ?? ''),
          categoria: String(row?.category ?? ''),
          fase: String(row?.phase ?? ''),
          condicao: String(row?.status ?? ''),
          nome: String(row?.name ?? ''),
          duracao: String(row?.duration ?? ''),
          percentualConcluido: Math.min(100, Math.max(0, pct)),
        };
      });
      setTasks(mapped);
    } catch (e) {
      setTasksError('Erro ao carregar dados da planilha.');
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchSpreadsheetTasks(selectedSpreadsheetId);
  }, [selectedSpreadsheetId]);

  // Aplica filtros do painel sobre as tarefas carregadas
  const filteredTasks = useMemo(() => {
    let rows = tasks;

    // developmentType -> compara com "classificacao"
    if (filters.developmentType && filters.developmentType.length > 0) {
      const devs = filters.developmentType.map((s) => s.toLowerCase());
      rows = rows.filter((r) => devs.some((d) => (r.classificacao || '').toLowerCase().includes(d)));
    }

    // category -> compara com "categoria"
    if (filters.category && filters.category.length > 0) {
      const cats = filters.category.map((s) => s.toLowerCase());
      rows = rows.filter((r) => cats.some((c) => (r.categoria || '').toLowerCase().includes(c)));
    }

    // objective -> mapeia para trechos da "fase"
    if (filters.objective && filters.objective.length > 0) {
      const map: Record<string, string> = {
        scope: 'Escopo',
        research: 'Pesquisa',
        prototype: 'Protótipo',
        validation: 'Validação',
        feasibility: 'Viabilidade',
        implementation: 'Implementação',
      };
      const needles = filters.objective.map((k) => map[k] || '').filter(Boolean);
      rows = rows.filter((r) =>
        needles.some((n) => (r.fase || '').toLowerCase().includes(n.toLowerCase()))
      );
    }

    // projectType não existe nos dados retornados; ignorado

    return rows;
  }, [tasks, filters]);

  return (
    <Layout title={t('dashboard')}>
      {/* Seleção de planilha */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Selecione a planilha:</label>
        <select
          className="w-full p-2 border border-gray-300 rounded-md"
          value={selectedSpreadsheetId}
          onChange={(e) => setSelectedSpreadsheetId(e.target.value)}
        >
          <option value="">-- Escolha uma planilha --</option>
          {importedSpreadsheets.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Filtros */}
      <FilterPanel onFilterChange={setFilters} />

      {/* Tabela com tarefas */}
      {selectedSpreadsheetId ? (
        <ScheduleTable
          tasks={filteredTasks}
          loading={loadingTasks}
          error={tasksError}
          onRefresh={() => fetchSpreadsheetTasks(selectedSpreadsheetId)}
        />
      ) : (
        <div className="text-center text-gray-500 mt-10">Selecione uma planilha para visualizar os dados.</div>
      )}
    </Layout>
  );
};

export default Dashboard;