"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MOCK_COMPANIES } from '@/data/mockDb';
import { BookOpen, Play, Clock, ChevronRight, Lock, Unlock, Mail, CheckCircle2, Globe, Search } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { collection, doc, setDoc, getDocs, getDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCompany } from '@/hooks/useCompany';

export default function CompanyCoursesPage() {
    const { domain } = useParams() as { domain: string };
    const { company, loadingCompany } = useCompany(domain);
    const themeColor = company?.branding?.themeColor || company?.themeColor || '#4f46e5';

    const { user } = useAuth();
    const [requestedCourses, setRequestedCourses] = useState<Record<string, boolean>>({});
    const [assignedCourses, setAssignedCourses] = useState<Record<string, boolean>>({});
    const [companyCourses, setCompanyCourses] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoadingData(true);
            try {
                if (user) {
                    const reqSnap = await getDocs(collection(db, 'users', user.uid, 'requests'));
                    const reqs: Record<string, boolean> = {};
                    reqSnap.forEach(doc => { reqs[doc.id] = true; });
                    setRequestedCourses(reqs);

                    const assignSnap = await getDocs(collection(db, 'users', user.uid, 'assignments'));
                    const assigns: Record<string, boolean> = {};
                    assignSnap.forEach(doc => { assigns[doc.id] = true; });
                    setAssignedCourses(assigns);
                }

                let compId = company?.id;
                const compQ = query(collection(db, 'companies'), where('subdomain', '==', domain));
                const compSnap = await getDocs(compQ);
                if (!compSnap.empty) compId = compSnap.docs[0].id;

                const fbCourses: any[] = [];
                const courseQ = query(collection(db, 'courses'), where('companyId', '==', compId));
                const querySnapshot = await getDocs(courseQ);
                querySnapshot.forEach((doc) => {
                    fbCourses.push({ id: doc.id, ...doc.data() });
                });

                setCompanyCourses(fbCourses.sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0)));
            } catch (error) {
                console.warn("Error fetching data:", error);
                setCompanyCourses([]);
            }
            setIsLoadingData(false);
        };
        fetchAllData();
    }, [user, domain, company?.id]);

    const handleRequestAccess = async (e: React.MouseEvent, course: any) => {
        e.preventDefault();
        if (!user) return alert("Please sign in to request access.");

        try {
            setRequestedCourses(prev => ({ ...prev, [course.id]: true }));
            await setDoc(doc(db, 'users', user.uid, 'requests', course.id), {
                courseId: course.id,
                courseTitle: course.title,
                status: 'PENDING',
                requestedAt: new Date().toISOString()
            });

            let userCompanyId = company?.id || 'platform';
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) userCompanyId = userDoc.data().companyId;
            
            const makeId = `${user.uid}_${course.id}`;
            await setDoc(doc(db, 'companies', userCompanyId, 'requests', makeId), {
                userId: user.uid,
                userName: user.displayName || user.email || 'A Learner',
                sourceCompany: company?.name || domain,
                courseId: course.id,
                courseTitle: course.title,
                status: 'PENDING',
                requestedAt: new Date().toISOString()
            });
        } catch (error) {
            console.warn("Failed to request access", error);
            alert("Failed to request access. Please try again.");
            setRequestedCourses(prev => ({ ...prev, [course.id]: false }));
        }
    };

    const filtered = companyCourses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

    if (isLoadingData) {
        return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '20px' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: `4px solid ${themeColor}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Retrieving company courses...</div>
        </div>;
    }

    const CourseCard = ({ course }: { course: any }) => {
        const isAssigned = assignedCourses[course.id];
        const isRequested = requestedCourses[course.id];
        const lessonsCount = course.modules?.reduce((a: number, m: any) => a + (m.lessons?.length || 0), 0) || 0;
        
        return (
            <div className="card hover-scale" style={{ padding: 0, overflow: 'hidden', border: `1px solid ${isAssigned ? themeColor + '30' : 'var(--border)'}`, display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '140px', background: `linear-gradient(135deg, ${themeColor}15, ${themeColor}35)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <BookOpen size={48} color={themeColor} style={{ opacity: 0.3 }} />
                    <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                        {isAssigned ? (
                            <div style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, background: '#10b98120', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', backdropFilter: 'blur(8px)' }}>
                                <Unlock size={12} /> Active
                            </div>
                        ) : (
                            <div style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, background: 'rgba(255,255,255,0.8)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Lock size={12} /> Locked
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>{course.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.description}</p>
                    <div style={{ marginTop: 'auto' }}>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                            <span>{lessonsCount} lessons</span>
                            <span>•</span>
                            <span>{lessonsCount * 15} min</span>
                        </div>
                        {isAssigned ? (
                            <Link href={`/company/${domain}/courses/${course.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '10px', background: themeColor, color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                                Start Learning <Play size={16} />
                            </Link>
                        ) : (
                            <button onClick={(e) => handleRequestAccess(e, course)} disabled={isRequested} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `2px ${isRequested ? 'solid' : 'dashed'} ${isRequested ? '#10b98140' : 'var(--border)'}`, background: isRequested ? '#10b98108' : 'transparent', color: isRequested ? '#10b981' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.9rem', cursor: isRequested ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                {isRequested ? <><CheckCircle2 size={18} /> Requested</> : <><Mail size={16} /> Request Access</>}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="animate-fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', gap: '20px', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>Company Courses</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Internal training and resources exclusive to {company?.name || domain}.</p>
                </div>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" placeholder="Search company courses..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '0.9rem', outline: 'none' }} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: '24px' }}>
                {filtered.map(c => <CourseCard key={c.id} course={c} />)}
                {filtered.length === 0 && <div style={{ color: 'var(--text-muted)', padding: '20px' }}>No company-specific courses found.</div>}
            </div>
        </div>
    );
}
