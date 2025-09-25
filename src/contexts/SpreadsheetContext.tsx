import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Interface base para dados de planilha
interface SpreadsheetRow {
  id: string;
  numero: number;
  classificacao: string;
  categoria: string;
  fase: string;
  condicao: string;
  nome: string;
  duracao: string;
  comoFazer: string;
  documentoReferencia: string;
  percentualConcluida: number;
  status: string; // Novo campo para status processado
  timestamp: Date;
}

// Interface para planilhas importadas
interface ImportedSpreadsheet {
  id: string;
  name: string;
  type: 'embalagem_primaria' | 'outros';
  data: SpreadsheetRow[];
  importedAt: Date;
  totalRows: number;
  completedRows: number;
}

interface SpreadsheetContextType {
  importedSpreadsheets: ImportedSpreadsheet[];
  addSpreadsheet: (spreadsheet: ImportedSpreadsheet) => void;
  updateSpreadsheet: (id: string, updates: Partial<ImportedSpreadsheet>) => void;
  deleteSpreadsheet: (id: string) => void;
  getSpreadsheetById: (id: string) => ImportedSpreadsheet | undefined;
  getTotalProgress: () => { total: number; completed: number; percentage: number };
  clearAllSpreadsheets: () => void;
  exportSpreadsheetData: (id: string) => void;
  processSpreadsheetData: (data: any[]) => SpreadsheetRow[];
  getStatusFromPercentage: (percentage: number) => string;
}

const SpreadsheetContext = createContext<SpreadsheetContextType | undefined>(undefined);

interface SpreadsheetProviderProps {
  children: ReactNode;
}

export const SpreadsheetProvider: React.FC<SpreadsheetProviderProps> = ({ children }) => {
  const [importedSpreadsheets, setImportedSpreadsheets] = useState<ImportedSpreadsheet[]>([]);

  // Carregar dados salvos do localStorage na inicialização
  useEffect(() => {
    const savedData = localStorage.getItem('importedSpreadsheets');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Converter strings de data de volta para objetos Date
        const spreadsheetsWithDates = parsed.map((spreadsheet: any) => ({
          ...spreadsheet,
          importedAt: new Date(spreadsheet.importedAt),
          data: spreadsheet.data.map((row: any) => ({
            ...row,
            timestamp: new Date(row.timestamp)
          }))
        }));
        setImportedSpreadsheets(spreadsheetsWithDates);
      } catch (error) {
        console.error('Erro ao carregar dados das planilhas:', error);
        localStorage.removeItem('importedSpreadsheets');
      }
    }
  }, []);

  // Salvar dados no localStorage sempre que houver mudanças
  useEffect(() => {
    localStorage.setItem('importedSpreadsheets', JSON.stringify(importedSpreadsheets));
  }, [importedSpreadsheets]);

  const addSpreadsheet = (spreadsheet: ImportedSpreadsheet) => {
    setImportedSpreadsheets(prev => [spreadsheet, ...prev]);
  };

  const updateSpreadsheet = (id: string, updates: Partial<ImportedSpreadsheet>) => {
    setImportedSpreadsheets(prev => 
      prev.map(spreadsheet => 
        spreadsheet.id === id 
          ? { ...spreadsheet, ...updates }
          : spreadsheet
      )
    );
  };

  const deleteSpreadsheet = (id: string) => {
    setImportedSpreadsheets(prev => prev.filter(spreadsheet => spreadsheet.id !== id));
  };

  const getSpreadsheetById = (id: string) => {
    return importedSpreadsheets.find(spreadsheet => spreadsheet.id === id);
  };

  const getTotalProgress = () => {
    const total = importedSpreadsheets.reduce((sum, spreadsheet) => sum + spreadsheet.totalRows, 0);
    const completed = importedSpreadsheets.reduce((sum, spreadsheet) => sum + spreadsheet.completedRows, 0);
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, percentage };
  };

  const clearAllSpreadsheets = () => {
    setImportedSpreadsheets([]);
    localStorage.removeItem('importedSpreadsheets');
  };

  const getStatusFromPercentage = (percentage: number): string => {
    if (percentage === 100) return 'Concluído';
    if (percentage === 0) return 'Não Iniciado';
    return 'Em Andamento';
  };

  const processSpreadsheetData = (data: any[]): SpreadsheetRow[] => {
    return data.map((row, index) => {
      const percentual = typeof row['% Concluído'] === 'string' 
        ? parseInt(row['% Concluído'].replace('%', '')) 
        : row['% Concluído'] || 0;
      
      return {
        id: `${Date.now()}_${index}`,
        numero: row['Número'] || index + 1,
        classificacao: row['Classificação'] || '',
        categoria: row['Categoria'] || '',
        fase: row['Fase'] || '',
        condicao: row['Condição'] || '',
        nome: row['Nome'] || '',
        duracao: row['Duração'] || '',
        comoFazer: row['Como Fazer'] || '',
        documentoReferencia: row['Documento Referência'] || '',
        percentualConcluida: percentual,
        status: getStatusFromPercentage(percentual),
        timestamp: new Date()
      };
    });
  };

  const exportSpreadsheetData = (id: string) => {
    const spreadsheet = getSpreadsheetById(id);
    if (!spreadsheet) return;

    // Criar dados para exportação
    const exportData = spreadsheet.data.map(row => ({
      'Número': row.numero,
      'Classificação': row.classificacao,
      'Categoria': row.categoria,
      'Fase': row.fase,
      'Condição': row.condicao,
      'Nome': row.nome,
      'Duração': row.duracao,
      'Como Fazer': row.comoFazer,
      'Documento Referência': row.documentoReferencia,
      '% Concluída': `${row.percentualConcluida}%`,
      'Status': row.status
    }));

    // Criar e baixar arquivo CSV
    const headers = Object.keys(exportData[0]);
    let csvContent = headers.join(',') + '\n';
    
    exportData.forEach(row => {
      const values = headers.map(header => `"${row[header as keyof typeof row]}"`);
      csvContent += values.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${spreadsheet.name}_export.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <SpreadsheetContext.Provider
      value={{
        importedSpreadsheets,
        addSpreadsheet,
        updateSpreadsheet,
        deleteSpreadsheet,
        getSpreadsheetById,
        getTotalProgress,
        clearAllSpreadsheets,
        exportSpreadsheetData,
        processSpreadsheetData,
        getStatusFromPercentage
      }}
    >
      {children}
    </SpreadsheetContext.Provider>
  );
};

export const useSpreadsheet = (): SpreadsheetContextType => {
  const context = useContext(SpreadsheetContext);
  if (context === undefined) {
    throw new Error('useSpreadsheet deve ser usado dentro de um SpreadsheetProvider');
  }
  return context;
};
