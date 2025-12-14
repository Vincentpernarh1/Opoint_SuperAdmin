
import React, { useState } from 'react';
import type { NewCompanyData } from '../../types';
import { XIcon, UserCircleIcon, MailIcon } from '../Icons/Icons';
import './AddCompanyModal.scss';

interface AddCompanyModalProps {
    onClose: () => void;
    onSubmit: (data: NewCompanyData) => void;
    isLoading: boolean;
    error: string | null;
}

const AddCompanyModal = ({ onClose, onSubmit, isLoading, error }: AddCompanyModalProps) => {
    const [name, setName] = useState('');
    const [licenseCount, setLicenseCount] = useState(10);
    const [adminName, setAdminName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [modules, setModules] = useState({
        payroll: true,
        leave: true,
        expenses: true,
        reports: true,
        announcements: true,
    });

    const handleModuleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setModules(prev => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        onSubmit({ name, licenseCount, modules, adminName, adminEmail });
    };

    const moduleKeys = Object.keys(modules) as (keyof typeof modules)[];

    return (
        <div className="add-company-modal__overlay">
            <div className="add-company-modal__content" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="add-company-modal__header">
                        <button onClick={onClose} disabled={isLoading} className="add-company-modal__close-btn" aria-label="Close">
                            <XIcon className="add-company-modal__close-icon" />
                        </button>
                        <h3 className="add-company-modal__title">Onboard New Company</h3>
                        <p className="add-company-modal__subtitle">Enter company details and create the initial administrator account.</p>
                    </div>
                    <fieldset disabled={isLoading} className="add-company-modal__form-body">
                        <div className="add-company-modal__form-section">
                            {/* Column 1: Company Info */}
                            <div className="add-company-modal__form-group">
                                <label htmlFor="companyName" className="add-company-modal__label">Company Name</label>
                                <input type="text" id="companyName" value={name} onChange={e => setName(e.target.value)} required className="add-company-modal__input" />
                            </div>
                            <div className="add-company-modal__form-group">
                                <label htmlFor="licenseCount" className="add-company-modal__label">Employee Licenses</label>
                                <input type="number" id="licenseCount" value={licenseCount} onChange={e => setLicenseCount(parseInt(e.target.value, 10))} required className="add-company-modal__input" />
                            </div>
                            {/* Column 2: Admin Info */}
                            <div className="add-company-modal__form-group">
                                <label htmlFor="adminName" className="add-company-modal__label">Administrator Name</label>
                                <div className="add-company-modal__input-container">
                                    <UserCircleIcon className="add-company-modal__input-icon" />
                                    <input type="text" id="adminName" value={adminName} onChange={e => setAdminName(e.target.value)} required placeholder="e.g., Jane Doe" className="add-company-modal__input add-company-modal__input--with-icon" />
                                </div>
                            </div>
                            <div className="add-company-modal__form-group">
                                <label htmlFor="adminEmail" className="add-company-modal__label">Administrator Email</label>
                                <div className="add-company-modal__input-container">
                                    <MailIcon className="add-company-modal__input-icon" />
                                    <input type="email" id="adminEmail" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} required placeholder="admin@company.com" className="add-company-modal__input add-company-modal__input--with-icon" />
                                </div>
                            </div>
                        </div>
                        <div className="add-company-modal__module-section">
                            <label className="add-company-modal__label">Enabled Modules</label>
                            <div className="add-company-modal__module-grid">
                                {moduleKeys.map(key => (
                                    <label key={key} className="add-company-modal__module-item">
                                        <input type="checkbox" name={key} checked={modules[key]} onChange={handleModuleChange} className="add-company-modal__checkbox" />
                                        <span className="add-company-modal__module-label">{key}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </fieldset>
                    <div className="add-company-modal__footer">
                        <div className="add-company-modal__error-message">
                            {error && (
                                <p role="alert">{error}</p>
                            )}
                        </div>
                        <div className="add-company-modal__actions">
                            <button type="button" onClick={onClose} disabled={isLoading} className="add-company-modal__btn add-company-modal__btn--cancel">Cancel</button>
                            <button type="submit" disabled={isLoading} className="add-company-modal__btn add-company-modal__btn--submit">
                                {isLoading ? (
                                    <div className="add-company-modal__loader">
                                        <div className="add-company-modal__spinner"></div>
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
        </div>
    );
};

export default AddCompanyModal;