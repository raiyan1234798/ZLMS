"use client";

import { MOCK_COMPANIES } from '@/data/mockDb';
import { Search, UserPlus, Shield, GraduationCap, Users, BookOpen, Edit3, Trash2, X, Check, ChevronDown, MoreVertical } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Role = 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'TRAINER' | 'USER';

interface PlatformUser {
    id: string;
    name: string;
    email: string;
    role: Role;
    companyId: string;
    status?: string;
    createdAt?: string;
}

export default function AllUsersPage() {
    const [filter, setFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [platformUsers, setPlatformUsers] = useState<PlatformUser[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [editingUser, setEditingUser] = useState<PlatformUser | null>(null);
    const [editRole, setEditRole] = useState<Role>('USER');
    const [editName, setEditName] = useState('');
    const [saving, setSaving] = useState(false);

    const [deletingUser, setDeletingUser] = useState<PlatformUser | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [showAddModal, setShowAddModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState<Role>('USER');
    const [newCompany, setNewCompany] = useState('');
    const [adding, setAdding] = useState(false);
    const [addError, setAddError] = useState('');

    // Dropdown menu
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            const users: PlatformUser[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                users.push({ id: doc.id, ...data } as PlatformUser);
            });
            setPlatformUsers(users);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Close menu on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleEditUser = async () => {
        if (!editingUser) return;
        setSaving(true);
        try {
            await updateDoc(doc(db, 'users', editingUser.id), {
                role: editRole,
                name: editName,
            });
            setPlatformUsers(prev => prev.map(u =>
                u.id === editingUser.id ? { ...u, role: editRole, name: editName } : u
            ));
            setEditingUser(null);
        } catch (error) {
            console.error("Error updating user:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!deletingUser) return;
        setDeleting(true);
        try {
            await deleteDoc(doc(db, 'users', deletingUser.id));
            setPlatformUsers(prev => prev.filter(u => u.id !== deletingUser.id));
            setDeletingUser(null);
        } catch (error) {
            console.error("Error deleting user:", error);
        } finally {
            setDeleting(false);
        }
    };

    const handleAddUser = async () => {
        if (!newName || !newEmail || (!newCompany && newRole !== 'SUPER_ADMIN')) {
            setAddError('All fields are required.');
            return;
        }
        setAdding(true);
        setAddError('');
        try {
            const newId = `manual_${Date.now()}`;
            const userData = {
                name: newName,
                email: newEmail,
                role: newRole,
                companyId: newRole === 'SUPER_ADMIN' ? 'platform' : newCompany,
                status: 'ACTIVE',
                createdAt: new Date().toISOString(),
            };
            await setDoc(doc(db, 'users', newId), userData);
            setPlatformUsers(prev => [...prev, { id: newId, ...userData }]);
            setShowAddModal(false);
            setNewName('');
            setNewEmail('');
            setNewRole('USER');
            setNewCompany('');
        } catch (error: any) {
            setAddError(error.message);
        } finally {
            setAdding(false);
        }
    };

    const filtered = platformUsers
        .filter(u => filter === 'ALL' || u.role === filter)
        .filter(u => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
        });

    const roleColor = (role: string) => {
        switch (role) {
            case 'SUPER_ADMIN': return { bg: '#f3e8ff', color: '#9333ea' };
            case 'COMPANY_ADMIN': return { bg: '#eef2ff', color: '#4f46e5' };
            case 'TRAINER': return { bg: '#fef3c7', color: '#d97706' };
            default: return { bg: '#ecfdf5', color: '#10b981' };
        }
    };

    const roleLabel = (role: string) => {
        switch (role) {
            case 'SUPER_ADMIN': return 'Super Admin';
            case 'COMPANY_ADMIN': return 'Admin';
            case 'TRAINER': return 'Trainer';
            default: return 'Learner';
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>All Users</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{platformUsers.length} users across all companies.</p>
                </div>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowAddModal(true)}>
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
                    <input type="text" placeholder="Search users..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '10px 14px 10px 42px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }} />
                </div>
                {['ALL', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'TRAINER', 'USER'].map(r => (
                    <button key={r} onClick={() => setFilter(r)} className={filter === r ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                        {r === 'ALL' ? 'All' : r === 'SUPER_ADMIN' ? 'Super Admins' : r === 'COMPANY_ADMIN' ? 'Admins' : r === 'TRAINER' ? 'Trainers' : 'Learners'}
                    </button>
                ))}
            </div>

            {/* Users Table */}
            <div className="card" style={{ padding: 0, overflow: 'visible', paddingBottom: '8px' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading users...</div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--background)' }}>
                                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>User</th>
                                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Company</th>
                                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Role</th>
                                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Status</th>
                                <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Actions</th>
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
                                                {roleLabel(user.role)}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 24px' }}>
                                            <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500, background: user.status === 'PRE_APPROVED' ? '#f1f5f9' : '#ecfdf5', color: user.status === 'PRE_APPROVED' ? '#64748b' : '#10b981' }}>
                                                {user.status === 'PRE_APPROVED' ? 'Pre-Approved' : 'Active'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 24px', textAlign: 'right', position: 'relative' }}>
                                            <div ref={openMenuId === user.id ? menuRef : null} style={{ position: 'relative', display: 'inline-block' }}>
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                                                    style={{ padding: '6px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer' }}
                                                >
                                                    <MoreVertical size={16} color="var(--text-muted)" />
                                                </button>
                                                {openMenuId === user.id && (
                                                    <div style={{
                                                        position: 'absolute', right: 0, top: '100%', marginTop: '4px',
                                                        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px',
                                                        boxShadow: '0 10px 40px rgba(0,0,0,0.12)', zIndex: 100, minWidth: '160px',
                                                        overflow: 'hidden', animation: 'fadeInUp 0.2s ease'
                                                    }}>
                                                        <button
                                                            onClick={() => { setEditingUser(user); setEditRole(user.role); setEditName(user.name || ''); setOpenMenuId(null); }}
                                                            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', width: '100%', fontSize: '0.85rem', color: 'var(--foreground)', textAlign: 'left' }}
                                                        >
                                                            <Edit3 size={14} color="#4f46e5" /> Edit Role
                                                        </button>
                                                        <div style={{ height: '1px', background: 'var(--border)' }} />
                                                        <button
                                                            onClick={() => { setDeletingUser(user); setOpenMenuId(null); }}
                                                            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', width: '100%', fontSize: '0.85rem', color: '#ef4444', textAlign: 'left' }}
                                                        >
                                                            <Trash2 size={14} /> Remove User
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ─── EDIT USER MODAL ─── */}
            {editingUser && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }} onClick={() => setEditingUser(null)}>
                    <div className="animate-fade-in-up" onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '440px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.2rem' }}>Edit User</h3>
                            <button onClick={() => setEditingUser(null)} style={{ padding: '6px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                <X size={18} color="var(--text-muted)" />
                            </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px', background: 'var(--background)', marginBottom: '24px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>
                                {editingUser.name ? editingUser.name.split(' ').map(n => n[0]).join('').slice(0, 2) : '?'}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600 }}>{editingUser.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{editingUser.email}</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '8px', color: 'var(--text-muted)' }}>Display Name</label>
                            <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="input-modern" />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '8px', color: 'var(--text-muted)' }}>Role</label>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {(['SUPER_ADMIN', 'COMPANY_ADMIN', 'TRAINER', 'USER'] as Role[]).map(r => {
                                    const rc = roleColor(r);
                                    const selected = editRole === r;
                                    return (
                                        <button key={r} onClick={() => setEditRole(r)} style={{
                                            flex: '1 1 calc(50% - 4px)', padding: '12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600,
                                            background: selected ? rc.color : 'var(--background)',
                                            color: selected ? 'white' : rc.color,
                                            border: `2px solid ${selected ? rc.color : 'var(--border)'}`,
                                            transition: 'all 0.2s ease'
                                        }}>
                                            {roleLabel(r)}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setEditingUser(null)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                            <button onClick={handleEditUser} className="btn-primary" style={{ flex: 1 }} disabled={saving}>
                                {saving ? 'Saving...' : <><Check size={16} /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── DELETE CONFIRMATION MODAL ─── */}
            {deletingUser && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }} onClick={() => setDeletingUser(null)}>
                    <div className="animate-fade-in-up" onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Trash2 size={28} color="#ef4444" />
                            </div>
                        </div>
                        <h3 style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '8px' }}>Remove User</h3>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                            Are you sure you want to remove <strong>{deletingUser.name}</strong>? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setDeletingUser(null)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                            <button onClick={handleDeleteUser} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#ef4444', color: 'white', fontWeight: 600, fontSize: '0.9rem' }} disabled={deleting}>
                                {deleting ? 'Removing...' : 'Remove User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── ADD USER MODAL ─── */}
            {showAddModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }} onClick={() => setShowAddModal(false)}>
                    <div className="animate-fade-in-up" onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.2rem' }}>Add New User</h3>
                            <button onClick={() => setShowAddModal(false)} style={{ padding: '6px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                <X size={18} color="var(--text-muted)" />
                            </button>
                        </div>

                        {addError && (
                            <div style={{ padding: '10px 14px', background: '#fef2f2', color: '#ef4444', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '16px', border: '1px solid #fecaca' }}>
                                {addError}
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>Full Name</label>
                                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="input-modern" placeholder="John Doe" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>Email Address</label>
                                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="input-modern" placeholder="john@company.com" />
                            </div>
                            {newRole !== 'SUPER_ADMIN' && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>Company</label>
                                    <select value={newCompany} onChange={e => setNewCompany(e.target.value)} className="input-modern" style={{ cursor: 'pointer', appearance: 'none' }}>
                                        <option value="">Select a company...</option>
                                        {MOCK_COMPANIES.filter(c => c.status === 'ACTIVE').map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>Role</label>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {(['SUPER_ADMIN', 'COMPANY_ADMIN', 'TRAINER', 'USER'] as Role[]).map(r => {
                                        const rc = roleColor(r);
                                        const selected = newRole === r;
                                        return (
                                            <button key={r} onClick={() => setNewRole(r)} style={{
                                                flex: '1 1 calc(50% - 4px)', padding: '10px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600,
                                                background: selected ? rc.color : 'var(--background)',
                                                color: selected ? 'white' : rc.color,
                                                border: `2px solid ${selected ? rc.color : 'var(--border)'}`,
                                                transition: 'all 0.2s ease'
                                            }}>
                                                {roleLabel(r)}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <button onClick={() => setShowAddModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                            <button onClick={handleAddUser} className="btn-primary" style={{ flex: 1 }} disabled={adding}>
                                {adding ? 'Adding...' : <><UserPlus size={16} /> Add User</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
