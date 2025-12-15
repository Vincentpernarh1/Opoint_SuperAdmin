import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { NewCompanyData } from '../../types';
import { api } from '../../services/api';
import { UserCircleIcon, MailIcon, ArrowLeftIcon, BuildingOfficeIcon } from '../Icons/Icons';
import NotificationOverlay from '../NotificationOverlay/NotificationOverlay';
import Loading from '../Loading/Loading';
import { encrypt } from '../../utils/encryption';
import './AddCompanyPage.scss';

const AddCompanyPage = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [licenseCount, setLicenseCount] = useState(10);
    const [registrationId, setRegistrationId] = useState('');
    const [address, setAddress] = useState('');
    const [adminName, setAdminName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [modules, setModules] = useState({
        payroll: true,
        leave: true,
        expenses: true,
        reports: true,
        announcements: true,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error';
        isVisible: boolean;
    } | null>(null);

    const handleModuleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setModules(prev => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);
        setNotification(null);

        const data: NewCompanyData = { name, licenseCount, registrationId, address, modules, adminName, adminEmail };

        try {
            const result = await api.createCompanyAndAdmin(data);
            const encryptedId = encrypt(result.company.id);
            console.log('Company ID:', result.company.id);
            console.log('Encrypted ID:', encryptedId);
            const baseUrl = process.env.REACT_APP_BASE_URL || 'https://yourapp.com'; // Set your base URL in env
            const loginUrl = `${baseUrl}/${encryptedId}/login`;
            const successMessage = `Company "${result.company.name}" onboarded successfully! Admin details stored in company record. Share this login link with the admin: ${loginUrl}`;
            setNotification({
                message: successMessage,
                type: 'success',
                isVisible: true
            });
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err: unknown) {
            setNotification({
                message: err instanceof Error ? err.message : 'An unexpected error occurred.',
                type: 'error',
                isVisible: true
            });
        } finally {
            setIsLoading(false);
        }
    };

    const moduleKeys = Object.keys(modules) as (keyof typeof modules)[];

    return (
        <div className="add-company-page">
            {isLoading && <Loading fullScreen message="Creating company and admin account..." />}
            <NotificationOverlay
                message={notification?.message || ''}
                type={notification?.type || 'success'}
                isVisible={notification?.isVisible || false}
                onClose={() => setNotification(null)}
                autoClose={notification?.type !== 'success'}
            />
            <header className="add-company-page__header">
                <Link to="/dashboard/companies" className="add-company-page__back-link">
                    <ArrowLeftIcon className="add-company-page__back-icon" />
                    <span className="add-company-page__back-text">Back to Companies</span>
                </Link>
            </header>
            <main className="add-company-page__main">
                <div className="add-company-page__container">
                    <form onSubmit={handleSubmit} className="add-company-page__form">
                        <div className="add-company-page__form-header">
                            <BuildingOfficeIcon className="add-company-page__header-icon" />
                            <div>
                                <h1 className="add-company-page__title">Onboard New Company</h1>
                                <p className="add-company-page__subtitle">Create a new client company and their first administrator account.</p>
                            </div>
                        </div>
                        <fieldset disabled={isLoading} className="add-company-page__form-body">
                            <div className="add-company-page__form-section">
                                <div className="add-company-page__form-column">
                                    <h3 className="add-company-page__column-title">Company Details</h3>
                                    <div className="add-company-page__form-group">
                                        <label htmlFor="companyName" className="add-company-page__label">Company Name</label>
                                        <input type="text" id="companyName" value={name} onChange={e => setName(e.target.value)} required className="add-company-page__input" />
                                    </div>
                                    <div className="add-company-page__form-group">
                                        <label htmlFor="licenseCount" className="add-company-page__label">Employee Licenses</label>
                                        <input type="number" id="licenseCount" value={licenseCount} onChange={e => setLicenseCount(parseInt(e.target.value, 10))} required className="add-company-page__input" />
                                    </div>
                                    <div className="add-company-page__form-group">
                                        <label htmlFor="registrationId" className="add-company-page__label">Registration ID</label>
                                        <input type="text" id="registrationId" value={registrationId} onChange={e => setRegistrationId(e.target.value)} required className="add-company-page__input" />
                                    </div>
                                    <div className="add-company-page__form-group">
                                        <label htmlFor="address" className="add-company-page__label">Address</label>
                                        <input type="text" id="address" value={address} onChange={e => setAddress(e.target.value)} className="add-company-page__input" />
                                    </div>
                                </div>
                                <div className="add-company-page__form-column">
                                    <h3 className="add-company-page__column-title">Administrator Account</h3>
                                    <div className="add-company-page__form-group">
                                        <label htmlFor="adminName" className="add-company-page__label">Administrator Name</label>
                                        <div className="add-company-page__input-container">
                                            <UserCircleIcon className="add-company-page__input-icon" />
                                            <input type="text" id="adminName" value={adminName} onChange={e => setAdminName(e.target.value)} required placeholder="e.g., Jane Doe" className="add-company-page__input add-company-page__input--with-icon" />
                                        </div>
                                    </div>
                                    <div className="add-company-page__form-group">
                                        <label htmlFor="adminEmail" className="add-company-page__label">Administrator Email</label>
                                        <div className="add-company-page__input-container">
                                            <MailIcon className="add-company-page__input-icon" />
                                            <input type="email" id="adminEmail" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} required placeholder="admin@company.com" className="add-company-page__input add-company-page__input--with-icon" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="add-company-page__module-section">
                                <label className="add-company-page__label">Enabled Modules</label>
                                <div className="add-company-page__module-grid">
                                    {moduleKeys.map(key => (
                                        <label key={key} className="add-company-page__module-item">
                                            <input type="checkbox" name={key} checked={modules[key]} onChange={handleModuleChange} className="add-company-page__checkbox" />
                                            <span className="add-company-page__module-label">{key}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </fieldset>
                        <div className="add-company-page__footer">
                            <div className="add-company-page__actions">
                                <Link to="/dashboard/companies" className="add-company-page__btn add-company-page__btn--cancel">Cancel</Link>
                                <button type="submit" disabled={isLoading} className="add-company-page__btn add-company-page__btn--submit">
                                    {isLoading ? (
                                        <div className="add-company-page__loader">
                                            <div className="add-company-page__spinner"></div>
                                            <span>Onboarding...</span>
                                        </div>
                                    ) : (
                                        'Add Company & Create Admin'
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default AddCompanyPage;
