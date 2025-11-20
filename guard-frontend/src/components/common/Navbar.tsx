import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  User,
  Bell,
  Search,
  ChevronDown,
  Settings,
  LogOut,
  AlertTriangle,
  Clock,
  CheckCircle,
  X
} from 'lucide-react';
import type { Anomaly } from '../../types/database';

interface NavbarProps {
  onMenuClick: () => void;
  currentView: string;
  onLogout: () => void;
  userName?: string;
  userEmail?: string;
  onViewChange?: (view: string) => void;
  recentAnomalies?: Anomaly[];
}

const Navbar: React.FC<NavbarProps> = ({
  onMenuClick,
  currentView,
  onLogout,
  userName = 'Margaret',
  userEmail = 'margarettary@gmail.com',
  onViewChange,
  recentAnomalies = []
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Load read notifications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('read_notifications');
    if (saved) {
      setReadNotifications(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save read notifications to localStorage
  useEffect(() => {
    localStorage.setItem('read_notifications', JSON.stringify(Array.from(readNotifications)));
  }, [readNotifications]);

  const getPageTitle = (view: string): string => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      anomaly: 'Anomaly Log',
      profile: 'Profile',
      settings: 'Settings',
      help: 'Help'
    };
    return titles[view] || 'GUARD System';
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300';
      case 'critical':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    const iconClass = 'h-4 w-4';
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className={`${iconClass} text-red-500`} />;
      case 'medium':
        return <AlertTriangle className={`${iconClass} text-yellow-500`} />;
      case 'low':
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      default:
        return <AlertTriangle className={`${iconClass} text-gray-500`} />;
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = recentAnomalies.filter(a => !readNotifications.has(a.id)).length;

  const markAsRead = (id: string) => {
    setReadNotifications(prev => new Set(prev).add(id));
  };

  const markAllAsRead = () => {
    setReadNotifications(new Set(recentAnomalies.map(a => a.id)));
  };

  const clearAll = () => {
    setReadNotifications(new Set(recentAnomalies.map(a => a.id)));
    setShowNotifications(false);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showUserMenu || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, showNotifications]);

  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    onLogout();
  };

  const handleNotificationToggle = () => {
    setShowNotifications(!showNotifications);
    setShowUserMenu(false);
  };

  const handleNotificationClick = (anomalyId: string) => {
    markAsRead(anomalyId);
    if (onViewChange) {
      onViewChange('anomaly');
    }
    setShowNotifications(false);
  };

  const handleViewAllAnomalies = () => {
    if (onViewChange) {
      onViewChange('anomaly');
    }
    setShowNotifications(false);
  };

  return (
    <header className="theme-card shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden theme-text-secondary hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Page Title */}
          <h1 className="text-xl font-semibold theme-text-primary">
            {getPageTitle(currentView)}
          </h1>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Search (Desktop only) - Only show in anomaly log */}
          {currentView === 'anomaly' && (
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search anomalies..."
                  className="pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all w-64"
                />
              </div>
            </div>
          )}

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={handleNotificationToggle}
              className="relative p-2 theme-text-secondary hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] theme-card rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-[28rem] sm:max-h-[32rem] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold theme-text-primary">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <X className="h-4 w-4 theme-text-secondary" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notification List */}
                <div className="flex-1 overflow-y-auto">
                  {recentAnomalies.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="h-12 w-12 theme-text-secondary mx-auto mb-3 opacity-50" />
                      <p className="text-sm theme-text-secondary">No notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {recentAnomalies.slice(0, 10).map((anomaly) => {
                        const isUnread = !readNotifications.has(anomaly.id);
                        return (
                          <div
                            key={anomaly.id}
                            onClick={() => handleNotificationClick(anomaly.id)}
                            className={`p-4 cursor-pointer transition-colors ${
                              isUnread
                                ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-1">
                                {getSeverityIcon(anomaly.severity)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <p className="font-medium theme-text-primary text-sm truncate">
                                    {(anomaly as any).fridges?.name || 'Unknown Device'}
                                  </p>
                                  {isUnread && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                                  )}
                                </div>
                                <p className="text-xs theme-text-secondary mb-2 line-clamp-2">
                                  {anomaly.description || `${anomaly.type.replace(/_/g, ' ')} detected`}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getSeverityColor(anomaly.severity)}`}>
                                    {anomaly.severity}
                                  </span>
                                  <span className="text-xs theme-text-secondary flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatTimeAgo(anomaly.detected_at)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {recentAnomalies.length > 0 && (
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleViewAllAnomalies}
                      className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors font-medium"
                    >
                      View All Anomalies
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={handleUserMenuToggle}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>

              {/* User Info (Desktop only) */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium theme-text-primary">{userName}</p>
                <p className="text-xs theme-text-secondary">{userEmail}</p>
              </div>

              <ChevronDown className="h-4 w-4 theme-text-secondary" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 theme-card rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium theme-text-primary">{userName}</p>
                      <p className="text-sm theme-text-secondary">{userEmail}</p>
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  <button
                    onClick={() => {
                      onViewChange?.('profile');
                      setShowUserMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm theme-text-primary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <User className="h-4 w-4 mr-3" />
                    View Profile
                  </button>

                  <button
                    onClick={() => {
                      onViewChange?.('settings');
                      setShowUserMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm theme-text-primary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </button>

                  <hr className="my-2 border-gray-200 dark:border-gray-700" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search - Only show in anomaly log */}
      {currentView === 'anomaly' && (
        <div className="md:hidden mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search anomalies..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;