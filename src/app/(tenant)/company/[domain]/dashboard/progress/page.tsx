"use client";
import { useParams } from 'next/navigation';
import { MOCK_COMPANIES, getCoursesByCompany } from '@/data/mockDb';
import { TrendingUp, BookOpen, Clock, Award, CheckCircle } from 'lucide-react';

export default function ProgressPage() {
    const { domain } = useParams() as { domain: string };
    const company = MOCK_COMPANIES.find(c => c.subdomain === domain);
    const courses = company ? getCoursesByCompany(company.id) : [];
    const themeColor = company?.branding.themeColor || '#4f46e5';
    const totalLessons = courses.reduce((a, c) => a + c.modules.reduce((b, m) => b + m.lessons.length, 0), 0);

    const overallProgress = 42;
    const hoursSpent = 12.6;
    const completedCourses = 1;

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>My Progress</h1>
                <p style={{ color: 'var(--text-muted)' }}>Track your learning journey at {company?.name}.</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                {[
                    { icon: TrendingUp, label: 'Overall Progress', value: `${overallProgress}%`, color: themeColor },
                    { icon: Clock, label: 'Hours Spent', value: hoursSpent, color: '#f59e0b' },
                    { icon: CheckCircle, label: 'Completed', value: completedCourses, color: '#10b981' },
                    { icon: Award, label: 'Certificates', value: completedCourses, color: '#8b5cf6' },
                ].map((s, i) => {
                    const Icon = s.icon; return (
                        <div key={i} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: s.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={22} color={s.color} /></div>
                            </div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '4px' }}>{s.value}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Course Progress */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '24px', fontSize: '1rem' }}>Course Progress</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {courses.map((course, i) => {
                        const progress = course.status === 'ASSIGNED' ? 30 + Math.floor(Math.random() * 50) : Math.floor(Math.random() * 20);
                        const lessonsCompleted = Math.floor(course.modules.reduce((a, m) => a + m.lessons.length, 0) * progress / 100);
                        const totalL = course.modules.reduce((a, m) => a + m.lessons.length, 0);
                        return (
                            <div key={course.id} style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, marginBottom: '2px' }}>{course.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lessonsCompleted}/{totalL} lessons completed</div>
                                    </div>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: progress > 60 ? '#10b981' : themeColor }}>{progress}%</span>
                                </div>
                                <div style={{ height: '8px', borderRadius: '999px', background: 'var(--border)' }}>
                                    <div style={{ width: `${progress}%`, height: '100%', borderRadius: '999px', background: `linear-gradient(90deg, ${themeColor}, ${themeColor}cc)`, transition: 'width 0.3s ease' }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Weekly Activity */}
            <div className="card">
                <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Weekly Learning Activity</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '140px', padding: '0 10px' }}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                        const height = 15 + Math.floor(Math.random() * 85);
                        return (
                            <div key={day} style={{ flex: 1, textAlign: 'center' }}>
                                <div style={{ height: `${height}%`, background: `linear-gradient(180deg, ${themeColor}, ${themeColor}88)`, borderRadius: '6px 6px 0 0', minHeight: '12px' }} />
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>{day}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
