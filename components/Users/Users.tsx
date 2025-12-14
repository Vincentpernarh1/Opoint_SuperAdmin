import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { User, UserStatus, UserRole, Company } from '../../types';
import { api } from '../../services/api';
import {
  UsersIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  SearchIcon,
  BuildingOfficeIcon,
  UserCircleIcon
} from '../Icons/Icons';
import Notification from '../Notification/Notification';
import './Users.scss';

const Users = ({ theme }: { theme: 'light' | 'dark' }) => {
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<string | null>(null);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(filteredUsers.map(user => user.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleBulkActivate = async () => {
    try {
      await Promise.all(Array.from(selectedUsers).map(id => api.updateUser(id, { status: UserStatus.ACTIVE })));
      setNotification(`Activated ${selectedUsers.size} users`);
      setSelectedUsers(new Set());
      loadData();
    } catch (error) {
      console.error('Failed to activate users:', error);
      setNotification('Failed to activate users');
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      await Promise.all(Array.from(selectedUsers).map(id => api.updateUser(id, { status: UserStatus.INACTIVE })));
      setNotification(`Deactivated ${selectedUsers.size} users`);
      setSelectedUsers(new Set());
      loadData();
    } catch (error) {
      console.error('Failed to deactivate users:', error);
      setNotification('Failed to deactivate users');
    }
  };

  // Initialize filters from URL params
  useEffect(() => {
    const companyId = searchParams.get('companyId');
    const role = searchParams.get('role');

    if (companyId) {
      setCompanyFilter(companyId);
    }
    if (role && role === 'admin') {
      setRoleFilter(UserRole.ADMIN);
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, companiesData] = await Promise.all([
        api.getUsers(),
        api.getCompanies()
      ]);
      setUsers(usersData);
      setCompanies(companiesData);
    } catch (error) {
      setNotification('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (user: User) => {
    const newStatus = user.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;
    try {
      await api.updateUser(user.id, { status: newStatus });
      setUsers(prev => prev.map(u =>
        u.id === user.id ? { ...u, status: newStatus, updatedAt: new Date() } : u
      ));
      setNotification(`User "${user.name}" ${newStatus.toLowerCase()}`);
    } catch (error) {
      setNotification('Failed to update user status');
    }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Are you sure you want to delete "${user.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.deleteUser(user.id);
      setUsers(prev => prev.filter(u => u.id !== user.id));
      setNotification(`User "${user.name}" deleted successfully`);
    } catch (error) {
      setNotification('Failed to delete user');
    }
  };

  const getCompanyName = (companyId?: string) => {
    if (!companyId) return 'N/A';
    const company = companies.find(c => c.id === companyId);
    return company?.name || 'Unknown';
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.team.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesCompany = companyFilter === 'all' || user.companyId === companyFilter;
    return matchesSearch && matchesStatus && matchesRole && matchesCompany;
  });

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  const isFilteredMode = searchParams.get('companyId') && searchParams.get('role') === 'admin';
  const filteredCompanyName = isFilteredMode ? companies.find(c => c.id === searchParams.get('companyId'))?.name : null;

  return (
    <>
      {notification && (
        <Notification
          message={notification}
          type="success"
          onClose={() => setNotification(null)}
        />
      )}

      <div className={`users-page ${theme}`}>
        <div className="page-header">
          <div className="header-content">
            <UsersIcon className="page-header-icon" />
            <div>
              <h1 className="page-title">
                {isFilteredMode ? `Admin Users - ${filteredCompanyName || 'Company'}` : 'Users'}
              </h1>
              <p className="page-subtitle">
                {isFilteredMode
                  ? `Manage admin users for ${filteredCompanyName || 'selected company'}`
                  : 'Manage users across all companies'
                }
              </p>
              {isFilteredMode && (
                <Link to="/dashboard/users" className="back-link">
                  ← Back to All Users
                </Link>
              )}
            </div>
          </div>
          <Link to="/dashboard/users/add" className="add-user-btn">
            <PlusIcon className="btn-icon" />
            Add User
          </Link>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>


          <div className="filter-group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'all')}
              className="filter-select"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value={UserStatus.ACTIVE}>Active</option>
              <option value={UserStatus.INACTIVE}>Inactive</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
              className="filter-select"
              aria-label="Filter by role"
            >
              <option value="all">All Roles</option>
              {Object.values(UserRole).map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>

            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="filter-select"
              aria-label="Filter by company"
            >
              <option value="all">All Companies</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedUsers.size > 0 && (
          <div className="bulk-actions">
            <span className="selected-count">{selectedUsers.size} users selected</span>
            <div className="bulk-buttons">
              <button onClick={handleBulkActivate} className="bulk-btn activate">
                <CheckCircleIcon />
                Activate Selected
              </button>
              <button onClick={handleBulkDeactivate} className="bulk-btn deactivate">
                <XCircleIcon />
                Deactivate Selected
              </button>
            </div>
          </div>
        )}

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    aria-label="Select all users"
                  />
                </th>
                <th>User</th>
                <th>Role</th>
                <th>Company</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                      aria-label={`Select ${user.name}`}
                    />
                  </td>
                  <td className="user-cell">
                    <div className="user-info">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="user-avatar" />
                      ) : (
                        <UserCircleIcon className="user-avatar-icon" />
                      )}
                      <div className="user-details">
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                        <div className="user-team">{user.team}</div>
                      </div>
                    </div>
                  </td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>
                    <div className="company-info">
                      <BuildingOfficeIcon className="company-icon" />
                      {getCompanyName(user.companyId)}
                    </div>
                  </td>
                  <td>{getStatusBadge(user.status)}</td>
                  <td>
                    {user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}
                  </td>
                  <td>
                    <div className="actions">
                      <Link to={`/dashboard/users/${user.id}`} className="action-btn view" title="View">
                        <EyeIcon className="action-icon" />
                      </Link>
                      <Link to={`/dashboard/users/${user.id}/edit`} className="action-btn edit" title="Edit">
                        <PencilIcon className="action-icon" />
                      </Link>
                      <button
                        onClick={() => handleStatusToggle(user)}
                        className={`action-btn ${user.status === UserStatus.ACTIVE ? 'deactivate' : 'activate'}`}
                        title={user.status === UserStatus.ACTIVE ? 'Deactivate' : 'Activate'}
                      >
                        {user.status === UserStatus.ACTIVE ? <XCircleIcon className="action-icon" /> : <CheckCircleIcon className="action-icon" />}
                      </button>
                      <button onClick={() => handleDelete(user)} className="action-btn delete" title="Delete">
                        <TrashIcon className="action-icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <UsersIcon className="empty-icon" />
            <h3>No users found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Users;