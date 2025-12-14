import React, { useState } from 'react';
import { User } from '../../types';
import {
  UserCircleIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  KeyIcon,
  BellIcon,
  CloudIcon,
  DocumentTextIcon
} from '../Icons/Icons';
import './Settings.scss';

interface SettingsProps {
  currentUser: User;
  onUpdateUser: (user: Partial<User>) => void;
  theme: 'light' | 'dark';
}

const Settings = ({ currentUser, onUpdateUser, theme }: SettingsProps) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    avatarUrl: currentUser.avatarUrl || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // Update user profile logic here
    onUpdateUser({
      name: formData.name,
      email: formData.email,
      avatarUrl: formData.avatarUrl
    });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    // Password change logic here
    alert('Password changed successfully');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserCircleIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon },
    { id: 'companies', label: 'Company Defaults', icon: BuildingOfficeIcon },
    { id: 'integrations', label: 'Integrations', icon: KeyIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'data', label: 'Data Management', icon: CloudIcon },
    { id: 'reports', label: 'Reports', icon: ChartBarIcon },
    { id: 'system', label: 'System Info', icon: DocumentTextIcon }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="settings-section">
            <h2>Profile Settings</h2>
            <form onSubmit={handleProfileUpdate} className="settings-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="avatarUrl">Avatar URL</label>
                <input
                  type="url"
                  id="avatarUrl"
                  name="avatarUrl"
                  value={formData.avatarUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              <button type="submit" className="btn-primary">Update Profile</button>
            </form>
          </div>
        );

      case 'security':
        return (
          <div className="settings-section">
            <h2>Security Settings</h2>
            <form onSubmit={handlePasswordChange} className="settings-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit" className="btn-primary">Change Password</button>
            </form>

            <div className="settings-section">
              <h3>Two-Factor Authentication</h3>
              <p>Enhance your account security with 2FA.</p>
              <button className="btn-secondary">Enable 2FA</button>
            </div>
          </div>
        );

      case 'companies':
        return (
          <div className="settings-section">
            <h2>Company Defaults</h2>
            <div className="settings-form">
              <div className="form-group">
                <label>Default Modules for New Companies</label>
                <div className="checkbox-group">
                  <label><input type="checkbox" defaultChecked /> Payroll</label>
                  <label><input type="checkbox" defaultChecked /> Leave Management</label>
                  <label><input type="checkbox" defaultChecked /> Expenses</label>
                  <label><input type="checkbox" /> Reports</label>
                  <label><input type="checkbox" /> Announcements</label>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="defaultLicenses">Default License Count</label>
                <input type="number" id="defaultLicenses" defaultValue="10" min="1" />
              </div>
              <button className="btn-primary">Save Defaults</button>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="settings-section">
            <h2>Integrations</h2>
            <div className="integration-item">
              <h3>Payment Gateway</h3>
              <p>Configure payment processing for payroll.</p>
              <button className="btn-secondary">Configure</button>
            </div>
            <div className="integration-item">
              <h3>Email Service</h3>
              <p>Set up email notifications and communications.</p>
              <button className="btn-secondary">Configure</button>
            </div>
            <div className="integration-item">
              <h3>SMS Service</h3>
              <p>Configure SMS notifications for users.</p>
              <button className="btn-secondary">Configure</button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="settings-section">
            <h2>Notification Preferences</h2>
            <div className="settings-form">
              <div className="checkbox-group">
                <label><input type="checkbox" defaultChecked /> Email notifications for new companies</label>
                <label><input type="checkbox" defaultChecked /> Email notifications for user activities</label>
                <label><input type="checkbox" /> SMS notifications for critical alerts</label>
                <label><input type="checkbox" /> Weekly summary reports</label>
              </div>
              <button className="btn-primary">Save Preferences</button>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="settings-section">
            <h2>Data Management</h2>
            <div className="data-actions">
              <button className="btn-secondary">Export All Data</button>
              <button className="btn-secondary">Create Backup</button>
              <button className="btn-secondary">View Audit Logs</button>
              <button className="btn-danger">Clear Old Data</button>
            </div>
          </div>
        );

      case 'reports':
        return (
          <div className="settings-section">
            <h2>Reports & Analytics</h2>
            <div className="report-options">
              <button className="btn-secondary">Generate User Activity Report</button>
              <button className="btn-secondary">Generate Company Performance Report</button>
              <button className="btn-secondary">Generate Payroll Summary</button>
              <button className="btn-secondary">Export License Usage Report</button>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="settings-section">
            <h2>System Information</h2>
            <div className="system-info">
              <div className="info-item">
                <span className="label">Version:</span>
                <span className="value">1.0.0</span>
              </div>
              <div className="info-item">
                <span className="label">Last Updated:</span>
                <span className="value">December 14, 2025</span>
              </div>
              <div className="info-item">
                <span className="label">Database Status:</span>
                <span className="value status-healthy">Healthy</span>
              </div>
              <div className="info-item">
                <span className="label">API Status:</span>
                <span className="value status-healthy">Operational</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`settings-page ${theme}`}>
      <div className="settings-container">
        <div className="settings-sidebar">
          <h1>Settings</h1>
          <nav className="settings-nav">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="nav-icon" />
                  <span className="nav-label">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="settings-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;