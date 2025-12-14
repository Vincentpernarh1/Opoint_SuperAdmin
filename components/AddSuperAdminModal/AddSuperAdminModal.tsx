import React, { useState } from 'react';
import { XIcon, UserCircleIcon, MailIcon, LockIcon } from '../Icons/Icons';
import './AddSuperAdminModal.scss';

interface AddSuperAdminModalProps {
    onClose: () => void;
    onSubmit: (data: { email: string; username: string; password: string }) => void;
    isLoading: boolean;
    error: string | null;
}

const AddSuperAdminModal = ({ onClose, onSubmit, isLoading, error }: AddSuperAdminModalProps) => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        if (password !== confirmPassword) {
            return;
        }
        onSubmit({ email, username, password });
    };

    return (
        <div className="add-super-admin-modal__overlay">
            <div className="add-super-admin-modal__content" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="add-super-admin-modal__header">
                        <button onClick={onClose} disabled={isLoading} className="add-super-admin-modal__close-btn" aria-label="Close">
                            <XIcon className="add-super-admin-modal__close-icon" />
                        </button>
                        <h3 className="add-super-admin-modal__title">Add New Super Admin</h3>
                        <p className="add-super-admin-modal__subtitle">Create a new super administrator account.</p>
                    </div>
                    <fieldset disabled={isLoading} className="add-super-admin-modal__form-body">
                        <div className="add-super-admin-modal__form-group">
                            <label htmlFor="email" className="add-super-admin-modal__label">Email</label>
                            <div className="add-super-admin-modal__input-container">
                                <MailIcon className="add-super-admin-modal__input-icon" />
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="add-super-admin-modal__input"
                                    placeholder="admin@example.com"
                                    required
                                />
                            </div>
                        </div>
                        <div className="add-super-admin-modal__form-group">
                            <label htmlFor="username" className="add-super-admin-modal__label">Username</label>
                            <div className="add-super-admin-modal__input-container">
                                <UserCircleIcon className="add-super-admin-modal__input-icon" />
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="add-super-admin-modal__input"
                                    placeholder="adminuser"
                                    required
                                />
                            </div>
                        </div>
                        <div className="add-super-admin-modal__form-group">
                            <label htmlFor="password" className="add-super-admin-modal__label">Password</label>
                            <div className="add-super-admin-modal__input-container">
                                <LockIcon className="add-super-admin-modal__input-icon" />
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="add-super-admin-modal__input"
                                    placeholder="Enter password"
                                    required
                                />
                            </div>
                        </div>
                        <div className="add-super-admin-modal__form-group">
                            <label htmlFor="confirmPassword" className="add-super-admin-modal__label">Confirm Password</label>
                            <div className="add-super-admin-modal__input-container">
                                <LockIcon className="add-super-admin-modal__input-icon" />
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="add-super-admin-modal__input"
                                    placeholder="Confirm password"
                                    required
                                />
                            </div>
                            {password !== confirmPassword && confirmPassword && (
                                <p className="add-super-admin-modal__error-text">Passwords do not match</p>
                            )}
                        </div>
                        {error && (
                            <div className="add-super-admin-modal__error-message">
                                <p>{error}</p>
                            </div>
                        )}
                        <div className="add-super-admin-modal__actions">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="add-super-admin-modal__btn add-super-admin-modal__btn--cancel"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || password !== confirmPassword}
                                className="add-super-admin-modal__btn add-super-admin-modal__btn--submit"
                            >
                                {isLoading ? 'Creating...' : 'Create Super Admin'}
                            </button>
                        </div>
                    </fieldset>
                </form>
            </div>
        </div>
    );
};

export default AddSuperAdminModal;