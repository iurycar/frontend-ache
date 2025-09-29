import React from 'react';
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

  const calculateEventPosition = (event: Event) => {
    const startDate = event.date;
    const duration = event.duration || 1;
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + duration - 1);

    // Calcular posição baseada na data atual e modo de visualização
    const daysDiff = Math.floor((startDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    const width = duration * (viewMode === 'week' ? 100 : 30) * zoomLevel;

    return {
      left: Math.max(0, daysDiff * (viewMode === 'week' ? 100 : 30) * zoomLevel),
      width: Math.max(50, width),
      endDate
    };
  };

  const generateTimeLine = () => {
    const days = [];
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - 7); // Mostrar 7 dias antes da data atual
    
    const endDate = new Date(currentDate);
    endDate.setDate(endDate.getDate() + 30); // Mostrar 30 dias depois da data atual

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    return days;
  };

  const timeline = generateTimeLine();

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
            <div className="w-64 p-3 font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
              Tarefa
            </div>
            <div className="flex-1 min-w-[800px]">
              <div className="flex">
                {timeline.map((day, index) => {
                  const isToday = day.toDateString() === new Date().toDateString();
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  
                  return (
                    <div
                      key={index}
                      className={`flex-1 p-2 text-center text-sm border-r border-gray-200 dark:border-gray-700 ${
                        isToday 
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                          : isCurrentMonth 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-500 dark:text-gray-400'
                      }`}
                      style={{ minWidth: `${30 * zoomLevel}px` }}
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
            {events.map((event, index) => {
              const position = calculateEventPosition(event);
              const progress = event.progress || 0;
              
              return (
                <div
                  key={event.id}
                  className="flex border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {/* Task Name */}
                  <div className="w-64 p-3 border-r border-gray-200 dark:border-gray-700">
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
                  <div className="flex-1 min-w-[800px] relative p-2">
                    <div className="relative h-8">
                      {/* Background bar */}
                      <div
                        className={`absolute top-1/2 transform -translate-y-1/2 rounded ${getEventTypeColor(event.type)} opacity-20`}
                        style={{
                          left: `${position.left}px`,
                          width: `${position.width}px`,
                          height: '24px'
                        }}
                      ></div>
                      
                      {/* Progress bar */}
                      <div
                        className={`absolute top-1/2 transform -translate-y-1/2 rounded-l ${getEventTypeColor(event.type)}`}
                        style={{
                          left: `${position.left}px`,
                          width: `${(position.width * progress) / 100}px`,
                          height: '24px'
                        }}
                      ></div>
                      
                      {/* Main bar */}
                      <div
                        className={`absolute top-1/2 transform -translate-y-1/2 rounded cursor-pointer hover:opacity-80 transition-opacity ${getEventTypeColor(event.type)} ${getPriorityColor(event.priority)}`}
                        style={{
                          left: `${position.left}px`,
                          width: `${position.width}px`,
                          height: '24px'
                        }}
                        onClick={() => onEventClick(event)}
                      >
                        <div className="flex items-center justify-center h-full text-white text-xs font-medium">
                          {progress > 0 && `${progress}%`}
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
