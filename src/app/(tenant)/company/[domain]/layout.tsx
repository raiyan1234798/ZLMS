import { MOCK_COMPANIES } from '@/data/mockDb';

export const runtime = 'edge';

function getMockCompany(domain: string) {
    return MOCK_COMPANIES.find(c => c.subdomain === domain) || null;
}

export default async function TenantLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ domain: string }>;
}) {
    const { domain } = await params;
    const mockCompany = getMockCompany(domain);

    const themeColor = mockCompany?.branding.themeColor || '#4f46e5';
    const companyName = mockCompany?.name || domain.charAt(0).toUpperCase() + domain.slice(1);

    return (
        <div style={{
            '--tenant-primary': themeColor,
            '--tenant-primary-hover': themeColor + 'cc',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
        } as React.CSSProperties}>
            <header className="glass-panel" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', flexWrap: 'wrap', gap: '8px' }}>
                <h2 style={{ color: 'var(--tenant-primary)', fontWeight: 'bold', fontSize: 'clamp(1rem, 3vw, 1.3rem)' }}>{companyName}</h2>
                <nav style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <a href={`/company/${domain}/login`} className="btn-primary" style={{ backgroundColor: 'var(--tenant-primary)', padding: '8px 14px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Login to {companyName}</a>
                </nav>
            </header>
            <main style={{ flex: 1, backgroundColor: 'var(--background)' }}>
                {children}
            </main>
        </div>
    );
}
