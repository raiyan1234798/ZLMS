import { getCompanyBySubdomain } from '@/data/mockDb';
import { notFound } from 'next/navigation';

export default async function TenantLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ domain: string }>;
}) {
    const { domain } = await params;
    const company = getCompanyBySubdomain(domain);

    if (!company) {
        notFound();
    }

    return (
        <div style={{
            /* CSS Variables injected via inline style to allow dynamic white-labeling */
            '--tenant-primary': company.branding.themeColor,
            '--tenant-primary-hover': company.branding.themeColor + 'cc',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
        } as React.CSSProperties}>
            <header className="glass-panel" style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
                <h2 style={{ color: 'var(--tenant-primary)', fontWeight: 'bold' }}>{company.name}</h2>
                <nav style={{ display: 'flex', gap: '20px' }}>
                    <a href="/login" className="btn-primary" style={{ backgroundColor: 'var(--tenant-primary)', padding: '8px 16px', fontSize: '14px' }}>Login to {company.name}</a>
                </nav>
            </header>
            <main style={{ flex: 1, backgroundColor: 'var(--background)' }}>
                {children}
            </main>
        </div>
    );
}
