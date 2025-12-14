import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Company } from '../../types';
import { api } from '../../services/api';
import {
  BuildingOfficeIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  PencilIcon,
  UsersGroupIcon,
  MailIcon
} from '../Icons/Icons';
import Loading from '../Loading/Loading';
import './CompanyDetails.scss';

const CompanyDetails = ({ theme }: { theme: 'light' | 'dark' }) => {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!id) {
        console.log('No ID provided');
        return;
      }

      try {
        console.log('Fetching company with ID:', id);
        setLoading(true);
        const data = await api.getCompany(id);
        // console.log('Company data received:', data);
        setCompany(data);
      } catch (err) {
        console.error('Error fetching company:', err);
        setError('Failed to load company details');
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  console.log('CompanyDetails: about to render', { loading, error, company });

  if (loading) {
    return <Loading message="Loading company details..." size="large" fullScreen={true} />;
  }

  if (error || !company) {
    return (
      <div className="company-details-page">
        <div className="error">
          <h2>Error</h2>
          <p>{error || 'Company not found'}</p>
          <Link to="/dashboard/companies" className="back-link">
            <ArrowLeftIcon className="icon" />
            Back to Companies
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  };

  return (
    <div className="company-details-page">
      <div className="page-header">
        <Link to="/dashboard/companies" className="back-link">
          <ArrowLeftIcon className="icon" />
          Back to Companies
        </Link>
        <h1>{company.name}</h1>
        <div className="header-actions">
          <Link to={`/dashboard/companies/${company.id}/edit`} className="action-btn edit">
            <PencilIcon className="icon" />
            Edit Company
          </Link>
        </div>
      </div>

      <div className="company-details-content">
        <div className="details-grid">
          {/* Basic Information */}
          <div className="detail-card">
            <div className="card-header">
              <BuildingOfficeIcon className="card-icon" />
              <h3>Basic Information</h3>
            </div>
            <div className="card-content">
              <div className="detail-row">
                <span className="label">Company Name:</span>
                <span className="value">{company.name}</span>
              </div>
              <div className="detail-row">
                <span className="label">Registration ID:</span>
                <span className="value">{company.registrationId || 'Not provided'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Address:</span>
                <span className="value">{company.address || 'Not provided'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Description:</span>
                <span className="value">{company.description || 'No description'}</span>
              </div>
              {company.adminName && (
                <div className="detail-row">
                  <span className="label">Admin Name:</span>
                  <span className="value">{company.adminName}</span>
                </div>
              )}
              {company.adminEmail && (
                <div className="detail-row">
                  <span className="label">Admin Email:</span>
                  <span className="value">{company.adminEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* License Information */}
          <div className="detail-card">
            <div className="card-header">
              <UsersIcon className="card-icon" />
              <h3>License Information</h3>
            </div>
            <div className="card-content">
              <div className="detail-row">
                <span className="label">Total Licenses:</span>
                <span className="value">{company.licenseCount}</span>
              </div>
              <div className="detail-row">
                <span className="label">Used Licenses:</span>
                <span className="value">{company.usedLicenses}</span>
              </div>
              <div className="detail-row">
                <span className="label">Available Licenses:</span>
                <span className="value">{company.licenseCount - company.usedLicenses}</span>
              </div>
              <div className="license-usage">
                <div className="usage-bar">
                  <div
                    className={`usage-fill usage-${Math.round((company.usedLicenses / company.licenseCount) * 100)}`}
                  ></div>
                </div>
                <span className="usage-text">
                  {Math.round((company.usedLicenses / company.licenseCount) * 100)}% used
                </span>
              </div>
            </div>
          </div>

          {/* Status & Dates */}
          <div className="detail-card">
            <div className="card-header">
              <CheckCircleIcon className="card-icon" />
              <h3>Status & Timeline</h3>
            </div>
            <div className="card-content">
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className={`status-badge ${company.status.toLowerCase()}`}>
                  {company.status === 'Active' ? (
                    <><CheckCircleIcon className="status-icon" /> Active</>
                  ) : (
                    <><XCircleIcon className="status-icon" /> Inactive</>
                  )}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Created:</span>
                <span className="value">{formatDate(company.createdAt)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Last Updated:</span>
                <span className="value">{formatDate(company.updatedAt)}</span>
              </div>
            </div>


          </div>

           {/* Login Access */}
          <div className="detail-card">
            <div className="card-header">
              <BuildingOfficeIcon className="card-icon" />
              <h3>Login Access</h3>
            </div>
            <div className="card-content">
              {company.loginUrl && (
                <div className="login-access-section">
                  <div className="detail-row">
                    <span className="label">Login URL:</span>
                    <div className="url-container">
                      <input
                        type="text"
                        value={company.loginUrl}
                        readOnly
                        className="url-input"
                          aria-label="Login URL"
                        onClick={(e) => e.currentTarget.select()}
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(company.loginUrl!)}
                        className="copy-btn"
                        title="Copy URL"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  {company.tableName && (
                    <div className="detail-row">
                      <span className="label">Table Name:</span>
                      <div className="url-container">
                        <input
                          type="text"
                          aria-label="Login URL"
                          value={company.tableName}
                          readOnly
                          className="url-input"
                          onClick={(e) => e.currentTarget.select()}
                        />
                        <button
                          onClick={() => navigator.clipboard.writeText(company.tableName!)}
                          className="copy-btn"
                          title="Copy Table Name"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
                  {company.adminEmail && (
                    <div className="email-action">
                      <a
                        href={`mailto:${company.adminEmail}?subject=Company Login Link&body=Your login link: ${encodeURIComponent(company.loginUrl || '')}`}
                        className="email-btn"
                      >
                        <MailIcon className="email-icon" />
                        Send Login Link via Email
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          
          
          {/* Modules */}
          <div className="detail-card full-width">
            <div className="card-header">
              <BuildingOfficeIcon className="card-icon" />
              <h3>Enabled Modules</h3>
            </div>
            <div className="card-content">
              <div className="modules-grid">
                {Object.entries(company.modules).map(([module, enabled]) => (
                  <div key={module} className={`module-item ${enabled ? 'enabled' : 'disabled'}`}>
                    {enabled ? (
                      <CheckCircleIcon className="module-icon enabled" />
                    ) : (
                      <XCircleIcon className="module-icon disabled" />
                    )}
                    <span className="module-name">
                      {module.charAt(0).toUpperCase() + module.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>


        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <Link to={`/dashboard/users?companyId=${company.id}&role=admin`} className="action-card">
              <UsersGroupIcon className="action-icon" />
              <span>View Admin Users</span>
            </Link>
            <Link to={`/dashboard/users?companyId=${company.id}`} className="action-card">
              <UsersIcon className="action-icon" />
              <span>View All Users</span>
            </Link>
            <Link to={`/dashboard/companies/${company.id}/edit`} className="action-card">
              <PencilIcon className="action-icon" />
              <span>Edit Company</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;