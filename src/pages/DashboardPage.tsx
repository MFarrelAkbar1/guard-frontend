import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { ConfirmModal } from '../components/common/Modal';
import Button from '../components/common/Button';
import StatsCard from '../components/dashboard/Statscard';
import EnergyCard from '../components/dashboard/EnergyCard';
import AnomalyCalendar from '../components/dashboard/AnomalyCalendar';
import EnergyChart from '../components/dashboard/EnergyChart';
import Settings from '../components/dashboard/Settings';
import Profile from '../components/dashboard/Profile';
import Help from '../components/dashboard/Help';
import FridgeManagement from '../components/dashboard/FridgeManagement';
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
import { getDashboardStats, getFridges, getRecentAnomalies } from '../services/dashboardService';
import { getFridgeStats } from '../services/fridgeService';
import type { DashboardStats, Fridge, Anomaly } from '../types/database';

interface DashboardPageProps {
  onLogout: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Filter and export states for anomaly log
  const [showFilter, setShowFilter] = useState(false);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dashboard data state
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [fridges, setFridges] = useState<Fridge[]>([]);
  const [anomalyLogs, setAnomalyLogs] = useState<Anomaly[]>([]);
  const [fridgeStats, setFridgeStats] = useState<Record<string, any>>({});

  // Get user data from auth context
  const userName = user?.user_metadata?.name || 'User';
  const userEmail = user?.email || '';
  const userId = user?.id || 'anonymous';

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all data in parallel
        const [stats, fridgesList, anomalies] = await Promise.all([
          getDashboardStats(),
          getFridges(),
          getRecentAnomalies(20)
        ]);

        setStatsData(stats);
        setFridges(fridgesList);
        setAnomalyLogs(anomalies);

        // Fetch stats for each fridge
        const statsPromises = fridgesList.map(async (fridge) => {
          const stats = await getFridgeStats(fridge.id);
          return { [fridge.id]: stats };
        });

        const statsResults = await Promise.all(statsPromises);
        const combinedStats = statsResults.reduce((acc, stat) => ({ ...acc, ...stat }), {});
        setFridgeStats(combinedStats);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();

