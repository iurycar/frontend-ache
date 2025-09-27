import React, { useEffect, useMemo, useRef, useState } from 'react';
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

  const didFetchFilesRef = useRef(false);

  useEffect(() => {
    const fetchFromBackend = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/arquivos_usuario', {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) return;
        const result = await response.json();

        const existingIds = new Set(importedSpreadsheets.map((s) => s.id));
        (result.arquivos || []).forEach((file: any) => {
          if (existingIds.has(file.id)) return;
          addSpreadsheet({
            id: file.id,
            name: file.name,
            project: file.project || t('imported_spreadsheets'),
            type: 'outros',
            data: [],
            importedAt: new Date(file.importedAt || Date.now()),
            totalRows: 0,
            completedRows: 0,
          });
        });
      } catch {
        // silencioso
      }
    };

    if (didFetchFilesRef.current) return;
    didFetchFilesRef.current = true;
    fetchFromBackend();
  }, [addSpreadsheet, importedSpreadsheets, t]);

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
        if (typeof pctRaw === 'number') {
          pct = pctRaw > 1 ? Math.round(pctRaw) : Math.round(pctRaw * 100);
        } else {
          const n = parseFloat(pctRaw);
          if (!isNaN(n)) pct = n > 1 ? Math.round(n) : Math.round(n * 100);
        }
        return {
          id: String(row?.num ?? idx),
          numero: String(row?.num ?? ''),
          classificacao: String(row?.classe ?? row?.classification ?? ''),
          categoria: String(row?.category ?? row?.categoria ?? ''),
          fase: String(row?.phase ?? row?.fase ?? ''),
          condicao: String(row?.condicao ?? row?.condition ?? row?.status ?? ''),
          nome: String(row?.name ?? row?.nome ?? ''),
          duracao: String(row?.duration ?? row?.duracao ?? ''),
          percentualConcluido: Math.min(100, Math.max(0, pct)),
          startDate: row?.start_date ?? null,
          endDate: row?.end_date ?? null,
          atraso: Number(row?.atraso ?? 0),
        };
      });
      setTasks(mapped);
    } catch {
      setTasksError('Erro ao carregar dados da planilha.');
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchSpreadsheetTasks(selectedSpreadsheetId);
  }, [selectedSpreadsheetId]);

  const handleTaskStart = async (id: string) => {
    if (!selectedSpreadsheetId) return;
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/arquivo/${selectedSpreadsheetId}/start/${encodeURIComponent(id)}`,
        { method: 'POST', credentials: 'include' }
      );
      if (!res.ok) throw new Error('Falha ao iniciar tarefa');
      await fetchSpreadsheetTasks(selectedSpreadsheetId);
    } catch {
      alert('Não foi possível iniciar a tarefa.');
    }
  };

  const handleTaskUnstart = async (id: string) => {
    if (!selectedSpreadsheetId) return;
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/arquivo/${selectedSpreadsheetId}/start/${encodeURIComponent(id)}`,
        { method: 'DELETE', credentials: 'include' }
      );
      if (!res.ok) throw new Error('Falha ao desfazer início');
      await fetchSpreadsheetTasks(selectedSpreadsheetId);
    } catch {
      alert('Não foi possível desfazer o início da tarefa.');
    }
  };

  const handleTaskUpdate = async (updated: Task) => {
    try {
      const payload = {
        num: Number(updated.numero),
        classe: updated.classificacao,
        category: updated.categoria,
        phase: updated.fase,
        status: updated.condicao,
        name: updated.nome,
        duration: updated.duracao,
        conclusion: Number.isFinite(updated.percentualConcluido)
          ? Number(updated.percentualConcluido) / 100
          : 0,
      };

      const res = await fetch(
        `http://127.0.0.1:5000/arquivo/${selectedSpreadsheetId}/linha/${encodeURIComponent(updated.id)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error('Falha ao salvar tarefa');
      await fetchSpreadsheetTasks(selectedSpreadsheetId);
    } catch {
      alert('Não foi possível salvar a tarefa no servidor.');
    }
  };

  const handleTaskDelete = async (id: string) => {
    if (!selectedSpreadsheetId) {
      alert('Selecione uma planilha antes de excluir.');
      return;
    }
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/arquivo/${selectedSpreadsheetId}/linha/${encodeURIComponent(id)}`,
        { method: 'DELETE', credentials: 'include' }
      );
      if (!res.ok) throw new Error('Falha ao excluir a tarefa.');
      await fetchSpreadsheetTasks(selectedSpreadsheetId);
    } catch {
      alert('Não foi possível excluir a tarefa no servidor.');
    }
  };

  const handleTaskAdd = () => {
    const newId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`;
    setTasks((prev) => [
      ...prev,
      {
        id: newId,
        numero: String(prev.length + 1),
        classificacao: '',
        categoria: '',
        fase: '',
        condicao: '',
        nome: t('new_task'),
        duracao: '',
        percentualConcluido: 0,
      } as unknown as Task,
    ]);
  };

  const classificacaoOptions = useMemo(
    () => Array.from(new Set((tasks || []).map((t) => (t.classificacao || '').trim()).filter(Boolean))).sort(),
    [tasks]
  );
  const faseOptions = useMemo(
    () => Array.from(new Set((tasks || []).map((t) => (t.fase || '').trim()).filter(Boolean))).sort(),
    [tasks]
  );

  const filteredTasks = useMemo(() => {
    const f = filters || {};
    const condSel = (f.condicao && f.condicao[0]) || '';
    const statusSel = (f.status && f.status[0]) || '';

    const isSempre = (cond: string) => (cond || '').toLowerCase() === 'sempre';
    const isOverdue = (t: Task): boolean => Number((t as any).atraso || 0) > 0;

    const statusLabel = (t: Task): 'Concluídas' | 'Em andamento' | 'Não iniciada' | 'Atrasadas' => {
      if ((t as any).percentualConcluido === 100) return 'Concluídas';
      if (isOverdue(t)) return 'Atrasadas';
      if ((t as any).percentualConcluido === 0) return 'Não iniciada';
      return 'Em andamento';
    };

    return (tasks || []).filter((t) => {
      if (f.classificacao?.length && !f.classificacao.includes((t as any).classificacao)) return false;
      if (f.category?.length && !f.category.includes((t as any).categoria)) return false;
      if (condSel && !isSempre((t as any).condicao) && (t as any).condicao !== condSel) return false;
      if (f.objective?.length && !f.objective.includes((t as any).fase)) return false;
      if (statusSel && statusLabel(t) !== statusSel) return false;
      return true;
    });
  }, [tasks, filters]);

  return (
    <Layout title={t('dashboard')}>
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
              {s.project} | {s.name}
            </option>
          ))}
        </select>
        {importedSpreadsheets.length === 0 && (
          <p className="text-gray-500 text-sm mt-2">{t('no_spreadsheets') || 'Nenhuma planilha importada.'}</p>
        )}
      </div>

      <FilterPanel
        onFilterChange={setFilters}
        classificacaoOptions={classificacaoOptions}
        faseOptions={faseOptions}
      />

      {selectedSpreadsheetId ? (
        <ScheduleTable
          tasks={filteredTasks}
          loading={loadingTasks}
          error={tasksError}
          onRefresh={() => fetchSpreadsheetTasks(selectedSpreadsheetId)}
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={handleTaskDelete}
          onTaskAdd={handleTaskAdd}
          onTaskStart={handleTaskStart}
          onTaskUnstart={handleTaskUnstart}
        />
      ) : (
        <div className="text-center text-gray-500 mt-10">
          {t('select_spreadsheet_to_view') || 'Selecione uma planilha para visualizar os dados.'}
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;