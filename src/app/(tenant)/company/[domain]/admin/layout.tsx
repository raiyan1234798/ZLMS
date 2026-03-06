"use client";

import { useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MOCK_COMPANIES } from '@/data/mockDb';
import {
    LayoutDashboard, Users, BookOpen, BarChart3, Settings,
    Award, Bell, Menu, X, ChevronRight, LogOut, Kanban,
    Upload, UserPlus, Palette
} from 'lucide-react';

export default function CompanyAdminLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const domain = params.domain as string;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [companyFeatures, setCompanyFeatures] = useState<string[] | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        const fetchFeatures = async () => {
            try {
                const q = query(collection(db, 'companies'), where('subdomain', '==', domain));
                const snap = await getDocs(q);
                if (!snap.empty) {
                    setCompanyFeatures(snap.docs[0].data().features || []);
                } else {
                    const mock = MOCK_COMPANIES.find(c => c.subdomain === domain);
                    setCompanyFeatures(mock?.features || []);
                }
            } catch (err) {
                console.error(err);
                setCompanyFeatures([]);
            }
        };
        fetchFeatures();
    }, [domain]);

    const allNavItems = [
        { icon: LayoutDashboard, label: 'Overview', href: `/company/${domain}/admin`, featureReq: null },
        { icon: Users, label: 'Users', href: `/company/${domain}/admin/users`, featureReq: null },
        { icon: BookOpen, label: 'Courses', href: `/company/${domain}/admin/courses`, featureReq: 'courses' },
        { icon: Kanban, label: 'Course Board', href: `/company/${domain}/admin/courses`, featureReq: 'courses' },
        { icon: UserPlus, label: 'Invite Users', href: `/company/${domain}/admin/invite`, featureReq: null },
        { icon: Award, label: 'Certificates', href: `/company/${domain}/admin/certificates`, featureReq: 'certificates' },
        { icon: BarChart3, label: 'Analytics', href: `/company/${domain}/admin/analytics`, featureReq: 'analytics' },
        { icon: Upload, label: 'Materials', href: `/company/${domain}/admin/materials`, featureReq: null },
        { icon: Palette, label: 'Branding', href: `/company/${domain}/admin/branding`, featureReq: null },
        { icon: Bell, label: 'Notifications', href: `/company/${domain}/admin/notifications`, featureReq: 'notifications' },
        { icon: Settings, label: 'Settings', href: `/company/${domain}/admin/settings`, featureReq: null },
    ];

    const navItems = allNavItems.filter(item =>
        !item.featureReq || (companyFeatures && companyFeatures.includes(item.featureReq))
    );

    return (
        <div className="dashboard-layout">
            {sidebarOpen && (
                <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }} />
            )}

            <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`} style={{ zIndex: 50 }}>
                <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--tenant-primary, var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                        {domain.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{domain.charAt(0).toUpperCase() + domain.slice(1)}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Company Admin</div>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: '12px', overflow: 'auto' }}>
                    {navItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href.endsWith('/admin') && pathname === item.href);
                        return (
                            <Link
                                key={item.label + index}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '10px 12px', borderRadius: '8px', marginBottom: '2px',
                                    color: isActive ? 'var(--tenant-primary, var(--primary))' : 'var(--text-muted)',
                                    background: isActive ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                                    fontWeight: isActive ? 600 : 400, fontSize: '0.9rem',
                                    transition: 'all 0.15s ease'
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
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--tenant-primary, var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>JD</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>John Doe</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Admin</div>
                        </div>
                        <LogOut size={16} color="var(--text-muted)" />
                    </div>
                </div>
            </aside>

            <div className="dashboard-main">
                <div style={{ padding: '16px 32px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={() => setSidebarOpen(true)} className="mobile-menu" aria-label="Open sidebar">
                            <Menu size={22} />
                        </button>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Admin <ChevronRight size={12} /> Overview
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Link href={`/company/${domain}/dashboard`} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                            Switch to Learner View
                        </Link>
                        <button style={{ position: 'relative', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <Bell size={18} color="var(--text-muted)" />
                            <span style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span>
                        </button>
                    </div>
                </div>
                <div style={{ padding: '32px', flex: 1 }}>
                    {children}
                </div>
            </div>
        </div >
    );
}
