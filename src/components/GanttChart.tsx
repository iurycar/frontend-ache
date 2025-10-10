import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: 'meeting' | 'deadline' | 'review' | 'other';
  participants?: string[];
  location?: string;
  description?: string;
  duration?: number;
  progress?: number;
  dependencies?: string[];
  priority?: 'low' | 'medium' | 'high';
}

interface GanttChartProps {
  events: Event[];
  currentDate: Date;
  onNavigate: (direction: 'prev' | 'next') => void;
  onZoom: (direction: 'in' | 'out') => void;
  onEventClick: (event: Event) => void;
}

const GanttChart: React.FC<GanttChartProps> = ({
  events,
  currentDate,
  onNavigate,
  onZoom,
  onEventClick
}) => {
  const [viewMode, setViewMode] = React.useState<'week' | 'month'>('month');
  const [zoomLevel, setZoomLevel] = React.useState(1);

  const getEventTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-500';
      case 'deadline':
        return 'bg-red-500';
      case 'review':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: Event['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500';
      case 'medium':
        return 'border-l-4 border-yellow-500';
      case 'low':
        return 'border-l-4 border-green-500';
      default:
        return 'border-l-4 border-gray-500';
    }
  };

  const getColumnWidth = () => {
    // Aumentamos a largura na visão de semana para dar mais espaço
    const width = viewMode === 'week' ? 80 : 40;
    return width;
  };

  // ✅ 1. Geração da linha do tempo agora é dinâmica e memoizada
  const timeline = useMemo(() => {
    const days = [];
    let startDate = new Date(currentDate);
    let endDate = new Date(currentDate);

    if (viewMode === 'week') {
      // Para a visão de semana, mostramos 14 dias
      startDate.setDate(currentDate.getDate() - 7);
      endDate.setDate(currentDate.getDate() + 7);
    } else {
      // Para a visão de mês, mostramos o mês inteiro
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    }

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    return days;
  }, [currentDate, viewMode]);


  const calculateEventPosition = (event: Event) => {
    // ✅ 2. O início da linha do tempo agora é o primeiro dia do array 'timeline'
    const timelineStart = timeline[0]; 
    if (!timelineStart) return { left: 0, width: 0, endDate: event.date };

    const startDate = event.date;
    const duration = event.duration || 1;
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + duration - 1);

    const daysDiff = Math.floor((startDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const columnWidth = getColumnWidth();
    
    // O posicionamento e a largura agora usam a largura da coluna correta
    const leftPosition = daysDiff * columnWidth * zoomLevel;
    const width = duration * columnWidth * zoomLevel;

    return {
      left: Math.max(0, leftPosition),
      width: Math.max(20, width), // Garante uma largura mínima
      endDate
    };
  };

  const handleZoom = (direction: 'in' | 'out') => {
    const newZoom = direction === 'in' ? zoomLevel * 1.2 : zoomLevel / 1.2;
    setZoomLevel(Math.max(0.5, Math.min(3, newZoom)));
    onZoom(direction);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Gráfico de Gantt
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'week' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'month' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Mês
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('prev')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => onNavigate('next')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <ChevronRight size={20} />
          </button>
          <div className="border-l border-gray-300 dark:border-gray-600 mx-2 h-6"></div>
          <button
            onClick={() => handleZoom('out')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <ZoomOut size={20} />
          </button>
          <button
            onClick={() => handleZoom('in')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <ZoomIn size={20} />
          </button>
        </div>
      </div>

      {/* Timeline Header */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <div className="w-64 p-3 font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
              Tarefa
            </div>
            <div className="flex-1 min-w-[800px]">
              <div className="flex">
                {timeline.map((day, index) => {
                  const isToday = day.toDateString() === new Date().toDateString();
                  
                  return (
                    <div
                      key={index}
                      className={`p-2 text-center text-sm border-r border-gray-200 dark:border-gray-700 ${
                        isToday 
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                          : 'text-gray-900 dark:text-white'
                      }`}
                      style={{ 
                        minWidth: `${getColumnWidth() * zoomLevel}px`,
                        width: `${getColumnWidth() * zoomLevel}px`,
                        flexShrink: 0
                      }}
                    >
                      <div className="font-medium">{day.getDate()}</div>
                      <div className="text-xs">
                        {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Events Rows */}
          <div className="space-y-1">
            {events.map((event) => {
              const position = calculateEventPosition(event);
              const progress = event.progress || 0;
              
              return (
                <div
                  key={event.id}
                  className="flex border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {/* Task Name */}
                  <div className="w-64 p-3 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`}></div>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                          {event.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {event.date.toLocaleDateString('pt-BR')} - {event.time}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gantt Bar */}
                  <div className="flex-1 min-w-[800px] relative">
                    <div className="relative h-full flex items-center">
                       {/* Main bar with progress */}
                      <div
                        className={`absolute rounded cursor-pointer hover:opacity-80 transition-opacity ${getPriorityColor(event.priority)}`}
                        style={{
                          left: `${position.left}px`,
                          width: `${position.width}px`,
                          height: '24px',
                          background: `linear-gradient(to right, ${getComputedStyle(document.documentElement).getPropertyValue('--' + event.type + '-color') || '#4A90E2'} ${progress}%, #e0e0e0 ${progress}%)`
                        }}
                        onClick={() => onEventClick(event)}
                      >
                        <div
                            className={`h-full rounded-l ${getEventTypeColor(event.type)}`}
                            style={{ width: `${progress}%` }}
                        >
                            <div className="flex items-center justify-center h-full text-white text-xs font-medium px-2 truncate">
                                {progress > 0 && `${progress}%`}
                            </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;