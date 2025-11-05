import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, Users, MapPin, Edit2, Trash2 } from 'lucide-react';
import EventModal from '../components/EventModal';
import GanttChart from '../components/GanttChart';

interface Event {
  id: string;
  title: string; // "<num> - <projeto>"
  date: Date;
  time: string;
  type: 'meeting' | 'deadline' | 'review' | 'other';
  participants?: string[];
  location?: string;
  description?: string;
  duration?: number;       // duração em dias
  progress?: number;       // 0 a 100
  priority?: 'low' | 'medium' | 'high';
  id_file?: string;        // projeto (id)
  num?: number;            // número da tarefa
  deadline?: Date;
}

type BackendTask = {
  num: number;
  name?: string | null;
  duration?: string | number | null;     // pode vir como "5 dias" ou número
  conclusion?: number | string | null;   // 0–1 ou 0–100
  start_date?: string | null;            // ISO/SQL date
  deadline?: string | null;              // ISO/SQL date
  end_date?: string | null;              // ISO/SQL date
  delay?: number | null;                 // calculado pelo backend (dias em atraso)
  id_file?: string | null;               // projeto (id)
  project_name?: string | null;          // projeto (nome) se backend retornar
};

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'gantt'>('gantt');

  // Eventos carregados do backend (apenas tarefas do funcionário)
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helpers de parsing/mapeamento
  const parseDurationDays = (value: string | number | null | undefined): number => {
    if (typeof value === 'number' && Number.isFinite(value)) return Math.max(1, Math.floor(value));
    if (!value) return 1;
    const n = parseInt(String(value).replace(/\D+/g, ''), 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  };

  const parseProgress = (value: number | string | null | undefined): number => {
    if (value == null) return 0;
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    if (n <= 1) return Math.round(Math.max(0, Math.min(1, n)) * 100);
    return Math.round(Math.max(0, Math.min(100, n)));
  };

  const toDate = (s?: string | null): Date | null => {
    if (!s) return null;
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  };

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const inferType = (task: BackendTask): Event['type'] => {
    if (!task.start_date && task.deadline) return 'deadline';
    return 'other';
  };

  const inferPriority = (task: BackendTask): Event['priority'] => {
    const progressPct = parseProgress(task.conclusion); // 0–100
    if (progressPct >= 100) return 'low';

    const dur = parseDurationDays(task.duration);
    const start = toDate(task.start_date);
    const declaredDeadline = toDate(task.deadline);

    // deadline efetiva (usa backend; se não houver, calcula a partir do start+duration)
    let dl: Date | null = declaredDeadline;
    if (!dl && start) {
      const end = new Date(startOfDay(start));
      end.setDate(end.getDate() + Math.max(1, dur) - 1); // inclusivo
      dl = end;
    }

    // Sem deadline: regra simples por trabalho restante
    if (!dl) {
      const remainingWorkDays = Math.max(0, Math.ceil(dur * (1 - progressPct / 100)));
      return remainingWorkDays >= 10 ? 'medium' : 'low';
    }

    const today = startOfDay(new Date());
    const deadlineDay = startOfDay(dl);
    const DAY = 1000 * 60 * 60 * 24;

    const daysToDeadline = Math.floor((deadlineDay.getTime() - today.getTime()) / DAY);
    const remainingWorkDays = Math.max(0, Math.ceil(dur * (1 - progressPct / 100)));
    const slack = daysToDeadline - remainingWorkDays;

    if (daysToDeadline < 0 && progressPct < 100) return 'high';
    if (daysToDeadline >= 7) return 'low';

    // Pouca folga => medium, senão low
    if (slack <= 2) return 'medium';
    return 'low';
  };

  const getProjectLabel = (t: BackendTask): string => {
    return ((t.project_name) || t.id_file || 'Projeto').toString();
  };

  const mapTasksToEvents = (tasks: BackendTask[]): Event[] => {
    return tasks.map((t) => {
      const duration = parseDurationDays(t.duration);
      const startCandidate = toDate(t.start_date);
      const deadline = toDate(t.deadline) || null;

      // 1) usa start_date; 2) se não houver, calcula a partir do deadline e duração; 3) hoje
      let start = startCandidate || new Date();
      if (!startCandidate && deadline) {
        const d = new Date(deadline);
        d.setDate(d.getDate() - Math.max(1, duration) + 1); // inclusivo
        start = d;
      }

      const progress = parseProgress(t.conclusion);
      const type = inferType(t);
      const priority = inferPriority(t);
      const time = start.toTimeString().slice(0, 5);

      const title = `📑 Tarefa: ${t.num} ➡ Projeto: ${getProjectLabel(t)}`;

      return {
        id: `task-${(t.id_file || 'x')}-${String(t.num)}`,
        title,
        date: start,
        deadline: deadline || undefined,
        time,
        type,
        duration,
        progress,
        priority,
        id_file: t.id_file || undefined,
        num: t.num,
      };
    });
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const resp = await fetch('/api/employee/tasks', {
          method: 'GET',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });

        if (!resp.ok) {
          const msg = await resp.text().catch(() => '');
          throw new Error(msg || `HTTP ${resp.status}`);
        }

        const payload = await resp.json().catch(() => ({}));
        const tasks: BackendTask[] = payload?.tasks || [];

        if (isMounted) setEvents(mapTasksToEvents(tasks));
      } catch (e: any) {
        if (isMounted) setError(e?.message || 'Falha ao carregar tarefas.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // UI helpers do calendário
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(new Date(year, month, day));
    return days;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    return events.filter(event => event.date.toDateString() === date.toDateString());
  };

  const getEventTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'deadline':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') newDate.setMonth(prev.getMonth() - 1);
      else newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  // Handlers UI
  const handleAddEvent = () => {
    setEditingEvent(null);
    setShowEventModal(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEventModal(true);
  };

  const handleSaveEvent = async (eventData: Omit<Event, 'id'>) => {
    try {
      // Se for edição de uma tarefa do backend, faz PATCH
      if (editingEvent && editingEvent.id_file && typeof editingEvent.num === 'number') {
        const idFile = editingEvent.id_file;
        const num = editingEvent.num;

        // Normaliza conclusão (0–1) para o backend desta rota
        const conclusion = Math.max(0, Math.min(1, (eventData.progress ?? 0) / 100));
        const duration = Number.isFinite(eventData.duration as number)
          ? String(eventData.duration)
          : '1';

        const resp = await fetch(`/api/employee/tasks/update/${encodeURIComponent(idFile)}/${num}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ duration, conclusion }),
        });

        if (!resp.ok) {
          const msg = await resp.text().catch(() => '');
          throw new Error(msg || `Falha HTTP ${resp.status}`);
        }
      }

      // Atualiza estado local
      if (editingEvent) {
        setEvents(prev =>
          prev.map(event =>
            event.id === editingEvent.id
              ? { ...event, ...eventData }
              : event
          )
        );
      } else {
        const newEvent: Event = { ...eventData, id: `event-${Date.now()}` };
        setEvents(prev => [...prev, newEvent]);
      }
    } catch (e) {
      console.error(e);
      alert('Falha ao atualizar a tarefa no servidor.');
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      setEvents(prev => prev.filter(event => event.id !== eventId));
    }
  };

  const handleGanttNavigate = (direction: 'prev' | 'next') => {
    navigateMonth(direction);
  };

  const handleGanttZoom = (_direction: 'in' | 'out') => {
    // Lógica adicional pode ser adicionada se necessário
  };

  const handleGanttEventClick = (event: Event) => {
    setEditingEvent(event);
    setShowEventModal(true);
  };

  const days = getDaysInMonth(currentDate);
  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <Layout title="Calendário">
      {/* View Mode Toggle */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {viewMode === 'gantt' ? 'Gráfico de Gantt' : 'Calendário'}
            </h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 text-sm rounded-md ${
                  viewMode === 'calendar'
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                <CalendarIcon size={16} className="mr-2 inline" />
                Calendário
              </button>
              <button
                onClick={() => setViewMode('gantt')}
                className={`px-4 py-2 text-sm rounded-md ${
                  viewMode === 'gantt'
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                Gráfico de Gantt
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {viewMode === 'gantt' ? (
            <div>
              {loading && (
                <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  Carregando tarefas...
                </div>
              )}
              {error && (
                <div className="mb-2 text-sm text-red-600">
                  {error}
                </div>
              )}
              <GanttChart
                events={events}
                currentDate={currentDate}
                onNavigate={handleGanttNavigate}
                onZoom={handleGanttZoom}
                onEventClick={handleGanttEventClick}
              />
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center text-gray-900 dark:text-white">
                  <CalendarIcon className="text-primary mr-2" size={24} />
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-opacity-90"
                  >
                    Hoje
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Calendar Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const dayEvents = day ? getEventsForDate(day) : [];
                  const isSelected = selectedDate && day && selectedDate.toDateString() === day.toDateString();
                  const isToday = day && day.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={index}
                      className={`min-h-[80px] p-1 border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        isSelected ? 'bg-primary bg-opacity-10 border-primary' : ''
                      } ${isToday ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
                      onClick={() => day && setSelectedDate(day)}
                    >
                      {day && (
                        <>
                          <div
                            className={`text-sm font-medium mb-1 ${
                              isToday ? 'text-blue-600' : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {day.getDate()}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map(event => (
                              <div
                                key={event.id}
                                className={`text-xs p-1 rounded truncate ${getEventTypeColor(event.type)}`}
                              >
                                {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                +{dayEvents.length - 2} mais
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Event Details Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg text-gray-900 dark:text-white">Eventos</h3>
              <button
                onClick={handleAddEvent}
                className="btn btn-primary flex items-center text-sm"
              >
                <Plus size={16} className="mr-1" />
                Novo Evento
              </button>
            </div>

            {selectedDate ? (
              <div>
                <h4 className="font-medium mb-3 text-gray-900 dark:text-white">
                  {selectedDate.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h4>

                {selectedDateEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateEvents.map(event => (
                      <div key={event.id} className={`border rounded-lg p-3 ${getEventTypeColor(event.type)}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{event.title}</div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEditEvent(event)}
                              className="p-1 text-gray-500 hover:text-primary transition-colors"
                              title="Editar evento"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                              title="Excluir evento"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center text-sm mb-2">
                          <Clock size={14} className="mr-1" />
                          {event.time}
                        </div>
                        {event.location && (
                          <div className="flex items-center text-sm mb-2">
                            <MapPin size={14} className="mr-1" />
                            {event.location}
                          </div>
                        )}
                        {event.participants && (
                          <div className="flex items-center text-sm mb-2">
                            <Users size={14} className="mr-1" />
                            {event.participants.join(', ')}
                          </div>
                        )}
                        {event.description && (
                          <p className="text-sm mt-2">{event.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhum evento nesta data</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">Selecione uma data para ver os eventos</p>
            )}
          </div>

          {/* Próximos Eventos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="font-medium text-lg mb-4 text-gray-900 dark:text-white">Próximos Eventos</h3>
            <div className="space-y-3">
              {events
                .filter(event => event.date >= new Date())
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .slice(0, 5)
                .map(event => (
                  <div key={event.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                    <div
                      className={`w-3 h-3 rounded-full mt-1 ${
                        event.type === 'meeting'
                          ? 'bg-blue-500'
                          : event.type === 'deadline'
                          ? 'bg-red-500'
                          : event.type === 'review'
                          ? 'bg-yellow-500'
                          : 'bg-gray-500'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900 dark:text-white">{event.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {event.date.toLocaleDateString('pt-BR')} às {event.time}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Evento */}
      <EventModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSave={handleSaveEvent}
        selectedDate={selectedDate || undefined}
        event={editingEvent}
      />
    </Layout>
  );
};

export default Calendar;