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

  const didFetchRef = useRef(false);

  useEffect(() => {
    const fetchFromBackend = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/arquivos_usuario', {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) return;
        const result = await response.json();

        // Evita duplicar planilhas já existentes no contexto
        const existingIds = new Set(importedSpreadsheets.map((s) => s.id));

        (result.arquivos || []).forEach((file: any) => {
          if (existingIds.has(file.id)) return; // já existe, não adiciona
          addSpreadsheet({
            id: file.id,
            name: file.name,
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

    if (didFetchRef.current) return;
    didFetchRef.current = true;
    fetchFromBackend();
  }, [addSpreadsheet, importedSpreadsheets]);

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
          classificacao: String(row?.classe ?? row?.classification ?? ''),
          categoria: String(row?.category ?? row?.categoria ?? ''),
          fase: String(row?.phase ?? row?.fase ?? ''),
          condicao: String(row?.condicao ?? row?.condition ?? row?.status ?? ''),
          nome: String(row?.name ?? row?.nome ?? ''),
          duracao: String(row?.duration ?? row?.duracao ?? ''),
          percentualConcluido: Math.min(100, Math.max(0, pct)),
          startDate: row?.start_date ?? null,
          endDate: row?.end_date ?? null,
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

  // Handlers para iniciar/desfazer início de tarefa
  const handleTaskStart = async (id: string) => {
    if (!selectedSpreadsheetId) return;
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/arquivo/${selectedSpreadsheetId}/start/${encodeURIComponent(id)}`,
        { method: 'POST', credentials: 'include' }
      );
      if (!res.ok) throw new Error('Falha ao iniciar tarefa');
      // Atualiza localmente (usa horário local apenas para refletir)
      const nowIso = new Date().toISOString();
      setTasks(prev => prev.map(t => (t.id === id ? { ...t, startDate: nowIso } : t)));
    } catch (e) {
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
      setTasks(prev => prev.map(t => (t.id === id ? { ...t, startDate: null } : t)));
    } catch (e) {
      alert('Não foi possível desfazer o início da tarefa.');
    }
  };

  // Handlers adaptados da versão antiga
  const handleTaskUpdate = async (updated: Task) => {
    try {
      // Mapeia para os campos do backend
      const payload = {
        // Se o usuário mudou "Número", enviamos o novo valor em 'num'
        num: Number(updated.numero),
        classe: updated.classificacao,
        category: updated.categoria,
        phase: updated.fase,
        status: updated.condicao, // coluna 'status' no backend carrega a "Condição"
        name: updated.nome,
        duration: updated.duracao,
        // Backend armazena 0–1; UI usa 0–100
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

      // Se o número foi alterado, o "id" da linha muda para o novo número
      const newId = String(payload.num);
      const saved: Task = { ...updated, id: newId };
      setTasks(prev => prev.map(t => (t.id === updated.id ? saved : t)));
    } catch (e) {
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
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );
      if (!res.ok) throw new Error('Falha ao excluir a tarefa.');
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      alert('Não foi possível excluir a tarefa no servidor.');
    }
  };

  const handleTaskAdd = () => {
    const newId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`;
    setTasks(prev => [
      ...prev,
      {
        id: newId,
        numero: String(prev.length + 1),
        classificacao: '',
        categoria: '',
        fase: '',
        condicao: '',
        nome: 'Nova Tarefa',
        duracao: '',
        percentualConcluido: 0,
      },
    ]);
  };

  const filteredTasks = useMemo(() => {
    let rows = tasks;

    if (filters.developmentType && filters.developmentType.length > 0) {
      const devs = filters.developmentType.map((s) => s.toLowerCase());
      rows = rows.filter((r) => devs.some((d) => (r.classificacao || '').toLowerCase().includes(d)));
    }

    if (filters.category && filters.category.length > 0) {
      const cats = filters.category.map((s) => s.toLowerCase());
      rows = rows.filter((r) => cats.some((c) => (r.categoria || '').toLowerCase().includes(c)));
    }

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

    if (filters.condicao && filters.condicao.length > 0) {
      const selected = (filters.condicao[0] || '').toString().trim().toLowerCase();
      rows = rows.filter((r) => {
        const c = (r.condicao || '').toString().trim().toLowerCase();
        return c === 'sempre' || c === selected;
      });
    }

    return rows;
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
              {s.name}
            </option>
          ))}
        </select>
        {importedSpreadsheets.length === 0 && (
          <p className="text-gray-500 text-sm mt-2">Nenhuma planilha importada.</p>
        )}
      </div>

      <FilterPanel onFilterChange={setFilters} />

      {selectedSpreadsheetId ? (
        <ScheduleTable
          tasks={filteredTasks}
          loading={loadingTasks}
          error={tasksError}
          onRefresh={() => fetchSpreadsheetTasks(selectedSpreadsheetId)}
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={handleTaskDelete}
          onTaskAdd={handleTaskAdd}
          onTaskStart={handleTaskStart}        // <- novo
          onTaskUnstart={handleTaskUnstart}    // <- novo
        />
      ) : (
        <div className="text-center text-gray-500 mt-10">
          Selecione uma planilha para visualizar os dados.
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;