"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Play, Clock, Search, ChevronRight, CheckCircle2, TrendingUp, Flame, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { useCompany } from '@/hooks/useCompany';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getCoursesByCompany } from '@/data/mockDb';

export default function MyCoursesPage() {
    const { domain } = useParams() as { domain: string };
    const { company, loadingCompany } = useCompany(domain);
    const themeColor = company?.branding?.themeColor || company?.themeColor || '#4f46e5';

    const { user } = useAuth();
    const [assignedCourses, setAssignedCourses] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchAssigned = async () => {
            if (!user) return;
            setIsLoadingData(true);
            try {
                // Fetch assigned IDs for the current user
                const assignSnap = await getDocs(collection(db, 'users', user.uid, 'assignments'));
                const assignedIds = new Set(assignSnap.docs.map(doc => doc.id));

                // Fetch real courses for the company to match details
                let compId = company?.id;
                if (!compId) {
                    const compQ = query(collection(db, 'companies'), where('subdomain', '==', domain));
                    const compSnap = await getDocs(compQ);
                    if (!compSnap.empty) compId = compSnap.docs[0].id;
                }

                const fbCourses: any[] = [];
                const courseQ = query(collection(db, 'courses'));
                const querySnapshot = await getDocs(courseQ);
                
                // Fetch progress for ALL assigned courses in one go (or per course)
                const courseDataWithProgress = await Promise.all(querySnapshot.docs
                    .filter(doc => (doc.data().domain === domain || (compId && doc.data().companyId === compId)) && assignedIds.has(doc.id))
                    .map(async (courseDoc) => {
                        const data = courseDoc.data();
                        const courseId = courseDoc.id;
                        
                        // Fetch detailed progress
                        const progRef = doc(db, 'users', user.uid, 'progress', courseId);
                        const progSnap = await getDoc(progRef);
                        const progData = progSnap.exists() ? progSnap.data() : { completedLessons: {}, overallProgress: 0, timeSpent: { today: 0, yesterday: 0, total: 0 }, lastAccessedLesson: null, lastAccessedTime: null };
                        
                        return { 
                            id: courseId, 
                            ...data, 
                            completedLessons: progData.completedLessons || {},
                            progress: progData.overallProgress || 0,
                            timeSpentToday: progData.timeSpent?.today || 0,
                            timeSpentYesterday: progData.timeSpent?.yesterday || 0,
                            totalTimeSpent: progData.timeSpent?.total || 0,
                            lastAccessedLesson: progData.lastAccessedLesson,
                            lastAccessedTime: progData.lastAccessedTime
                        };
                    })
                );

                setAssignedCourses(courseDataWithProgress);
            } catch (error) {
                console.warn("Error fetching my courses:", error);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchAssigned();
    }, [user, domain, company?.id]);

    const filtered = assignedCourses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

    if (isLoadingData) {
        return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '20px' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: `4px solid ${themeColor}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Retrieving your curriculum...</div>
            <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }` }} />
        </div>;
    }

    return (
        <div className="animate-fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', gap: '20px', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>My Courses</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>You are currently enrolled in {assignedCourses.length} programs.</p>
                </div>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" placeholder="Search my courses..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '0.9rem', outline: 'none' }} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: '24px' }}>
                {filtered.map(course => {
                    const lessonsCount = course.modules?.reduce((a: number, m: any) => a + (m.lessons?.length || 0), 0) || 0;
                    const todayMinutes = Math.round((course.timeSpentToday || 0) / 60);
                    const yesterdayMinutes = Math.round((course.timeSpentYesterday || 0) / 60);
                    const totalHours = Math.round((course.totalTimeSpent || 0) / 3600);
                    
                    return (
                        <div key={course.id} className="card hover-scale" style={{ padding: '20px', overflow: 'hidden', border: `1px solid ${themeColor}30`, display: 'flex', flexDirection: 'column', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                            {/* Course Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px', color: '#0f172a' }}>{course.title}</h3>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{lessonsCount} lessons</div>
                                </div>
                                {course.progress >= 100 && (
                                    <div style={{ background: '#ecfdf5', padding: '6px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <CheckCircle2 size={14} color="#10b981" />
                                        <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Done</span>
                                    </div>
                                )}
                            </div>

                            {/* Learning Stats - Today & Yesterday */}
                            <div style={{
                                background: '#f8fafc',
                                borderRadius: '8px',
                                padding: '12px',
                                marginBottom: '16px',
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '12px'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase' }}>
                                        Today
                                    </div>
                                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#4f46e5' }}>
                                        {todayMinutes} min
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Flame size={12} color="#f59e0b" /> Yesterday
                                    </div>
                                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b' }}>
                                        {yesterdayMinutes} min
                                    </div>
                                </div>
                            </div>

                            {/* Where to Start Today */}
                            {(() => {
                                const allLessons = course.modules?.flatMap((m: any) => m.lessons.map((l: any) => ({ ...l, moduleTitle: m.title }))) || [];
                                const nextLesson = allLessons.find((l: any) => !course.completedLessons[l.id]);
                                const lastLessonAccessed = course.lastAccessedLesson;
                                
                                if (course.progress >= 100) {
                                    return (
                                        <div style={{
                                            background: '#ecfdf5',
                                            borderLeft: '3px solid #10b981',
                                            borderRadius: '6px',
                                            padding: '12px',
                                            marginBottom: '16px',
                                            fontSize: '0.875rem'
                                        }}>
                                            <div style={{ color: '#10b981', fontWeight: 600, marginBottom: '2px' }}>✓ Course Completed</div>
                                            <div style={{ color: '#0c4a6e', fontSize: '0.8rem' }}>All lessons completed!</div>
                                        </div>
                                    );
                                }

                                if (nextLesson) {
                                    return (
                                        <div style={{
                                            background: '#eff6ff',
                                            borderLeft: '3px solid #0ea5e9',
                                            borderRadius: '6px',
                                            padding: '12px',
                                            marginBottom: '16px',
                                        }}>
                                            <div style={{ fontSize: '0.7rem', color: '#0369a1', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>
                                                📍 Continue From
                                            </div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0c4a6e', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {nextLesson.moduleTitle} → {nextLesson.title}
                                            </div>
                                            {lastLessonAccessed && (
                                                <div style={{ fontSize: '0.75rem', color: '#0369a1' }}>
                                                    Last accessed: {new Date(lastLessonAccessed).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                            {/* Progress Bar */}
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Progress</span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: themeColor }}>{course.progress || 0}%</span>
                                </div>
                                <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${course.progress || 0}%`,
                                        height: '100%',
                                        background: course.progress >= 100 ? '#10b981' : themeColor,
                                        transition: 'width 0.3s ease',
                                        borderRadius: '3px'
                                    }}></div>
                                </div>
                            </div>

                            {/* Resume Button */}
                            <Link 
                                href={`/company/${domain}/courses/${course.id}`} 
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    background: themeColor,
                                    color: 'white',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    boxShadow: `0 2px 8px ${themeColor}40`,
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <Play size={16} fill="white" />
                                {course.progress > 0 ? 'Continue' : 'Start'} Learning
                            </Link>
                        </div>
                    );
                })}

                {filtered.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 20px', background: 'var(--surface)', borderRadius: '24px', border: '2px dashed var(--border)' }}>
                        <BookOpen size={64} color="var(--text-muted)" style={{ opacity: 0.2, marginBottom: '20px' }} />
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>No courses here yet</h3>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>Once your administrator assigns courses to you, they will appear here for you to start learning.</p>
                        <Link href={`/company/${domain}/dashboard/courses`} style={{ display: 'inline-block', marginTop: '24px', color: themeColor, fontWeight: 700, textDecoration: 'none' }}>Browse All Courses →</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
