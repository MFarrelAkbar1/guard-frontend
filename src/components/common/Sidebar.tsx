import React from 'react';
import {
  Shield,
  Home,
  FileText,
  User,
  Settings,
  HelpCircle,
  LogOut,
  X,
  Refrigerator
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  currentView, 
  onViewChange, 
  onLogout 
}) => {
  const mainMenuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      active: currentView === 'dashboard',
      onClick: () => onViewChange('dashboard')
    },
    {
      id: 'fridges',
      label: 'Fridges',
      icon: <Refrigerator className="h-5 w-5" />,
      active: currentView === 'fridges',
      onClick: () => onViewChange('fridges')
    },
    {
      id: 'anomaly',
      label: 'Anomaly Log',
      icon: <FileText className="h-5 w-5" />,
      active: currentView === 'anomaly',
      onClick: () => onViewChange('anomaly')
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="h-5 w-5" />,
      active: currentView === 'profile',
      onClick: () => onViewChange('profile')
    }
  ];

  const bottomMenuItems: MenuItem[] = [
    {
      id: 'help',
      label: 'Help',
      icon: <HelpCircle className="h-5 w-5" />,
      onClick: () => onViewChange('help')
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      onClick: () => onViewChange('settings')
    }
  ];

  const MenuItem: React.FC<{ item: MenuItem }> = ({ item }) => (
    <button
      onClick={item.onClick}
      className={`flex items-center w-full px-4 py-2 mb-2 rounded-lg transition-colors theme-sidebar-item ${
        item.active ? 'active' : ''
      }`}
    >
      {item.icon}
      <span className="ml-3">{item.label}</span>
    </button>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 theme-sidebar transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0`}>
        
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 theme-sidebar-header">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">Guard</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-white hover:bg-blue-700 p-1 rounded transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex flex-col h-full">
          {/* Main Menu */}
          <div className="flex-1 px-4 py-8">
            <div className="space-y-1">
              {mainMenuItems.map((item) => (
                <MenuItem key={item.id} item={item} />
              ))}
            </div>
          </div>
          
          {/* Bottom Menu */}
          <div className="px-4 pb-4">
            <div className="space-y-1 mb-4">
              {bottomMenuItems.map((item) => (
                <MenuItem key={item.id} item={item} />
              ))}
            </div>
            
            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center w-full px-4 py-2 rounded-lg theme-btn-danger transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="ml-3">Sign Out</span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;