import { useEffect, useLayoutEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

const SIDEBAR_COLLAPSED_KEY = 'elovia_admin_sidebar_collapsed';
const ADMIN_THEME_KEY = 'elovia_admin_theme';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
  );
  const [theme, setTheme] = useState(
    () => window.localStorage.getItem(ADMIN_THEME_KEY) || 'dark'
  );

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem(ADMIN_THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  return (
    <div className="admin-theme flex h-screen overflow-hidden bg-white text-slate-900 dark:bg-black dark:text-white">
      {/* Desktop sidebar */}
      <div className="hidden h-full shrink-0 md:flex">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed((collapsed) => !collapsed)}
          theme={theme}
          onToggleTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 z-50 h-full w-64">
            <Sidebar
              mobile
              theme={theme}
              onToggleTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-white/30 dark:bg-black dark:text-white md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-1 text-slate-600 dark:text-white/60">
            <Menu size={22} />
          </button>
          <span className="font-bold">Admin Panel</span>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto bg-white p-6 dark:bg-black">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
