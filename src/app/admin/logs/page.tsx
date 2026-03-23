"use client";

import { MOCK_COMPANIES } from '@/data/mockDb';
import { Activity, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const activityLogs = [
    { id: 1, action: 'Company Created', detail: 'Skyline Real Estate was added to the platform', company: 'c3', user: 'Rayan', time: '30 minutes ago', type: 'company' },
    { id: 2, action: 'User Enrolled', detail: 'Tom Harris enrolled in Cold Calling Mastery', company: 'c2', user: 'Tom Harris', time: '1 hour ago', type: 'enrollment' },
    { id: 3, action: 'Course Completed', detail: 'Jane Smith completed React Fundamentals', company: 'c1', user: 'Jane Smith', time: '2 hours ago', type: 'completion' },
    { id: 4, action: 'Certificate Issued', detail: 'Certificate issued to Emily Chen for TypeScript course', company: 'c1', user: 'Emily Chen', time: '3 hours ago', type: 'certificate' },
    { id: 5, action: 'Plan Upgraded', detail: 'Acme Corp upgraded from Professional to Enterprise', company: 'c2', user: 'Robert Taylor', time: '5 hours ago', type: 'billing' },
    { id: 6, action: 'User Invited', detail: 'Maria Rodriguez invited 3 new agents', company: 'c3', user: 'Maria Rodriguez', time: '6 hours ago', type: 'user' },
    { id: 7, action: 'Course Created', detail: 'Nina Patel created "Customer Service 101"', company: 'c4', user: 'Nina Patel', time: '8 hours ago', type: 'course' },
    { id: 8, action: 'Account Suspended', detail: 'NovaTech Solutions suspended for non-payment', company: 'c6', user: 'System', time: '1 day ago', type: 'billing' },
    { id: 9, action: 'HIPAA Training Assigned', detail: 'HIPAA Compliance Training assigned to all MedLearn staff', company: 'c5', user: 'Dr. Helen Park', time: '1 day ago', type: 'enrollment' },
    { id: 10, action: 'Feature Enabled', detail: 'AI Course Builder enabled for Global IT Academy', company: 'c1', user: 'Rayan', time: '2 days ago', type: 'feature' },
    { id: 11, action: 'Branding Updated', detail: 'TravelPro Agency updated their logo and theme color', company: 'c4', user: 'Carlos Mendez', time: '2 days ago', type: 'branding' },
    { id: 12, action: 'Quiz Passed', detail: 'Sophie Turner scored 95% on Property Law quiz', company: 'c3', user: 'Sophie Turner', time: '3 days ago', type: 'completion' },
];

const typeColor = (type: string) => {
    switch (type) {
        case 'company': return '#4f46e5';
        case 'enrollment': return '#10b981';
        case 'completion': return '#8b5cf6';
        case 'certificate': return '#f59e0b';
        case 'billing': return '#ef4444';
        case 'user': return '#06b6d4';
        case 'course': return '#ec4899';
        case 'feature': return '#14b8a6';
        case 'branding': return '#f97316';
        default: return '#64748b';
    }
};

export default function ActivityLogsPage() {
    const [filter, setFilter] = useState('all');
    const [platformUsers, setPlatformUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'users'));
                const users: any[] = [];
                querySnapshot.forEach((doc) => {
                    users.push({ id: doc.id, ...doc.data() });
                });
                setPlatformUsers(users);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const activeCompanyIds = loading ? [] : Array.from(new Set(platformUsers.filter(u => u.companyId && u.companyId !== 'platform').map(u => u.companyId)));
    const activeActivityLogs = loading ? [] : activityLogs.filter(log => activeCompanyIds.includes(log.company));

    const filtered = filter === 'all' ? activeActivityLogs : activeActivityLogs.filter(l => l.type === filter);

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Activity Logs</h1>
                <p style={{ color: 'var(--text-muted)' }}>Track every action across the platform active tenants in real time.</p>
            </div>

            {/* Filter */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <Filter size={18} color="var(--text-muted)" style={{ marginTop: '8px' }} />
                {['all', 'company', 'enrollment', 'completion', 'certificate', 'billing', 'course'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={filter === f ? 'btn-primary' : 'btn-secondary'} style={{ padding: '6px 14px', fontSize: '0.8rem', textTransform: 'capitalize' }}>
                        {f}
                    </button>
                ))}
            </div>

            {/* Logs */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading activity logs...</div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No logs found for active tenants.</div>
                ) : filtered.map((log, i) => {
                    const company = MOCK_COMPANIES.find(c => c.id === log.company);
                    return (
                        <div key={log.id} style={{ padding: '16px 24px', borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: typeColor(log.type), flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{log.action}</span>
                                    <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 500, background: typeColor(log.type) + '15', color: typeColor(log.type), textTransform: 'capitalize' }}>{log.type}</span>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{log.detail}</div>
                            </div>
                            {company && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                    <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: company.branding.themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.6rem', fontWeight: 600 }}>{company.name.charAt(0)}</div>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{company.name}</span>
                                </div>
                            )}
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0, minWidth: '100px', textAlign: 'right' }}>{log.time}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
