import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, UserRole, UserStatus } from '../../types';
import { api } from '../../services/api';
import { ArrowLeftIcon } from '../Icons/Icons';
import Loading from '../Loading/Loading';
import NotificationOverlay from '../NotificationOverlay/NotificationOverlay';
import './EditUser.scss';

const EditUser = ({ theme }: { theme: 'light' | 'dark' }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: UserRole.EMPLOYEE,
    status: UserStatus.ACTIVE,
    basicSalary: 0,
    mobileMoneyNumber: '',
    team: '',
  });

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${id}`);
      const result = await response.json();
      
      if (result.success) {
        const user = result.data;
        setFormData({
          name: user.name || '',
          email: user.email || '',
          role: user.role || UserRole.EMPLOYEE,
          status: user.status || UserStatus.ACTIVE,
          basicSalary: user.basicSalary || 0,
          mobileMoneyNumber: user.mobileMoneyNumber || '',
          team: user.team || '',
        });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      const updatedUser = await api.updateUser(id!, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        basicSalary: parseFloat(formData.basicSalary.toString()),
        mobileMoneyNumber: formData.mobileMoneyNumber,
        team: formData.team,
      });

      setNotification({
        message: 'User updated successfully',
        type: 'success',
        isVisible: true
      });

      // Navigate back after a short delay
      setTimeout(() => {
        navigate(`/dashboard/users/${id}`);
      }, 1500);
    } catch (error) {
      console.error('Error updating user:', error);
      setNotification({
        message: error instanceof Error ? error.message : 'Failed to update user',
        type: 'error',
        isVisible: true
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'basicSalary' ? parseFloat(value) || 0 : value
    }));
  };

  if (loading) {
    return <Loading message="Loading user details..." />;
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

      <div className="edit-user">
        <div className="page-header">
          <button onClick={() => navigate(`/dashboard/users/${id}`)} className="back-btn">
            <ArrowLeftIcon className="icon" />
            Back
          </button>
          <h1>Edit User</h1>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-section">
            <h2>Personal Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="user@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="mobileMoneyNumber">Mobile Money Number</label>
                <input
                  type="text"
                  id="mobileMoneyNumber"
                  name="mobileMoneyNumber"
                  value={formData.mobileMoneyNumber}
                  onChange={handleChange}
                  placeholder="0XXXXXXXXX"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Employment Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value={UserRole.EMPLOYEE}>Employee</option>
                  <option value={UserRole.ADMIN}>Admin</option>
                  <option value={UserRole.HR}>HR</option>
                  <option value={UserRole.OPERATIONS}>Operations</option>
                  <option value={UserRole.PAYMENTS}>Payments</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="status">Status *</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value={UserStatus.ACTIVE}>Active</option>
                  <option value={UserStatus.INACTIVE}>Inactive</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="basicSalary">Basic Salary (GHS) *</label>
                <input
                  type="number"
                  id="basicSalary"
                  name="basicSalary"
                  value={formData.basicSalary}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="team">Team</label>
                <input
                  type="text"
                  id="team"
                  name="team"
                  value={formData.team}
                  onChange={handleChange}
                  placeholder="e.g., Engineering, Sales"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/users/${id}`)}
              className="cancel-btn"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditUser;
