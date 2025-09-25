import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLocale } from '../contexts/LocaleContext';
import { 
  LayoutDashboard, 
  Package, 
  LogOut, 
  Settings, 
  Calendar, 
  Users, 
  FileText,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { logout, user } = useAuth();
  const { t } = useLocale();
  
  const navItems = [
    { icon: LayoutDashboard, text: t('dashboard'), path: '/dashboard' },
    { icon: Package, text: t('packaging_analysis'), path: '/analise-embalagens' },
    { icon: Calendar, text: t('calendar'), path: '/calendario' },
    { icon: FileText, text: t('reports'), path: '/relatorios' },
    { icon: Users, text: t('team'), path: '/equipe' },
    { icon: Settings, text: t('settings'), path: '/configuracoes' },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 bg-black transition-opacity z-20 lg:hidden ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
      />

      <aside
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-900 shadow-md transition-all duration-300 z-30 
                  ${isOpen ? 'w-64' : 'w-0 lg:w-20'} lg:relative`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            {isOpen ? (
              <div className="flex items-center">
                <div className="bg-primary rounded-md p-2 text-white mr-2">
                  <LayoutDashboard size={20} />
                </div>
                <h2 className="font-bold text-gray-800 dark:text-white text-lg">Cronograma</h2>
              </div>
            ) : (
              <div className="mx-auto bg-primary rounded-md p-2 text-white">
                <LayoutDashboard size={20} />
              </div>
            )}
            
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={toggleSidebar}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center py-3 px-4 transition-colors ${
                        isActive
                          ? 'bg-primary text-white border-r-4 border-primary font-medium'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                      } ${!isOpen ? 'justify-center' : ''}`
                    }
                  >
                    <item.icon size={20} className={`${!isOpen ? 'mx-auto' : 'mr-3'}`} />
                    {isOpen && <span>{item.text}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {isOpen && user && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center mb-2">
                <div className="bg-gray-200 dark:bg-gray-600 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                  <span className="text-gray-700 dark:text-gray-200">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{t('user_test')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('admin')}</p>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={logout}
              className={`flex items-center text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary ${
                !isOpen ? 'justify-center w-full' : ''
              }`}
            >
              <LogOut size={20} className={`${!isOpen ? 'mx-auto' : 'mr-3'}`} />
              {isOpen && <span>{t('logout')}</span>}
            </button>
          </div>
        </div>
      </aside>
      
      {/* Toggle button for larger screens */}
      <button
        className="hidden lg:flex fixed bottom-24 left-6 z-30 rounded-full bg-pink-500 text-white p-3 shadow-lg hover:bg-pink-600 transition-colors"
        onClick={toggleSidebar}
      >
        <ChevronRight
          size={20}
          className={`transform transition-transform ${!isOpen ? 'rotate-180' : ''}`}
        />
      </button>
    </>
  );
};

export default Sidebar;