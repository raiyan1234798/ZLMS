
import { getCompanyBySubdomain } from '@/data/mockDb';
import Link from 'next/link';

export default async function TenantLandingPage({
    params
}: {
    params: Promise<{ domain: string }>;
}) {
    const { domain } = await params;
    const company = getCompanyBySubdomain(domain);

    const themeColor = company?.branding.themeColor || '#4f46e5';
    const companyName = company?.name || domain.charAt(0).toUpperCase() + domain.slice(1);
    const dashboardTitle = company?.branding.dashboardTitle || `${companyName} Learning Portal`;
    const landingPageText = company?.branding.landingPageText || `Welcome to the official learning portal for ${companyName}.`;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            {/* Background Decorations */}
            <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '50vw', height: '50vw', background: `radial-gradient(circle, ${themeColor}15 0%, transparent 70%)`, filter: 'blur(60px)', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '50vw', height: '50vw', background: `radial-gradient(circle, ${themeColor}15 0%, transparent 70%)`, filter: 'blur(60px)', zIndex: 0 }} />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', zIndex: 10 }}>
                <div className="animate-fade-in-up" style={{
                    width: 'clamp(80px, 15vw, 120px)',
                    height: 'clamp(80px, 15vw, 120px)',
                    borderRadius: '24px',
                    background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`,
                    margin: '0 auto 32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                    fontWeight: '800',
                    boxShadow: `0 20px 40px -10px ${themeColor}60`,
                    fontFamily: 'Outfit, sans-serif'
                }}>
                    {companyName.charAt(0)}
                </div>

                <h1 className="animate-fade-in-up animate-delay-100" style={{ fontSize: 'clamp(1.8rem, 5vw, 4.5rem)', marginBottom: '20px', color: 'var(--foreground)', textAlign: 'center', maxWidth: '800px', letterSpacing: '-0.03em', lineHeight: 1.1, padding: '0 8px' }}>
                    {dashboardTitle}
                </h1>

                <p className="animate-fade-in-up animate-delay-200" style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.25rem)', color: 'var(--text-muted)', marginBottom: '40px', textAlign: 'center', maxWidth: '600px', lineHeight: 1.6, padding: '0 8px' }}>
                    {landingPageText}
                </p>

                <div className="card glass-panel animate-fade-in-up animate-delay-300" style={{ padding: 'clamp(24px, 4vw, 40px)', width: '100%', maxWidth: '440px', textAlign: 'center' }}>
                    <h3 style={{ marginBottom: '8px', fontSize: 'clamp(1.1rem, 3vw, 1.5rem)' }}>Ready to learn?</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>Sign in to access your modules</p>

                    <Link href={`/company/${domain}/login`} className="btn-primary hover-scale" style={{ display: 'flex', width: '100%', background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`, padding: '14px', fontSize: '1rem', boxShadow: `0 8px 20px -8px ${themeColor}aa` }}>
                        Go to Login Portal
                    </Link>

                    <div style={{ margin: '20px 0', borderBottom: '1px solid var(--border)', position: 'relative' }}>
                        <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--surface)', padding: '0 12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>or</span>
                    </div>

                    <Link href={`/company/${domain}/admin`} className="btn-secondary" style={{ display: 'flex', width: '100%', padding: '14px', fontSize: '1rem', justifyContent: 'center' }}>
                        Company Admin Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
