
"use client";
import { useParams } from 'next/navigation';
import { TrendingUp, BookOpen, Clock, Award, CheckCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useCompany } from '@/hooks/useCompany';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ProgressPage() {
    const { domain } = useParams() as { domain: string };
    const { company, loadingCompany } = useCompany(domain);
    const { user } = useAuth();
    
    const [loading, setLoading] = useState(true);
    const [assignedCourses, setAssignedCourses] = useState<any[]>([]);
    const [userProgress, setUserProgress] = useState<Record<string, any>>({});
    
    const themeColor = company?.branding?.themeColor || company?.themeColor || '#4f46e5';

    useEffect(() => {
        const fetchProgressData = async () => {
            if (!user || !company) return;
            setLoading(true);
            try {
                // 1. Fetch user assignments
                const assignSnap = await getDocs(collection(db, 'users', user.uid, 'assignments'));
                const assignments: any[] = [];
                const progressMap: Record<string, any> = {};

                for (const d of assignSnap.docs) {
                    const courseId = d.id;
                    const courseDoc = await getDoc(doc(db, 'courses', courseId));
                    if (courseDoc.exists()) {
                        const courseData = courseDoc.data();
                        assignments.push({ id: courseDoc.id, ...courseData });

                        // 2. Fetch progress for this course
                        const progDoc = await getDoc(doc(db, 'users', user.uid, 'progress', courseId));
                        if (progDoc.exists()) {
                            progressMap[courseId] = progDoc.data();
                        } else {
                            progressMap[courseId] = { completedLessons: [], lastAccessed: null };
                        }
                    }
                }
                setAssignedCourses(assignments);
                setUserProgress(progressMap);
            } catch (error) {
                console.error("Error fetching progress data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProgressData();
    }, [user, company]);

    if (loadingCompany || (user && loading)) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                <Loader2 className="animate-spin" size={32} color={themeColor} />
            </div>
        );
    }

    // Calculations
    const totalCourses = assignedCourses.length;
    const completedCoursesCount = assignedCourses.filter(c => {
        const prog = userProgress[c.id];
        return prog?.overallProgress === 100;
    }).length;

    const totalProgress = assignedCourses.length > 0 ? assignedCourses.reduce((acc, c) => {
        const prog = userProgress[c.id];
        return acc + (prog?.overallProgress || 0);
    }, 0) / assignedCourses.length : 0;

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>My Progress</h1>
                <p style={{ color: 'var(--text-muted)' }}>Track your learning journey at {company?.name || domain}.</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                {[
                    { icon: TrendingUp, label: 'Overall Progress', value: `${Math.round(totalProgress)}%`, color: themeColor },
                    { icon: Clock, label: 'Courses in Progress', value: totalCourses - completedCoursesCount, color: '#f59e0b' },
                    { icon: CheckCircle, label: 'Completed', value: completedCoursesCount, color: '#10b981' },
                    { icon: Award, label: 'Certificates', value: completedCoursesCount, color: '#8b5cf6' },
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
                {assignedCourses.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        You haven&apos;t been assigned any courses yet. Check the course library!
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {assignedCourses.map((course) => {
                            const prog = userProgress[course.id];
                            const totalL = course.lessons?.length || (course.modules?.reduce((a: number, m: any) => a + (m.lessons?.length || 0), 0)) || 0;
                            const progressPercent = prog?.overallProgress || 0;
                            const completedL = prog?.completedLessons ? Object.keys(prog.completedLessons).length : 0;
                            
                            return (
                                <div key={course.id} style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, marginBottom: '2px' }}>{course.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{completedL}/{totalL} lessons completed</div>
                                        </div>
                                        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: progressPercent >= 100 ? '#10b981' : themeColor }}>{progressPercent}%</span>
                                    </div>
                                    <div style={{ height: '8px', borderRadius: '999px', background: 'var(--border)' }}>
                                        <div style={{ width: `${progressPercent}%`, height: '100%', borderRadius: '999px', background: `linear-gradient(90deg, ${themeColor}, ${themeColor}cc)`, transition: 'width 0.3s ease' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Weekly Activity (Placeholder for real activity tracking integration) */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1rem' }}>Weekly Learning Activity</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Last 7 Days</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '140px', padding: '0 10px' }}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                        // In a fully dynamic app, we would fetch activity logs for the user per day
                        const heights = [35, 65, 45, 85, 25, 10, 5];
                        const height = heights[i];
                        return (
                            <div key={day} style={{ flex: 1, textAlign: 'center' }}>
                                <div style={{ height: `${height}%`, background: `linear-gradient(180deg, ${themeColor}, ${themeColor}88)`, borderRadius: '6px 6px 0 0', minHeight: '4px' }} />
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>{day}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
