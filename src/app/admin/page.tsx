"use client";

import { KanbanBoard } from '@/components/ui/KanbanBoard';
import { MOCK_COMPANIES, MOCK_COURSES } from '@/data/mockDb';
import Link from 'next/link';
import { Building2, Users, BookOpen, DollarSign, ArrowUpRight, Activity, GraduationCap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function SuperAdminOverview() {
    const [platformUsers, setPlatformUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'users'));
                const users: any[] = [];
                querySnapshot.forEach((doc) => {
                    users.push({ id: doc.id, ...doc.data() });
                });
                setPlatformUsers(users);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const activeCompanyIds = loading ? [] : Array.from(new Set(platformUsers.filter(u => u.companyId && u.companyId !== 'platform').map(u => u.companyId)));
    const activeCompanies = loading ? [] : MOCK_COMPANIES.filter(c => activeCompanyIds.includes(c.id));
    const activeCourses = loading ? [] : MOCK_COURSES.filter(c => activeCompanyIds.includes(c.companyId));

    const totalAdmins = platformUsers.filter(u => u.role === 'COMPANY_ADMIN').length;
    const totalTrainers = platformUsers.filter(u => u.role === 'TRAINER').length;
    const totalLearners = platformUsers.filter(u => u.role === 'USER').length;

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Platform Overview</h1>
                <p style={{ color: 'var(--text-muted)' }}>Welcome back, Rayan. Here&apos;s your platform summary.</p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {[
                    { icon: Building2, label: 'Active Tenants', value: activeCompanyIds.length, sub: `From ${MOCK_COMPANIES.length} available`, color: '#4f46e5', bg: '#eef2ff' },
                    { icon: Users, label: 'Total Users', value: platformUsers.filter(u => u.companyId !== 'platform').length, sub: `${totalAdmins} admins`, color: '#10b981', bg: '#ecfdf5' },
                    { icon: BookOpen, label: 'Active Courses', value: activeCourses.length, sub: 'Across active tenants', color: '#f59e0b', bg: '#fffbeb' },
                    { icon: GraduationCap, label: 'Learners', value: totalLearners, sub: `${totalTrainers} trainers`, color: '#8b5cf6', bg: '#f5f3ff' },
                    { icon: DollarSign, label: 'Monthly Revenue', value: '$12,480', sub: '+18% vs last month', color: '#ec4899', bg: '#fdf2f8' },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={22} color={stat.color} />
                                </div>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '4px' }}>{loading ? '-' : stat.value}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{stat.label}</div>
                            <div style={{ fontSize: '0.75rem', color: stat.color, marginTop: '4px' }}>{stat.sub}</div>
                        </div>
                    );
                })}
            </div>

            {/* Companies Table & Recent Activity */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Companies */}
                <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1rem' }}>Active Companies</h3>
                        <Link href="/admin/companies" style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            View all <ArrowUpRight size={14} />
                        </Link>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading live data...</div>
                        ) : activeCompanies.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No active companies with registered users.</div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'var(--background)' }}>
                                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Company</th>
                                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Users</th>
                                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Courses</th>
                                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Status</th>
                                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Features</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeCompanies.map((company) => {
                                        const userCount = platformUsers.filter(u => u.companyId === company.id).length;
                                        const courseCount = MOCK_COURSES.filter(c => c.companyId === company.id).length;
                                        return (
                                            <tr key={company.id} style={{ borderTop: '1px solid var(--border)' }}>
                                                <td style={{ padding: '14px 24px' }}>
                                                    <Link href={`/company/${company.subdomain}/admin`} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
                                                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: company.branding.themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>
                                                            {company.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 500 }}>{company.name}</div>
                                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{company.subdomain}.zlms.com</div>
                                                        </div>
                                                    </Link>
                                                </td>
                                                <td style={{ padding: '14px 24px', fontSize: '0.9rem' }}>{userCount}</td>
                                                <td style={{ padding: '14px 24px', fontSize: '0.9rem' }}>{courseCount}</td>
                                                <td style={{ padding: '14px 24px' }}>
                                                    <span style={{
                                                        padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 500,
                                                        background: company.status === 'ACTIVE' ? '#ecfdf5' : '#fef2f2',
                                                        color: company.status === 'ACTIVE' ? '#10b981' : '#ef4444'
                                                    }}>
                                                        {company.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{company.features.length} enabled</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card">
                    <h3 style={{ fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={18} /> Recent Activity
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { text: 'Global IT Academy registered a new user', time: 'Just now', color: '#10b981' },
                            { text: 'Acme Corp completed 5 course enrollments', time: '1 hour ago', color: '#8b5cf6' },
                            { text: 'Skyline uploaded new materials', time: '2 hours ago', color: '#06b6d4' },
                            { text: 'Admin accessed Global IT dashboard', time: '3 hours ago', color: '#3b82f6' },
                            { text: 'System backup completed', time: '1 day ago', color: '#ef4444' }
                        ].map((activity, i) => (
                            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: activity.color, marginTop: '6px', flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 400 }}>{activity.text}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{activity.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Feature Kanban */}
            <div className="card" style={{ marginTop: '32px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>Platform Feature Management</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Drag features between columns to enable or disable them globally.</p>
                </div>
                <KanbanBoard
                    initialColumns={{
                        available: { id: 'available', title: '🟡 Available Features', itemIds: ['f7', 'f8', 'f9', 'f10'] },
                        enabled: { id: 'enabled', title: '🟢 Enabled Features', itemIds: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'] },
                        disabled: { id: 'disabled', title: '🔴 Disabled Features', itemIds: ['f11', 'f12'] },
                    }}
                    items={{
                        f1: { id: 'f1', content: 'Courses' },
                        f2: { id: 'f2', content: 'Video Learning' },
                        f3: { id: 'f3', content: 'Inline Quizzes' },
                        f4: { id: 'f4', content: 'Certificates' },
                        f5: { id: 'f5', content: 'Analytics' },
                        f6: { id: 'f6', content: 'Notifications' },
                        f7: { id: 'f7', content: 'AI Course Builder' },
                        f8: { id: 'f8', content: 'Leaderboards' },
                        f9: { id: 'f9', content: 'Surveys' },
                        f10: { id: 'f10', content: 'Gamification' },
                        f11: { id: 'f11', content: 'Discussion Forums' },
                        f12: { id: 'f12', content: 'SSO Integration' },
                    }}
                />
            </div>
        </div>
    );
}
