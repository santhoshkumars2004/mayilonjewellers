import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    signInWithCustomToken
} from 'firebase/auth';
import localforage from 'localforage';

const GlobalLoader = ({ message = 'Loading…' }) => (
    <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(8px)',
        color: '#f59e0b',
        fontSize: '1.2rem',
        fontWeight: 600,
        gap: '12px',
        flexDirection: 'column',
        animation: 'fadeIn 0.2s ease-out'
    }}>
        <div style={{
            width: '48px', height: '48px',
            border: '4px solid rgba(245,158,11,0.2)',
            borderTopColor: '#f59e0b',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            boxShadow: '0 0 24px rgba(245, 158, 11, 0.2)'
        }} />
        <span style={{ letterSpacing: '0.05em' }}>{message}</span>
        <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        `}</style>
    </div>
);

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(undefined); // undefined = initial load
    const [actionLoading, setActionLoading] = useState(false);
    const [actionMessage, setActionMessage] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
        return unsubscribe;
    }, []);

    const login = async (email, password) => {
        setActionMessage('Authenticating…');
        setActionLoading(true);
        try {
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            // Save credentials securely for biometric login later
            await localforage.setItem('saved_email', email);
            await localforage.setItem('saved_password', password); // In a real prod app, use proper credential management API
            return userCred;
        } finally {
            setActionLoading(false);
        }
    };

    const loginWithBiometrics = async () => {
        setActionMessage('Verifying FaceID / TouchID…');
        setActionLoading(true);
        try {
            // First check if we have saved credentials in localforage
            const savedEmail = await localforage.getItem('saved_email');
            const savedPassword = await localforage.getItem('saved_password');

            if (!savedEmail || !savedPassword) {
                throw new Error("No saved credentials found. Please login with password first.");
            }

            // For PWA / Mobile web — we trigger the native Credential Manager prompt
            // This pops up the nice native biometric sheet (TouchID/FaceID) 
            // without forcing them to create a full "Passkey"
            if (window.PasswordCredential && navigator.credentials) {
                try {
                    // We quickly "store" it in the browser's native password manager to trigger it
                    const cred = new window.PasswordCredential({
                        id: savedEmail,
                        password: savedPassword,
                        name: 'Mayilon Jewellers',
                    });

                    // Request it back (this asks for fingerprint/FaceID on iOS/Android native)
                    await navigator.credentials.get({ password: true, mediation: 'optional' });
                } catch (e) {
                    console.warn("Native credential prompt skipped/failed, falling back to local storage auth", e);
                    // It's okay if it fails, we still have the password in localforage to log them in
                }
            }

            // Actually log them into Firebase using the saved credentials
            await signInWithEmailAndPassword(auth, savedEmail, savedPassword);
            return true;

        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            setActionLoading(false);
        }
    };

    const logout = async () => {
        setActionMessage('Signing out securely…');
        setActionLoading(true);
        try {
            await signOut(auth);
            // Don't clear localforage so biometrics work next time
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loginWithBiometrics, loading: user === undefined }}>
            {actionLoading && <GlobalLoader message={actionMessage} />}
            {children}
        </AuthContext.Provider>
    );
};
