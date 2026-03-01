import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const LandingPage = () => {
    return (
        <main className="landing-page">
            {/* Particles */}
            <div className="landing-particles" aria-hidden="true">
                {[...Array(15)].map((_, i) => (
                    <span key={i} className="particle" style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 6}s`,
                        animationDuration: `${3 + Math.random() * 4}s`,
                    }} />
                ))}
            </div>

            {/* ===== LEFT PANEL — Deity ===== */}
            <section className="landing-panel landing-panel--left">
                <div className="panel-inner">
                    <img
                        src="/deity.png"
                        alt="Lord Murugan — Divine Blessing"
                        className="deity-image"
                    />
                    {/* Corner accents */}
                    <span className="frame-corner frame-corner--tl" aria-hidden="true" />
                    <span className="frame-corner frame-corner--tr" aria-hidden="true" />
                    <span className="frame-corner frame-corner--bl" aria-hidden="true" />
                    <span className="frame-corner frame-corner--br" aria-hidden="true" />
                </div>
            </section>

            {/* Vertical divider */}
            <div className="landing-divider-vertical" aria-hidden="true">
                <span className="divider-line" />
                <span className="divider-gem">◆</span>
                <span className="divider-line" />
            </div>

            {/* ===== RIGHT PANEL — Brand ===== */}
            <section className="landing-panel landing-panel--right">
                <div className="brand-inner">
                    {/* Logo */}
                    <div className="logo-wrap">
                        <div className="logo-glow" aria-hidden="true" />
                        <img
                            src="/logo.png"
                            alt="Mayilon Jewellers Peacock Logo"
                            className="brand-logo"
                        />
                    </div>

                    {/* Name */}
                    <h1 className="brand-title">
                        <span className="brand-title--main">Mayilon</span>
                        <span className="brand-title--sub">Jewellers</span>
                    </h1>

                    {/* Divider */}
                    <div className="brand-rule" aria-hidden="true">
                        <span className="brand-rule-line" />
                        <span className="brand-rule-icon">◆</span>
                        <span className="brand-rule-line" />
                    </div>

                    {/* Tagline */}
                    <p className="brand-tagline">
                        <Sparkles size={14} />
                        Trusted Jewellery Since Generations
                        <Sparkles size={14} />
                    </p>

                    {/* CTA */}
                    <Link to="/dashboard" className="brand-cta">
                        <span>Enter Shop</span>
                        <ArrowRight size={20} className="cta-arrow" />
                    </Link>

                    <p className="brand-footer">Gold &bull; Silver &bull; Diamonds &bull; Precious Gems</p>
                </div>
            </section>
        </main>
    );
};

export default LandingPage;
