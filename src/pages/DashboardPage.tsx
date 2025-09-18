import React, { useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import { ConfirmModal } from '../components/common/Modal';
import Button from '../components/common/Button';
import StatsCard from '../components/dashboard/Statscard';
import EnergyCard from '../components/dashboard/EnergyCard';
import AnomalyCalendar from '../components/dashboard/AnomalyCalendar';
import EnergyChart from '../components/dashboard/EnergyChart';
import { 
  Power, 
  AlertTriangle, 
  TrendingUp, 
  User,
  Zap,
  Activity,
  Download,
  Filter,
  CheckCircle,
  Clock
} from 'lucide-react';

interface DashboardPageProps {
  onLogout: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Mock data
  const statsData = {
    totalPower: 245.8,
    weeklyAnomalies: 4,
    energyEfficiency: 97,
    costSavings: 125000
  };

  const devices = [
    {
      id: 'NR-BB332Q-PK-1',
      name: 'Kulkas NR-BB332Q-PK-1',
      percentage: 97,
      status: 'online' as const,
      power: 149.94,
      voltage: 220.5,
      current: 0.68,
      lastUpdate: new Date().toISOString(),
      location: 'Kitchen Area'
    },
    {
      id: 'NR-BB332Q-PK-2', 
      name: 'Kulkas NR-BB332Q-PK-2',
      percentage: 62,
      status: 'warning' as const,
      power: 95.86,
      voltage: 218.3,
      current: 0.44,
      lastUpdate: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
      location: 'Storage Room'
    }
  ];

  const anomalyLogs = [
    { 
      id: 1, 
      device: 'Kulkas NR-BB332Q-PK-2', 
      type: 'Overcurrent Detected', 
      date: '2025-05-13 08:45:22',
      severity: 'high' as const,
      status: 'active' as const,
      description: 'Current exceeded normal threshold by 15%'
    },
    { 
      id: 2, 
      device: 'Kulkas NR-BB332Q-PK-2', 
      type: 'Voltage Fluctuation', 
      date: '2025-05-13 13:22:15',
      severity: 'medium' as const,
      status: 'resolved' as const,
      description: 'Voltage dropped below 200V for 3 minutes'
    },
    { 
      id: 3, 
      device: 'Kulkas NR-BB332Q-PK-2', 
      type: 'Power Interruption', 
      date: '2025-05-12 22:18:33',
      severity: 'critical' as const,
      status: 'resolved' as const,
      description: 'Complete power loss detected for 45 seconds'
    },
    {
      id: 4,
      device: 'Kulkas NR-BB332Q-PK-1',
      type: 'Phase Imbalance',
      date: '2025-05-12 14:30:18',
      severity: 'low' as const,
      status: 'resolved' as const,
      description: 'Minor phase imbalance detected and corrected'
    }
  ];

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setLoading(true);
    setTimeout(() => {
      onLogout();
      setLoading(false);
      setShowLogoutConfirm(false);
    }, 1000);
  };

  const handleDeviceControl = (deviceId: string, action: 'disconnect' | 'reconnect') => {
    console.log(`Device ${deviceId} ${action} requested`);
    // In real app, this would call an API
    // You could also show a toast notification here
  };

  const handleDateClick = (date: Date) => {
    console.log('Calendar date clicked:', date);
    // Could open modal with anomaly details for that date
    // setCurrentView('anomaly'); // Navigate to anomaly log
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'active': return <Clock className="h-4 w-4 text-orange-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate anomaly stats
  const anomalyStats = {
    total: anomalyLogs.length,
    resolved: anomalyLogs.filter(log => log.status === 'resolved').length,
    active: anomalyLogs.filter(log => log.status === 'active').length,
    critical: anomalyLogs.filter(log => log.severity === 'critical').length
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Navbar */}
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          currentView={currentView}
          onLogout={handleLogout}
          userName="Margaret"
          userEmail="margarettary@gmail.com"
        />

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {currentView === 'dashboard' ? (
            // DASHBOARD VIEW
            <div className="space-y-6">
              {/* Welcome Header */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="text-xl font-semibold text-gray-900">Selamat Pagi, Margaret</h1>
                      <p className="text-gray-500">margarettary@gmail.com</p>
                      <p className="text-sm text-gray-400 mt-1">Last login: Today, 08:30 AM</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">System Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-600">All Systems Operational</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">2 devices connected</p>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                  title="Total Power"
                  value={`${statsData.totalPower}W`}
                  subtitle="Current consumption"
                  icon={Power}
                  color="blue"
                  trend={{
                    value: 2.5,
                    label: 'from yesterday',
                    type: 'increase'
                  }}
                  onClick={() => console.log('Power stats clicked')}
                />
                
                <StatsCard
                  title="Efficiency"
                  value={`${statsData.energyEfficiency}%`}
                  subtitle="Overall system efficiency"
                  icon={TrendingUp}
                  color="green"
                  trend={{
                    value: 1.2,
                    label: 'from last week',
                    type: 'increase'
                  }}
                />
                
                <StatsCard
                  title="Weekly Anomalies"
                  value={statsData.weeklyAnomalies}
                  subtitle="Anomalies detected this week"
                  icon={AlertTriangle}
                  color="orange"
                  trend={{
                    value: 25,
                    label: 'from last week',
                    type: 'decrease'
                  }}
                  onClick={() => setCurrentView('anomaly')}
                />
                
                <StatsCard
                  title="Cost Savings"
                  value={`Rp ${statsData.costSavings.toLocaleString()}`}
                  subtitle="Monthly savings estimate"
                  icon={Zap}
                  color="purple"
                  trend={{
                    value: 15,
                    label: 'this month',
                    type: 'increase'
                  }}
                />
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Energy Management Cards */}
                <div className="xl:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Power className="h-5 w-5 mr-2" />
                      Manajemen Energi
                    </h2>
                    <Button variant="outline" size="sm">
                      <Activity className="h-4 w-4 mr-2" />
                      View All Devices
                    </Button>
                  </div>
                  
                  <div className="grid gap-4">
                    {devices.map((device) => (
                      <EnergyCard
                        key={device.id}
                        device={device}
                        onControlDevice={handleDeviceControl}
                      />
                    ))}
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="bg-white rounded-lg p-4 shadow-sm border">
                    <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        Export Report
                      </Button>
                      <Button variant="outline" size="sm">
                        Schedule Maintenance
                      </Button>
                      <Button variant="outline" size="sm">
                        System Settings
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Anomaly Calendar */}
                <AnomalyCalendar onDateClick={handleDateClick} />

                {/* Energy Chart */}
                <div className="xl:col-span-3">
                  <EnergyChart 
                    timeRange="24h"
                    height={300}
                    showControls={true}
                  />
                </div>
              </div>
            </div>
          ) : currentView === 'anomaly' ? (
            // ANOMALY LOG VIEW
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">Anomaly Log</h1>
                    <p className="text-gray-500 mt-1">Track and monitor all system anomalies</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="primary" size="sm">
                      New Report
                    </Button>
                  </div>
                </div>
              </div>

              {/* Anomaly Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatsCard
                  title="Total Anomalies"
                  value={anomalyStats.total}
                  icon={AlertTriangle}
                  color="gray"
                />
                <StatsCard
                  title="Resolved"
                  value={anomalyStats.resolved}
                  icon={CheckCircle}
                  color="green"
                />
                <StatsCard
                  title="Active"
                  value={anomalyStats.active}
                  icon={Clock}
                  color="orange"
                />
                <StatsCard
                  title="Critical"
                  value={anomalyStats.critical}
                  icon={AlertTriangle}
                  color="red"
                />
              </div>
              
              {/* Anomaly List */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900">Recent Anomalies</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Showing {anomalyLogs.length} of {anomalyLogs.length} entries</span>
                    </div>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {anomalyLogs.map((log, index) => (
                    <div key={log.id} className={`p-6 hover:bg-gray-50 transition-colors ${index === 0 ? 'bg-blue-50' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <input 
                            type="checkbox" 
                            className="mt-1 rounded border-gray-300 focus:ring-blue-500" 
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getStatusIcon(log.status)}
                              <h3 className="font-medium text-gray-900">{log.device}</h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{log.description}</p>
                            <p className="text-xs text-gray-500">{formatDate(log.date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getSeverityBadgeColor(log.severity)}`}>
                            {log.severity.toUpperCase()}
                          </span>
                          <span className={`px-3 py-1 text-sm rounded font-medium ${
                            log.status === 'resolved' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {log.type}
                          </span>
                          <Button variant="outline" size="sm">
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="p-6 border-t bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Showing 1 to {anomalyLogs.length} of {anomalyLogs.length} results
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled>
                        Previous
                      </Button>
                      <Button variant="outline" size="sm" disabled>
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // OTHER VIEWS PLACEHOLDER
            <div className="bg-white rounded-lg p-8 shadow-sm border text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-8 w-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
                </h2>
                <p className="text-gray-500 mb-4">This page is currently under development.</p>
                <Button 
                  variant="primary" 
                  onClick={() => setCurrentView('dashboard')}
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to sign out of your account? Any unsaved changes will be lost."
        type="warning"
        confirmText="Sign Out"
        cancelText="Cancel"
        loading={loading}
      />
    </div>
  );
};

export default DashboardPage;