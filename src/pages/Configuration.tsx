import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Settings, Palette, Bell, Shield, Database, Globe, Moon, Sun, Languages, Clock, MessageSquare } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLocale } from '../contexts/LocaleContext';
import { useNotifications } from '../contexts/NotificationContext';

interface ConfigSettings {
  theme: 'light' | 'dark';
  notifications: {
    email: boolean;
    push: boolean;
    deadlines: boolean;
    updates: boolean;
  };
  language: string;
  timezone: string;
  autoSave: boolean;
  dataRetention: number;
}

const Configuration: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, timezone, setLanguage, setTimezone, t } = useLocale();
  const { settings: notificationSettings, updateSettings: updateNotificationSettings } = useNotifications();
  
  const [settings, setSettings] = useState<ConfigSettings>({
    theme: theme,
    notifications: {
      email: true,
      push: true,
      deadlines: true,
      updates: false,
    },
    language: language,
    timezone: timezone,
    autoSave: true,
    dataRetention: 365,
  });

  useEffect(() => {
    setSettings(prev => ({ ...prev, theme }));
  }, [theme]);

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleNotificationChange = (key: keyof ConfigSettings['notifications']) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const handleSettingChange = (key: keyof ConfigSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    // Here you would typically send to your backend
    alert('Configurações salvas com sucesso!');
    
    // Adicionar notificação de evento
    addEventNotification(
      'Configurações Atualizadas',
      'Suas configurações foram salvas com sucesso.'
    );
  };

  return (
    <Layout title={t('settings')}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">{t('system_settings')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('personalize_experience')}</p>
        </div>

        {/* Theme Settings */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex items-center mb-4">
            <Palette className="text-primary mr-3" size={24} />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('appearance')}</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('system_theme')}
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('choose_theme')}
                </p>
              </div>
              <button
                onClick={handleThemeToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  theme === 'dark' ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
                <span className="sr-only">Toggle theme</span>
              </button>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <Sun size={20} className="text-yellow-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('light')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Moon size={20} className="text-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('dark')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border-2 border-primary rounded-lg bg-white">
                <div className="h-2 bg-primary rounded mb-2"></div>
                <div className="h-1 bg-gray-200 rounded mb-1"></div>
                <div className="h-1 bg-gray-200 rounded mb-1"></div>
                <div className="h-1 bg-gray-200 rounded w-3/4"></div>
                <p className={`text-xs text-center mt-2 font-medium ${theme === 'dark' ? 'text-black' : 'text-gray-600'}`}>
                  {t('pink_white_theme')}
                </p>
              </div>
              
              <div className="p-4 border-2 border-gray-300 rounded-lg bg-gray-800">
                <div className="h-2 bg-primary rounded mb-2"></div>
                <div className="h-1 bg-gray-600 rounded mb-1"></div>
                <div className="h-1 bg-gray-600 rounded mb-1"></div>
                <div className="h-1 bg-gray-600 rounded w-3/4"></div>
                <p className={`text-xs text-center mt-2 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
                  {t('pink_dark_gray_theme')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex items-center mb-4">
            <Bell className="text-primary mr-3" size={24} />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('notifications_settings')}</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('event_notifications')}
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receba notificações sobre eventos importantes
                </p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.eventNotifications}
                onChange={() => updateNotificationSettings({ eventNotifications: !notificationSettings.eventNotifications })}
                className="h-4 w-4 text-primary rounded focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('email_notifications')}
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receba atualizações importantes por email
                </p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.emailNotifications}
                onChange={() => updateNotificationSettings({ emailNotifications: !notificationSettings.emailNotifications })}
                className="h-4 w-4 text-primary rounded focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('push_notifications')}
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receba notificações no navegador
                </p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings.pushNotifications}
                onChange={() => updateNotificationSettings({ pushNotifications: !notificationSettings.pushNotifications })}
                className="h-4 w-4 text-primary rounded focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Language and Timezone Settings */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex items-center mb-4">
            <Globe className="text-primary mr-3" size={24} />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('language')} & {t('timezone')}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('language')}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="pt">Português (Brasil)</option>
                <option value="en">English (US)</option>
                <option value="es">Español</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('timezone')}
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                <option value="America/New_York">Nova York (GMT-5)</option>
                <option value="Europe/London">Londres (GMT+0)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Retenção de Dados (dias)
              </label>
              <input
                type="number"
                value={settings.dataRetention}
                onChange={(e) => handleSettingChange('dataRetention', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                min="30"
                max="3650"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoSave"
                checked={settings.autoSave}
                onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                className="h-4 w-4 text-primary rounded focus:ring-primary mr-3"
              />
              <label htmlFor="autoSave" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Salvamento Automático
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Shield className="text-primary mr-3" size={24} />
            <h3 className="text-lg font-medium">Segurança</h3>
          </div>
          
          <div className="space-y-4">
            <button className="w-full md:w-auto btn btn-outline">
              Alterar Senha
            </button>
            
            <button className="w-full md:w-auto btn btn-outline ml-0 md:ml-3">
              Configurar 2FA
            </button>
            
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Sessões Ativas</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div>
                    <div className="font-medium">Navegador Atual</div>
                    <div className="text-sm text-gray-500">Chrome - São Paulo, SP</div>
                  </div>
                  <span className="text-green-600 text-sm">Ativo</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chatbot Settings */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex items-center mb-4">
            <MessageSquare className="text-primary mr-3" size={24} />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('virtual_assistant')}</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Key para IA Externa
              </label>
              <div className="flex">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Digite sua chave da API (ex: Gemini, OpenAI)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <button 
                  onClick={() => setApiKey('')}
                  className="px-4 py-2 bg-red-500 text-white rounded-r-md hover:bg-red-600"
                >
                  Limpar
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Configure uma chave da API para integração com serviços de IA externos como Gemini ou OpenAI
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">{t('melora_assistant')}</h4>
                <span className="text-green-600 text-sm">Ativo</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Assistente virtual inteligente para ajudar com dúvidas sobre o sistema
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p>• Respostas automáticas para perguntas comuns</p>
                <p>• Integração com API externa quando necessário</p>
                <p>• Suporte em português, inglês e espanhol</p>
              </div>
            </div>
          </div>
        </div>

        {/* Database Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Database className="text-primary mr-3" size={24} />
            <h3 className="text-lg font-medium">Banco de Dados</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">Tipo</div>
                <div className="font-medium">MySQL</div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                <div className="font-medium text-green-600">Conectado</div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">Último Backup</div>
                <div className="font-medium">Hoje, 03:00</div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button className="btn btn-outline">
                Fazer Backup
              </button>
              <button className="btn btn-outline">
                Restaurar Backup
              </button>
              <button className="btn btn-outline">
                Otimizar Banco
              </button>
            </div>
          </div>
        </div>

        {/* API Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Globe className="text-primary mr-3" size={24} />
            <h3 className="text-lg font-medium">Integrações API</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chave da API
              </label>
              <div className="flex">
                <input
                  type="password"
                  value="sk-1234567890abcdef"
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                />
                <button className="px-4 py-2 bg-primary text-white rounded-r-md hover:bg-opacity-90">
                  Regenerar
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Google Calendar</h4>
                  <span className="text-green-600 text-sm">Conectado</span>
                </div>
                <p className="text-sm text-gray-500 mb-3">Sincronização de eventos e prazos</p>
                <button className="btn btn-outline text-sm">Desconectar</button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Microsoft Outlook</h4>
                  <span className="text-gray-500 text-sm">Desconectado</span>
                </div>
                <p className="text-sm text-gray-500 mb-3">Sincronização de emails e calendário</p>
                <button className="btn btn-primary text-sm">Conectar</button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button onClick={saveSettings} className="btn btn-primary">
            Salvar Configurações
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Configuration;