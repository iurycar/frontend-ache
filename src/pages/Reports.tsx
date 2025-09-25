import React, { useState } from 'react';
import Layout from '../components/Layout';
import { FileText, Download, Calendar, TrendingUp, BarChart3, PieChart } from 'lucide-react';
// Removido useSpreadsheet e useAuth se não forem mais usados para os gráficos
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface ReportData {
  id: string;
  name: string;
  type: 'task' | 'project' | 'team' | 'custom';
  createdAt: Date;
  status: 'completed' | 'in_progress' | 'scheduled';
  size: string;
}

const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [reports, setReports] = useState<ReportData[]>([
    {
      id: '1',
      name: 'Relatório de Tarefas - Junho 2024',
      type: 'task',
      createdAt: new Date(2024, 5, 15),
      status: 'completed',
      size: '2.3 MB'
    },
    {
      id: '2',
      name: 'Análise de Projetos - Q2 2024',
      type: 'project',
      createdAt: new Date(2024, 5, 10),
      status: 'completed',
      size: '1.8 MB'
    },
    {
      id: '3',
      name: 'Performance da Equipe - Maio 2024',
      type: 'team',
      createdAt: new Date(2024, 4, 30),
      status: 'completed',
      size: '950 KB'
    }
  ]);
  
  // Toda a lógica de estado e funções para upload, download e delete foi removida.

  const getStatusColor = (status: ReportData['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: ReportData['status']) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'in_progress': return 'Em Progresso';
      case 'scheduled': return 'Agendado';
      default: return status;
    }
  };

  const getTypeIcon = (type: ReportData['type']) => {
    switch (type) {
      case 'task': return <BarChart3 size={16} />;
      case 'project': return <TrendingUp size={16} />;
      case 'team': return <PieChart size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const taskStatusData = {
    labels: ['Concluídas', 'Em Andamento', 'Atrasadas', 'Não Iniciadas'],
    datasets: [
      {
        data: [45, 23, 8, 12],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#6B7280'],
        borderWidth: 0,
      },
    ],
  };

  const monthlyProgressData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Tarefas Concluídas',
        data: [12, 19, 15, 25, 22, 30],
        backgroundColor: '#D92567',
        borderColor: '#D92567',
        borderWidth: 1,
      },
      {
        label: 'Projetos Finalizados',
        data: [8, 11, 9, 15, 14, 18],
        backgroundColor: '#F2357B',
        borderColor: '#F2357B',
        borderWidth: 1,
      },
    ],
  };

  return (
    <Layout title="Relatórios">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Relatórios e Análises</h2>
            <p className="text-gray-600 dark:text-gray-400">Visualize e analise dados do seu cronograma modular</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100"
            >
              <option value="week">Esta Semana</option>
              <option value="month">Este Mês</option>
              <option value="quarter">Este Trimestre</option>
              <option value="year">Este Ano</option>
            </select>
          </div>
        </div>

        {/* Seção de upload e listagem de arquivos removida daqui */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Cards de estatísticas mantidos */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <BarChart3 className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tarefas Concluídas</p>
                  <h3 className="text-2xl font-semibold">45</h3>
                  <p className="text-xs text-green-600">+12% vs mês anterior</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <TrendingUp className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Projetos Ativos</p>
                  <h3 className="text-2xl font-semibold">18</h3>
                  <p className="text-xs text-blue-600">+3 novos projetos</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-full mr-4">
                  <Calendar className="text-yellow-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Prazos Próximos</p>
                  <h3 className="text-2xl font-semibold">7</h3>
                  <p className="text-xs text-yellow-600">Próximos 7 dias</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded-full mr-4">
                  <FileText className="text-primary" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Relatórios Gerados</p>
                  <h3 className="text-2xl font-semibold">{reports.length}</h3>
                  <p className="text-xs text-primary">Este mês</p>
                </div>
              </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráficos mantidos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="font-medium text-lg mb-4">Status das Tarefas</h3>
            <div className="h-64">
              <Pie 
                data={taskStatusData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom' } },
                }}
              />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="font-medium text-lg mb-4">Progresso Mensal</h3>
            <div className="h-64">
              <Bar 
                data={monthlyProgressData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'top' } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            {/* Tabela de relatórios mantida */}
            <div className="p-6 border-b">
              <h3 className="font-medium text-lg">Relatórios Disponíveis</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-200 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Relatório</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Criação</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamanho</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-primary mr-3">{getTypeIcon(report.type)}</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{report.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-100 capitalize">{report.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-100">{report.createdAt.toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(report.status)}`}>{getStatusText(report.status)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-100">{report.size}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="text-primary hover:text-primary-light"><Download size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </div>
        
        {/* A seção de relatórios de planilhas importadas foi removida */}
      </div>
    </Layout>
  );
};

export default Reports;