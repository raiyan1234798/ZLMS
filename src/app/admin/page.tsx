"use client";

import { KanbanBoard, ColumnData } from '@/components/ui/KanbanBoard';
import { MOCK_COMPANIES } from '@/data/mockDb';
import Link from 'next/link';
import { Building2, Users, BookOpen, DollarSign, ArrowUpRight, Activity, GraduationCap, RefreshCw, Clock, UserCheck, AlertCircle } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, getDoc, setDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ALL_FEATURES, DEFAULT_FEATURE_COLUMNS } from '@/lib/features';
import { useAuth } from '@/lib/authContext';

export default function SuperAdminOverview() {
    const { userData } = useAuth();
    const [platformUsers, setPlatformUsers] = useState<any[]>([]);
    const [firebaseCompanies, setFirebaseCompanies] = useState<any[]>([]);
    const [firebaseCourses, setFirebaseCourses] = useState<any[]>([]);
    const [kanbanColumns, setKanbanColumns] = useState<Record<string, ColumnData>>(DEFAULT_FEATURE_COLUMNS);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const fetchData = useCallback(async () => {
        try {
            const [usersSnap, companiesSnap, coursesSnap] = await Promise.all([
                getDocs(collection(db, 'users')),
                getDocs(collection(db, 'companies')),
                getDocs(collection(db, 'courses')),
            ]);
            const users: any[] = [];
            usersSnap.forEach((doc) => {
                users.push({ id: doc.id, ...doc.data() });
            });
            setPlatformUsers(users);

            const fbCompanies: any[] = [];
            companiesSnap.forEach((doc) => {
                fbCompanies.push({ id: doc.id, ...doc.data() });
            });
            setFirebaseCompanies(fbCompanies);

            const fbCourses: any[] = [];
            coursesSnap.forEach((doc) => {
                fbCourses.push({ id: doc.id, ...doc.data() });
            });
            setFirebaseCourses(fbCourses);

            const featuresDoc = await getDoc(doc(db, 'settings', 'features'));
            if (featuresDoc.exists()) {
                setKanbanColumns(featuresDoc.data().columns);
            } else {
                await setDoc(doc(db, 'settings', 'features'), { columns: DEFAULT_FEATURE_COLUMNS });
            }

            setLastUpdated(new Date());
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();

        const unsubUsers = onSnapshot(collection(db, 'users'), () => {
            fetchData();
        });
        const unsubCompanies = onSnapshot(collection(db, 'companies'), () => {
            fetchData();
        });
        const unsubCourses = onSnapshot(collection(db, 'courses'), () => {
            fetchData();
        });

        return () => {
            unsubUsers();
            unsubCompanies();
            unsubCourses();
        };
    }, [fetchData]);

    const allCompanies = [
        ...firebaseCompanies.map(c => ({ id: c.id, name: c.name, subdomain: c.subdomain, themeColor: c.themeColor, features: c.features || [], status: c.status || 'ACTIVE' })),
    ];

    const pendingUsers = platformUsers.filter(u => u.status === 'PENDING_APPROVAL' || u.status === 'PRE_APPROVED');
    const activeUsers = platformUsers.filter(u => u.status === 'ACTIVE');
    const totalAdmins = platformUsers.filter(u => u.role === 'COMPANY_ADMIN').length;
    const totalTrainers = platformUsers.filter(u => u.role === 'TRAINER').length;
    const totalLearners = platformUsers.filter(u => u.role === 'USER').length;

    const recentPending = pendingUsers.slice(0, 5);

    return (
        <div>
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Platform Overview</h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Welcome back, {userData?.name || 'Admin'}. Here&apos;s your platform summary.
                        {loading ? '' : ` • Updated ${lastUpdated.toLocaleTimeString()}`}
                    </p>
                </div>
                <button onClick={fetchData} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {[
                    { icon: Building2, label: 'Live Tenants', value: allCompanies.length, sub: `${firebaseCompanies.filter(c => c.status === 'ACTIVE').length} active`, color: '#4f46e5', bg: '#eef2ff' },
                    { icon: Users, label: 'Total Users', value: platformUsers.length, sub: `${totalAdmins} admins`, color: '#10b981', bg: '#ecfdf5' },
                    { icon: UserCheck, label: 'Pending Approval', value: pendingUsers.length, sub: pendingUsers.length > 0 ? 'Needs attention' : 'All clear', color: pendingUsers.length > 0 ? '#f59e0b' : '#10b981', bg: pendingUsers.length > 0 ? '#fffbeb' : '#ecfdf5' },
                    { icon: BookOpen, label: 'Active Courses', value: firebaseCourses.length, sub: 'Across all tenants', color: '#f59e0b', bg: '#fffbeb' },
                    { icon: GraduationCap, label: 'Learners', value: totalLearners, sub: `${totalTrainers} trainers`, color: '#8b5cf6', bg: '#f5f3ff' },
                    { icon: DollarSign, label: 'Monthly Revenue', value: '$12,480', sub: '+18% vs last month', color: '#ec4899', bg: '#fdf2f8' },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={22} color={stat.color} />
                                </div>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '4px' }}>{loading ? '-' : stat.value}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{stat.label}</div>
                            <div style={{ fontSize: '0.75rem', color: stat.color, marginTop: '4px' }}>{stat.sub}</div>
                        </div>
                    );
                })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                {pendingUsers.length > 0 && (
                    <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h3 style={{ fontSize: '1rem' }}>Pending Approvals</h3>
                                <span style={{ background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                                    {pendingUsers.length}
                                </span>
                            </div>
                            <Link href="/admin/users?filter=PENDING" style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                View all <ArrowUpRight size={14} />
                            </Link>
                        </div>
                        <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                            {recentPending.map((user) => (
                                <div key={user.id} style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>
                                        {user.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{user.name || 'Unknown'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <Link href={`/admin/users?filter=PENDING`} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                                            Review
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1rem' }}>Live Tenants</h3>
                        <Link href="/admin/companies" style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            View all <ArrowUpRight size={14} />
                        </Link>
                    </div>
                    <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
                        ) : allCompanies.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No live tenants yet.</div>
                        ) : allCompanies.slice(0, 5).map((company) => {
                            const userCount = platformUsers.filter(u => u.companyId === company.id).length;
                            return (
                                <div key={company.id} style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: company.themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>
                                        {company.name.charAt(0)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{company.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{userCount} users</div>
                                    </div>
                                    <span style={{
                                        padding: '3px 8px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500,
                                        background: company.status === 'ACTIVE' ? '#ecfdf5' : '#fef2f2',
                                        color: company.status === 'ACTIVE' ? '#10b981' : '#ef4444'
                                    }}>
                                        {company.status}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                        <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>Recent Activity</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Latest platform events</p>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {[
                        { text: 'New user registered', time: 'Just now', color: '#10b981' },
                        { text: 'Company created', time: '5 min ago', color: '#4f46e5' },
                        { text: 'Course assigned', time: '1 hour ago', color: '#8b5cf6' },
                        { text: 'User approved', time: '2 hours ago', color: '#10b981' },
                        { text: 'System backup completed', time: '1 day ago', color: '#ef4444' }
                    ].map((activity, i) => (
                        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: activity.color, marginTop: '6px', flexShrink: 0 }} />
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 400 }}>{activity.text}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{activity.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card">
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>Platform Feature Management</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Drag features between columns to enable or disable them globally.</p>
                </div>
                {!loading && (
                    <KanbanBoard
                        initialColumns={kanbanColumns}
                        items={Object.keys(ALL_FEATURES).reduce((acc, key) => {
                            acc[key] = { id: key, content: ALL_FEATURES[key] };
                            return acc;
                        }, {} as Record<string, { id: string; content: string }>)}
                        onDragEndAction={async (result) => {
                            if (!result.destination) return;

                            const { source, destination, draggableId } = result;
                            const newColumns = JSON.parse(JSON.stringify(kanbanColumns));

                            if (source.droppableId === destination.droppableId) {
                                const column = newColumns[source.droppableId];
                                column.itemIds.splice(source.index, 1);
                                column.itemIds.splice(destination.index, 0, draggableId);
                            } else {
                                const startCol = newColumns[source.droppableId];
                                const finishCol = newColumns[destination.droppableId];
                                startCol.itemIds.splice(source.index, 1);
                                finishCol.itemIds.splice(destination.index, 0, draggableId);
                            }

                            setKanbanColumns(newColumns);
                            await setDoc(doc(db, 'settings', 'features'), { columns: newColumns }, { merge: true });
                        }}
                    />
                )}
            </div>
        </div>
    );
}
