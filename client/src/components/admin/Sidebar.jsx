import { createElement } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart2,
  BookOpen,
  CreditCard,
  DollarSign,
  Eye,
  Flag,
  Heart,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MessageSquare,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Users,
  Video,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Messages', path: '/admin/messages', icon: MessageSquare },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Reports', path: '/admin/reports', icon: Flag },
  { label: 'Random Video Monitor', path: '/admin/random-video/monitor', icon: Video },
  { label: 'Revenue', path: '/admin/revenue', icon: DollarSign },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
  { label: 'Visitors', path: '/admin/visitors', icon: Eye },
  { label: 'Plans', path: '/admin/plans', icon: CreditCard },
  { label: 'Blog', path: '/admin/blog', icon: BookOpen },
  { label: 'Ads', path: '/admin/ads', icon: Megaphone },
];

const Sidebar = ({
  mobile = false,
  collapsed = true,
  onToggleCollapsed,
  theme = 'dark',
  onToggleTheme,
  onClose,
}) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isCollapsed = !mobile && collapsed;
  const isDark = theme === 'dark';
  const showLabels = mobile || !isCollapsed;
  const tooltipClass = `pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 ${
    isDark ? 'bg-slate-800' : 'bg-slate-900'
  }`;

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose?.();
  };

  const handleToggleCollapsed = () => {
    onToggleCollapsed?.();
  };

  const ThemeIcon = isDark ? Moon : Sun;
  const CollapseIcon = isCollapsed ? PanelLeftOpen : PanelLeftClose;
  const themeTooltip = isDark ? 'Switch to light theme' : 'Switch to dark theme';
  const collapseTooltip = isCollapsed ? 'Expand sidebar' : 'Collapse sidebar';

  return (
    <aside
      className={`flex h-full min-h-0 shrink-0 flex-col border-r transition-all duration-300 ease-in-out ${
        mobile ? 'w-64' : isCollapsed ? 'w-16' : 'w-64'
      } ${
        isDark
          ? 'border-white/30 bg-black text-white'
          : 'border-slate-200 bg-white text-slate-900'
      }`}
    >
      <div
        className={`flex shrink-0 border-b ${
          mobile || !isCollapsed
            ? 'h-16 items-center justify-between gap-3 px-4'
            : 'flex-col items-center gap-2 py-3'
        } ${isDark ? 'border-white/30' : 'border-slate-200'}`}
      >
        <div className={`flex items-center ${showLabels ? 'gap-3' : ''}`}>
          <div className="rounded-xl bg-gradient-to-tr from-primary-600 to-pink-500 p-2 text-white">
            <Heart size={20} fill="currentColor" />
          </div>
          {showLabels && (
            <div>
              <p className="text-sm font-bold leading-tight">Elovia Love</p>
              <p className={`text-xs ${isDark ? 'text-white/60' : 'text-slate-500'}`}>Admin Panel</p>
            </div>
          )}
        </div>
        {!mobile && (
          <div className="group relative">
            <button
              type="button"
              onClick={handleToggleCollapsed}
              aria-label={collapseTooltip}
              aria-expanded={!isCollapsed}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                isDark
                  ? 'text-white/60 hover:bg-white/10 hover:text-white'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {createElement(CollapseIcon, { size: 18 })}
            </button>
            <span className={tooltipClass}>{collapseTooltip}</span>
          </div>
        )}
      </div>

      <nav className={`min-h-0 flex-1 space-y-1 py-4 ${mobile || !isCollapsed ? 'overflow-y-auto px-3' : 'overflow-visible px-2'}`}>
        {navItems.map(({ label, path, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <div key={path} className="group relative">
              <Link
                to={path}
                onClick={onClose}
                aria-label={isCollapsed ? label : undefined}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center rounded-xl py-2.5 text-sm font-medium transition-colors ${
                  showLabels ? 'gap-3 px-3' : 'justify-center px-0'
                } ${
                  active
                    ? 'bg-primary-600 text-white'
                    : isDark
                      ? 'text-white/60 hover:bg-white/10 hover:text-white'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {createElement(Icon, { size: 20 })}
                {showLabels && <span>{label}</span>}
              </Link>
              {isCollapsed && (
                <span className={`${tooltipClass} font-medium`}>{label}</span>
              )}
            </div>
          );
        })}
      </nav>

      <div
        className={`shrink-0 border-t ${
          mobile || !isCollapsed ? 'px-4 py-4' : 'p-2'
        } ${isDark ? 'border-white/30' : 'border-slate-200'}`}
      >
        <div className="group relative mb-2">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={themeTooltip}
            aria-pressed={isDark}
            className={`flex w-full items-center rounded-xl py-2 text-sm transition-colors ${
              showLabels ? 'gap-3 px-3' : 'justify-center px-0'
            } ${
              isDark
                ? 'text-white/60 hover:bg-white/10 hover:text-white'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {createElement(ThemeIcon, { size: 18 })}
            {showLabels && <span>{themeTooltip}</span>}
          </button>
          {isCollapsed && <span className={tooltipClass}>{themeTooltip}</span>}
        </div>

        <div className={`group relative flex ${showLabels ? 'mb-3 items-center gap-3' : 'justify-center'}`}>
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white ${isCollapsed ? 'cursor-default' : ''}`}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          {showLabels ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.name}</p>
              <p className={`text-xs ${isDark ? 'text-white/60' : 'text-slate-500'}`}>Administrator</p>
            </div>
          ) : (
            <span className={tooltipClass}>{user?.name}</span>
          )}
        </div>

        <div className="group relative">
          <button
            onClick={handleLogout}
            className={`flex w-full items-center rounded-xl transition-colors ${
              showLabels ? 'gap-2 px-3 py-2 text-sm' : 'justify-center p-2'
            } ${
              isDark
                ? 'text-white/60 hover:bg-white/10 hover:text-white'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <LogOut size={18} />
            {showLabels && <span>Log out</span>}
          </button>
          {isCollapsed && <span className={tooltipClass}>Log out</span>}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
