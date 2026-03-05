import Link from 'next/link';

export default function PlatformHome() {
    return (
        <div style={{ textAlign: 'center', padding: '100px 20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '4rem', marginBottom: '20px', background: 'linear-gradient(45deg, var(--primary), #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                The Ultimate White-Label LMS
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '40px' }}>
                Launch your own branded learning platform in minutes. Scalable SaaS architecture with strict multi-tenant isolation.
            </p>

            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '80px' }}>
                <button className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>Get Started</button>
                <button className="btn-secondary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>View Demo</button>
            </div>

            <div className="card glass-panel" style={{ textAlign: 'left', background: 'white' }}>
                <h3>Multi-Tenant Examples (For Demo)</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Try out the mock company subdomains below:</p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <li>
                        <a href="http://globalit.localhost:3000" style={{ color: 'var(--primary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🌐 globalit.localhost:3000 (Global IT Academy)
                        </a>
                    </li>
                    <li>
                        <a href="http://acme.localhost:3000" style={{ color: 'var(--primary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🚀 acme.localhost:3000 (Acme Corp Sales)
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
}
