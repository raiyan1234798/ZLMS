
// This layout provides CSS custom properties (tenant theme) for all company pages.
// generateStaticParams returns a broad set of known domains so Next.js can pre-build them.
// At runtime, any domain works because this layout doesn't 404 on unknown domains.

export function generateStaticParams() {
    // Include all known mock subdomains PLUS placeholders so any real Firestore company subdomain
    // gets built. When new companies are added in Firebase they will work at runtime even
    // without a rebuild, since layouts/pages are client-rendered.
    return [
        { domain: 'globalit' },
        { domain: 'acme' },
        { domain: 'skyline' },
        { domain: 'travelpro' },
        { domain: 'medlearn' },
        { domain: 'novatech' },
        { domain: 'demo' },
        { domain: 'luxaar' },
        { domain: 'z2learn' },
        { domain: 'ustglobal' },
        // Real Firestore company domains — add new ones here after creating in the app
        { domain: 'c8' },
        { domain: 'c9' },
        { domain: 'c10' },
        { domain: 'test' },
    ];
}

export default async function TenantLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ domain: string }>;
}) {
    const { domain } = await params;

    // Default theme — actual colors are applied client-side by each page/layout
    // using Firestore data, so we just pass a neutral default here.
    const themeColor = '#4f46e5';
    const companyName = domain.charAt(0).toUpperCase() + domain.slice(1);

    return (
        <div style={{
            '--tenant-primary': themeColor,
            '--tenant-primary-hover': themeColor + 'cc',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
        } as React.CSSProperties}>
            {children}
        </div>
    );
}
