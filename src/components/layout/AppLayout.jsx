import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingCart,
    TrendingUp,
    Package,
    FileText,
    IndianRupee,
    Settings,
    Gem,
    Menu,
    X
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/sales', icon: ShoppingCart, label: 'Sales' },
    { to: '/purchase', icon: TrendingUp, label: 'Purchase' },
    { to: '/stock', icon: Package, label: 'Inventory' },
    { to: '/billing', icon: FileText, label: 'Billing' },
    { to: '/accounts', icon: IndianRupee, label: 'Accounts' },
    { to: '/settings', icon: Settings, label: 'Settings' },
];

// Bottom Navigation for Mobile
const BottomNav = () => {
    const location = useLocation();
    const mainItems = navItems.slice(0, 5); // Show only main 5 items

    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: '#1F2937',
            borderTop: '1px solid #374151',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '8px 0',
            zIndex: 100,
        }}>
            {mainItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '2px',
                            padding: '4px 8px',
                            color: isActive ? '#F59E0B' : '#9CA3AF',
                            textDecoration: 'none',
                            fontSize: '0.65rem',
                            fontWeight: 500,
                        }}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                );
            })}
        </nav>
    );
};

// Desktop Sidebar
const Sidebar = ({ isOpen, onClose }) => {
    const { getSetting } = useShop();
    const shopName = getSetting('shopName') || 'Mayilon Jewellers';

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 40,
                        display: 'none',
                    }}
                    className="mobile-overlay"
                />
            )}

            <aside
                style={{
                    width: '260px',
                    minWidth: '260px',
                    background: 'linear-gradient(180deg, #1F2937 0%, #111827 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRight: '1px solid #374151',
                    height: '100vh',
                    position: 'relative',
                    zIndex: 50,
                }}
                className="desktop-sidebar"
            >
                {/* Logo */}
                <div style={{ padding: '20px', borderBottom: '1px solid #374151' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Gem size={22} color="#FFF" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1rem', fontWeight: 700, color: '#FBBF24', lineHeight: 1.2 }}>
                                {shopName}
                            </h1>
                            <p style={{ fontSize: '0.65rem', color: '#6B7280' }}>Management System</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={onClose}
                                style={({ isActive }) => ({
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: isActive ? '#F59E0B' : '#9CA3AF',
                                    background: isActive ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                                    borderLeft: isActive ? '3px solid #F59E0B' : '3px solid transparent',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s ease',
                                })}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                </nav>

                <div style={{ padding: '12px 16px', borderTop: '1px solid #374151', fontSize: '0.7rem', color: '#6B7280' }}>
                    v1.0.0 • © 2026
                </div>
            </aside>
        </>
    );
};

// Mobile Header
const MobileHeader = ({ onMenuClick }) => {
    const { getSetting } = useShop();
    const shopName = getSetting('shopName') || 'Mayilon Jewellers';

    return (
        <header
            style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: '#1F2937',
                borderBottom: '1px solid #374151',
                position: 'sticky',
                top: 0,
                zIndex: 30,
            }}
            className="mobile-header"
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Gem size={18} color="#FFF" />
                </div>
                <span style={{ fontWeight: 600, color: '#FBBF24', fontSize: '0.9rem' }}>{shopName}</span>
            </div>
            <button
                onClick={onMenuClick}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', padding: '4px' }}
            >
                <Settings size={20} />
            </button>
        </header>
    );
};

const AppLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <>
            <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-header { display: flex !important; }
          .mobile-overlay { display: block !important; }
          .main-content { 
            padding-bottom: 70px !important; 
          }
          .bottom-nav-wrapper { display: block !important; }
        }
        @media (min-width: 769px) {
          .bottom-nav-wrapper { display: none !important; }
          .mobile-header { display: none !important; }
        }
      `}</style>

            <div style={{ display: 'flex', minHeight: '100vh', background: '#F3F4F6' }}>
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <MobileHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                    <main
                        className="main-content"
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            background: '#F9FAFB',
                        }}
                    >
                        <Outlet />
                    </main>
                </div>
            </div>

            <div className="bottom-nav-wrapper">
                <BottomNav />
            </div>
        </>
    );
};

export default AppLayout;
