export default function PlatformLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header className="glass-panel" style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
                <h2 style={{ color: 'var(--primary)' }}>Z LMS</h2>
                <nav style={{ display: 'flex', gap: '20px' }}>
                    <a href="#features">Features</a>
                    <a href="#pricing">Pricing</a>
                    <a href="/admin" className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>Super Admin</a>
                </nav>
            </header>
            <main style={{ flex: 1 }}>{children}</main>
        </div>
    );
}
