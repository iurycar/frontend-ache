import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Trash2, 
  Eye, 
  Calendar
} from 'lucide-react';
import SpreadsheetDetailView from './SpreadsheetDetailView';

// Interface para os arquivos que vêm do backend (ajustado para importedAt)
interface UploadedFile {
  id: string;
  name: string;
  importedAt: string;
}

interface SpreadsheetViewerProps {
  onSpreadsheetSelect?: (spreadsheetId: string) => void;
  selectedSpreadsheetId?: string;
  onBackToList?: () => void;
  reloadTrigger?: number;
}

const SpreadsheetViewer: React.FC<SpreadsheetViewerProps> = ({ 
  onSpreadsheetSelect, 
  selectedSpreadsheetId, 
  onBackToList,
  reloadTrigger,
}) => {
  const [importedFiles, setImportedFiles] = useState<UploadedFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileToDelete, setFileToDelete] = useState<UploadedFile | null>(null);

  const fetchImportedFiles = async () => {
    try {
      const response = await fetch('/api/arquivos_usuario', {
        method: 'GET',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Falha ao buscar arquivos');
      }
      const result = await response.json();
      // Mapeamento ajustado para corresponder ao backend (name, importedAt)
      const mappedFiles = result.arquivos.map((file: any) => ({
        id: file.id,
        name: file.name,
        importedAt: file.importedAt 
      }));
      setImportedFiles(mappedFiles);
    } catch (error) {
      console.error('Erro ao buscar arquivos importados:', error);
      setImportedFiles([]);
    }
  };

  useEffect(() => {
    fetchImportedFiles();
  }, [reloadTrigger]);

  const filteredFiles = useMemo(() => {
    return importedFiles.filter(file =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [importedFiles, searchTerm]);

  const handleDownload = (fileId: string) => {
    window.location.href = `/api/download/${fileId}`;
  };

  const handleDeleteClick = (file: UploadedFile) => {
    setFileToDelete(file);
  };
  
  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    try {
      const response = await fetch(`/api/delete/${fileToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        setImportedFiles(prevFiles => prevFiles.filter(f => f.id !== fileToDelete.id));
        console.log(`Arquivo ${fileToDelete.name} excluído com sucesso`);
      } else {
        const errorData = await response.text();
        console.error("Falha ao excluir o arquivo:", response.status, errorData);
      }
    } catch (error) {
      console.error('Erro ao excluir o arquivo:', error);
    } finally {
      setFileToDelete(null);
    }
  };
  
  const handleCancelDelete = () => {
      setFileToDelete(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Data inválida';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  if (selectedSpreadsheetId) {
    return (
      <SpreadsheetDetailView
        spreadsheetId={selectedSpreadsheetId}
        onBack={onBackToList || (() => {})}
      />
    );
  }

  if (importedFiles.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <FileSpreadsheet className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Nenhuma planilha importada</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Importe sua primeira planilha para começar a visualizar os dados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
           <div className="flex items-center">
             <FileSpreadsheet className="text-blue-600 mr-3" size={24} />
             <div>
               <p className="text-sm text-gray-600 dark:text-gray-400">Total de Arquivos</p>
               <p className="text-2xl font-bold text-gray-900 dark:text-white">{importedFiles.length}</p>
             </div>
           </div>
         </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
         <div className="flex-1">
           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buscar</label>
           <input
             type="text"
             placeholder="Buscar por nome do arquivo..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
           />
         </div>
       </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
         <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
           <h3 className="text-lg font-medium text-gray-900 dark:text-white">Arquivos Importados</h3>
         </div>
         <div className="divide-y divide-gray-200 dark:divide-gray-700">
           {filteredFiles.map((file) => (
             <div key={file.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <FileSpreadsheet className="text-primary" size={32} />
                  </div>
                  <div className="flex-1 min-w-0">
                     <h4 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                       {file.name}
                     </h4>
                     <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                       <span className="flex items-center">
                         <Calendar className="mr-1" size={14} />
                         {formatDate(file.importedAt)}
                       </span>
                     </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                   <button
                     onClick={() => onSpreadsheetSelect && onSpreadsheetSelect(file.id)}
                     className="p-2 text-gray-400 hover:text-primary dark:text-gray-500 dark:hover:text-primary transition-colors"
                     title="Visualizar dados"
                   >
                     <Eye size={18} />
                   </button>
                   <button
                     onClick={() => handleDownload(file.id)}
                     className="p-2 text-gray-400 hover:text-green-600 dark:text-gray-500 dark:hover:text-green-600 transition-colors"
                     title="Exportar arquivo original"
                   >
                     <Download size={18} />
                   </button>
                   <button
                     onClick={() => handleDeleteClick(file)}
                     className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-600 transition-colors"
                     title="Excluir arquivo"
                   >
                     <Trash2 size={18} />
                   </button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {fileToDelete && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
           <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-80">
             <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confirmar Exclusão</h5>
             <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">
               Tem certeza de que deseja excluir o arquivo <span className="font-bold">"{fileToDelete.name}"</span>? Esta ação não pode ser desfeita.
             </p>
             <div className="flex justify-end space-x-3">
               <button
                 onClick={handleCancelDelete}
                 className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
               >
                 Cancelar
               </button>
               <button
                 onClick={handleConfirmDelete}
                 className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors"
               >
                 Confirmar
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

export default SpreadsheetViewer;