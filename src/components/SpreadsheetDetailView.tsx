import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface SpreadsheetDetailViewProps {
  spreadsheetId: string;
  onBack: () => void;
}

type BackendRow = Record<string, unknown>;

const columns: { key: keyof BackendRow; label: string }[] = [
  { key: 'num', label: 'Número' },
  { key: 'classe', label: 'Classificação' },
  { key: 'category', label: 'Categoria' },
  { key: 'phase', label: 'Fase' },
  { key: 'status', label: 'Condição' },
  { key: 'name', label: 'Nome' },
  { key: 'duration', label: 'Duração' },
  { key: 'text', label: 'Como fazer' },
  { key: 'reference', label: 'Doc. Referência' },
  { key: 'conclusion', label: '% Conclusão' },
  { key: 'start_date', label: 'Iniciado em' },
  { key: 'end_date', label: 'Finalizado em' },
  { key: 'responsible', label: 'Responsável' },
];

const formatDate = (value?: unknown) => {
  if (!value) return '';
  const d = new Date(String(value));
  if (isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
};

const formatCell = (key: string, value: unknown) => {
  if (value === null || value === undefined) return '';
  switch (key) {
    case 'start_date':
    case 'end_date':
      return formatDate(value);
    case 'conclusion': {
      if (typeof value === 'number') return `${(value * 100).toFixed(0)}%`; // Multiplica por 100
      const parsed = parseFloat(String(value).replace(',', '.'));
      return isNaN(parsed) ? String(value) : `${(parsed * 100).toFixed(0)}%`; // Multiplica por 100
    }
    default:
      return String(value);
  }
};

const SpreadsheetDetailView: React.FC<SpreadsheetDetailViewProps> = ({ 
  spreadsheetId, 
  onBack 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BackendRow[]>([]);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:5000/arquivo/${spreadsheetId}/dados`, {
          method: 'GET',
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Falha ao buscar dados da planilha');
        }
        
        const result = await response.json();
        setData((result.dados as BackendRow[]) || []);
        setFileName(result.nome || 'Planilha');
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setError('Erro ao carregar dados da planilha');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [spreadsheetId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Carregando planilha...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">{error}</h3>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-primary transition-colors rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{fileName}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {data.length} registros
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Dados da Planilha
          </h3>
        </div>
        <div className="overflow-x-auto">
          {data.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {columns.map(col => (
                    <th
                      key={String(col.key)}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {data.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    {columns.map(col => (
                      <td
                        key={String(col.key)}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
                      >
                        {formatCell(String(col.key), row[col.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Nenhum dado encontrado na planilha
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpreadsheetDetailView;