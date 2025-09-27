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

  const handleSettingChange = (key: keyof ConfigSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    // Here you would typically send to your backend
    alert('Configurações salvas com sucesso!');
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