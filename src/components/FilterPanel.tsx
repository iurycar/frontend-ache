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
    { id: 'tertiary', label: 'Embalagem Terciária', checked: false },
    { id: 'accessories', label: 'Acessórios', checked: false },
    { id: 'labels', label: 'Rótulos', checked: false },
    { id: 'leaflets', label: 'Bulas', checked: false },
  ]);

  const [categories, setCategories] = useState<FilterOption[]>([
    { id: 'clamps', label: 'BRAÇADEIRAS', checked: false },
    { id: 'adapters', label: 'ADAPTADORES', checked: false },
    { id: 'aluminum', label: 'ALUMÍNIO', checked: false },
    { id: 'ampoules', label: 'AMPOLAS', checked: false },
    { id: 'pouches', label: 'BOLSAS', checked: false },
    { id: 'vials', label: 'FRASCOS', checked: false },
    { id: 'syringes', label: 'SERINGAS', checked: false },
  ]);

  const [projectType, setProjectType] = useState('');
  const [objective, setObjective] = useState('');

  const toggleFilter = () => {
    setIsOpen(!isOpen);
  };

  const handleDevelopmentTypeChange = (id: string) => {
    const updatedTypes = developmentTypes.map(type => 
      type.id === id ? { ...type, checked: !type.checked } : type
    );
    setDevelopmentTypes(updatedTypes);
    applyFilters(updatedTypes, categories, projectType, objective);
  };

  const handleCategoryChange = (id: string) => {
    const updatedCategories = categories.map(category => 
      category.id === id ? { ...category, checked: !category.checked } : category
    );
    setCategories(updatedCategories);
    applyFilters(developmentTypes, updatedCategories, projectType, objective);
  };

  const handleProjectTypeChange = (value: string) => {
    setProjectType(value);
    applyFilters(developmentTypes, categories, value, objective);
  };

  const handleObjectiveChange = (value: string) => {
    setObjective(value);
    applyFilters(developmentTypes, categories, projectType, value);
  };

  const applyFilters = (
    devTypes: FilterOption[],
    cats: FilterOption[],
    projType: string,
    obj: string
  ) => {
    const filters: Record<string, string[]> = {};
    
    filters.developmentType = devTypes.filter(t => t.checked).map(t => t.id);
    filters.category = cats.filter(c => c.checked).map(c => c.id);
    
    if (projType) filters.projectType = [projType];
    if (obj) filters.objective = [obj];
    
    onFilterChange(filters);
  };

  const clearFilters = () => {
    setDevelopmentTypes(developmentTypes.map(t => ({ ...t, checked: false })));
    setCategories(categories.map(c => ({ ...c, checked: false })));
    setProjectType('');
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
        <button className="text-gray-500">
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
                  applyFilters(updatedTypes, categories, projectType, objective);
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
                  applyFilters(developmentTypes, updatedCategories, projectType, objective);
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
            {/* Project Type */}
            <div>
              <h4 className="font-medium mb-2 text-gray-700">Tipo de Projeto</h4>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={projectType}
                onChange={(e) => handleProjectTypeChange(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="new">Nova Embalagem</option>
                <option value="improvement">Melhoria</option>
                <option value="redesign">Redesenho</option>
              </select>
            </div>

            {/* Objective */}
            <div>
              <h4 className="font-medium mb-2 text-gray-700">Objetivo</h4>
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