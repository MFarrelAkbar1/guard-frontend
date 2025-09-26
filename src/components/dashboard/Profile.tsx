import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Edit3, Save, X, Eye, EyeOff } from 'lucide-react';
import Button from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileData {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile: React.FC = () => {
  const { user, updateProfile, updatePassword } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.user_metadata?.name || 'User',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.user_metadata?.name || 'User',
        email: user.email || ''
      }));
    }
  }, [user]);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);

  const handleNameEdit = () => {
    setIsEditingName(true);
  };

  const handleNameSave = async () => {
    if (!profileData.name.trim()) {
      alert('Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      await updateProfile(profileData.name.trim());
      setIsEditingName(false);
      // Profile data will be automatically updated through the useEffect when user changes
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update name. Please try again.');
      // Reset to original name on error
      setProfileData(prev => ({ ...prev, name: user?.user_metadata?.name || 'User' }));
    } finally {
      setLoading(false);
    }
  };

  const handleNameCancel = () => {
    setProfileData(prev => ({ ...prev, name: user?.user_metadata?.name || 'User' })); // Reset to original
    setIsEditingName(false);
  };

  const handlePasswordChange = async () => {
    if (!profileData.currentPassword) {
      alert('Please enter your current password');
      return;
    }
    if (profileData.newPassword !== profileData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    if (profileData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(profileData.currentPassword, profileData.newPassword);
      setIsChangingPassword(false);
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      alert('Password updated successfully!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordCancel = () => {
    setProfileData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
    setIsChangingPassword(false);
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="theme-card rounded-lg p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold theme-text-primary">Profile Settings</h1>
            <p className="theme-text-secondary mt-1">Manage your personal information and security</p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="theme-card rounded-lg p-6">
        <h2 className="text-lg font-semibold theme-text-primary mb-6">Personal Information</h2>

        <div className="space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              Full Name
            </label>
            <div className="flex items-center gap-3">
              {isEditingName ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    className="flex-1 px-3 py-2 rounded-md shadow-sm theme-input"
                    placeholder="Enter your full name"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleNameSave}
                    disabled={loading || !profileData.name.trim()}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNameCancel}
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-between">
                  <span className="theme-text-primary font-medium">{profileData.name}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNameEdit}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Email Field (Read-only) */}
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              Email Address
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="theme-text-secondary">{profileData.email}</span>
              </div>
              <span className="text-xs theme-text-secondary bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                Not editable
              </span>
            </div>
            <p className="text-xs theme-text-secondary mt-1">
              Contact support to change your email address
            </p>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="theme-card rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold theme-text-primary">Security</h2>
          {!isChangingPassword && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChangingPassword(true)}
            >
              <Lock className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          )}
        </div>

        {isChangingPassword ? (
          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={profileData.currentPassword}
                  onChange={(e) => setProfileData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 rounded-md shadow-sm theme-input"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={profileData.newPassword}
                  onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 rounded-md shadow-sm theme-input"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-xs theme-text-secondary mt-1">
                Must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={profileData.confirmPassword}
                  onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 rounded-md shadow-sm theme-input"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                onClick={handlePasswordChange}
                disabled={loading || !profileData.currentPassword || !profileData.newPassword || !profileData.confirmPassword}
              >
                {loading ? 'Changing...' : 'Change Password'}
              </Button>
              <Button
                variant="outline"
                onClick={handlePasswordCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 dark:text-gray-400">
              Password last changed: <span className="font-medium">March 15, 2024</span>
            </p>
            <p className="text-sm theme-text-secondary mt-2">
              For security reasons, we recommend changing your password regularly.
            </p>
          </div>
        )}
      </div>

      {/* Account Statistics */}
      <div className="theme-card rounded-lg p-6">
        <h2 className="text-lg font-semibold theme-text-primary mb-4">Account Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">2</div>
            <div className="text-sm theme-text-secondary">Devices Connected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">97%</div>
            <div className="text-sm theme-text-secondary">System Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">45</div>
            <div className="text-sm theme-text-secondary">Days Active</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;