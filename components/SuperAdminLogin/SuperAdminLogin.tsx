import React, { useState } from 'react';
import { LogoIcon, MailIcon, LockIcon, KeyIcon, EyeIcon, EyeSlashIcon } from '../Icons/Icons';
import { api } from '../../services/api';
import './SuperAdminLogin.scss';

interface SuperAdminLoginProps {
    onLogin: (email: string, password: string) => Promise<boolean>;
}

const SuperAdminLogin = ({ onLogin }: SuperAdminLoginProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [isResetting, setIsResetting] = useState(false);
    const [resetMessage, setResetMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        setError(null);
        setIsLoading(true);

        try {
            const success = await onLogin(email, password);
            if (!success) {
                const newFailedAttempts = failedAttempts + 1;
                setFailedAttempts(newFailedAttempts);
                setError(`Invalid Super Admin credentials. ${5 - newFailedAttempts} attempts remaining.`);
                
                if (newFailedAttempts >= 5) {
                    setShowResetPassword(true);
                    setError('Too many failed attempts. Please reset your password.');
                }
            } else {
                // Reset failed attempts on successful login
                setFailedAttempts(0);
                setShowResetPassword(false);
            }
        } catch (error) {
            setError('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isResetting) return;
        setResetMessage(null);
        setIsResetting(true);

        try {
            const result = await api.resetSuperAdminPassword(resetEmail || email);
            setResetMessage(`Password reset successful! Your temporary password is: ${result.tempPassword}`);
            setShowResetPassword(false);
            setFailedAttempts(0);
        } catch (error) {
            setResetMessage(error instanceof Error ? error.message : 'Failed to reset password');
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-content">
                <div className="login-card">
                <div className="login-header">
                    <div className="login-logo-container">
                        <LogoIcon className="login-logo" />
                    </div>
                    <h2 className="login-title">
                        Super Admin Portal
                    </h2>
                    <p className="login-subtitle">
                        Sign in to manage B2B client companies
                    </p>
                </div>
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email" className="sr-only">
                            Admin Email
                        </label>
                        <div className="input-icon">
                            <MailIcon />
                        </div>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="login-input"
                            placeholder="Admin Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password" className="sr-only">
                            Password
                        </label>
                        <div className="input-icon">
                            <LockIcon />
                        </div>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            required
                            className="login-input"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                        </button>
                    </div>

                    {error && (
                        <div className="error-message">
                            <p>{error}</p>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="login-button"
                        >
                            {isLoading ? (
                                <div className="button-spinner">
                                    <div></div>
                                    Signing in...
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </div>

                    {showResetPassword && (
                        <div className="reset-password-section">
                            <button
                                type="button"
                                onClick={() => setShowResetPassword(true)}
                                className="reset-password-button"
                            >
                                <KeyIcon className="reset-icon" />
                                Reset Password
                            </button>
                        </div>
                    )}

                    <div className="demo-info">
                        <p>
                            Demo credentials: <br />
                            <span className="demo-credentials">admin@vpena.com</span> / <span className="demo-credentials">superadminpassword</span>
                        </p>
                    </div>
                </form>
                </div>

                {showResetPassword && (
                    <div className="reset-password-modal">
                        <div className="reset-password-content">
                            <h3 className="reset-title">Reset Password</h3>
                            <p className="reset-description">
                                Enter your email address and we'll send you a temporary password.
                            </p>
                            
                            <form onSubmit={handleResetPassword} className="reset-form">
                                <div className="input-group">
                                    <label htmlFor="resetEmail" className="sr-only">
                                        Email Address
                                    </label>
                                    <div className="input-icon">
                                        <MailIcon />
                                    </div>
                                    <input
                                        id="resetEmail"
                                        name="resetEmail"
                                        type="email"
                                        required
                                        className="login-input"
                                        placeholder="Enter your email"
                                        value={resetEmail || email}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                    />
                                </div>

                                {resetMessage && (
                                    <div className={`reset-message ${resetMessage.includes('successful') ? 'success' : 'error'}`}>
                                        <p>{resetMessage}</p>
                                    </div>
                                )}

                                <div className="reset-actions">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowResetPassword(false);
                                            setResetMessage(null);
                                        }}
                                        className="reset-cancel-button"
                                        disabled={isResetting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isResetting}
                                        className="reset-submit-button"
                                    >
                                        {isResetting ? 'Resetting...' : 'Reset Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperAdminLogin;
