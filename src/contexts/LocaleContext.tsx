import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'pt' | 'en' | 'es';
export type Timezone = 'America/New_York' | 'Europe/London' | 'America/Sao_Paulo';

interface LocaleContextType {
  language: Language;
  timezone: Timezone;
  setLanguage: (lang: Language) => void;
  setTimezone: (tz: Timezone) => void;
  t: (key: string) => string;
  formatDateTime: (date: Date) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// Traduções
const translations = {
  pt: {
    'dashboard': 'Dashboard',
    'packaging_analysis': 'Planilhas',
    'calendar': 'Calendário',
    'reports': 'Relatórios',
    'team': 'Equipe',
    'settings': 'Configurações',
    'total_tasks': 'Total de Tarefas',
    'completed': 'Concluída',
    'in_progress': 'Em Andamento',
    'delayed': 'Atrasadas',
    'imported_spreadsheets': 'Planilhas Importadas',
    'task_schedule': 'Cronograma de Tarefas',
    'import_excel': 'Importar Excel',
    'export': 'Exportar',
    'new_task': 'Nova Tarefa',
    'task_stage': 'TAREFA/ETAPA',
    'duration': 'DURAÇÃO',
    'status': 'STATUS',
    'how_to': 'COMO FAZER',
    'search': 'Pesquisar...',
    'notifications': 'Notificações',
    'user_test': 'Usuário Teste',
    'admin': 'admin',
    'logout': 'Sair',
    'appearance': 'Aparência',
    'system_theme': 'Tema do Sistema',
    'light': 'Claro',
    'dark': 'Escuro',
    'language': 'Idioma',
    'timezone': 'Fuso Horário',
    'notifications_settings': 'Configurações de Notificações',
    'event_notifications': 'Notificações de Eventos',
    'email_notifications': 'Notificações por Email',
    'push_notifications': 'Notificações Push',
    'virtual_assistant': 'Assistente Virtual',
    'ask_questions': 'Tire suas dúvidas aqui',
    'type_message': 'Digite sua mensagem...',
    'hello_assistant': 'Olá! Sou o assistente virtual do Cronograma Modular. Como posso ajudar você hoje?',
    'pink_white_theme': 'Tema Rosa e Branco',
    'pink_dark_gray_theme': 'Tema Rosa e Cinza Escuro',
    'choose_theme': 'Escolha entre tema claro ou escuro',
    'system_settings': 'Configurações do Sistema',
    'personalize_experience': 'Personalize sua experiência no Cronograma Modular',
    'packaging_analysis_title': 'Análise de Embalagens',
    'camera_view': 'Visualização da Câmera',
    'connect_esp': 'Conectar ESP',
    'start_analysis': 'Iniciar Análise',
    'connect_esp_to_start': 'Conecte o ESP para iniciar a análise',
    'analysis_results': 'Resultados da Análise',
    'approved': 'Aprovado',
    'rejected': 'Rejeitado',
    'defects_found': 'Defeitos encontrados:',
    'system_console': 'Console do Sistema',
    'reports_analysis': 'Relatórios e Análises',
    'visualize_data': 'Visualize e analise dados do seu cronograma modular',
    'completed_tasks': 'Tarefas Concluídas',
    'active_projects': 'Projetos Ativos',
    'upcoming_deadlines': 'Prazos Próximos',
    'generated_reports': 'Relatórios Gerados',
    'task_status': 'Status das Tarefas',
    'monthly_progress': 'Progresso Mensal',
    'available_reports': 'Relatórios Disponíveis',
    'report': 'RELATÓRIO',
    'type': 'TIPO',
    'creation_date': 'DATA DE CRIAÇÃO',
    'this_month': 'Este Mês',
    'vs_previous_month': 'vs mês anterior',
    'new_projects': 'novos projetos',
    'next_7_days': 'Próximos 7 dias',
    'completed_status': 'Concluído',
    'not_started_status': 'Não Iniciado',
    'in_progress_status': 'Em Andamento',
    'delayed_status': 'Atrasado',
    'filters': 'Filtros',
    'scope_briefing': '1. Escopo & Briefing',
    'research_analysis': '2. Pesquisa e Análise',
    'concept_prototype': '3. Concepção e Protótipo',
    'concept_validation': '4. Validação de Conceito',
    'primary_packaging': 'Embalagem Primária',
    'ampoules': 'Ampolas',
    'technical_requirements': 'Definir requisitos técnicos de proteção e barreira',
    'dosage_volume': 'Estabelecer o volume de dosagem',
    'pharmaceutical_standards': 'Levantar normas farmacêuticas aplicáveis (ex: USP)',
    'create_3d_prototype': 'Criar protótipo da ampola em 3D',
    'glass_compatibility': 'Testar a compatibilidade do vidro com a formulação do produto',
    'stability_test': 'Realizar teste de estabilidade em diferentes condições de temperatura e umidade',
    'days': 'dias',
    'sequential': 'sequencial',
    'classification': 'de classificação (ex:',
    'specific': 'a específica (ex: Blister)',
    'scope_brief': 'to (ex: 1. Escopo & Brief)',
    'priority': 'ou prioridade (A, B,',
    'task_activity': 'efa ou atividade',
    'estimated': 'timado (ex: 5 dias)',
    'procedure': 'ção do procedimento',
    'reference': 'ncia: Referência do do',
    'completion': 'entual de conclusão (0',
    'melora_assistant': 'Melora sua assistente virtual'
  },
  en: {
    'dashboard': 'Dashboard',
    'packaging_analysis': 'Spreadsheets',
    'calendar': 'Calendar',
    'reports': 'Reports',
    'team': 'Team',
    'settings': 'Settings',
    'total_tasks': 'Total Tasks',
    'completed': 'Completed',
    'in_progress': 'In Progress',
    'delayed': 'Delayed',
    'imported_spreadsheets': 'Imported Spreadsheets',
    'task_schedule': 'Task Schedule',
    'import_excel': 'Import Excel',
    'export': 'Export',
    'new_task': 'New Task',
    'task_stage': 'TASK/STAGE',
    'duration': 'DURATION',
    'status': 'STATUS',
    'how_to': 'HOW TO',
    'search': 'Search...',
    'notifications': 'Notifications',
    'user_test': 'Test User',
    'admin': 'admin',
    'logout': 'Logout',
    'appearance': 'Appearance',
    'system_theme': 'System Theme',
    'light': 'Light',
    'dark': 'Dark',
    'language': 'Language',
    'timezone': 'Timezone',
    'notifications_settings': 'Notification Settings',
    'event_notifications': 'Event Notifications',
    'email_notifications': 'Email Notifications',
    'push_notifications': 'Push Notifications',
    'virtual_assistant': 'Virtual Assistant',
    'ask_questions': 'Ask your questions here',
    'type_message': 'Type your message...',
    'hello_assistant': 'Hello! I am the virtual assistant of the Modular Schedule. How can I help you today?',
    'pink_white_theme': 'Pink and White Theme',
    'pink_dark_gray_theme': 'Pink and Dark Gray Theme',
    'choose_theme': 'Choose between light or dark theme',
    'system_settings': 'System Settings',
    'personalize_experience': 'Personalize your experience in the Modular Schedule',
    'packaging_analysis_title': 'Packaging Analysis',
    'camera_view': 'Camera View',
    'connect_esp': 'Connect ESP',
    'start_analysis': 'Start Analysis',
    'connect_esp_to_start': 'Connect the ESP to start the analysis',
    'analysis_results': 'Analysis Results',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'defects_found': 'Defects found:',
    'system_console': 'System Console',
    'reports_analysis': 'Reports and Analysis',
    'visualize_data': 'Visualize and analyze data from your modular schedule',
    'completed_tasks': 'Completed Tasks',
    'active_projects': 'Active Projects',
    'upcoming_deadlines': 'Upcoming Deadlines',
    'generated_reports': 'Generated Reports',
    'task_status': 'Task Status',
    'monthly_progress': 'Monthly Progress',
    'available_reports': 'Available Reports',
    'report': 'REPORT',
    'type': 'TYPE',
    'creation_date': 'CREATION DATE',
    'this_month': 'This Month',
    'vs_previous_month': 'vs previous month',
    'new_projects': 'new projects',
    'next_7_days': 'Next 7 days',
    'completed_status': 'Completed',
    'not_started_status': 'Not Started',
    'delayed_status': 'Delayed',
    'filters': 'Filters',
    'scope_briefing': '1. Scope & Briefing',
    'research_analysis': '2. Research & Analysis',
    'concept_prototype': '3. Concept & Prototype',
    'concept_validation': '4. Concept Validation',
    'primary_packaging': 'Primary Packaging',
    'ampoules': 'Ampoules',
    'technical_requirements': 'Define technical requirements for protection and barrier',
    'dosage_volume': 'Establish dosage volume',
    'pharmaceutical_standards': 'Research applicable pharmaceutical standards (e.g., USP)',
    'create_3d_prototype': 'Create 3D ampoule prototype',
    'glass_compatibility': 'Test glass compatibility with product formulation',
    'stability_test': 'Perform stability test under different temperature and humidity conditions',
    'days': 'days',
    'sequential': 'sequential',
    'classification': 'of classification (ex:',
    'specific': 'specific (ex: Blister)',
    'scope_brief': 'to (ex: 1. Scope & Brief)',
    'priority': 'or priority (A, B,',
    'task_activity': 'task or activity',
    'estimated': 'estimated (ex: 5 days)',
    'procedure': 'of the procedure',
    'reference': 'reference of the',
    'completion': 'eventual conclusion (0',
    'melora_assistant': 'Melora your virtual assistant'
  },
  es: {
    'dashboard': 'Panel de Control',
    'packaging_analysis': 'Análisis de Empaque',
    'calendar': 'Calendario',
    'reports': 'Reportes',
    'team': 'Equipo',
    'settings': 'Configuración',
    'total_tasks': 'Total de Tareas',
    'completed': 'Completada',
    'in_progress': 'En Progreso',
    'delayed': 'Retrasadas',
    'imported_spreadsheets': 'Hojas de Cálculo Importadas',
    'task_schedule': 'Programa de Tareas',
    'import_excel': 'Importar Excel',
    'export': 'Exportar',
    'new_task': 'Nueva Tarea',
    'task_stage': 'TAREA/ETAPA',
    'duration': 'DURACIÓN',
    'status': 'ESTADO',
    'how_to': 'CÓMO HACER',
    'search': 'Buscar...',
    'notifications': 'Notificaciones',
    'user_test': 'Usuario de Prueba',
    'admin': 'admin',
    'logout': 'Cerrar Sesión',
    'appearance': 'Apariencia',
    'system_theme': 'Tema del Sistema',
    'light': 'Claro',
    'dark': 'Oscuro',
    'language': 'Idioma',
    'timezone': 'Zona Horaria',
    'notifications_settings': 'Configuración de Notificaciones',
    'event_notifications': 'Notificaciones de Eventos',
    'email_notifications': 'Notificaciones por Email',
    'push_notifications': 'Notificaciones Push',
    'virtual_assistant': 'Asistente Virtual',
    'ask_questions': 'Haz tus preguntas aquí',
    'type_message': 'Escribe tu mensaje...',
    'hello_assistant': '¡Hola! Soy el asistente virtual del Cronograma Modular. ¿Cómo puedo ayudarte hoy?',
    'pink_white_theme': 'Tema Rosa y Blanco',
    'pink_dark_gray_theme': 'Tema Rosa y Gris Oscuro',
    'choose_theme': 'Elige entre tema claro u oscuro',
    'system_settings': 'Configuración del Sistema',
    'personalize_experience': 'Personaliza tu experiencia en el Cronograma Modular',
    'packaging_analysis_title': 'Análisis de Empaque',
    'camera_view': 'Vista de Cámara',
    'connect_esp': 'Conectar ESP',
    'start_analysis': 'Iniciar Análisis',
    'connect_esp_to_start': 'Conecta el ESP para iniciar el análisis',
    'analysis_results': 'Resultados del Análisis',
    'approved': 'Aprobado',
    'rejected': 'Rechazado',
    'defects_found': 'Defectos encontrados:',
    'system_console': 'Consola del Sistema',
    'reports_analysis': 'Reportes y Análisis',
    'visualize_data': 'Visualiza y analiza datos de tu cronograma modular',
    'completed_tasks': 'Tareas Completadas',
    'active_projects': 'Proyectos Activos',
    'upcoming_deadlines': 'Plazos Próximos',
    'generated_reports': 'Reportes Generados',
    'task_status': 'Estado de Tareas',
    'monthly_progress': 'Progreso Mensual',
    'available_reports': 'Reportes Disponibles',
    'report': 'REPORTE',
    'type': 'TIPO',
    'creation_date': 'FECHA DE CREACIÓN',
    'this_month': 'Este Mes',
    'vs_previous_month': 'vs mes anterior',
    'new_projects': 'nuevos proyectos',
    'next_7_days': 'Próximos 7 días',
    'completed_status': 'Completada',
    'not_started_status': 'No Iniciada',
    'delayed_status': 'Retrasada',
    'filters': 'Filtros',
    'scope_briefing': '1. Alcance y Briefing',
    'research_analysis': '2. Investigación y Análisis',
    'concept_prototype': '3. Concepto y Prototipo',
    'concept_validation': '4. Validación de Concepto',
    'primary_packaging': 'Empaque Primario',
    'ampoules': 'Ampollas',
    'technical_requirements': 'Definir requisitos técnicos de protección y barrera',
    'dosage_volume': 'Establecer volumen de dosificación',
    'pharmaceutical_standards': 'Investigar estándares farmacéuticos aplicables (ej: USP)',
    'create_3d_prototype': 'Crear prototipo 3D de la ampolla',
    'glass_compatibility': 'Probar compatibilidad del vidrio con la formulación del producto',
    'stability_test': 'Realizar prueba de estabilidad en diferentes condiciones de temperatura y humedad',
    'days': 'días',
    'sequential': 'secuencial',
    'classification': 'de clasificación (ej:',
    'specific': 'específica (ej: Blister)',
    'scope_brief': 'a (ej: 1. Alcance y Brief)',
    'priority': 'o prioridad (A, B,',
    'task_activity': 'tarea o actividad',
    'estimated': 'estimado (ej: 5 días)',
    'procedure': 'del procedimiento',
    'reference': 'referencia del',
    'completion': 'conclusión eventual (0',
    'melora_assistant': 'Melora tu asistente virtual'
  }
};

export const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');
  const [timezone, setTimezone] = useState<Timezone>('America/Sao_Paulo');

  useEffect(() => {
    // Carregar configurações salvas
    const savedLanguage = localStorage.getItem('language') as Language;
    const savedTimezone = localStorage.getItem('timezone') as Timezone;
    
    if (savedLanguage) setLanguage(savedLanguage);
    if (savedTimezone) setTimezone(savedTimezone);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const handleSetTimezone = (tz: Timezone) => {
    setTimezone(tz);
    localStorage.setItem('timezone', tz);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const formatDateTime = (date: Date): string => {
    try {
      return new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-ES', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(date);
    } catch (error) {
      return date.toLocaleString();
    }
  };

  const value: LocaleContextType = {
    language,
    timezone,
    setLanguage: handleSetLanguage,
    setTimezone: handleSetTimezone,
    t,
    formatDateTime
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
