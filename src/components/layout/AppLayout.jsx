import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingCart,
    TrendingUp,
    Package,
    FileText,
    IndianRupee,
    Settings,
    Menu,
    X,
} from 'lucide-react';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/sales', icon: ShoppingCart, label: 'Sales' },
    { to: '/purchase', icon: TrendingUp, label: 'Purchase' },
    { to: '/stock', icon: Package, label: 'Inventory' },
    { to: '/billing', icon: FileText, label: 'Billing' },
    { to: '/accounts', icon: IndianRupee, label: 'Accounts' },
    { to: '/settings', icon: Settings, label: 'Settings' },
];

const AppLayout = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

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

                    {/* Mobile Hamburger */}
                    <button
                        className="navbar-hamburger"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={menuOpen}
                    >
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
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
                    </ul>
                </nav>
            </div>

            {/* ===== MAIN CONTENT ===== */}
            <div className="app-content">
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </>
    );
};

export default AppLayout;
