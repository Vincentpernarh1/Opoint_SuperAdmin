import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import type { SuperAdmin } from '../../types';
import { api } from '../../services/api';
import { UserCircleIcon, ArrowLeftIcon } from '../Icons/Icons';
import Loading from '../Loading/Loading';
import NotificationOverlay from '../NotificationOverlay/NotificationOverlay';
import './EditSuperAdmin.scss';

const EditSuperAdmin = ({ theme }: { theme: 'light' | 'dark' }) => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [superAdmin, setSuperAdmin] = useState<SuperAdmin | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error';
        isVisible: boolean;
    } | null>(null);

    // Form state
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchSuperAdmin = async () => {
            if (!id) {
                setLoadError('Super admin ID is required');
                setLoading(false);
                return;
            }

            try {
                const adminData = await api.getSuperAdmin(id);
                setSuperAdmin(adminData);

                // Pre-populate form
                setEmail(adminData.email);
                setUsername(adminData.username);
            } catch (err) {
                console.error('Error fetching super admin:', err);
                setLoadError('Failed to load super admin details');
            } finally {
                setLoading(false);
            }
        };

        fetchSuperAdmin();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving || !superAdmin) return;

        setSaving(true);
        setNotification(null);

        const updates = {
            email,
            username
        };

        try {
            await api.updateSuperAdmin(superAdmin.id.toString(), updates);
            setNotification({
                message: 'Super admin updated successfully!',
                type: 'success',
                isVisible: true
            });
            setTimeout(() => navigate('/dashboard/superadmins'), 2000);
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
        return <Loading message="Loading super admin details..." size="large" fullScreen={true} />;
    }

    if (loadError && !superAdmin) {
        return (
            <div className="edit-super-admin">
                <header className="edit-super-admin__header">
                    <Link to="/dashboard/superadmins" className="edit-super-admin__back-link">
                        <ArrowLeftIcon className="edit-super-admin__back-icon" />
                        <span className="edit-super-admin__back-text">Back to Super Admins</span>
                    </Link>
                </header>
                <main className="edit-super-admin__main">
                    <div className="edit-super-admin__container">
                        <div className="edit-super-admin__error">
                            <h2>Error</h2>
                            <p>{loadError}</p>
                            <Link to="/dashboard/superadmins" className="edit-super-admin__btn edit-super-admin__btn--cancel">
                                Back to Super Admins
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="edit-super-admin">
            <header className="edit-super-admin__header">
                <Link to="/dashboard/superadmins" className="edit-super-admin__back-link">
                    <ArrowLeftIcon className="edit-super-admin__back-icon" />
                    <span className="edit-super-admin__back-text">Back to Super Admins</span>
                </Link>
            </header>
            <main className="edit-super-admin__main">
                <div className="edit-super-admin__container">
                    <form onSubmit={handleSubmit} className="edit-super-admin__form">
                        <div className="edit-super-admin__form-header">
                            <UserCircleIcon className="edit-super-admin__header-icon" />
                            <div>
                                <h1 className="edit-super-admin__title">Edit Super Admin</h1>
                                <p className="edit-super-admin__subtitle">Update super admin information.</p>
                            </div>
                        </div>

                        <div className="edit-super-admin__form-section">
                            <div className="edit-super-admin__field-group">
                                <label htmlFor="email" className="edit-super-admin__label">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="edit-super-admin__input"
                                    required
                                    disabled={saving}
                                />
                            </div>

                            <div className="edit-super-admin__field-group">
                                <label htmlFor="username" className="edit-super-admin__label">
                                    Username *
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="edit-super-admin__input"
                                    required
                                    disabled={saving}
                                />
                            </div>
                        </div>

                        <div className="edit-super-admin__form-actions">
                            <Link
                                to="/dashboard/superadmins"
                                className="edit-super-admin__btn edit-super-admin__btn--cancel"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="edit-super-admin__btn edit-super-admin__btn--save"
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {notification && (
                <NotificationOverlay
                    message={notification.message}
                    type={notification.type}
                    isVisible={notification.isVisible}
                    onClose={() => setNotification(null)}
                    theme={theme}
                />
            )}
        </div>
    );
};

export default EditSuperAdmin;