    // Refresh data every minute
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Convert fridges to device format for EnergyCard
  const devices = fridges.map((fridge) => {
    const stats = fridgeStats[fridge.id];
    const hasRecentData = stats?.lastUpdated &&
      (new Date().getTime() - new Date(stats.lastUpdated).getTime()) < 5 * 60 * 1000;

    return {
      id: fridge.id,
      user_id: fridge.user_id,
      name: fridge.name,
      location: fridge.location || 'Unknown Location',
      status: (hasRecentData ? 'online' : (stats?.anomalyCount > 0 ? 'warning' : 'offline')) as 'online' | 'offline' | 'warning' | 'error',
      created_at: fridge.created_at,
      updated_at: fridge.updated_at,
      latest_power: stats?.latestPowerWatts || 0,
      latest_timestamp: stats?.lastUpdated || new Date().toISOString(),
      anomaly_count_today: stats?.anomalyCount || 0,
      total_data_points_today: 1440 // 1 minute intervals = 1440 per day
    };
  });

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
    // In real app, this would call an API
    // You could also show a toast notification here
  };

  const handleDateClick = (date: Date) => {
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

  // Filter anomaly logs
  const filteredAnomalyLogs = anomalyLogs.filter((log: any) => {
    if (severityFilter !== 'all' && log.severity !== severityFilter) {
      return false;
    }
    if (statusFilter !== 'all' && log.status !== statusFilter) {
      return false;
    }
    return true;
  });

  // Export functionality
  const handleExport = () => {
    const csvContent = [
      ['ID', 'Device', 'Type', 'Date', 'Severity', 'Status', 'Description'],
      ...filteredAnomalyLogs.map((log: any) => [
        log.id,
        log.fridges?.name || 'Unknown Device',
        log.type,
        log.detected_at,
        log.severity,
        log.status,
        log.description || ''
      ])
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anomaly-log-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calculate anomaly stats
  const anomalyStats = {
    total: filteredAnomalyLogs.length,
    resolved: filteredAnomalyLogs.filter(log => log.status === 'resolved').length,
    active: filteredAnomalyLogs.filter(log => log.status === 'active').length,
    critical: filteredAnomalyLogs.filter(log => log.severity === 'critical').length
  };

  return (
    <div className="min-h-screen theme-bg-secondary flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Navbar */}
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          currentView={currentView}
          onLogout={handleLogout}
          userName={userName}
          userEmail={userEmail}
          onViewChange={setCurrentView}
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
                      <h1 className="text-xl font-semibold text-gray-900">Selamat Pagi, {userName}</h1>
                      <p className="text-gray-500">{userEmail}</p>
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
                  title="Daily Total Power"
                  value={statsData ? `${statsData.total_power_today_kwh.toFixed(2)} kWh` : 'Loading...'}
                  subtitle="Today's consumption"
                  icon={Power}
                  color="blue"
                  trend={statsData ? {
                    value: statsData.total_power_trend.value,
                    label: 'from yesterday',
                    type: statsData.total_power_trend.type
                  } : undefined}
                />

                <StatsCard
                  title="Efficiency"
                  value={statsData ? `${statsData.energy_efficiency}%` : 'Loading...'}
                  subtitle="Overall system efficiency"
                  icon={TrendingUp}
                  color="green"
                />

                <StatsCard
                  title="Weekly Anomalies"
                  value={statsData ? statsData.anomalies_this_week : 'Loading...'}
                  subtitle="Anomalies detected this week"
                  icon={AlertTriangle}
                  color="orange"
                  onClick={() => setCurrentView('anomaly')}
                />

                <StatsCard
                  title="Cost Savings"
                  value={statsData ? `Rp ${statsData.cost_savings_idr.toLocaleString('id-ID')}` : 'Loading...'}
                  subtitle="Total savings estimate"
                  icon={Zap}
                  color="purple"
                />
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Energy Management Cards */}
                <div className="xl:col-span-2 space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Power className="h-5 w-5 mr-2" />
                      Manajemen Energi
                    </h2>
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
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilter(!showFilter)}
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>

                      {showFilter && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Severity
                              </label>
                              <select
                                value={severityFilter}
                                onChange={(e) => setSeverityFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="all">All Severity</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                              </label>
                              <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="resolved">Resolved</option>
                              </select>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSeverityFilter('all');
                                  setStatusFilter('all');
                                }}
                              >
                                Clear
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setShowFilter(false)}
                              >
                                Apply
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExport}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
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
                  {filteredAnomalyLogs.map((log: any, index) => (
                    <div key={log.id} className={`p-6 hover:bg-gray-50 transition-colors ${index === 0 ? 'bg-blue-50' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getStatusIcon(log.status)}
                              <h3 className="font-medium text-gray-900">{log.fridges?.name || 'Unknown Device'}</h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{log.description || 'No description available'}</p>
                            <p className="text-xs text-gray-500">{formatDate(log.detected_at)}</p>
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="p-6 border-t bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Showing 1 to {filteredAnomalyLogs.length} of {filteredAnomalyLogs.length} results
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
          ) : currentView === 'fridges' ? (
            // FRIDGES VIEW
            <FridgeManagement
              fridges={fridges}
              fridgeStats={fridgeStats}
              onRefresh={async () => {
                const fridgesList = await getFridges();
                setFridges(fridgesList);
                const statsPromises = fridgesList.map(async (fridge) => {
                  const stats = await getFridgeStats(fridge.id);
                  return { [fridge.id]: stats };
                });
                const statsResults = await Promise.all(statsPromises);
                const combinedStats = statsResults.reduce((acc, stat) => ({ ...acc, ...stat }), {});
                setFridgeStats(combinedStats);
              }}
            />
          ) : currentView === 'settings' ? (
            // SETTINGS VIEW
            <Settings />
          ) : currentView === 'profile' ? (
            // PROFILE VIEW
            <Profile />
          ) : currentView === 'help' ? (
            // HELP VIEW
            <Help />
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