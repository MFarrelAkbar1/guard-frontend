import React from 'react';
import { Moon, Sun, Settings as SettingsIcon, Bell, Shield, Database } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../common/Button';

const Settings: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="theme-card rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <SettingsIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold theme-text-primary">Settings</h1>
            <p className="theme-text-secondary mt-1">Manage your application preferences</p>
          </div>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="theme-card rounded-lg p-6">
        <h2 className="text-lg font-semibold theme-text-primary mb-4 flex items-center gap-2">
          {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          Appearance
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium theme-text-primary">Theme</h3>
              <p className="text-sm theme-text-secondary">Choose between light and dark mode</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="pt-2 text-sm theme-text-secondary">
            Current theme: <span className="font-medium">{isDarkMode ? 'Dark' : 'Light'}</span>
            <div className="mt-2 p-2 rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs">
              Debug: isDarkMode = {isDarkMode.toString()}, HTML class should be: {isDarkMode ? 'dark' : 'light'}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="theme-card rounded-lg p-6">
        <h2 className="text-lg font-semibold theme-text-primary mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </h2>

        <div className="space-y-4">
          {[
            { label: 'Anomaly Alerts', description: 'Get notified when anomalies are detected', enabled: true },
            { label: 'Power Threshold Warnings', description: 'Alerts when power consumption exceeds limits', enabled: true },
            { label: 'System Updates', description: 'Notifications about system updates and maintenance', enabled: false },
            { label: 'Weekly Reports', description: 'Receive weekly energy consumption reports', enabled: true }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <h3 className="font-medium theme-text-primary">{item.label}</h3>
                <p className="text-sm theme-text-secondary">{item.description}</p>
              </div>
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                  item.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    item.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security Settings */}
      <div className="theme-card rounded-lg p-6">
        <h2 className="text-lg font-semibold theme-text-primary mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium theme-text-primary">Two-Factor Authentication</h3>
              <p className="text-sm theme-text-secondary">Add an extra layer of security to your account</p>
            </div>
            <Button variant="outline" size="sm">
              Enable
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium theme-text-primary">Session Timeout</h3>
              <p className="text-sm theme-text-secondary">Automatically log out after inactivity</p>
            </div>
            <select className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-1 text-sm">
              <option>30 minutes</option>
              <option>1 hour</option>
              <option>2 hours</option>
              <option>Never</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="theme-card rounded-lg p-6">
        <h2 className="text-lg font-semibold theme-text-primary mb-4 flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Management
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium theme-text-primary">Data Retention</h3>
              <p className="text-sm theme-text-secondary">How long to keep historical data</p>
            </div>
            <select className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-1 text-sm">
              <option>30 days</option>
              <option>90 days</option>
              <option>1 year</option>
              <option>Forever</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium theme-text-primary">Export Data</h3>
              <p className="text-sm theme-text-secondary">Download your data in various formats</p>
            </div>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button variant="primary">
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default Settings;