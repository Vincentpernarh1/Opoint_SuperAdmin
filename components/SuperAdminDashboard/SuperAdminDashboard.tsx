import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Company } from '../../types';
import { api } from '../../services/api';
import {
  BuildingOfficeIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  ArrowRightIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ShieldCheckIcon
} from '../Icons/Icons';
import Loading from '../Loading/Loading';
import './SuperAdminDashboard.scss';

interface SuperAdminDashboardProps {
    currentUser: User;
    theme: 'light' | 'dark';
}

const SuperAdminDashboard = ({ currentUser, theme }: SuperAdminDashboardProps) => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [companiesData, usersData] = await Promise.all([
                api.getCompanies(),
                api.getUsers()
            ]);
            setCompanies(companiesData);
            setUsers(usersData);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const activeCompanies = companies.filter(c => c.status === 'Active');
    const inactiveCompanies = companies.filter(c => c.status === 'Inactive');
    const activeUsers = users.filter(u => u.status === 'Active');
    const totalLicenses = companies.reduce((sum, c) => sum + c.licenseCount, 0);
    const usedLicenses = companies.reduce((sum, c) => sum + c.usedLicenses, 0);

    if (loading) {
        return <Loading message="Loading dashboard..." size="large" fullScreen={true} />;
    }

    return (
        <div className={`dashboard-page ${theme}`}>
            <div className="dashboard-header">
                <div className="header-content">
                    <ChartBarIcon className="dashboard-header-icon" />
                    <div>
                        <h1 className="dashboard-title">Dashboard Overview</h1>
                        <p className="dashboard-subtitle">Welcome back, {currentUser.name}</p>
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon companies">
                        <BuildingOfficeIcon />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{companies.length}</div>
                        <div className="stat-label">Total Companies</div>
                        <div className="stat-breakdown">
                            <span className="active">{activeCompanies.length} Active</span>
                            <span className="inactive">{inactiveCompanies.length} Inactive</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon users">
                        <UsersIcon />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{users.length}</div>
                        <div className="stat-label">Total Users</div>
                        <div className="stat-breakdown">
                            <span className="active">{activeUsers.length} Active</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon licenses">
                        <CheckCircleIcon />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{usedLicenses}/{totalLicenses}</div>
                        <div className="stat-label">License Usage</div>
                        <div className="stat-breakdown">
                            <span className="usage">{Math.round((usedLicenses / totalLicenses) * 100)}% Used</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon modules">
                        <ChartBarIcon />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">
                            {companies.reduce((sum, c) => sum + Object.values(c.modules).filter(Boolean).length, 0)}
                        </div>
                        <div className="stat-label">Active Modules</div>
                        <div className="stat-breakdown">
                            <span className="modules-count">Across all companies</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-sections">
                <div className="section">
                    <div className="section-header">
                        <h2 className="section-title">Recent Companies</h2>
                        <Link to="/dashboard/companies" className="section-link">
                            View All <ArrowRightIcon className="link-icon" />
                        </Link>
                    </div>
                    <div className="companies-preview">
                        {companies.slice(0, 3).map(company => (
                            <div key={company.id} className="company-preview-card">
                                <div className="company-header">
                                    <BuildingOfficeIcon className="company-icon" />
                                    <div>
                                        <h3 className="company-name">{company.name}</h3>
                                        <span className={`company-status ${company.status.toLowerCase()}`}>
                                            {company.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="company-stats">
                                    <span className="stat">{company.usedLicenses}/{company.licenseCount} licenses</span>
                                    <span className="stat">{Object.values(company.modules).filter(Boolean).length} modules</span>
                                </div>
                                <Link to={`/dashboard/companies/${company.id}`} className="company-link">
                                    View Details
                                </Link>
                            </div>
                        ))}
                        {companies.length === 0 && (
                            <div className="empty-preview">
                                <BuildingOfficeIcon className="empty-icon" />
                                <p>No companies yet</p>
                                <Link to="/dashboard/companies/add" className="add-link">
                                    <PlusIcon className="add-icon" />
                                    Add First Company
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="section">
                    <div className="section-header">
                        <h2 className="section-title">Quick Actions</h2>
                    </div>
                    <div className="quick-actions">
                        <Link to="/dashboard/companies/add" className="action-card">
                            <div className="action-icon">
                                <PlusIcon />
                            </div>
                            <div className="action-content">
                                <h3>Add Company</h3>
                                <p>Onboard a new client company</p>
                            </div>
                        </Link>

                        <Link to="/dashboard/users" className="action-card">
                            <div className="action-icon">
                                <UsersIcon />
                            </div>
                            <div className="action-content">
                                <h3>Manage Users</h3>
                                <p>View and manage all users</p>
                            </div>
                        </Link>

                        <Link to="/dashboard/superadmins" className="action-card">
                            <div className="action-icon">
                                <ShieldCheckIcon />
                            </div>
                            <div className="action-content">
                                <h3>Super Admins</h3>
                                <p>Manage super administrator accounts</p>
                            </div>
                        </Link>

                        <Link to="/dashboard/settings" className="action-card">
                            <div className="action-icon">
                                <Cog6ToothIcon />
                            </div>
                            <div className="action-content">
                                <h3>Settings</h3>
                                <p>Configure system settings</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;