import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react';
// Removidos 'useSpreadsheet', 'useLocale', 'useNotifications' e 'importExcelFile' que não são mais necessários aqui.

interface SpreadsheetImporterProps {
  onImportComplete?: () => void;
}

const SpreadsheetImporter: React.FC<SpreadsheetImporterProps> = ({ onImportComplete }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFileImport = async (file: File) => {
    if (!file) return;

    setIsImporting(true);
    setImportStatus('idle');
    setImportMessage('Enviando arquivo...');

    const formData = new FormData();
    formData.append('arquivo', file);

    try {
      // Verificar se é um arquivo Excel
      if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
        throw new Error('Por favor, selecione um arquivo Excel (.xlsx, .xls) ou CSV (.csv)');
      }

      // Lógica de upload para o backend
      const response = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include' 
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.mensagem || 'Erro no servidor');
      }

      setImportStatus('success');
      setImportMessage(result.mensagem);
      
      if (onImportComplete) {
        onImportComplete();
      }

    } catch (error) {
      console.error('Erro ao importar planilha:', error);
      setImportStatus('error');
      setImportMessage(error instanceof Error ? error.message : 'Erro desconhecido ao importar arquivo');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileImport(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileImport(file);
    }
    // Reset input
    e.target.value = '';
  };

  const resetStatus = () => {
    setImportStatus('idle');
    setImportMessage('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-lg flex items-center text-gray-900 dark:text-white">
          <FileSpreadsheet className="text-primary mr-2" size={20} />
          Importar Planilha
        </h3>
        {importStatus !== 'idle' && (
           <button
             onClick={resetStatus}
             className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
           >
             <X size={16} />
           </button>
        )}
      </div>

      {/* Status Messages */}
      {importStatus === 'success' && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="text-green-600 mr-2" size={16} />
          <span className="text-green-800 text-sm">{importMessage}</span>
        </div>
      )}

      {importStatus === 'error' && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="text-red-600 mr-2" size={16} />
          <span className="text-red-800 text-sm">{importMessage}</span>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto text-gray-400 mb-4" size={48} />
        
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-700">
            {isImporting ? 'Processando...' : 'Arraste e solte sua planilha aqui'}
          </p>
          <p className="text-sm text-gray-500">
            ou clique para selecionar um arquivo Excel (.xlsx, .xls) ou CSV (.csv)
          </p>
          
          {!isImporting && (
            <label className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 cursor-pointer transition-colors">
              <FileSpreadsheet className="mr-2" size={16} />
              Selecionar Arquivo
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileInput}
                className="hidden"
                disabled={isImporting}
              />
            </label>
          )}
        </div>

        {isImporting && (
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Importando dados...</p>
          </div>
        )}
      </div>
      
      {/* A seção de formato esperado foi mantida, pois ainda é útil para o usuário */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
         <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Formato Esperado:</h4>
         <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• <strong>Número:</strong> Identificador sequencial</li>
          <li>• <strong>Classificação:</strong> Tipo de classificação (ex: Embalagem Primária)</li>
          <li>• <strong>Categoria:</strong> Categoria específica (ex: Blisters)</li>
          <li>• <strong>Fase:</strong> Fase do projeto (ex: 1. Escopo & Briefing)</li>
          <li>• <strong>Condição:</strong> Condição ou prioridade (A, B, C, Sempre)</li>
          <li>• <strong>Nome:</strong> Nome da tarefa ou atividade</li>
          <li>• <strong>Duração:</strong> Tempo estimado (ex: 5 dias)</li>
          <li>• <strong>Como Fazer:</strong> Descrição do procedimento</li>
          <li>• <strong>Documento Referência:</strong> Referência do documento</li>
          <li>• <strong>% Concluída:</strong> Percentual de conclusão (0-100)</li>
        </ul>
      </div>
    </div>
  );
};

export default SpreadsheetImporter;