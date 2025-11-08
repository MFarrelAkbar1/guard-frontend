import React, { useState, useEffect } from 'react';
import { Moon, Sun, Settings as SettingsIcon, Bell, Shield, Database, Mail, Check, Volume2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import {
  requestNotificationPermission,
  showTestNotification,
  getNotificationSettings,
  saveNotificationSettings,
  canShowNotifications
} from '../../services/notificationService';

interface NotificationSettings {
  anomalyAlerts: boolean;
  powerThresholdWarnings: boolean;
  systemUpdates: boolean;
  weeklyReports: boolean;
}

interface UserPreferences {
  notifications: NotificationSettings;
  dataRetention: string;
  sessionTimeout: string;
}

const Settings: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testEmailSent, setTestEmailSent] = useState(false);
  const [isTestingNotification, setIsTestingNotification] = useState(false);
  const [browserNotificationSettings, setBrowserNotificationSettings] = useState(getNotificationSettings());

  const [preferences, setPreferences] = useState<UserPreferences>({
    notifications: {
      anomalyAlerts: true,
      powerThresholdWarnings: true,
      systemUpdates: false,
      weeklyReports: true
    },
    dataRetention: '90 days',
    sessionTimeout: '1 hour'
  });

  const [originalPreferences, setOriginalPreferences] = useState<UserPreferences>(preferences);

  // Load preferences from localStorage or API on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem(`user_preferences_${user?.id}`);
    if (savedPreferences) {
      const parsed = JSON.parse(savedPreferences);
      setPreferences(parsed);
      setOriginalPreferences(parsed);
    }
  }, [user?.id]);

  // Check if preferences have changed
  useEffect(() => {
    const hasChanged = JSON.stringify(preferences) !== JSON.stringify(originalPreferences);
    setHasChanges(hasChanged);
  }, [preferences, originalPreferences]);

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const handlePreferenceChange = (key: keyof Omit<UserPreferences, 'notifications'>, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage (in a real app, this would be an API call)
      localStorage.setItem(`user_preferences_${user?.id}`, JSON.stringify(preferences));
      setOriginalPreferences(preferences);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBrowserNotificationToggle = async (key: 'enabled' | 'sound') => {
    if (key === 'enabled' && !browserNotificationSettings.enabled) {
      // Request permission when enabling
      const permission = await requestNotificationPermission();
      if (permission !== 'granted') {
        alert('Please enable notifications in your browser settings to receive alerts.');
        return;
      }
    }

    const newSettings = {
      ...browserNotificationSettings,
      [key]: !browserNotificationSettings[key]
    };
    setBrowserNotificationSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  const handleMinSeverityChange = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    const newSettings = {
      ...browserNotificationSettings,
      minSeverity: severity
    };
    setBrowserNotificationSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  const handleTestNotification = async () => {
    setIsTestingNotification(true);
    try {
      await showTestNotification();
    } catch (error) {
      console.error('Failed to show test notification:', error);
    } finally {
      setIsTestingNotification(false);
    }
  };

  const handleTestEmail = async () => {
    setIsTestingEmail(true);
    setTestEmailSent(false);

    try {
      // Check if we're in development mode
      if (process.env.REACT_APP_NODE_ENV === 'development') {
        // Simulate email sending for development
        await new Promise(resolve => setTimeout(resolve, 2000));
        alert(`Development Mode: Mock email sent to ${user?.email}\n\nIn production, configure SMTP in Supabase Settings → Auth → SMTP Settings to enable real email notifications.`);
        setTestEmailSent(true);
      } else {
        // In production, you would call your API endpoint that handles email sending
        // Example using Supabase Functions or your own backend:

        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/send-test-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: user?.email,
            subject: 'GUARD Test Email',
            message: 'This is a test email from your GUARD system.'
          })
        });

        if (!response.ok) {
          throw new Error('Failed to send email');
        }

        setTestEmailSent(true);
      }

      // Reset success message after 3 seconds
      setTimeout(() => {
        setTestEmailSent(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to send test email:', error);
      alert('Failed to send test email. Please check your email configuration.');
    } finally {
      setIsTestingEmail(false);
    }
  };

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
            {
              key: 'anomalyAlerts' as keyof NotificationSettings,
              label: 'Anomaly Alerts',
              description: 'Get notified via email when anomalies are detected',
              enabled: preferences.notifications.anomalyAlerts
            },
            {
              key: 'powerThresholdWarnings' as keyof NotificationSettings,
              label: 'Power Threshold Warnings',
              description: 'Email alerts when power consumption exceeds limits',
              enabled: preferences.notifications.powerThresholdWarnings
            },
            {
              key: 'systemUpdates' as keyof NotificationSettings,
              label: 'System Updates',
              description: 'Notifications about system updates and maintenance',
              enabled: preferences.notifications.systemUpdates
            },
            {
              key: 'weeklyReports' as keyof NotificationSettings,
              label: 'Weekly Reports',
              description: 'Receive weekly energy consumption reports via email',
              enabled: preferences.notifications.weeklyReports
            }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <h3 className="font-medium theme-text-primary">{item.label}</h3>
                <p className="text-sm theme-text-secondary">{item.description}</p>
              </div>
              <button
                onClick={() => handleNotificationChange(item.key)}
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

          {/* Test Email Section */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium theme-text-primary">Email Configuration</h3>
                <p className="text-sm theme-text-secondary">
                  Test email notifications to: <span className="font-medium">{user?.email}</span>
                </p>
                {process.env.REACT_APP_NODE_ENV === 'development' && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    Development mode: SMTP configuration required for production emails
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestEmail}
                disabled={isTestingEmail}
                className="flex items-center gap-2"
              >
                {isTestingEmail ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    Sending...
                  </>
                ) : testEmailSent ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    Email Sent!
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Send Test Email
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Browser Notification Settings */}
      <div className="theme-card rounded-lg p-6">
        <h2 className="text-lg font-semibold theme-text-primary mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Browser Notifications
        </h2>

        <div className="space-y-4">
          {/* Enable Browser Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium theme-text-primary">Enable Browser Notifications</h3>
              <p className="text-sm theme-text-secondary">
                {canShowNotifications()
                  ? 'Get real-time browser notifications for anomaly alerts'
                  : 'Permission needed to show browser notifications'}
              </p>
            </div>
            <button
              onClick={() => handleBrowserNotificationToggle('enabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                browserNotificationSettings.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  browserNotificationSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Enable Sound */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium theme-text-primary flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Sound Alerts
              </h3>
              <p className="text-sm theme-text-secondary">Play sound when anomalies are detected</p>
            </div>
            <button
              onClick={() => handleBrowserNotificationToggle('sound')}
              disabled={!browserNotificationSettings.enabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                browserNotificationSettings.sound && browserNotificationSettings.enabled
                  ? 'bg-blue-600'
                  : 'bg-gray-200 dark:bg-gray-600'
              } ${!browserNotificationSettings.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  browserNotificationSettings.sound ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Minimum Severity */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium theme-text-primary">Minimum Severity</h3>
              <p className="text-sm theme-text-secondary">Only notify for selected severity and above</p>
            </div>
            <select
              value={browserNotificationSettings.minSeverity}
              onChange={(e) => handleMinSeverityChange(e.target.value as 'low' | 'medium' | 'high' | 'critical')}
              disabled={!browserNotificationSettings.enabled}
              className={`border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-1 text-sm ${
                !browserNotificationSettings.enabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical Only</option>
            </select>
          </div>

          {/* Test Notification */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium theme-text-primary">Test Notification</h3>
                <p className="text-sm theme-text-secondary">Send a test browser notification and sound</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestNotification}
                disabled={isTestingNotification || !browserNotificationSettings.enabled}
                className="flex items-center gap-2"
              >
                {isTestingNotification ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    Testing...
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4" />
                    Test Notification
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Browser permission status */}
          {!canShowNotifications() && browserNotificationSettings.enabled && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Permission Required:</strong> Please allow notifications in your browser to receive anomaly alerts.
                Click the "Test Notification" button above to grant permission.
              </p>
            </div>
          )}
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
            <select
              value={preferences.sessionTimeout}
              onChange={(e) => handlePreferenceChange('sessionTimeout', e.target.value)}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-1 text-sm"
            >
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
            <select
              value={preferences.dataRetention}
              onChange={(e) => handlePreferenceChange('dataRetention', e.target.value)}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-1 text-sm"
            >
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

      {/* Save Button - Only show when there are changes */}
      {hasChanges && (
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={handleSaveChanges}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Settings;