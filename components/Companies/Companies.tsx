import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Company, CompanyStatus } from '../../types';
import { api } from '../../services/api';
import {
  BuildingOfficeIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
  UsersGroupIcon,
  SearchIcon
} from '../Icons/Icons';
import Loading from '../Loading/Loading';
import NotificationOverlay from '../NotificationOverlay/NotificationOverlay';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import './Companies.scss';

const Companies = ({ theme }: { theme: 'light' | 'dark' }) => {
//   console.log('Companies component rendered');
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | 'all'>('all');
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
  } | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<{
    isVisible: boolean;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCompanies(new Set(filteredCompanies.map(company => company.id)));
    } else {
      setSelectedCompanies(new Set());
    }
  };

  const handleSelectCompany = (companyId: string, checked: boolean) => {
    const newSelected = new Set(selectedCompanies);
    if (checked) {
      newSelected.add(companyId);
    } else {
      newSelected.delete(companyId);
    }
    setSelectedCompanies(newSelected);
  };

  const handleBulkActivate = async () => {
    try {
      await Promise.all(Array.from(selectedCompanies).map(id => api.updateCompany(id, { status: CompanyStatus.ACTIVE })));
      setNotification({
        message: `Activated ${selectedCompanies.size} companies`,
        type: 'success',
        isVisible: true
      });
      setSelectedCompanies(new Set());
      loadCompanies();
    } catch (error) {
      console.error('Failed to activate companies:', error);
      setNotification({
        message: 'Failed to activate companies',
        type: 'error',
        isVisible: true
      });
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      await Promise.all(Array.from(selectedCompanies).map(id => api.updateCompany(id, { status: CompanyStatus.INACTIVE })));
      setNotification({
        message: `Deactivated ${selectedCompanies.size} companies`,
        type: 'success',
        isVisible: true
      });
      setSelectedCompanies(new Set());
      loadCompanies();
    } catch (error) {
      console.error('Failed to deactivate companies:', error);
      setNotification({
        message: 'Failed to deactivate companies',
        type: 'error',
        isVisible: true
      });
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await api.getCompanies();
      setCompanies(data);
    } catch (error) {
      setNotification({
        message: 'Failed to load companies',
        type: 'error',
        isVisible: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = (company: Company) => {
    const isActivating = company.status === CompanyStatus.INACTIVE;
    const action = isActivating ? 'activate' : 'deactivate';
    setConfirmationModal({
      isVisible: true,
      message: `Are you sure you want to ${action} "${company.name}"?`,
      onConfirm: async () => {
        const newStatus = isActivating ? CompanyStatus.ACTIVE : CompanyStatus.INACTIVE;
        try {
          await api.updateCompany(company.id, { status: newStatus });
          setCompanies(prev => prev.map(c =>
            c.id === company.id ? { ...c, status: newStatus, updatedAt: new Date() } : c
          ));
          setNotification({
            message: `Company "${company.name}" ${newStatus.toLowerCase()}`,
            type: 'success',
            isVisible: true
          });
        } catch (error) {
          setNotification({
            message: 'Failed to update company status',
            type: 'error',
            isVisible: true
          });
        }
        setConfirmationModal(null);
      }
    });
  };

  const handleDelete = (company: Company) => {
    setConfirmationModal({
      isVisible: true,
      message: `Are you sure you want to delete "${company.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await api.deleteCompany(company.id);
          setCompanies(prev => prev.filter(c => c.id !== company.id));
          setNotification({
            message: `Company "${company.name}" deleted successfully`,
            type: 'success',
            isVisible: true
          });
        } catch (error) {
          setNotification({
            message: 'Failed to delete company',
            type: 'error',
            isVisible: true
          });
        }
        setConfirmationModal(null);
      }
    });
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (company.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: CompanyStatus) => {
    return status === CompanyStatus.ACTIVE ? (
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

  if (loading) {
    return <Loading message="Loading companies..." size="large" fullScreen={true} />;
  }

  return (
    <>
      <NotificationOverlay
        message={notification?.message || ''}
        type={notification?.type || 'success'}
        isVisible={notification?.isVisible || false}
        onClose={() => setNotification(null)}
        theme={theme}
      />

      <ConfirmationModal
        isVisible={confirmationModal?.isVisible || false}
        message={confirmationModal?.message || ''}
        onConfirm={confirmationModal?.onConfirm || (() => {})}
        onCancel={() => setConfirmationModal(null)}
        theme={theme}
      />

      <div className={`companies-page ${theme}`}>
        <div className="page-header">
          <div className="header-content">
            <BuildingOfficeIcon className="page-header-icon" />
            <div>
              <h1 className="page-title">Companies</h1>
              <p className="page-subtitle">Manage your client companies and their access permissions</p>
            </div>
          </div>
          <Link to="/dashboard/companies/add" className="add-company-btn">
            <PlusIcon className="btn-icon" />
            Add Company
          </Link>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-select">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CompanyStatus | 'all')}
              className="status-filter"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value={CompanyStatus.ACTIVE}>Active</option>
              <option value={CompanyStatus.INACTIVE}>Inactive</option>
            </select>
          </div>
        </div>

        {selectedCompanies.size > 0 && (
          <div className="bulk-actions">
            <span className="selected-count">{selectedCompanies.size} companies selected</span>
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

        <div className="companies-grid">
          {filteredCompanies.map(company => (
            <div key={company.id} className="company-card">
              <div className="card-header">
                <div className="company-select">
                  <input
                    type="checkbox"
                    checked={selectedCompanies.has(company.id)}
                    onChange={(e) => handleSelectCompany(company.id, e.target.checked)}
                    aria-label={`Select ${company.name}`}
                  />
                </div>
                <div className="company-info">
                  <BuildingOfficeIcon className="company-icon" />
                  <div className="company-details">
                    <h3 className="company-name">{company.name}</h3>
                    {getStatusBadge(company.status)}
                  </div>
                </div>
              </div>

              <div className="card-body">
                {company.description && (
                  <p className="company-description">{company.description}</p>
                )}
                <div className="company-meta">
                  {company.registrationId && (
                    <p className="company-registration-id">
                      <span className="meta-label">Reg ID:</span> {company.registrationId}
                    </p>
                  )}
                  {company.adminName && (
                    <p className="company-admin">
                      <span className="meta-label">Admin:</span> {company.adminName}
                    </p>
                  )}
                  {company.address && (
                    <p className="company-address">
                      <span className="meta-label">Address:</span> {company.address}
                    </p>
                  )}
                </div>
              </div>

              <div className="card-stats">
                <div className="stat">
                  <UsersIcon className="stat-icon" />
                  <span className="stat-value">{company.usedLicenses}/{company.licenseCount}</span>
                  <span className="stat-label">Licenses</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{Object.values(company.modules).filter(Boolean).length}</span>
                  <span className="stat-label">Modules</span>
                </div>
              </div>

              <div className="card-actions">
                <Link to={`/dashboard/companies/${company.id}`} className="action-btn view">
                  <EyeIcon className="action-icon" />
                  View
                </Link>
                <Link to={`/dashboard/users?companyId=${company.id}&role=admin`} className="action-btn admin-users">
                  <UsersGroupIcon className="action-icon" />
                  Admin Users
                </Link>
                <Link to={`/dashboard/companies/${company.id}/edit`} className="action-btn edit">
                  <PencilIcon className="action-icon" />
                  Edit
                </Link>
                <button
                  onClick={() => handleStatusToggle(company)}
                  className={`action-btn ${company.status === CompanyStatus.ACTIVE ? 'deactivate' : 'activate'}`}
                >
                  {company.status === CompanyStatus.ACTIVE ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => handleDelete(company)} className="action-btn delete">
                  <TrashIcon className="action-icon" />
                  Delete
                </button>
              </div>

              <div className="card-footer">
                <span className="updated-date">
                  Updated: {(company.updatedAt && company.updatedAt instanceof Date && !isNaN(company.updatedAt.getTime())) ? company.updatedAt.toLocaleDateString() : (company.createdAt && company.createdAt instanceof Date && !isNaN(company.createdAt.getTime())) ? company.createdAt.toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="empty-state">
            <BuildingOfficeIcon className="empty-icon" />
            <h3>No companies found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Companies;