"use client";
import { useParams } from 'next/navigation';
import { MOCK_COMPANIES, getUsersByCompany, getCoursesByCompany, getLearnersForCompany } from '@/data/mockDb';
import { BarChart3, TrendingUp, Users, BookOpen, Award } from 'lucide-react';

export default function CompanyAnalyticsPage() {
    const { domain } = useParams() as { domain: string };
    const company = MOCK_COMPANIES.find(c => c.subdomain === domain);
    const users = company ? getUsersByCompany(company.id) : [];
    const courses = company ? getCoursesByCompany(company.id) : [];
    const learners = company ? getLearnersForCompany(company.id) : [];

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Analytics</h1>
                <p style={{ color: 'var(--text-muted)' }}>Performance insights for {company?.name}.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {[
                    { icon: Users, label: 'Active Users', value: learners.length, change: '+3', color: company?.branding.themeColor || '#4f46e5' },
                    { icon: BookOpen, label: 'Courses', value: courses.length, change: '+1', color: '#10b981' },
                    { icon: Award, label: 'Certificates', value: Math.floor(learners.length * 2.5), change: '+5', color: '#f59e0b' },
                    { icon: TrendingUp, label: 'Completion Rate', value: `${65 + Math.floor(Math.random() * 25)}%`, change: '+8%', color: '#8b5cf6' },
                ].map((s, i) => {
                    const Icon = s.icon; return (
                        <div key={i} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: s.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={22} color={s.color} /></div>
                                <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 500 }}>{s.change}</span>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '4px' }}>{s.value}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Course Performance */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '1rem' }}>Course Performance</h3>
                {courses.map(course => {
                    const completion = 40 + Math.floor(Math.random() * 50);
                    return (
                        <div key={course.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 500, marginBottom: '4px' }}>{course.title}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{course.modules.length} modules · {learners.length} enrolled</div>
                            </div>
                            <div style={{ width: '180px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completion</span><span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{completion}%</span></div>
                                <div style={{ height: '6px', borderRadius: '999px', background: 'var(--border)' }}><div style={{ width: `${completion}%`, height: '100%', borderRadius: '999px', background: company?.branding.themeColor || 'var(--primary)' }} /></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Weekly Activity */}
            <div className="card">
                <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Weekly Activity</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '160px', padding: '0 20px' }}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                        const height = 20 + Math.floor(Math.random() * 80);
                        return (
                            <div key={day} style={{ flex: 1, textAlign: 'center' }}>
                                <div style={{ height: `${height}%`, background: `linear-gradient(180deg, ${company?.branding.themeColor || '#4f46e5'}, ${company?.branding.themeColor || '#4f46e5'}88)`, borderRadius: '6px 6px 0 0', minHeight: '16px' }} />
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>{day}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
