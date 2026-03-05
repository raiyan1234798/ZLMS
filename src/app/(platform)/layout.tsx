'use client';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/authContext';

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, loading } = useAuth();

    const isSuperAdmin = user?.email === 'abubackerraiyan@gmail.com';

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header className="glass-panel" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', position: 'relative', zIndex: 50 }}>
                <h2 style={{ color: 'var(--primary)', fontSize: '1.3rem' }}>Z LMS</h2>

                {/* Desktop nav */}
                <nav className="desktop-nav" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <a href="#features" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Features</a>
                    <a href="#pricing" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Pricing</a>
                    {!loading && isSuperAdmin && (
                        <a href="/admin" className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>Dashboard</a>
                    )}
                </nav>

                {/* Mobile hamburger */}
                <button
                    className="mobile-nav-toggle"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle navigation menu"
                    style={{ display: 'none', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)' }}
                >
                    {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                {/* Mobile dropdown */}
                {menuOpen && (
                    <div className="mobile-dropdown" style={{
                        position: 'absolute', top: '100%', left: 0, right: 0,
                        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
                        padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '16px',
                        boxShadow: 'var(--shadow-lg)', zIndex: 100
                    }}>
                        <a href="#features" onClick={() => setMenuOpen(false)} style={{ color: 'var(--foreground)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500, padding: '8px 0' }}>Features</a>
                        <a href="#pricing" onClick={() => setMenuOpen(false)} style={{ color: 'var(--foreground)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500, padding: '8px 0' }}>Pricing</a>
                        {!loading && isSuperAdmin && (
                            <a href="/admin" className="btn-primary" style={{ padding: '10px 16px', fontSize: '0.9rem', textAlign: 'center' }}>Dashboard</a>
                        )}
                    </div>
                )}
            </header>
            <main style={{ flex: 1 }}>{children}</main>

            <style>{`
                @media (max-width: 768px) {
                    .desktop-nav { display: none !important; }
                    .mobile-nav-toggle { display: flex !important; }
                }
            `}</style>
        </div>
    );
}
