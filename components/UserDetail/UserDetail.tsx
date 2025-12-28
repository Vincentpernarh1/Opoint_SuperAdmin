import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { User, UserStatus, UserRole } from '../../types';
import { api } from '../../services/api';
import {
  UserCircleIcon,
  BuildingOfficeIcon,
  MailIcon,
  SmartphoneIcon,
  CalendarIcon,
  DollarSignIcon,
  ArrowLeftIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '../Icons/Icons';
import Loading from '../Loading/Loading';
import NotificationOverlay from '../NotificationOverlay/NotificationOverlay';
import './UserDetail.scss';

const UserDetail = ({ theme }: { theme: 'light' | 'dark' }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
  } | null>(null);

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${id}`);
      const result = await response.json();
      
      if (result.success) {
        setUser(result.data);
      } else {
        setNotification({
          message: 'Failed to load user details',
          type: 'error',
          isVisible: true
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setNotification({
        message: 'Failed to load user details',
        type: 'error',
        isVisible: true
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    return status === UserStatus.ACTIVE ? (
      <span className="status-badge active">
        <CheckCircleIcon className="status-icon" />
        Active
      </span>
    ) : (
      <span className="status-badge inactive">
        <XCircleIcon className="status-icon" />
        Inactive
      </span>
    );
  };

  const getRoleBadge = (role: UserRole) => {
    const roleColors = {
      [UserRole.EMPLOYEE]: 'employee',
      [UserRole.ADMIN]: 'admin',
      [UserRole.HR]: 'hr',
      [UserRole.OPERATIONS]: 'operations',
      [UserRole.PAYMENTS]: 'payments',
      [UserRole.SUPER_ADMIN]: 'super-admin',
    };

    return (
      <span className={`role-badge ${roleColors[role]}`}>
        {role}
      </span>
    );
  };

  if (loading) {
    return <Loading message="Loading user details..." />;
  }

  if (!user) {
    return (
      <div className="user-detail">
        <div className="error-state">
          <h2>User not found</h2>
          <button onClick={() => navigate('/dashboard/users')} className="back-btn">
            <ArrowLeftIcon className="icon" />
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {notification && (
        <NotificationOverlay
          message={notification.message}
          type={notification.type}
          isVisible={notification.isVisible}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="user-detail">
        <div className="page-header">
          <button onClick={() => navigate('/dashboard/users')} className="back-btn">
            <ArrowLeftIcon className="icon" />
            Back to Users
          </button>
          <h1>User Details</h1>
          <Link to={`/dashboard/users/${user.id}/edit`} className="edit-btn">
            <PencilIcon className="icon" />
            Edit User
          </Link>
        </div>

        <div className="user-card">
          <div className="user-header">
            <div className="user-avatar">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} />
              ) : (
                <UserCircleIcon className="avatar-icon" />
              )}
            </div>
            <div className="user-info">
              <h2>{user.name}</h2>
              <div className="user-meta">
                {getRoleBadge(user.role)}
                {getStatusBadge(user.status)}
              </div>
            </div>
          </div>

          <div className="user-details">
            <div className="detail-section">
              <h3>Contact Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">
                    <MailIcon className="icon" />
                    Email
                  </div>
                  <div className="detail-value">{user.email}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">
                    <SmartphoneIcon className="icon" />
                    Mobile Money Number
                  </div>
                  <div className="detail-value">
                    {user.mobileMoneyNumber || 'Not provided'}
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Employment Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">
                    <BuildingOfficeIcon className="icon" />
                    Company
                  </div>
                  <div className="detail-value">{user.companyName || 'N/A'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">
                    <CalendarIcon className="icon" />
                    Hire Date
                  </div>
                  <div className="detail-value">
                    {user.hireDate ? user.hireDate.toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">
                    <DollarSignIcon className="icon" />
                    Basic Salary
                  </div>
                  <div className="detail-value">
                    GHS {user.basicSalary?.toLocaleString() || '0'}
                  </div>
                </div>
                {user.team && (
                  <div className="detail-item">
                    <div className="detail-label">Team</div>
                    <div className="detail-value">{user.team}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="detail-section">
              <h3>Account Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">
                    <CalendarIcon className="icon" />
                    Last Login
                  </div>
                  <div className="detail-value">
                    {user.lastLogin ? user.lastLogin.toLocaleString() : 'Never'}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">
                    <CalendarIcon className="icon" />
                    Created At
                  </div>
                  <div className="detail-value">
                    {user.createdAt.toLocaleString()}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">
                    <CalendarIcon className="icon" />
                    Updated At
                  </div>
                  <div className="detail-value">
                    {user.updatedAt.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDetail;
