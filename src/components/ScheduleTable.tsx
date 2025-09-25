import React from 'react';

export interface Task {
  id: string;
  numero: string;
  classificacao: string;
  categoria: string;
  fase: string;
  condicao: string;
  nome: string;
  duracao: string;
  percentualConcluido: number; // 0-100
}

interface ScheduleTableProps {
  tasks: Task[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ tasks, loading, error, onRefresh }) => {
  if (loading) {
    return <div className="text-center text-gray-500 mt-10">Carregando tarefas...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-600 mt-10">
        {error}
        {onRefresh && (
          <div>
            <button className="ml-2 text-primary underline" onClick={onRefresh}>Tentar novamente</button>
          </div>
        )}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return <div className="text-center text-gray-500 mt-10">Nenhuma tarefa encontrada.</div>;
  }

  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-200 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">Número</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">Classificação</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">Categoria</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">Fase</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">Condição</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">Nome</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">Duração</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">% Concluído</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {tasks.map((t) => (
            <tr key={t.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{t.numero}</td>
              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{t.classificacao}</td>
              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{t.categoria}</td>
              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{t.fase}</td>
              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{t.condicao}</td>
              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{t.nome}</td>
              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{t.duracao}</td>
              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{`${t.percentualConcluido}%`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleTable;