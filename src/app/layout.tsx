import type { Metadata } from 'next';
import '../styles/globals.scss';
import { Providers } from './Providers';

export const metadata: Metadata = {
    title: 'Z LMS',
    description: 'Multi-tenant SaaS Learning Management System',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
