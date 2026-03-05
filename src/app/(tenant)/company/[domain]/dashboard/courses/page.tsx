
"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MOCK_COMPANIES, getCoursesByCompany } from '@/data/mockDb';
import { BookOpen, Play, Clock, ChevronRight, Lock, Unlock, Mail, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function MyCoursesPage() {
    const { domain } = useParams() as { domain: string };
    const company = MOCK_COMPANIES.find(c => c.subdomain === domain);
    const initialCourses = company ? getCoursesByCompany(company.id) : [];
    const themeColor = company?.branding.themeColor || '#4f46e5';

    const { user } = useAuth();
    const [requestedCourses, setRequestedCourses] = useState<Record<string, boolean>>({});
    const [assignedCourses, setAssignedCourses] = useState<Record<string, boolean>>({});
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (user && company) {
            const fetchUserData = async () => {
                try {
                    // Fetch requests
                    const reqSnap = await getDocs(collection(db, 'users', user.uid, 'requests'));
                    const reqs: Record<string, boolean> = {};
                    reqSnap.forEach(doc => { reqs[doc.id] = true; });
                    setRequestedCourses(reqs);

                    // Fetch assignments
                    const assignSnap = await getDocs(collection(db, 'users', user.uid, 'assignments'));
                    const assigns: Record<string, boolean> = {};
                    assignSnap.forEach(doc => { assigns[doc.id] = true; });
                    setAssignedCourses(assigns);
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
                setIsLoadingData(false);
            };
            fetchUserData();
        } else {
            setIsLoadingData(false);
        }
    }, [user, company]);

    const handleRequestAccess = async (e: React.MouseEvent, courseId: string, courseTitle: string) => {
        e.preventDefault();
        if (!user) return alert("Please sign in to request access.");

        try {
            // Optimistic update
            setRequestedCourses(prev => ({ ...prev, [courseId]: true }));

            // Save to Firestore under user
            await setDoc(doc(db, 'users', user.uid, 'requests', courseId), {
                courseId,
                courseTitle,
                status: 'PENDING',
                requestedAt: new Date().toISOString()
            });

            // Make it visible to company admin globally by storing in a company collection
            const makeId = `${user.uid}_${courseId}`;
            await setDoc(doc(db, 'companies', company!.id, 'requests', makeId), {
                userId: user.uid,
                userName: user.displayName || user.email || 'A Learner',
                courseId,
                courseTitle,
                status: 'PENDING',
                requestedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Failed to request access", error);
            alert("Failed to request access. Please try again.");
            // Revert optimistic update
            setRequestedCourses(prev => ({ ...prev, [courseId]: false }));
        }
    };

    if (isLoadingData) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>Loading your learning path...</div>;
    }

    return (
        <div className="animate-fade-in-up">
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.4rem', marginBottom: '8px', color: 'var(--foreground)' }}>My Content</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{initialCourses.length} learning paths available at {company?.name}.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
                {initialCourses.map((course) => {
                    const totalLessons = course.modules.reduce((a, m) => a + m.lessons.length, 0);
                    // Use a visual progress if assigned, otherwise 0
                    const progress = assignedCourses[course.id] ? 15 + ((totalLessons * 7 + 3) % 50) : 0;
                    const totalDuration = totalLessons * 15; // estimated 15 min per lesson

                    const isRequested = requestedCourses[course.id];
                    const isAssigned = assignedCourses[course.id]; // Override mock DB status with Firestore real status

                    return (
                        <Link
                            key={course.id}
                            href={isAssigned ? `/company/${domain}/courses/${course.id}` : '#'}
                            style={{
                                textDecoration: 'none',
                                color: 'inherit',
                                pointerEvents: isAssigned ? 'auto' : 'none'
                            }}
                        >
                            <div className="card hover-scale" style={{
                                padding: 0,
                                overflow: 'hidden',
                                cursor: isAssigned ? 'pointer' : 'default',
                                border: `1px solid ${isAssigned ? themeColor + '20' : 'var(--border)'}`,
                                position: 'relative'
                            }}>
                                <div style={{
                                    height: '140px',
                                    background: `linear-gradient(135deg, ${themeColor}15, ${themeColor}40)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative'
                                }}>
                                    <BookOpen size={48} color={themeColor} style={{ opacity: 0.3, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }} />

                                    {isAssigned ? (
                                        <div style={{ position: 'absolute', top: '12px', left: '12px', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: '#10b98120', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', backdropFilter: 'blur(8px)' }}>
                                            <Unlock size={12} /> Enrolled
                                        </div>
                                    ) : (
                                        <div style={{ position: 'absolute', top: '12px', left: '12px', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: 'var(--surface)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: 'var(--shadow-sm)' }}>
                                            <Lock size={12} /> Locked
                                        </div>
                                    )}

                                    <div style={{ position: 'absolute', top: '12px', right: '12px', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: 'var(--glass-bg)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', backdropFilter: 'blur(12px)', boxShadow: 'var(--shadow-sm)' }}>
                                        <Clock size={12} /> {totalDuration} min
                                    </div>
                                </div>

                                <div style={{ padding: '24px' }}>
                                    <h3 style={{ fontSize: '1.15rem', marginBottom: '8px', lineHeight: 1.3 }}>{course.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>{course.description}</p>

                                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', fontWeight: 500 }}>
                                        <span>{course.modules.length} modules</span>
                                        <span>•</span>
                                        <span>{totalLessons} lessons</span>
                                    </div>

                                    {isAssigned ? (
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Your Progress</span>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: themeColor }}>{progress}%</span>
                                            </div>
                                            <div style={{ height: '8px', borderRadius: '999px', background: 'var(--border)', overflow: 'hidden' }}>
                                                <div style={{ width: `${progress}%`, height: '100%', borderRadius: '999px', background: `linear-gradient(90deg, ${themeColor}, ${themeColor}dd)`, transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: themeColor, fontSize: '0.9rem', fontWeight: 600 }}>
                                                    Resume <ChevronRight size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ marginTop: 'auto' }}>
                                            {isRequested ? (
                                                <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: '#f8fafc', borderRadius: '10px', color: '#10b981', fontWeight: 600, fontSize: '0.95rem', border: '1px dashed #10b98160' }}>
                                                    <CheckCircle2 size={18} /> Access Requested
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={(e) => handleRequestAccess(e, course.id, course.title)}
                                                    className="btn-secondary hover-scale"
                                                    style={{
                                                        width: '100%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px',
                                                        borderStyle: 'dashed',
                                                        borderWidth: '2px',
                                                        borderColor: 'var(--border)',
                                                        background: 'transparent',
                                                        padding: '12px',
                                                        pointerEvents: 'auto'
                                                    }}
                                                >
                                                    <Mail size={16} /> Request Course Access
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
