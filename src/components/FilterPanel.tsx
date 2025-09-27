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

  // Agora representa a coluna "Classificação" da tabela
  const [classificacaoTypes, setClassificacaoTypes] = useState<FilterOption[]>([
    { id: 'Primária', label: 'Embalagem Primária', checked: false },
    { id: 'Secundária', label: 'Embalagem Secundária', checked: false },
  ]);

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
  const [status, setStatus] = useState('');       // Novo filtro de Status

  const toggleFilter = () => setIsOpen(!isOpen);

  const handleClassificacaoChange = (value: string) => {
    const updated = classificacaoTypes.map(c => ({ ...c, checked: c.id === value && value !== '' }));
    setClassificacaoTypes(updated);
    applyFilters(updated, categories, condicao, objective, status);
  };

  const handleCategoryChange = (value: string) => {
    const updated = categories.map(c => ({ ...c, checked: c.id === value && value !== '' }));
    setCategories(updated);
    applyFilters(classificacaoTypes, updated, condicao, objective, status);
  };

  const handleCondicaoChange = (value: string) => {
    setCondicao(value);
    applyFilters(classificacaoTypes, categories, value, objective, status);
  };

  const handleObjectiveChange = (value: string) => {
    setObjective(value);
    applyFilters(classificacaoTypes, categories, condicao, value, status);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    applyFilters(classificacaoTypes, categories, condicao, objective, value);
  };

  const applyFilters = (
    classificacoes: FilterOption[],
    cats: FilterOption[],
    cond: string,
    obj: string,
    statusVal: string
  ) => {
    const filters: Record<string, string[]> = {};

    // chave 'classificacao' para filtrar a coluna Classificação
    const cls = classificacoes.filter(c => c.checked).map(c => c.id);
    if (cls.length) filters.classificacao = cls;

    // chave 'category' permanece igual
    const cat = cats.filter(c => c.checked).map(c => c.id);
    if (cat.length) filters.category = cat;

    if (cond) filters.condicao = [cond];   // A/B/C
    if (obj) filters.objective = [obj];    // Fase
    if (statusVal) filters.status = [statusVal]; // Concluídas | Em andamento | Não iniciada | Atrasadas

    onFilterChange(filters);
  };

  const clearFilters = () => {
    setClassificacaoTypes(classificacaoTypes.map(t => ({ ...t, checked: false })));
    setCategories(categories.map(c => ({ ...c, checked: false })));
    setCondicao('');
    setObjective('');
    setStatus('');
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
            {/* Classificação (antes: Tipo de Desenvolvimento) */}
            <div>
              <h4 className="font-medium mb-2 text-gray-700">Classificação</h4>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={classificacaoTypes.find(t => t.checked)?.id || ''}
                onChange={e => handleClassificacaoChange(e.target.value)}
              >
                <option value="">Todas</option>
                {classificacaoTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Categoria */}
            <div>
              <h4 className="font-medium mb-2 text-gray-700">Categoria</h4>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={categories.find(c => c.checked)?.id || ''}
                onChange={e => handleCategoryChange(e.target.value)}
              >
                <option value="">Todas</option>
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

            {/* Fase */}
            <div>
              <h4 className="font-medium mb-2 text-gray-700">Fase</h4>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={objective}
                onChange={(e) => handleObjectiveChange(e.target.value)}
              >
                <option value="">Todas</option>
                <option value="scope">Escopo & Briefing</option>
                <option value="research">Pesquisa & Análise</option>
                <option value="prototype">Protótipo</option>
                <option value="validation">Validação de Conceito</option>
                <option value="feasibility">Viabilidade</option>
                <option value="implementation">Implementação</option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <h4 className="font-medium mb-2 text-gray-700">Status</h4>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
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