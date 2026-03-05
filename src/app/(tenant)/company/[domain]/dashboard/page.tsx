"use client";

import { useParams } from 'next/navigation';
import { MOCK_COMPANIES, getCoursesByCompany, getLearnersForCompany } from '@/data/mockDb';
import Link from 'next/link';
import { BookOpen, Clock, CheckCircle, Award, Target } from 'lucide-react';

export default function UserDashboard() {
    const params = useParams();
    const domain = params.domain as string;
    const company = MOCK_COMPANIES.find(c => c.subdomain === domain);
    const courses = company ? getCoursesByCompany(company.id) : [];
    const learners = company ? getLearnersForCompany(company.id) : [];
    const currentUser = learners[0]; // Simulating first learner logged in

    const assignedCourses = courses.filter(c => c.status === 'ASSIGNED');
    const availableCourses = courses.filter(c => c.status === 'AVAILABLE');
    const allVisibleCourses = [...assignedCourses, ...availableCourses];

    // Simulated progress data
    const progressMap: Record<string, number> = {};
    allVisibleCourses.forEach((course, i) => {
        progressMap[course.id] = assignedCourses.includes(course) ? Math.min(15 + (i * 23), 92) : 0;
    });

    const completedCount = Object.values(progressMap).filter(p => p >= 90).length;
    const hoursSpent = (allVisibleCourses.length * 4.2).toFixed(1);

    return (
        <div>
            {/* Welcome Banner */}
            <div style={{
                marginBottom: '32px', padding: '32px', borderRadius: 'var(--radius)',
                background: `linear-gradient(135deg, ${company?.branding.themeColor || 'var(--primary)'}, ${company?.branding.themeColor || 'var(--primary)'}88)`,
                color: 'white'
            }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
                    Welcome back, {currentUser?.name || 'Learner'}! 👋
                </h1>
                <p style={{ opacity: 0.9 }}>
                    Continue your learning journey at {company?.branding.dashboardTitle || company?.name}
                </p>
            </div>

            {/* Progress Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                {[
                    { icon: BookOpen, label: 'Enrolled Courses', value: allVisibleCourses.length, color: company?.branding.themeColor || '#4f46e5' },
                    { icon: CheckCircle, label: 'Completed', value: completedCount, color: '#10b981' },
                    { icon: Clock, label: 'Hours Spent', value: hoursSpent, color: '#f59e0b' },
                    { icon: Award, label: 'Certificates', value: completedCount, color: '#8b5cf6' },
                ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: s.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={22} color={s.color} />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{s.value}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.label}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Assigned Courses */}
            {assignedCourses.length > 0 && (
                <>
                    <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.3rem' }}>Continue Learning</h2>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{assignedCourses.length} assigned</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                        {assignedCourses.map((course) => {
                            const progress = progressMap[course.id] || 0;
                            const totalLessons = course.modules.reduce((a, m) => a + m.lessons.length, 0);
                            return (
                                <Link key={course.id} href={`/company/${domain}/courses/${course.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="card" style={{ padding: 0, overflow: 'hidden', transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'pointer' }}>
                                        <div style={{ height: '140px', background: `linear-gradient(135deg, ${company?.branding.themeColor}22, ${company?.branding.themeColor}44)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                            <BookOpen size={44} color={company?.branding.themeColor} style={{ opacity: 0.4 }} />
                                            <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'white', borderRadius: '999px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 500, color: company?.branding.themeColor }}>
                                                {course.modules.length} modules · {totalLessons} lessons
                                            </div>
                                            {progress >= 90 && (
                                                <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#10b981', borderRadius: '999px', padding: '4px 10px', fontSize: '0.7rem', fontWeight: 600, color: 'white' }}>
                                                    ✓ Completed
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ padding: '20px' }}>
                                            <h3 style={{ fontSize: '1.05rem', marginBottom: '6px' }}>{course.title}</h3>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.description}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ flex: 1, height: '6px', borderRadius: '999px', background: 'var(--border)' }}>
                                                    <div style={{ width: `${progress}%`, height: '100%', borderRadius: '999px', background: progress >= 90 ? '#10b981' : company?.branding.themeColor || 'var(--primary)', transition: 'width 0.3s ease' }}></div>
                                                </div>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{progress}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Available Courses */}
            {availableCourses.length > 0 && (
                <>
                    <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.3rem' }}>Available Courses</h2>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{availableCourses.length} available</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                        {availableCourses.map((course) => {
                            const totalLessons = course.modules.reduce((a, m) => a + m.lessons.length, 0);
                            return (
                                <Link key={course.id} href={`/company/${domain}/courses/${course.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}>
                                        <div style={{ height: '120px', background: `linear-gradient(135deg, ${company?.branding.themeColor}11, ${company?.branding.themeColor}22)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <BookOpen size={36} color={company?.branding.themeColor} style={{ opacity: 0.3 }} />
                                        </div>
                                        <div style={{ padding: '20px' }}>
                                            <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>{course.title}</h3>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '12px' }}>{course.description}</p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    {course.modules.length} modules · {totalLessons} lessons
                                                </span>
                                                <span style={{ fontSize: '0.8rem', color: company?.branding.themeColor, fontWeight: 500 }}>Start →</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </>
            )}

            {allVisibleCourses.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
                    <BookOpen size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                    <h3 style={{ marginBottom: '8px' }}>No courses assigned yet</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Your admin will assign courses to you soon.</p>
                </div>
            )}

            {/* AI Learning Path */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '24px', background: 'linear-gradient(135deg, #f5f3ff, #eef2ff)', flexWrap: 'wrap' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg, #8b5cf6, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Target size={28} color="white" />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>AI Learning Path</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Get personalized course recommendations based on your progress and role.</p>
                </div>
                <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>Explore</button>
            </div>
        </div>
    );
}
