import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Show banner after a short delay so it doesn't appear immediately
            setTimeout(() => setShowBanner(true), 2000);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Listen for successful install
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowBanner(false);
            setDeferredPrompt(null);
        });

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowBanner(false);
        }
        setDeferredPrompt(null);
    };

    const dismiss = () => {
        setShowBanner(false);
        // Don't show again for this session
        sessionStorage.setItem('pwa-dismissed', 'true');
    };

    // Don't show if already installed, dismissed this session, or no prompt available
    if (isInstalled || !showBanner || sessionStorage.getItem('pwa-dismissed')) return null;

    return (
        <aside className="install-banner" role="alert" aria-label="Install application">
            <div className="install-banner-content">
                <div className="install-banner-icon">
                    <Smartphone size={22} />
                    <Monitor size={22} />
                </div>
                <div className="install-banner-text">
                    <strong>Install Mayilon Jewellers</strong>
                    <p>Get the app on your phone or laptop — works offline!</p>
                </div>
            </div>
            <div className="install-banner-actions">
                <button className="install-banner-btn install-banner-btn--install" onClick={handleInstall}>
                    <Download size={16} /> Install App
                </button>
                <button className="install-banner-btn install-banner-btn--dismiss" onClick={dismiss} aria-label="Dismiss">
                    <X size={16} />
                </button>
            </div>
        </aside>
    );
};

export default InstallPrompt;
