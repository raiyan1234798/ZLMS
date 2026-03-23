
"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Clock, CheckCircle, Award, Target, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { useCompany } from '@/hooks/useCompany';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useState, useEffect } from 'react';

export default function UserDashboard() {
    const params = useParams();
    const domain = params.domain as string;
    const { userData, user } = useAuth();
    const { company, loadingCompany } = useCompany(domain);
    
    const [assignedCourses, setAssignedCourses] = useState<any[]>([]);
    const [userProgress, setUserProgress] = useState<Record<string, any>>({});
    const [totalSecondsSpent, setTotalSecondsSpent] = useState(0);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !company?.id) return;
            setLoadingData(true);
            try {
                // Fetch assignments
                const assignSnap = await getDocs(collection(db, 'users', user.uid, 'assignments'));
                const assignments: any[] = [];
                const progressMap: Record<string, any> = {};
                let secondsAccumulated = 0;

                for (const d of assignSnap.docs) {
                    const courseId = d.id;
                    const courseDoc = await getDoc(doc(db, 'courses', courseId));
                    if (courseDoc.exists()) {
                        const courseData = { id: courseDoc.id, ...courseDoc.data() } as any;
                        
                        // Data Isolation Check: Ensure course belongs to this company
                        if (courseData.companyId !== company.id) continue;

                        assignments.push(courseData);

                        // Fetch progress
                        const progDoc = await getDoc(doc(db, 'users', user.uid, 'progress', courseId));
                        if (progDoc.exists()) {
                            const progData = progDoc.data();
                            progressMap[courseId] = progData.overallProgress || 0;
                            if (progData.timeSpent?.total) {
                                secondsAccumulated += progData.timeSpent.total;
                            }
                        } else {
                            progressMap[courseId] = 0;
                        }
                    }
                }
                setAssignedCourses(assignments);
                setUserProgress(progressMap);
                setTotalSecondsSpent(secondsAccumulated);
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, [user, company?.id]);

    const themeColor = company?.branding?.themeColor || company?.themeColor || 'var(--primary)';
    const dashboardTitle = company?.branding?.dashboardTitle || company?.name || domain;

    if (loadingCompany || loadingData) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                <Loader2 className="animate-spin" size={32} color={themeColor} />
            </div>
        );
    }

    const completedCount = Object.values(userProgress).filter(p => p >= 100).length;
    let hoursSpent = (totalSecondsSpent / 3600).toFixed(1);
    
    // Fallback to estimation for legacy or initial users with 0 tracking
    if (parseFloat(hoursSpent) === 0 && assignedCourses.length > 0) {
        hoursSpent = (completedCount * 2 + (assignedCourses.length - completedCount) * 0.5).toFixed(1);
    }

    return (
        <div>
            {/* Welcome Banner */}
            <div style={{
                marginBottom: '32px', padding: '32px', borderRadius: 'var(--radius)',
                background: `linear-gradient(135deg, ${themeColor}, ${themeColor}bb)`,
                color: 'white'
            }}>
                <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', marginBottom: '8px', fontWeight: 700 }}>
                    Welcome back, {userData?.name || 'Learner'}! 👋
                </h1>
                <p style={{ opacity: 0.9, fontSize: 'clamp(0.9rem, 3vw, 1.1rem)' }}>
                    Continue your learning journey at {dashboardTitle}
                </p>
            </div>

            {/* Progress Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '32px' }}>
                {[
                    { icon: BookOpen, label: 'Enrolled Courses', value: assignedCourses.length, color: themeColor },
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
            {assignedCourses.length > 0 ? (
                <>
                    <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 600 }}>Continue Learning</h2>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{assignedCourses.length} assigned</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                        {assignedCourses.map((course) => {
                            const progress = userProgress[course.id] || 0;
                            const totalLessons = course.lessons?.length || (course.modules?.reduce((a: number, m: any) => a + (m.lessons?.length || 0), 0)) || 0;
                            return (
                                <Link key={course.id} href={`/company/${domain}/courses/${course.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="card" style={{ padding: 0, overflow: 'hidden', transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'pointer' }}>
                                        <div style={{ height: '140px', background: `linear-gradient(135deg, ${themeColor}22, ${themeColor}44)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                            <BookOpen size={44} color={themeColor} style={{ opacity: 0.4 }} />
                                            <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'white', borderRadius: '999px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 500, color: themeColor, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                                {totalLessons} lessons
                                            </div>
                                            {progress >= 100 && (
                                                <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#10b981', borderRadius: '999px', padding: '4px 10px', fontSize: '0.7rem', fontWeight: 600, color: 'white' }}>
                                                    ✓ Completed
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ padding: '20px' }}>
                                            <h3 style={{ fontSize: '1.05rem', marginBottom: '6px', fontWeight: 600 }}>{course.title}</h3>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.description}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ flex: 1, height: '6px', borderRadius: '999px', background: 'var(--border)' }}>
                                                    <div style={{ width: `${progress}%`, height: '100%', borderRadius: '999px', background: progress >= 100 ? '#10b981' : themeColor, transition: 'width 0.3s ease' }}></div>
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
            ) : (
                <div className="card" style={{ textAlign: 'center', padding: '60px', marginBottom: '32px' }}>
                    <BookOpen size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                    <h3 style={{ marginBottom: '8px' }}>No courses assigned yet</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Explore the library or wait for your admin to assign courses.</p>
                </div>
            )}

            {/* AI Learning Path */}
            {company?.features?.includes('ai_builder') && (
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '24px', background: 'linear-gradient(135deg, #f5f3ff, #eef2ff)', flexWrap: 'wrap' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg, #8b5cf6, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Target size={28} color="white" />
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>AI Learning Path</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Get personalized course recommendations based on your progress and role.</p>
                    </div>
                    <Link href={`/company/${domain}/dashboard/ai-path`} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-block' }}>Explore</Link>
                </div>
            )}
        </div>
    );
}
