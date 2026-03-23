"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Play, Search, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { useCompany } from '@/hooks/useCompany';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function EnrolledCoursesPage() {
    const { domain } = useParams() as { domain: string };
    const { company } = useCompany(domain);
    const themeColor = company?.branding?.themeColor || company?.themeColor || '#4f46e5';

    const { user } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchEnrolled = async () => {
            if (!user) return;
            setIsLoadingData(true);
            try {
                // Fetch progress documents to see what the user has actually started
                const progressSnap = await getDocs(collection(db, 'users', user.uid, 'progress'));
                const enrolledIds = new Set(progressSnap.docs.map(doc => doc.id));

                if (enrolledIds.size === 0) {
                    setEnrolledCourses([]);
                    return;
                }

                // Fetch real courses to match details
                const fbCourses: any[] = [];
                const courseQ = query(collection(db, 'courses'));
                const querySnapshot = await getDocs(courseQ);
                
                const courseDataWithProgress = await Promise.all(querySnapshot.docs
                    .filter(doc => enrolledIds.has(doc.id))
                    .map(async (courseDoc) => {
                        const data = courseDoc.data();
                        const courseId = courseDoc.id;
                        
                        const progRef = doc(db, 'users', user.uid, 'progress', courseId);
                        const progSnap = await getDoc(progRef);
                        const progData = progSnap.exists() ? progSnap.data() : { overallProgress: 0 };
                        
                        return { 
                            id: courseId, 
                            ...data, 
                            progress: progData.overallProgress || 0
                        };
                    })
                );

                setEnrolledCourses(courseDataWithProgress);
            } catch (error) {
                console.warn("Error fetching enrolled courses:", error);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchEnrolled();
    }, [user, domain, company?.id]);

    const filtered = enrolledCourses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

    if (isLoadingData) {
        return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '20px' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: `4px solid ${themeColor}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Loading your enrollment...</div>
        </div>;
    }

    return (
        <div className="animate-fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', gap: '20px', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>Enrolled Courses</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Courses you have actively started or completed.</p>
                </div>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" placeholder="Search enrolled courses..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '0.9rem', outline: 'none' }} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: '24px' }}>
                {filtered.map(course => {
                    return (
                        <div key={course.id} className="card hover-scale" style={{ padding: 0, overflow: 'hidden', border: `1px solid ${themeColor}30`, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ height: '160px', background: `linear-gradient(135deg, ${themeColor}15, ${themeColor}35)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                <BookOpen size={56} color={themeColor} style={{ opacity: 0.3 }} />
                            </div>
                            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>{course.title}</h3>
                                <div style={{ height: '8px', background: 'var(--background)', borderRadius: '4px', margin: '12px 0', overflow: 'hidden' }}>
                                    <div style={{ width: `${course.progress || 0}%`, height: '100%', background: themeColor, borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{course.progress >= 100 ? 'Completed' : 'In Progress'}</span>
                                    <span style={{ fontSize: '0.8rem', color: themeColor, fontWeight: 700 }}>{course.progress || 0}%</span>
                                </div>
                                <Link href={`/company/${domain}/courses/${course.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px', borderRadius: '12px', background: themeColor, color: 'white', textDecoration: 'none', fontWeight: 700 }}>
                                    Continue <Play size={18} fill="white" />
                                </Link>
                            </div>
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 20px' }}>
                        <p style={{ color: 'var(--text-muted)' }}>You haven't started any courses yet.</p>
                        <Link href={`/company/${domain}/dashboard/courses`} style={{ color: themeColor, fontWeight: 700 }}>Browse Courses →</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
