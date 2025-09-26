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
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onFilterChange }) => {
  const { t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [developmentTypes, setDevelopmentTypes] = useState<FilterOption[]>([
    { id: 'primary', label: 'Embalagem Primária', checked: false },
    { id: 'secondary', label: 'Embalagem Secundária', checked: false },
  ]);

  const [categories, setCategories] = useState<FilterOption[]>([
    { id: 'blisters', label: 'Blisters', checked: false },
    { id: 'bisnagas', label: 'Bisnagas', checked: false },
    { id: 'cartucho', label: 'Cartucho', checked: false },
    { id: 'frasco_plast', label: 'Frascos de Plástico', checked: false },
    { id: 'ampoules', label: 'Ampolas', checked: false },
    { id: 'monodoses', label: 'Monodoses', checked: false },
    { id: 'potes_para_po', label: 'Potes para Pó', checked: false },
    { id: 'frasco_vidro', label: 'Frascos de Vidro', checked: false },
    { id: 'sachets', label: 'Sachets', checked: false },
  ]);

  // Novo filtro: Condição (A/B/C)
  const [condicao, setCondicao] = useState('');
  const [objective, setObjective] = useState('');

  const toggleFilter = () => {
    setIsOpen(!isOpen);
  };

  const handleDevelopmentTypeChange = (id: string) => {
    const updatedTypes = developmentTypes.map(type =>
      type.id === id ? { ...type, checked: !type.checked } : type
    );
    setDevelopmentTypes(updatedTypes);
    applyFilters(updatedTypes, categories, condicao, objective);
  };

  const handleCategoryChange = (id: string) => {
    const updatedCategories = categories.map(category =>
      category.id === id ? { ...category, checked: !category.checked } : category
    );
    setCategories(updatedCategories);
    applyFilters(developmentTypes, updatedCategories, condicao, objective);
  };

  const handleCondicaoChange = (value: string) => {
    setCondicao(value);
    applyFilters(developmentTypes, categories, value, objective);
  };

  const handleObjectiveChange = (value: string) => {
    setObjective(value);
    applyFilters(developmentTypes, categories, condicao, value);
  };

  const applyFilters = (
    classTypes: FilterOption[],
    cats: FilterOption[],
    cond: string,
    obj: string
  ) => {
    const filters: Record<string, string[]> = {};

    filters.developmentType = classTypes.filter(t => t.checked).map(t => t.id);
    filters.category = cats.filter(c => c.checked).map(c => c.id);

    if (cond) filters.condicao = [cond]; // A/B/C
    if (obj) filters.objective = [obj];

    onFilterChange(filters);
  };

  const clearFilters = () => {
    setDevelopmentTypes(developmentTypes.map(t => ({ ...t, checked: false })));
    setCategories(categories.map(c => ({ ...c, checked: false })));
    setCondicao('');
    setObjective('');
    onFilterChange({});
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-6">
      <div
        className="p-4 flex justify-between items-center cursor-pointer border-b"
        onClick={toggleFilter}
      >
        <div className="flex items-center">
          <Filter size={18} className="text-primary mr-2" />
          <h3 className="font-medium">Filtros</h3>
        </div>
        <button className="text-gray-500" type="button">
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {isOpen && (
        <div className="p-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Development Type */}
            <div>
              <h4 className="font-medium mb-2 text-gray-700">Tipo de Desenvolvimento</h4>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={developmentTypes.find(t => t.checked)?.id || ''}
                onChange={e => {
                  const selectedId = e.target.value;
                  const updatedTypes = developmentTypes.map(type => ({
                    ...type,
                    checked: type.id === selectedId,
                  }));
                  setDevelopmentTypes(updatedTypes);
                  applyFilters(updatedTypes, categories, condicao, objective);
                }}
              >
                <option value="">Todos</option>
                {developmentTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <h4 className="font-medium mb-2 text-gray-700">Categoria</h4>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={categories.find(c => c.checked)?.id || ''}
                onChange={e => {
                  const selectedId = e.target.value;
                  const updatedCategories = categories.map(category => ({
                    ...category,
                    checked: category.id === selectedId,
                  }));
                  setCategories(updatedCategories);
                  applyFilters(developmentTypes, updatedCategories, condicao, objective);
                }}
              >
                <option value="">Todos</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Condição (A/B/C) */}
            <div>
              <h4 className="font-medium mb-2 text-gray-700">Condição</h4>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={condicao}
                onChange={(e) => handleCondicaoChange(e.target.value)}
              >
                <option value="">Todas</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Linhas com "Sempre" aparecem independentemente da seleção.
              </p>
            </div>

            {/* Fase (Objective) */}
            <div>
              <h4 className="font-medium mb-2 text-gray-700">Fase</h4>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={objective}
                onChange={(e) => handleObjectiveChange(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="scope">Escopo & Briefing</option>
                <option value="research">Pesquisa & Análise</option>
                <option value="prototype">Protótipo</option>
                <option value="validation">Validação de Conceito</option>
                <option value="feasibility">Viabilidade</option>
                <option value="implementation">Implementação</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center text-gray-600 hover:text-primary"
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