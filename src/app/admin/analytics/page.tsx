"use client";

import { MOCK_COMPANIES, MOCK_COURSES } from '@/data/mockDb';
import { BarChart3, TrendingUp, Users, BookOpen, Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AnalyticsPage() {
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

    const companyAnalytics = activeCompanies.map(company => {
        const users = platformUsers.filter(u => u.companyId === company.id);
        const courses = MOCK_COURSES.filter(c => c.companyId === company.id);
        const completionRate = 45 + Math.floor(Math.random() * 40);
        return { company, users: users.length, courses: courses.length, completionRate, engagementScore: 60 + Math.floor(Math.random() * 35) };
    });

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Platform Analytics</h1>
                <p style={{ color: 'var(--text-muted)' }}>Insights and performance metrics across all active tenants.</p>
            </div>

            {/* Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {[
                    { icon: Users, label: 'Total Users', value: loading ? '-' : platformUsers.filter(u => u.companyId !== 'platform').length, change: '+12%', color: '#4f46e5', bg: '#eef2ff' },
                    { icon: BookOpen, label: 'Active Courses', value: loading ? '-' : activeCourses.length, change: '+8%', color: '#10b981', bg: '#ecfdf5' },
                    { icon: Award, label: 'Certificates Issued', value: loading ? '-' : 156, change: '+24%', color: '#f59e0b', bg: '#fffbeb' },
                    { icon: TrendingUp, label: 'Avg Completion', value: '72%', change: '+5%', color: '#8b5cf6', bg: '#f5f3ff' },
                ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <div key={i} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={22} color={s.color} />
                                </div>
                                <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 500 }}>{s.change}</span>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '4px' }}>{s.value}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Company Performance */}
            <div className="card" style={{ marginBottom: '32px' }}>
                <h3 style={{ marginBottom: '24px', fontSize: '1rem' }}>Active Tenant Performance</h3>
                {loading ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading analytics data...</div>
                ) : companyAnalytics.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No active companies with registered users found.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {companyAnalytics.map(({ company, users, courses, completionRate, engagementScore }) => (
                            <div key={company.id} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: company.branding.themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, flexShrink: 0 }}>{company.name.charAt(0)}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, marginBottom: '8px' }}>{company.name}</div>
                                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        <span>{users} users</span>
                                        <span>{courses} courses</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center', padding: '0 16px' }}>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: completionRate > 70 ? '#10b981' : '#f59e0b' }}>{completionRate}%</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completion</div>
                                </div>
                                <div style={{ width: '120px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Engagement</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{engagementScore}%</span>
                                    </div>
                                    <div style={{ height: '6px', borderRadius: '999px', background: 'var(--border)' }}>
                                        <div style={{ width: `${engagementScore}%`, height: '100%', borderRadius: '999px', background: company.branding.themeColor }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Activity Chart Placeholder */}
            <div className="card">
                <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Weekly Activity</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '200px', padding: '0 20px' }}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                        const height = 30 + Math.floor(Math.random() * 70);
                        return (
                            <div key={day} style={{ flex: 1, textAlign: 'center' }}>
                                <div style={{ height: `${height}%`, background: `linear-gradient(180deg, #4f46e5, #7c3aed)`, borderRadius: '6px 6px 0 0', minHeight: '20px', transition: 'height 0.3s ease' }} />
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>{day}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
