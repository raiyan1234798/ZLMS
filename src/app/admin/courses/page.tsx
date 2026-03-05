"use client";

import { MOCK_COURSES, MOCK_COMPANIES } from '@/data/mockDb';
import { Search, Plus, BookOpen, Users, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function AllCoursesPage() {
    const [filter, setFilter] = useState('ALL');
    const filtered = filter === 'ALL' ? MOCK_COURSES : MOCK_COURSES.filter(c => c.status === filter);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>All Courses</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{MOCK_COURSES.length} courses across all companies.</p>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                {[
                    { icon: BookOpen, label: 'Total Courses', value: MOCK_COURSES.length, color: '#4f46e5', bg: '#eef2ff' },
                    { icon: CheckCircle, label: 'Assigned', value: MOCK_COURSES.filter(c => c.status === 'ASSIGNED').length, color: '#10b981', bg: '#ecfdf5' },
                    { icon: BookOpen, label: 'Available', value: MOCK_COURSES.filter(c => c.status === 'AVAILABLE').length, color: '#f59e0b', bg: '#fffbeb' },
                    { icon: Users, label: 'Companies', value: new Set(MOCK_COURSES.map(c => c.companyId)).size, color: '#8b5cf6', bg: '#f5f3ff' },
                ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={20} color={s.color} />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{s.value}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.label}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                    <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" placeholder="Search courses..." style={{ width: '100%', padding: '10px 14px 10px 42px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }} />
                </div>
                {['ALL', 'ASSIGNED', 'AVAILABLE'].map(r => (
                    <button key={r} onClick={() => setFilter(r)} className={filter === r ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                        {r === 'ALL' ? 'All' : r}
                    </button>
                ))}
            </div>

            {/* Course Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                {filtered.map(course => {
                    const company = MOCK_COMPANIES.find(c => c.id === course.companyId);
                    const totalLessons = course.modules.reduce((a, m) => a + m.lessons.length, 0);
                    const totalQuestions = course.modules.reduce((a, m) => a + m.lessons.reduce((b, l) => b + l.questions.length, 0), 0);
                    return (
                        <div key={course.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ height: '100px', background: `linear-gradient(135deg, ${company?.branding.themeColor}22, ${company?.branding.themeColor}55)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                <BookOpen size={36} color={company?.branding.themeColor} style={{ opacity: 0.4 }} />
                                <span style={{ position: 'absolute', top: '10px', right: '10px', padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500, background: course.status === 'ASSIGNED' ? '#eef2ff' : '#ecfdf5', color: course.status === 'ASSIGNED' ? '#4f46e5' : '#10b981' }}>
                                    {course.status}
                                </span>
                            </div>
                            <div style={{ padding: '20px' }}>
                                <h3 style={{ fontSize: '1.05rem', marginBottom: '4px' }}>{course.title}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.description}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: company?.branding.themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.65rem', fontWeight: 600 }}>{company?.name.charAt(0)}</div>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{company?.name}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    <span>{course.modules.length} modules</span>
                                    <span>{totalLessons} lessons</span>
                                    <span>{totalQuestions} quizzes</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
