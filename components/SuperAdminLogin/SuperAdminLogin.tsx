import React, { useState } from 'react';
import { LogoIcon, MailIcon, LockIcon } from '../Icons/Icons';
import './SuperAdminLogin.scss';

interface SuperAdminLoginProps {
    onLogin: (email: string, password: string) => Promise<boolean>;
}

const SuperAdminLogin = ({ onLogin }: SuperAdminLoginProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        setError(null);
        setIsLoading(true);

        try {
            const success = await onLogin(email, password);
            if (!success) {
                setError('Invalid Super Admin credentials.');
            }
        } catch (error) {
            setError('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
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
                            type="password"
                            autoComplete="current-password"
                            required
                            className="login-input"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
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

                    <div className="demo-info">
                        <p>
                            Demo credentials: <br />
                            <span className="demo-credentials">admin@vpena.com</span> / <span className="demo-credentials">superadminpassword</span>
                        </p>
                    </div>
                </form>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminLogin;
