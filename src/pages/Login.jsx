import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import localforage from 'localforage';
import { Fingerprint } from 'lucide-react';

const Login = () => {
    const { login, loginWithBiometrics, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasBiometrics, setHasBiometrics] = useState(false);

    // Check if device supports WebAuthn and has saved credentials
    useEffect(() => {
        const checkBiometrics = async () => {
            if (window.PublicKeyCredential) {
                const savedEmail = await localforage.getItem('saved_email');
                if (savedEmail) {
                    setHasBiometrics(true);
                }
            }
        };
        checkBiometrics();
    }, []);

    // If already logged in, go to dashboard
    useEffect(() => {
        if (user && !authLoading) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, authLoading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email.trim(), password);
            // navigate is handled by the useEffect above
        } catch (err) {
            console.error('Login error:', err);
            setError('Invalid email or password. Please try again.');
        }
        setLoading(false);
    };

    const handleBiometricLogin = async () => {
        setError('');
        try {
            await loginWithBiometrics();
            // navigate is handled by the useEffect above
        } catch (err) {
            console.error('Biometric login error:', err);
            setError(err.message || 'Biometric login failed. Please use password.');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            padding: '24px',
        }}>
            <main style={{
                width: '100%',
                maxWidth: '400px',
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '24px',
                padding: '48px 36px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px', height: '64px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: '28px',
                        boxShadow: '0 8px 24px rgba(245,158,11,0.4)',
                    }}>
                        💎
                    </div>
                    <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>
                        Mayilon Jewellers
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                        Sign in to access the shop
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 500 }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 500 }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '12px 16px',
                            background: 'rgba(239,68,68,0.15)',
                            border: '1px solid rgba(239,68,68,0.4)',
                            borderRadius: '10px',
                            color: '#fca5a5',
                            fontSize: '0.85rem',
                            marginBottom: '16px',
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: loading ? 'rgba(245,158,11,0.5)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '1rem',
                            fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: loading ? 'none' : '0 4px 16px rgba(245,158,11,0.4)',
                        }}
                    >
                        {loading ? 'Signing in…' : 'Sign In with Password'}
                    </button>
                </form>

                {hasBiometrics && (
                    <div style={{ marginTop: '24px' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.4)',
                            fontSize: '0.85rem', marginBottom: '20px'
                        }}>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                            <span>OR QUICK LOGIN</span>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                        </div>

                        <button
                            onClick={handleBiometricLogin}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                            }}
                        >
                            <Fingerprint size={22} color="#f59e0b" />
                            Use Touch ID / Face ID
                        </button>
                    </div>
                )}

                <p style={{ textAlign: 'center', marginTop: '24px', color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
                    Only authorized staff can access this system
                </p>
            </main>
        </div>
    );
};

export default Login;
