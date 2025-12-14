import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SuperAdmin } from '../../types';
import { api } from '../../services/api';
import {
  UsersIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  SearchIcon,
  UserCircleIcon,
  MailIcon,
  CalendarIcon
} from '../Icons/Icons';
import AddSuperAdminModal from '../AddSuperAdminModal/AddSuperAdminModal';
import Notification from '../Notification/Notification';
import Loading from '../Loading/Loading';
import NotificationOverlay from '../NotificationOverlay/NotificationOverlay';
import './SuperAdmins.scss';

const SuperAdmins = ({ theme }: { theme: 'light' | 'dark' }) => {
  const navigate = useNavigate();
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
  } | null>(null);

  useEffect(() => {
    loadSuperAdmins();
  }, []);

  const loadSuperAdmins = async () => {
    try {
      const data = await api.getSuperAdmins();
      setSuperAdmins(data);
    } catch (error) {
      console.error('Failed to load super admins:', error);
      setNotification({
        message: 'Failed to load super admins',
        type: 'error',
        isVisible: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuperAdmin = async (data: { email: string; username: string; password: string }) => {
    setIsCreating(true);
    setCreateError(null);
    try {
      const newAdmin = await api.createSuperAdmin(data);
      setSuperAdmins(prev => [...prev, newAdmin]);
      setShowAddModal(false);
      setNotification({
        message: 'Super admin created successfully',
        type: 'success',
        isVisible: true
      });
    } catch (error) {
      console.error('Failed to create super admin:', error);
      setCreateError(error instanceof Error ? error.message : 'Failed to create super admin');
    } finally {
      setIsCreating(false);
    }
  };

  const handleViewSuperAdmin = (admin: SuperAdmin) => {
    // Navigate to super admin details/edit page
    navigate(`/dashboard/superadmins/${admin.id}/edit`);
  };

  const handleEditSuperAdmin = (admin: SuperAdmin) => {
    // Navigate to super admin edit page
    navigate(`/dashboard/superadmins/${admin.id}/edit`);
  };

  const handleDeleteSuperAdmin = async (admin: SuperAdmin) => {
    if (!window.confirm(`Are you sure you want to delete super admin "${admin.username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.deleteSuperAdmin(admin.id.toString());
      setSuperAdmins(prev => prev.filter(a => a.id !== admin.id));
      setNotification({
        message: 'Super admin deleted successfully',
        type: 'success',
        isVisible: true
      });
    } catch (error: any) {
      setNotification({
        message: 'Failed to delete super admin',
        type: 'error',
        isVisible: true
      });
    }
  };

  const filteredAdmins = superAdmins.filter(admin =>
    admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading message="Loading super admins..." size="large" fullScreen={true} />;
  }

  return (
    <div className={`super-admins-page ${theme}`}>
      {notification && (
        <NotificationOverlay
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          isVisible={notification.isVisible}
          theme={theme}
        />
      )}

      <div className="super-admins-header">
        <div className="header-content">
          <UsersIcon className="super-admins-header-icon" />
          <div>
            <h1 className="super-admins-title">Super Admins</h1>
            <p className="super-admins-subtitle">Manage super administrator accounts</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="add-super-admin-btn"
        >
          <PlusIcon className="add-icon" />
          Add Super Admin
        </button>
      </div>

      <div className="super-admins-controls">
        <div className="search-container">
          <SearchIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="super-admins-table-container">
        <table className="super-admins-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Created</th>
              <th>Last Access</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins.map(admin => (
              <tr key={admin.id}>
                <td>
                  <div className="admin-info">
                    <UserCircleIcon className="admin-avatar" />
                    <span className="admin-username">{admin.username}</span>
                  </div>
                </td>
                <td>
                  <div className="admin-email">
                    <MailIcon className="email-icon" />
                    {admin.email}
                  </div>
                </td>
                <td>
                  <div className="admin-date">
                    <CalendarIcon className="date-icon" />
                    {admin.date_created.toLocaleDateString()}
                  </div>
                </td>
                <td>
                  <div className="admin-date">
                    {admin.last_access_time ? (
                      <>
                        <CalendarIcon className="date-icon" />
                        {admin.last_access_time.toLocaleDateString()}
                      </>
                    ) : (
                      <span className="no-access">Never</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="actions">
                    <button 
                      className="action-btn view-btn" 
                      title="View details"
                      onClick={() => handleViewSuperAdmin(admin)}
                    >
                      <EyeIcon />
                    </button>
                    <button 
                      className="action-btn edit-btn" 
                      title="Edit admin"
                      onClick={() => handleEditSuperAdmin(admin)}
                    >
                      <PencilIcon />
                    </button>
                    <button 
                      className="action-btn delete-btn" 
                      title="Delete admin"
                      onClick={() => handleDeleteSuperAdmin(admin)}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAdmins.length === 0 && (
          <div className="empty-state">
            <UsersIcon className="empty-icon" />
            <h3>No super admins found</h3>
            <p>
              {searchTerm
                ? 'No super admins match your search criteria.'
                : 'Get started by creating your first super admin account.'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddModal(true)}
                className="add-first-admin-btn"
              >
                <PlusIcon className="add-icon" />
                Add First Super Admin
              </button>
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddSuperAdminModal
          onClose={() => {
            setShowAddModal(false);
            setCreateError(null);
          }}
          onSubmit={handleCreateSuperAdmin}
          isLoading={isCreating}
          error={createError}
        />
      )}
    </div>
  );
};

export default SuperAdmins;