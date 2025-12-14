import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import type { Company } from '../../types';
import { api } from '../../services/api';
import { BuildingOfficeIcon, ArrowLeftIcon } from '../Icons/Icons';
import Loading from '../Loading/Loading';
import NotificationOverlay from '../NotificationOverlay/NotificationOverlay';
import './EditCompanyPage.scss';

const EditCompanyPage = ({ theme }: { theme: 'light' | 'dark' }) => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error';
        isVisible: boolean;
    } | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [licenseCount, setLicenseCount] = useState(10);
    const [registrationId, setRegistrationId] = useState('');
    const [address, setAddress] = useState('');
    const [modules, setModules] = useState({
        payroll: true,
        leave: true,
        expenses: true,
        reports: true,
        announcements: true,
    });

    useEffect(() => {
        const fetchCompany = async () => {
            if (!id) {
                setLoadError('Company ID is required');
                setLoading(false);
                return;
            }

            try {
                const companyData = await api.getCompany(id);
                setCompany(companyData);

                // Pre-populate form
                setName(companyData.name);
                setLicenseCount(companyData.licenseCount);
                setRegistrationId(companyData.registrationId || '');
                setAddress(companyData.address || '');
                setModules(companyData.modules);
            } catch (err) {
                console.error('Error fetching company:', err);
                setLoadError('Failed to load company details');
            } finally {
                setLoading(false);
            }
        };

        fetchCompany();
    }, [id]);

    const handleModuleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setModules(prev => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving || !company) return;

        setSaving(true);
        setNotification(null);

        const updates = {
            name,
            licenseCount,
            registrationId,
            address,
            modules
        };

        try {
            await api.updateCompany(company.id, updates);
            setNotification({
                message: 'Company updated successfully!',
                type: 'success',
                isVisible: true
            });
            setTimeout(() => navigate(`/dashboard/companies/${company.id}`), 2000);
        } catch (err: unknown) {
            setNotification({
                message: err instanceof Error ? err.message : 'An unexpected error occurred.',
                type: 'error',
                isVisible: true
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Loading message="Loading company details..." size="large" fullScreen={true} />;
    }

    if (loadError && !company) {
        return (
            <div className="edit-company-page">
                <header className="edit-company-page__header">
                    <Link to="/dashboard/companies" className="edit-company-page__back-link">
                        <ArrowLeftIcon className="edit-company-page__back-icon" />
                        <span className="edit-company-page__back-text">Back to Companies</span>
                    </Link>
                </header>
                <main className="edit-company-page__main">
                    <div className="edit-company-page__container">
                        <div className="edit-company-page__error">
                            <h2>Error</h2>
                            <p>{loadError}</p>
                            <Link to="/dashboard/companies" className="edit-company-page__btn edit-company-page__btn--cancel">
                                Back to Companies
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const moduleKeys = Object.keys(modules) as (keyof typeof modules)[];

    return (
        <div className="edit-company-page">
            <header className="edit-company-page__header">
                <Link to={`/dashboard/companies/${company?.id}`} className="edit-company-page__back-link">
                    <ArrowLeftIcon className="edit-company-page__back-icon" />
                    <span className="edit-company-page__back-text">Back to Company Details</span>
                </Link>
            </header>
            <main className="edit-company-page__main">
                <div className="edit-company-page__container">
                    <form onSubmit={handleSubmit} className="edit-company-page__form">
                        <div className="edit-company-page__form-header">
                            <BuildingOfficeIcon className="edit-company-page__header-icon" />
                            <div>
                                <h1 className="edit-company-page__title">Edit Company</h1>
                                <p className="edit-company-page__subtitle">Update company information and settings.</p>
                            </div>
                        </div>
                        <fieldset disabled={saving} className="edit-company-page__form-body">
                            <div className="edit-company-page__form-section">
                                <div className="edit-company-page__form-column">
                                    <h3 className="edit-company-page__column-title">Company Details</h3>
                                    <div className="edit-company-page__form-group">
                                        <label htmlFor="companyName" className="edit-company-page__label">Company Name</label>
                                        <input
                                            type="text"
                                            id="companyName"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            required
                                            className="edit-company-page__input"
                                        />
                                    </div>
                                    <div className="edit-company-page__form-group">
                                        <label htmlFor="licenseCount" className="edit-company-page__label">Employee Licenses</label>
                                        <input
                                            type="number"
                                            id="licenseCount"
                                            value={licenseCount}
                                            onChange={e => setLicenseCount(parseInt(e.target.value, 10))}
                                            required
                                            className="edit-company-page__input"
                                        />
                                    </div>
                                    <div className="edit-company-page__form-group">
                                        <label htmlFor="registrationId" className="edit-company-page__label">Registration ID</label>
                                        <input
                                            type="text"
                                            id="registrationId"
                                            value={registrationId}
                                            onChange={e => setRegistrationId(e.target.value)}
                                            required
                                            className="edit-company-page__input"
                                        />
                                    </div>
                                    <div className="edit-company-page__form-group">
                                        <label htmlFor="address" className="edit-company-page__label">Address</label>
                                        <input
                                            type="text"
                                            id="address"
                                            value={address}
                                            onChange={e => setAddress(e.target.value)}
                                            className="edit-company-page__input"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="edit-company-page__module-section">
                                <label className="edit-company-page__label">Enabled Modules</label>
                                <div className="edit-company-page__module-grid">
                                    {moduleKeys.map(key => (
                                        <label key={key} className="edit-company-page__module-item">
                                            <input
                                                type="checkbox"
                                                name={key}
                                                checked={modules[key]}
                                                onChange={handleModuleChange}
                                                className="edit-company-page__checkbox"
                                            />
                                            <span className="edit-company-page__module-label">{key}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </fieldset>
                        <div className="edit-company-page__footer">
                            <div className="edit-company-page__actions">
                                <Link to={`/dashboard/companies/${company?.id}`} className="edit-company-page__btn edit-company-page__btn--cancel">
                                    Cancel
                                </Link>
                                <button type="submit" disabled={saving} className="edit-company-page__btn edit-company-page__btn--submit">
                                    {saving ? (
                                        <div className="edit-company-page__loader">
                                            <div className="edit-company-page__spinner"></div>
                                            <span>Updating...</span>
                                        </div>
                                    ) : (
                                        'Update Company'
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
            <NotificationOverlay
                message={notification?.message || ''}
                type={notification?.type || 'success'}
                isVisible={notification?.isVisible || false}
                onClose={() => setNotification(null)}
                theme={theme}
            />
        </div>
    );
};

export default EditCompanyPage;