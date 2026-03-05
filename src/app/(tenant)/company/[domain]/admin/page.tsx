"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MOCK_COMPANIES, getUsersByCompany, getCoursesByCompany, getAdminForCompany } from '@/data/mockDb';
import Link from 'next/link';
import { Users, BookOpen, TrendingUp, Award, ArrowUpRight, UserPlus, BarChart3, Activity, Palette } from 'lucide-react';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CompanyAdminOverview() {
    const params = useParams();
    const domain = params.domain as string;
    const company = MOCK_COMPANIES.find(c => c.subdomain === domain);
    const companyUsers = company ? getUsersByCompany(company.id) : [];
    const companyCourses = company ? getCoursesByCompany(company.id) : [];
    const admin = company ? getAdminForCompany(company.id) : null;
    const learners = companyUsers.filter(u => u.role === 'USER');
    const trainers = companyUsers.filter(u => u.role === 'TRAINER');

    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [approvingId, setApprovingId] = useState<string | null>(null);

    useEffect(() => {
        if (!company) return;
        const fetchRequests = async () => {
            try {
                const q = query(collection(db, 'companies', company.id, 'requests'), where('status', '==', 'PENDING'));
                const querySnapshot = await getDocs(q);
                const reqs: any[] = [];
                querySnapshot.forEach((doc) => {
                    reqs.push({ id: doc.id, ...doc.data() });
                });
                setPendingRequests(reqs);
            } catch (error) {
                console.error("Error fetching requests:", error);
            }
        };
        fetchRequests();
    }, [company]);

    const handleApproveRequest = async (req: any) => {
        if (!company) return;
        setApprovingId(req.id);
        try {
            // Write to user's assigned courses
            await setDoc(doc(db, 'users', req.userId, 'assignments', req.courseId), {
                courseId: req.courseId,
                assignedAt: new Date().toISOString()
            });

            // Delete from company requests list
            await deleteDoc(doc(db, 'companies', company.id, 'requests', req.id));

            // Delete from user's requests list
            await deleteDoc(doc(db, 'users', req.userId, 'requests', req.courseId));

            // Remove from UI
            setPendingRequests(prev => prev.filter(r => r.id !== req.id));
        } catch (error) {
            console.error("Error approving request:", error);
            alert("Failed to approve access.");
        }
        setApprovingId(null);
    };

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Company Dashboard</h1>
                <p style={{ color: 'var(--text-muted)' }}>Welcome back{admin ? `, ${admin.name}` : ''}. Here&apos;s your company overview for <strong>{company?.name}</strong>.</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {[
                    { icon: Users, label: 'Total Users', value: companyUsers.length, sub: `${learners.length} learners · ${trainers.length} trainers`, color: company?.branding.themeColor || '#4f46e5', bg: (company?.branding.themeColor || '#4f46e5') + '15' },
                    { icon: BookOpen, label: 'Courses', value: companyCourses.length, sub: `${companyCourses.filter(c => c.status === 'ASSIGNED').length} assigned`, color: '#10b981', bg: '#ecfdf5' },
                    { icon: Award, label: 'Certificates Issued', value: Math.floor(learners.length * 2.5), sub: 'All time', color: '#f59e0b', bg: '#fffbeb' },
                    { icon: BarChart3, label: 'Avg Completion', value: `${60 + Math.floor(Math.random() * 30)}%`, sub: 'Across all courses', color: '#8b5cf6', bg: '#f5f3ff' },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={22} color={stat.color} />
                                </div>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '4px' }}>{stat.value}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{stat.label}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{stat.sub}</div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions + Users */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                {/* Quick Actions */}
                <div className="card">
                    <h3 style={{ fontSize: '1rem', marginBottom: '20px' }}>Quick Actions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {[
                            { icon: BookOpen, label: 'Create Course', color: company?.branding.themeColor || '#4f46e5', href: `/company/${domain}/admin/courses` },
                            { icon: UserPlus, label: 'Invite User', color: '#10b981', href: '#' },
                            { icon: Palette, label: 'Edit Branding', color: '#f59e0b', href: '#' },
                            { icon: BarChart3, label: 'View Reports', color: '#8b5cf6', href: '#' },
                        ].map((action, i) => {
                            const Icon = action.icon;
                            return (
                                <Link key={i} href={action.href} style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                                    padding: '20px', borderRadius: '12px', border: '1px solid var(--border)',
                                    transition: 'all 0.2s ease', textDecoration: 'none', color: 'inherit', cursor: 'pointer'
                                }}>
                                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: action.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Icon size={22} color={action.color} />
                                    </div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{action.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Users List */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1rem' }}>Team Members ({companyUsers.length})</h3>
                        <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'var(--tenant-primary, var(--primary))' }}>
                            <UserPlus size={14} /> Invite
                        </button>
                    </div>
                    <div style={{ maxHeight: '320px', overflow: 'auto' }}>
                        {companyUsers.map((user) => (
                            <div key={user.id} style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: user.role === 'COMPANY_ADMIN' ? 'var(--tenant-primary, var(--primary))' : user.role === 'TRAINER' ? '#f59e0b' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>
                                        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{user.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                                    </div>
                                </div>
                                <span style={{
                                    padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500,
                                    background: user.role === 'COMPANY_ADMIN' ? '#eef2ff' : user.role === 'TRAINER' ? '#fef3c7' : '#ecfdf5',
                                    color: user.role === 'COMPANY_ADMIN' ? '#4f46e5' : user.role === 'TRAINER' ? '#d97706' : '#10b981'
                                }}>
                                    {user.role === 'COMPANY_ADMIN' ? 'Admin' : user.role === 'TRAINER' ? 'Trainer' : 'Learner'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Pending Access Requests */}
            {pendingRequests.length > 0 && (
                <div className="card animate-fade-in-up" style={{ padding: 0, overflow: 'hidden', marginBottom: '32px', border: '1px solid #f59e0b' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: '#fffbeb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1rem', color: '#b45309' }}>Pending Course Requests ({pendingRequests.length})</h3>
                    </div>
                    <div style={{ overflow: 'auto' }}>
                        {pendingRequests.map((req) => (
                            <div key={req.id} style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <BookOpen size={20} color="#d97706" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{req.courseTitle}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Requested by User ID: {req.userId.slice(0, 8)}...</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleApproveRequest(req)}
                                    disabled={approvingId === req.id}
                                    className="btn-primary hover-scale"
                                    style={{
                                        background: '#10b981',
                                        padding: '8px 16px',
                                        fontSize: '0.85rem',
                                        opacity: approvingId === req.id ? 0.5 : 1
                                    }}
                                >
                                    {approvingId === req.id ? 'Approving...' : 'Approve Access'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Courses */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1rem' }}>Courses ({companyCourses.length})</h3>
                    <Link href={`/company/${domain}/admin/courses`} style={{ color: 'var(--tenant-primary, var(--primary))', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Manage <ArrowUpRight size={14} />
                    </Link>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--background)' }}>
                            <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Course</th>
                            <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Modules</th>
                            <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Lessons</th>
                            <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Status</th>
                            <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Enrolled</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companyCourses.map((course) => {
                            const totalLessons = course.modules.reduce((a, m) => a + m.lessons.length, 0);
                            return (
                                <tr key={course.id} style={{ borderTop: '1px solid var(--border)' }}>
                                    <td style={{ padding: '14px 24px' }}>
                                        <div style={{ fontWeight: 500 }}>{course.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.description}</div>
                                    </td>
                                    <td style={{ padding: '14px 24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{course.modules.length}</td>
                                    <td style={{ padding: '14px 24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{totalLessons}</td>
                                    <td style={{ padding: '14px 24px' }}>
                                        <span style={{
                                            padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 500,
                                            background: course.status === 'AVAILABLE' ? '#ecfdf5' : course.status === 'ASSIGNED' ? '#eef2ff' : '#f1f5f9',
                                            color: course.status === 'AVAILABLE' ? '#10b981' : course.status === 'ASSIGNED' ? '#4f46e5' : '#64748b'
                                        }}>
                                            {course.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{learners.length} users</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Activity */}
            <div className="card" style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={18} /> Recent Activity
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {learners.slice(0, 3).map((user, i) => (
                        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: company?.branding.themeColor || '#4f46e5', marginTop: '6px', flexShrink: 0 }} />
                            <div>
                                <div style={{ fontSize: '0.85rem' }}>{user.name} completed a lesson in {companyCourses[0]?.title || 'a course'}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{i + 1} hour{i > 0 ? 's' : ''} ago</div>
                            </div>
                        </div>
                    ))}
                    {trainers.map((trainer, i) => (
                        <div key={`t-${i}`} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', marginTop: '6px', flexShrink: 0 }} />
                            <div>
                                <div style={{ fontSize: '0.85rem' }}>{trainer.name} uploaded new training materials</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>1 day ago</div>
                            </div>
                        </div>
                    ))}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6', marginTop: '6px', flexShrink: 0 }} />
                        <div>
                            <div style={{ fontSize: '0.85rem' }}>{Math.floor(learners.length * 1.5)} certificates issued this month</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>3 days ago</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
