import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};

export function middleware(req: NextRequest) {
    const url = req.nextUrl;

    // Get hostname of request (e.g. demo.zlms.com, zlms.com, localhost:3000)
    const hostname = req.headers.get('host') || 'localhost:3000';

    // We are on local dev, strip port if exists to get pure hostname
    // Or handle custom subdomains if they exist.
    // For production like `tenant.zlms.com`, we can extract `tenant`

    // For local development, map localhost to platform, but if it's sub.localhost:3000 mapping to sub.
    let currentHost = hostname.split(':')[0]; // get demo.localhost or demo.zlms.com
    if (currentHost === 'localhost') {
        // Treat base localhost as platform
        currentHost = 'zlms.local';
    }

    // Define our base domains
    const isPlatform = currentHost === 'zlms.com' || currentHost === 'zlms.local';

    // If it's the platform, rewrite to (platform) directory or let it pass if it's main landing page
    if (isPlatform) {
        if (url.pathname.startsWith('/admin')) {
            // Continue normally
            return NextResponse.next();
        }
    } else {
        // It's a tenant subdomain (e.g. acme.zlms.com -> 'acme')
        const subdomain = currentHost.replace('.zlms.com', '').replace('.localhost', '').replace('.zlms.local', '');

        // Rewrite path to /company/[subdomain]/[path...]
        return NextResponse.rewrite(new URL(`/company/${subdomain}${url.pathname}`, req.url));
    }

    return NextResponse.next();
}
