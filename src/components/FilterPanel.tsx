import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';
import { useLocale } from '../contexts/LocaleContext';

interface FilterOption {
  id: string;
  label: string;
  checked: boolean;
}

interface FilterPanelProps {
  onFilterChange: (filters: Record<string, string[]>) => void;
  classificacaoOptions?: string[];
  faseOptions?: string[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onFilterChange, classificacaoOptions, faseOptions }) => {
  const { t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  // Seleção direta de "Classificação"
  const [classificacaoSel, setClassificacaoSel] = useState<string>('');

  // Categorias de exemplo (mantidas)
  const [categories, setCategories] = useState<FilterOption[]>([
    { id: 'Blisters', label: 'Blisters', checked: false },
    { id: 'Bisnagas', label: 'Bisnagas', checked: false },
    { id: 'Cartucho', label: 'Cartucho', checked: false },
    { id: 'Frascos de Plástico', label: 'Frascos de Plástico', checked: false },
    { id: 'Ampolas', label: 'Ampolas', checked: false },
    { id: 'Monodoses', label: 'Monodoses', checked: false },
    { id: 'Potes para Pó', label: 'Potes para Pó', checked: false },
    { id: 'Frascos de Vidro', label: 'Frascos de Vidro', checked: false },
    { id: 'Sachets', label: 'Sachets', checked: false },
  ]);

  // Filtros adicionais
  const [condicao, setCondicao] = useState('');
  const [objective, setObjective] = useState(''); // Fase
  const [status, setStatus] = useState('');       // Status derivado

  const toggleFilter = () => setIsOpen(!isOpen);

  const handleClassificacaoChange = (value: string) => {
    setClassificacaoSel(value);
    applyFilters(value, categories, condicao, objective, status);
  };

  const handleCategoryChange = (value: string) => {
    const updated = categories.map((c) => ({ ...c, checked: c.id === value && value !== '' }));
    setCategories(updated);
    applyFilters(classificacaoSel, updated, condicao, objective, status);
  };

  const handleCondicaoChange = (value: string) => {
    setCondicao(value);
    applyFilters(classificacaoSel, categories, value, objective, status);
  };

  const handleObjectiveChange = (value: string) => {
    setObjective(value);
    applyFilters(classificacaoSel, categories, condicao, value, status);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    applyFilters(classificacaoSel, categories, condicao, objective, value);
  };

  const applyFilters = (
    classificacaoValue: string,
    cats: FilterOption[],
    cond: string,
    obj: string,
    statusVal: string
  ) => {
    const filters: Record<string, string[]> = {};

    if (classificacaoValue) filters.classificacao = [classificacaoValue];

    const cat = cats.filter((c) => c.checked).map((c) => c.id);
    if (cat.length) filters.category = cat;

    if (cond) filters.condicao = [cond];
    if (obj) filters.objective = [obj];
    if (statusVal) filters.status = [statusVal];

    onFilterChange(filters);
  };

  const clearFilters = () => {
    setClassificacaoSel('');
    setCategories(categories.map((c) => ({ ...c, checked: false })));
    setCondicao('');
    setObjective('');
    setStatus('');
    onFilterChange({});
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md mb-6">
      <div
        className="p-4 flex justify-between items-center cursor-pointer border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
        onClick={toggleFilter}
      >
        <div className="flex items-center">
          <Filter size={18} className="text-primary mr-2" />
          <h3 className="font-medium text-gray-800 dark:text-gray-200">{t('filters') || 'Filtros'}</h3>
        </div>
        <button className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100" type="button">
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {isOpen && (
        <div className="p-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Classificação */}
            <div>
              <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-200">Classificação</h4>
              <select
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                value={classificacaoSel}
                onChange={(e) => handleClassificacaoChange(e.target.value)}
              >
                <option value="">Todas</option>
                {(classificacaoOptions ?? []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Categoria */}
            <div>
              <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-200">Categoria</h4>
              <select
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                value={categories.find((c) => c.checked)?.id || ''}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="">Todas</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Condição (A/B/C) */}
            <div>
              <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-200">Condição</h4>
              <select
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                value={condicao}
                onChange={(e) => handleCondicaoChange(e.target.value)}
              >
                <option value="">Todas</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Linhas com "Sempre" aparecem independentemente da seleção.
              </p>
            </div>

            {/* Fase */}
            <div>
              <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-200">Fase</h4>
              <select
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                value={objective}
                onChange={(e) => handleObjectiveChange(e.target.value)}
              >
                <option value="">Todas</option>
                {(faseOptions ?? []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-200">Status</h4>
              <select
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Concluídas">Concluídas</option>
                <option value="Em andamento">Em andamento</option>
                <option value="Não iniciada">Não iniciada</option>
                <option value="Atrasadas">Atrasadas</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center text-gray-700 dark:text-gray-200 hover:text-primary"
            >
              <X size={16} className="mr-1" />
              <span className="text-sm">Limpar Filtros</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;