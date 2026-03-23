"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/lib/authContext';
import {
    LayoutDashboard, Users, BookOpen, BarChart3, Settings,
    Shield, CreditCard, Bell, Menu, X, ChevronRight,
    Building2, Activity, Kanban, MessageSquare, LogOut
} from 'lucide-react';

const navItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/admin' },
    { icon: Building2, label: 'Live Tenants', href: '/admin/companies' },
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
    const { user, userData, loading, isSuperAdmin } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeItem, setActiveItem] = useState('/admin');
    const [isAuthChecking, setIsAuthChecking] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [pendingUsersCount, setPendingUsersCount] = useState(0);

    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }

        if (user && !loading) {
            if (isSuperAdmin) {
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
                router.push('/login');
            }
        }
    }, [user, userData, loading, isSuperAdmin, pathname, router]);

    useEffect(() => {
        if (user && isAuthorized) {
            const q = query(collection(db, 'users'), where('status', '==', 'PENDING_APPROVAL'));
            const unsubscribe = onSnapshot(q, (snap) => {
                setPendingUsersCount(snap.size);
            });
            return () => unsubscribe();
        }
    }, [user, isAuthorized]);

    useEffect(() => {
        const current = navItems.find(item => pathname.startsWith(item.href));
        if (current) setActiveItem(current.href);
    }, [pathname]);

    const handleSignOut = async () => {
        await signOut(auth);
        router.push('/login');
    };

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', background: '#0f172a' }}>
                <div style={{ width: '48px', height: '48px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: '#94a3b8', fontFamily: 'system-ui, sans-serif' }}>Verifying authentication...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }



    if (!user || !isAuthorized) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px', background: '#0f172a' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Shield size={40} color="#ef4444" />
                </div>
                <h2 style={{ color: '#f8fafc', fontFamily: 'system-ui, sans-serif', margin: 0 }}>Authentication Required</h2>
                <p style={{ color: '#94a3b8', fontFamily: 'system-ui, sans-serif', textAlign: 'center', maxWidth: '400px' }}>
                    You must be logged in as a Super Admin to access this area.
                </p>
                <Link href="/login" style={{ 
                    padding: '12px 24px', 
                    background: '#4f46e5', 
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

    const userInitials = userData?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || user?.email?.charAt(0).toUpperCase() || 'SA';
    const userName = userData?.name || user?.email || 'Super Admin';

    return (
        <div className="dashboard-layout">
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }}
                />
            )}

            <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`} style={{ zIndex: 50 }}>
                <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Z</div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1rem' }}>Z LMS</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Super Admin</div>
                        </div>
                    </Link>
                    <button onClick={() => setSidebarOpen(false)} className="mobile-close" aria-label="Close sidebar">
                        <X size={20} />
                    </button>
                </div>

                <nav style={{ flex: 1, padding: '12px', overflow: 'auto' }}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeItem === item.href;
                        const hasNotification = item.href === '/admin/users' && pendingUsersCount > 0;
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
                                    position: 'relative',
                                    textDecoration: 'none',
                                }}
                            >
                                <Icon size={18} />
                                {item.label}
                                {hasNotification && (
                                    <span style={{
                                        position: 'absolute',
                                        right: '8px',
                                        background: '#ef4444',
                                        color: 'white',
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        padding: '2px 6px',
                                        borderRadius: '999px',
                                        minWidth: '18px',
                                        textAlign: 'center',
                                    }}>
                                        {pendingUsersCount}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>{userInitials}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{userName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
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
                            <Menu size={22} />
                        </button>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                Platform <ChevronRight size={12} /> Dashboard
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {pendingUsersCount > 0 && (
                            <Link href="/admin/users?filter=PENDING" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#fef2f2', borderRadius: '8px', textDecoration: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: 500 }}>
                                <Bell size={16} />
                                {pendingUsersCount} Pending
                            </Link>
                        )}
                        <button style={{ position: 'relative', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white' }}>
                            <Bell size={18} color="var(--text-muted)" />
                            <span style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span>
                        </button>
                    </div>
                </div>

                <div style={{ padding: '32px', flex: 1, position: 'relative' }}>
                    {children}
                    <Link href="/admin/support" style={{ position: 'fixed', bottom: '32px', right: '32px', width: '56px', height: '56px', borderRadius: '50%', background: '#b48648', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(180, 134, 72, 0.4)', zIndex: 100, transition: 'transform 0.2s ease', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                        <MessageSquare size={26} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
