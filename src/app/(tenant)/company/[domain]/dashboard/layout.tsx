"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    LayoutDashboard, BookOpen, BarChart3, Award, Bell,
    Menu, X, ChevronRight, User, LogOut
} from 'lucide-react';

export default function TenantDashboardLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const domain = params.domain as string;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: `/company/${domain}/dashboard` },
        { icon: BookOpen, label: 'My Courses', href: `/company/${domain}/dashboard/courses` },
        { icon: Award, label: 'Certificates', href: `/company/${domain}/dashboard/certificates` },
        { icon: BarChart3, label: 'Progress', href: `/company/${domain}/dashboard/progress` },
        { icon: Bell, label: 'Notifications', href: `/company/${domain}/dashboard/notifications` },
    ];

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
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Learning Portal</div>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: '12px', overflow: 'auto' }}>
                    {navItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = index === 0;
                        return (
                            <Link
                                key={item.label}
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
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--tenant-primary, var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>JS</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>Jane Smith</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Learner</div>
                        </div>
                        <LogOut size={16} color="var(--text-muted)" />
                    </div>
                </div>
            </aside>

            <div className="dashboard-main">
                <div style={{ padding: '16px 32px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={() => setSidebarOpen(true)} className="mobile-menu" style={{ display: 'none' }}>
                            <Menu size={24} />
                        </button>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Dashboard <ChevronRight size={12} /> My Learning
                        </div>
                    </div>
                    <button style={{ position: 'relative', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <Bell size={18} color="var(--text-muted)" />
                    </button>
                </div>

                <div style={{ padding: '32px', flex: 1 }}>
                    {children}
                </div>
            </div>
        </div>
    );
}
