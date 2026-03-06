"use client";
import { AuthProvider } from '@/lib/authContext';
import { LanguageProvider } from '@/lib/LanguageContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <AuthProvider>
                {children}
            </AuthProvider>
        </LanguageProvider>
    );
}
