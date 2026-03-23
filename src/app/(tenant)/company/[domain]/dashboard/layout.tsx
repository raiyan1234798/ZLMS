"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/lib/authContext';
import { useCompany } from '@/hooks/useCompany';
import {
    LayoutDashboard, BookOpen, BarChart3, Award, Bell,
    Menu, ChevronRight, LogOut, MessageSquare, Shield, User
} from 'lucide-react';

export default function TenantDashboardLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const domain = params.domain as string;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { company: companyData, loadingCompany } = useCompany(domain);
    const companyFeatures = companyData?.features || [];
    const pathname = usePathname();
    const router = useRouter();
    const { user, userData, loading } = useAuth();

    useEffect(() => {
        if (loading || loadingCompany) return;

        if (!user) {
            router.push('/login');
            return;
        }

        if (userData && companyData) {
            const userCompanyId = userData.companyId;
            if (userCompanyId !== domain && userCompanyId !== companyData.id && userCompanyId !== companyData.subdomain) {
                router.push('/login');
            }
        }
    }, [user, userData, loading, loadingCompany, domain, router, companyData]);

    const allNavItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: `/company/${domain}/dashboard`, featureReq: null },
        { icon: BookOpen, label: 'My Courses', href: `/company/${domain}/dashboard/courses`, featureReq: 'courses' },
        { icon: Award, label: 'Certificates', href: `/company/${domain}/dashboard/certificates`, featureReq: 'certificates' },
        { icon: BarChart3, label: 'Progress', href: `/company/${domain}/dashboard/progress`, featureReq: 'analytics' },
        { icon: MessageSquare, label: 'Support', href: `/company/${domain}/dashboard/support`, featureReq: null },
        { icon: Bell, label: 'Notifications', href: `/company/${domain}/dashboard/notifications`, featureReq: 'notifications' },
    ];

    const navItems = allNavItems.filter(item =>
        !item.featureReq || (companyFeatures && companyFeatures.includes(item.featureReq))
    );

    const handleSignOut = async () => {
        await signOut(auth);
        router.push('/login');
    };

    const themeColor = companyData?.themeColor || '#4f46e5';
    const companyName = companyData?.name || domain.charAt(0).toUpperCase() + domain.slice(1);
    const userInitials = userData?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || user?.email?.charAt(0).toUpperCase() || 'L';

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: themeColor, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!user) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px', background: '#0f172a' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Shield size={40} color="#ef4444" />
                </div>
                <h2 style={{ color: '#f8fafc', fontFamily: 'system-ui, sans-serif', margin: 0 }}>Authentication Required</h2>
                <p style={{ color: '#94a3b8', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
                    Please log in to access your learning portal.
                </p>
                <Link href="/login" style={{ 
                    padding: '12px 24px', 
                    background: themeColor, 
                    color: 'white', 
                    borderRadius: '8px', 
                    textDecoration: 'none',
                    fontFamily: 'system-ui, sans-serif',
                    fontWeight: 500
                }}>
                    Go to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            {sidebarOpen && (
                <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }} />
            )}

            <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`} style={{ zIndex: 50 }}>
                <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                        {companyName.charAt(0)}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{companyName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Learning Portal</div>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: '12px', overflow: 'auto' }}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '10px 12px', borderRadius: '8px', marginBottom: '2px',
                                    color: isActive ? themeColor : 'var(--text-muted)',
                                    background: isActive ? `${themeColor}15` : 'transparent',
                                    fontWeight: isActive ? 600 : 400, fontSize: '0.9rem',
                                    transition: 'all 0.15s ease',
                                    textDecoration: 'none',
                                }}
                            >
                                <Icon size={18} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>{userInitials}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{userData?.name || 'Learner'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Learner</div>
                        </div>
                        <button onClick={handleSignOut} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} title="Sign out">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            <div className="dashboard-main">
                <div style={{ padding: '16px 32px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={() => setSidebarOpen(true)} className="mobile-menu" aria-label="Open sidebar">
                            <Menu size={24} />
                        </button>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Dashboard <ChevronRight size={12} /> My Learning
                        </div>
                    </div>
                    <button style={{ position: 'relative', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white' }}>
                        <Bell size={18} color="var(--text-muted)" />
                    </button>
                </div>

                <div style={{ padding: '32px', flex: 1, position: 'relative' }}>
                    {children}
                    <Link href={`/company/${domain}/dashboard/support`} style={{ position: 'fixed', bottom: '32px', right: '32px', width: '56px', height: '56px', borderRadius: '50%', background: themeColor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 10px 25px ${themeColor}40`, zIndex: 100, transition: 'transform 0.2s ease', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                        <MessageSquare size={26} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
