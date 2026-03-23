"use client";

import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { BookOpen, CheckCircle, Search, Users, Clock, Plus, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AllCoursesPage() {
    const [filter, setFilter] = useState('ALL');
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [companies, setCompanies] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const cQuery = query(collection(db, 'companies'));
                const cSnap = await getDocs(cQuery);
                const fbComps: any[] = [];
                cSnap.forEach(doc => fbComps.push({ id: doc.id, ...doc.data() }));
                setCompanies(fbComps);

                const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);
                const fbCourses: any[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    fbCourses.push({
                        id: doc.id,
                        ...data,
                        modules: data.modules ? data.modules : (data.lessons ? [{ id: 'm1', title: 'Content', lessons: data.lessons }] : [])
                    });
                });
                setCourses(fbCourses);
            } catch (error) {
                console.warn("Error fetching courses:", error);
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filtered = courses.filter(c => {
        const matchesFilter = filter === 'ALL' || c.status === filter;
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.companyName?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const stats = [
        { icon: BookOpen, label: 'Total Courses', value: courses.length, color: '#4f46e5', bg: '#eef2ff' },
        { icon: CheckCircle, label: 'Assigned', value: courses.filter(c => c.status === 'ASSIGNED').length, color: '#10b981', bg: '#ecfdf5' },
        { icon: BookOpen, label: 'Available', value: courses.filter(c => c.status === 'AVAILABLE').length, color: '#f59e0b', bg: '#fffbeb' },
        { icon: Users, label: 'Active Tenants', value: new Set(courses.map(c => c.companyId || c.domain)).size, color: '#8b5cf6', bg: '#f5f3ff' },
    ];

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '4px' }}>Platform Course Repository</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{courses.length} courses across all company environments.</p>
                </div>
                <button
                    onClick={() => window.location.href = '/admin/courses/create'}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
                >
                    <Plus size={18} /> Create New Course
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {stats.map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <div key={i} className="card hover-scale" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={24} color={s.color} />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{loading ? '...' : s.value}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                    <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search courses or companies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.95rem', outline: 'none', background: 'var(--surface)', transition: 'border-color 0.2s' }}
                    />
                </div>
                <div style={{ display: 'flex', background: 'var(--surface)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    {['ALL', 'ASSIGNED', 'AVAILABLE'].map(r => (
                        <button
                            key={r}
                            onClick={() => setFilter(r)}
                            style={{
                                padding: '8px 16px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                borderRadius: '8px',
                                border: 'none',
                                background: filter === r ? '#4f46e5' : 'transparent',
                                color: filter === r ? 'white' : 'var(--text-muted)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {r.charAt(0) + r.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Course Cards */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card" style={{ height: '300px', opacity: 0.5, background: 'var(--surface)', border: '1px solid var(--border)' }}></div>
                    ))}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
                    {filtered.map(course => {
                        const company = companies.find(c => c.id === course.companyId || c.subdomain === course.domain);
                        const themeColor = company?.branding?.themeColor || '#4f46e5';
                        const totalLessons = course.modules?.reduce((a: number, m: any) => a + (m.lessons?.length || 0), 0) || 0;

                        return (
                            <div key={course.id} className="card hover-scale" style={{ padding: 0, overflow: 'hidden', border: `1px solid ${themeColor}15` }}>
                                <div style={{ height: '120px', background: `linear-gradient(135deg, ${themeColor}15, ${themeColor}40)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                    <BookOpen size={40} color={themeColor} style={{ opacity: 0.4 }} />
                                    <span style={{
                                        position: 'absolute', top: '12px', right: '12px', padding: '4px 12px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700,
                                        background: course.status === 'ASSIGNED' ? '#eef2ff' : '#ecfdf5',
                                        color: course.status === 'ASSIGNED' ? '#4f46e5' : '#10b981',
                                        border: `1px solid ${course.status === 'ASSIGNED' ? '#4f46e530' : '#10b98130'}`
                                    }}>
                                        {course.status}
                                    </span>
                                </div>
                                <div style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.65rem', fontWeight: 800 }}>
                                            {course.companyName?.charAt(0) || company?.name.charAt(0) || '?'}
                                        </div>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{course.companyName || company?.name || 'External'}</span>
                                    </div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', color: 'var(--foreground)' }}>{course.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                                        {course.description || 'No description provided.'}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {totalLessons * 15}m</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><BookOpen size={14} /> {totalLessons} lessons</span>
                                        </div>
                                        <Link href={`/company/${company?.subdomain || course.domain}/admin/courses`} style={{ background: 'none', border: 'none', color: themeColor, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            View Details <ExternalLink size={12} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {filtered.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--surface)', borderRadius: '24px', border: '2px dashed var(--border)' }}>
                    <BookOpen size={48} color="var(--text-muted)" style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-muted)' }}>No courses found matching your criteria</h3>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Try adjusting your search or filters.</p>
                </div>
            )}
        </div>
    );
}
