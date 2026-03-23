import Link from 'next/link';

export default function PlatformHome() {
    return (
        <div className="animate-fade-in-up" style={{ textAlign: 'center', padding: '80px 20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', marginBottom: '20px', background: 'linear-gradient(45deg, var(--primary), #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}>
                The Ultimate White-Label LMS
            </h1>
            <p style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.2rem)', color: 'var(--text-muted)', marginBottom: '40px', lineHeight: 1.7, padding: '0 8px' }}>
                Launch your own branded learning platform in minutes. Scalable SaaS architecture with strict multi-tenant isolation.
            </p>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '60px', flexWrap: 'wrap' }}>
                <button className="btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>Get Started</button>
                <button className="btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem' }}>View Demo</button>
            </div>

            <div className="card glass-panel" style={{ textAlign: 'left', background: 'white' }}>
                <h3 style={{ marginBottom: '8px' }}>Multi-Tenant Examples (For Demo)</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>Try out the mock company portals below:</p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <li>
                        <Link href="/company/globalit" style={{ color: 'var(--primary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', wordBreak: 'break-word' }}>
                            🌐 Global IT Academy
                        </Link>
                    </li>
                    <li>
                        <Link href="/company/acme" style={{ color: 'var(--primary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', wordBreak: 'break-word' }}>
                            🚀 Acme Corp Sales
                        </Link>
                    </li>
                    <li>
                        <Link href="/company/travelpro" style={{ color: 'var(--primary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', wordBreak: 'break-word' }}>
                            ✈️ TravelPro Training
                        </Link>
                    </li>
                    <li>
                        <Link href="/company/medlearn" style={{ color: 'var(--primary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', wordBreak: 'break-word' }}>
                            🏥 MedLearn Institute
                        </Link>
                    </li>
                    <li>
                        <Link href="/company/skyline" style={{ color: 'var(--primary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', wordBreak: 'break-word' }}>
                            🏠 Skyline Real Estate
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
}
