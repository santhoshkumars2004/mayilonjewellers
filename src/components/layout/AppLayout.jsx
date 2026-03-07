import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import InstallPrompt from '../common/InstallPrompt';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    ShoppingCart,
    TrendingUp,
    Package,
    FileText,
    Wallet,
    Settings,
    Menu,
    X,
    Users,
    LogOut,
} from 'lucide-react';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/sales', icon: ShoppingCart, label: 'Sales' },
    { to: '/purchase', icon: TrendingUp, label: 'Purchase' },
    { to: '/stock', icon: Package, label: 'Inventory' },
    { to: '/billing', icon: FileText, label: 'Billing' },

    { to: '/expenses', icon: Wallet, label: 'Expenses' },
    { to: '/dealers', icon: Users, label: 'Dealers' },
    { to: '/settings', icon: Settings, label: 'Settings' },
];

const AppLayout = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const { logout, user } = useAuth();

    // Close mobile menu on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    return (
        <>
            {/* ===== TOP NAVBAR ===== */}
            <header className="navbar">
                <nav className="navbar-inner">
                    {/* Brand */}
                    <NavLink to="/" className="navbar-brand">
                        <img
                            src="/logo.png"
                            alt="Mayilon Jewellers"
                            className="navbar-logo"
                            width="40"
                            height="40"
                        />
                        <span className="navbar-brand-text">Mayilon Jewellers</span>
                    </NavLink>

                    {/* Desktop Navigation Links */}
                    <ul className="navbar-links">
                        {navItems.map((item) => (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `navbar-link ${isActive ? 'navbar-link--active' : ''}`
                                    }
                                >
                                    <item.icon size={16} />
                                    <span>{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>

                    {/* Mobile Hamburger + Logout */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                            onClick={logout}
                            title={`Sign out (${user?.email})`}
                            style={{
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: '8px',
                                padding: '7px 10px',
                                cursor: 'pointer',
                                color: '#ef4444',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                            }}
                        >
                            <LogOut size={15} />
                            <span className="navbar-logout-label">Sign out</span>
                        </button>
                        <button
                            className="navbar-hamburger"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={menuOpen}
                        >
                            {menuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </nav>
            </header>

            {/* ===== MOBILE OVERLAY MENU ===== */}
            <div
                className={`mobile-menu-overlay ${menuOpen ? 'mobile-menu-overlay--open' : ''}`}
                aria-hidden={!menuOpen}
            >
                <nav className="mobile-menu-nav">
                    <ul className="mobile-menu-list">
                        {navItems.map((item, index) => (
                            <li
                                key={item.to}
                                className="mobile-menu-item"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <NavLink
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `mobile-menu-link ${isActive ? 'mobile-menu-link--active' : ''}`
                                    }
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <item.icon size={22} />
                                    <span>{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                        {/* Logout in mobile menu */}
                        <li className="mobile-menu-item" style={{ animationDelay: `${navItems.length * 0.05}s` }}>
                            <button
                                onClick={logout}
                                className="mobile-menu-link"
                                style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                            >
                                <LogOut size={22} />
                                <span>Sign Out</span>
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>

            {/* ===== MAIN CONTENT ===== */}
            <div className="app-content">
                <main className="main-content">
                    <Outlet />
                </main>
            </div>

            {/* ===== PWA Install Prompt ===== */}
            <InstallPrompt />
        </>
    );
};

export default AppLayout;
