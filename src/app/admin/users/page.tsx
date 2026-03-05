"use client";

import { MOCK_COMPANIES } from '@/data/mockDb';
import { Search, UserPlus, Shield, GraduationCap, Users, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AllUsersPage() {
    const [filter, setFilter] = useState('ALL');
    const [platformUsers, setPlatformUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'users'));
                const users: any[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.role !== 'SUPER_ADMIN' && data.companyId !== 'platform') {
                        users.push({ id: doc.id, ...data });
                    }
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

    const filtered = filter === 'ALL' ? platformUsers : platformUsers.filter(u => u.role === filter);

    const roleColor = (role: string) => {
        switch (role) {
            case 'COMPANY_ADMIN': return { bg: '#eef2ff', color: '#4f46e5' };
            case 'TRAINER': return { bg: '#fef3c7', color: '#d97706' };
            default: return { bg: '#ecfdf5', color: '#10b981' };
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>All Users</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{platformUsers.length} users across all companies.</p>
                </div>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserPlus size={16} /> Add User
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                {[
                    { icon: Users, label: 'Total Users', value: platformUsers.length, color: '#4f46e5', bg: '#eef2ff' },
                    { icon: Shield, label: 'Admins', value: platformUsers.filter(u => u.role === 'COMPANY_ADMIN').length, color: '#ef4444', bg: '#fef2f2' },
                    { icon: BookOpen, label: 'Trainers', value: platformUsers.filter(u => u.role === 'TRAINER').length, color: '#f59e0b', bg: '#fffbeb' },
                    { icon: GraduationCap, label: 'Learners', value: platformUsers.filter(u => u.role === 'USER').length, color: '#10b981', bg: '#ecfdf5' },
                ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={20} color={s.color} />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{loading ? '-' : s.value}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.label}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Filters + Search */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                    <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" placeholder="Search users..." style={{ width: '100%', padding: '10px 14px 10px 42px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }} />
                </div>
                {['ALL', 'COMPANY_ADMIN', 'TRAINER', 'USER'].map(r => (
                    <button key={r} onClick={() => setFilter(r)} className={filter === r ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                        {r === 'ALL' ? 'All' : r === 'COMPANY_ADMIN' ? 'Admins' : r === 'TRAINER' ? 'Trainers' : 'Learners'}
                    </button>
                ))}
            </div>

            {/* Users Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading users...</div>
                ) : platformUsers.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--background)' }}>
                                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>User</th>
                                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Company</th>
                                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Role</th>
                                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(user => {
                                const company = MOCK_COMPANIES.find(c => c.id === user.companyId);
                                const rc = roleColor(user.role);
                                return (
                                    <tr key={user.id} style={{ borderTop: '1px solid var(--border)' }}>
                                        <td style={{ padding: '14px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: company?.branding.themeColor || '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>
                                                    {user.name ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : '?'}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{user.name || 'Unknown'}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: company?.branding.themeColor || '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.65rem', fontWeight: 600 }}>
                                                    {company?.name.charAt(0) || '?'}
                                                </div>
                                                <span style={{ fontSize: '0.9rem' }}>{company?.name || user.companyId}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 24px' }}>
                                            <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500, background: rc.bg, color: rc.color }}>
                                                {user.role === 'COMPANY_ADMIN' ? 'Admin' : user.role === 'TRAINER' ? 'Trainer' : 'Learner'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 24px' }}>
                                            <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500, background: '#ecfdf5', color: '#10b981' }}>Active</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
