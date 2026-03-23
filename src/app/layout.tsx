import type { Metadata } from 'next';
import '../styles/globals.scss';
import { Providers } from './Providers';

export const metadata: Metadata = {
    title: 'Z LMS',
    description: 'Multi-tenant SaaS Learning Management System',
    icons: {
        icon: '/icon.png',
        shortcut: '/favicon.ico',
        apple: '/icon.png',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <script dangerouslySetInnerHTML={{ __html: `
                    (function() {
                        const originalError = console.error;
                        console.error = function(...args) {
                            if (args[0] && typeof args[0] === 'string' && args[0].includes('Cross-Origin-Opener-Policy')) {
                                return;
                            }
                            originalError.apply(console, args);
                        };
                        const originalWarn = console.warn;
                        console.warn = function(...args) {
                            if (args[0] && typeof args[0] === 'string' && args[0].includes('Cross-Origin-Opener-Policy')) {
                                return;
                            }
                            originalWarn.apply(console, args);
                        };
                    })();
                ` }} />
            </head>
            <body>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
