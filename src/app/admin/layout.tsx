"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import {
    LayoutDashboard, Users, BookOpen, BarChart3, Settings,
    Shield, CreditCard, Bell, Menu, X, ChevronRight,
    Building2, Activity, Kanban, MessageSquare
} from 'lucide-react';

const navItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/admin' },
    { icon: Building2, label: 'Companies', href: '/admin/companies' },
    { icon: Users, label: 'All Users', href: '/admin/users' },
    { icon: BookOpen, label: 'All Courses', href: '/admin/courses' },
    { icon: Kanban, label: 'Feature Board', href: '/admin/features' },
    { icon: CreditCard, label: 'Billing', href: '/admin/billing' },
    { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
    { icon: Activity, label: 'Activity Logs', href: '/admin/logs' },
    { icon: Bell, label: 'Notifications', href: '/admin/notifications' },
    { icon: MessageSquare, label: 'Support', href: '/admin/support' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeItem, setActiveItem] = useState('/admin');
    const [isAuthChecking, setIsAuthChecking] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                if (user.email === 'abubackerraiyan@gmail.com') {
                    setIsAuthorized(true);
                } else {
                    const docRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists() && docSnap.data().role === 'SUPER_ADMIN') {
                        setIsAuthorized(true);
                    } else {
                        setIsAuthorized(false);
                        if (!pathname.startsWith('/admin/login')) {
                            router.push('/admin/login');
                        }
                    }
                }
            } else {
                setIsAuthorized(false);
                if (!pathname.startsWith('/admin/login')) {
                    router.push('/admin/login');
                }
            }
            setIsAuthChecking(false);
        });

        return () => unsubscribe();
    }, [pathname, router]);

    if (isAuthChecking) {
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Validating super admin access...</div>;
    }

    if (pathname.startsWith('/admin/login')) {
        return <>{children}</>;
    }

    if (!isAuthorized) {
        return null;
    }

    return (
        <div className="dashboard-layout">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }}
                />
            )}

            {/* Sidebar */}
            <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`} style={{ zIndex: 50 }}>
                <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Z</div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1rem' }}>Z LMS</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Super Admin</div>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="mobile-close" aria-label="Close sidebar">
                        <X size={20} />
                    </button>
                </div>

                <nav style={{ flex: 1, padding: '12px', overflow: 'auto' }}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeItem === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => { setActiveItem(item.href); setSidebarOpen(false); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    marginBottom: '2px',
                                    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                    background: isActive ? '#eef2ff' : 'transparent',
                                    fontWeight: isActive ? 600 : 400,
                                    fontSize: '0.9rem',
                                    transition: 'all 0.15s ease',
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
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>PO</div>
                        <div>
                            <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>Platform Owner</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>admin@zlms.com</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="dashboard-main">
                {/* Top bar */}
                <div style={{ padding: '16px 32px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={() => setSidebarOpen(true)} className="mobile-menu" aria-label="Open sidebar">
                            <Menu size={22} />
                        </button>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                Platform <ChevronRight size={12} /> Dashboard
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button style={{ position: 'relative', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <Bell size={18} color="var(--text-muted)" />
                            <span style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span>
                        </button>
                    </div>
                </div>

                {/* Page content */}
                <div style={{ padding: '32px', flex: 1, position: 'relative' }}>
                    {children}
                    {/* Floating Chat Button */}
                    <Link href="/admin/support" style={{ position: 'fixed', bottom: '32px', right: '32px', width: '56px', height: '56px', borderRadius: '50%', background: '#b48648', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(180, 134, 72, 0.4)', zIndex: 100, transition: 'transform 0.2s ease', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                        <MessageSquare size={26} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
