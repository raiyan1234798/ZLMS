"use client";
import { useParams } from 'next/navigation';
import { MOCK_COMPANIES } from '@/data/mockDb';
import { Search, UserPlus, Shield, GraduationCap, Users, Edit3, Trash2, X, Check, MoreVertical, BookOpen, Clock, CheckCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Role = 'COMPANY_ADMIN' | 'TRAINER' | 'USER';
type Status = 'ACTIVE' | 'PENDING' | 'PRE_APPROVED';

interface CourseRequest {
    id: string;
    userId: string;
    userName: string;
    courseId: string;
    courseTitle: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    requestedAt: string;
}

interface CompanyUser {
    id: string;
    name: string;
    email: string;
    role: Role;
    companyId: string;
    status: Status;
    createdAt?: string;
}

export default function CompanyUsersPage() {
    const { domain } = useParams() as { domain: string };
    const company = MOCK_COMPANIES.find(c => c.subdomain === domain);
    const themeColor = company?.branding.themeColor || '#4f46e5';

    const [users, setUsers] = useState<CompanyUser[]>([]);
    const [courseRequests, setCourseRequests] = useState<CourseRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Edit modal
    const [editingUser, setEditingUser] = useState<CompanyUser | null>(null);
    const [editRole, setEditRole] = useState<Role>('USER');
    const [editName, setEditName] = useState('');
    const [saving, setSaving] = useState(false);

    // Delete modal
    const [deletingUser, setDeletingUser] = useState<CompanyUser | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Add / Pre-Approve modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState<Role>('USER');
    const [adding, setAdding] = useState(false);
    const [addError, setAddError] = useState('');

    // Approve Modal
    const [approvingUser, setApprovingUser] = useState<CompanyUser | null>(null);
    const [approveRole, setApproveRole] = useState<Role>('USER');
    const [approving, setApproving] = useState(false);

    // Menu
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const fetchUsers = async () => {
        if (!company) return;
        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            const companyUsers: CompanyUser[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.companyId === company.id) {
                    companyUsers.push({ id: doc.id, ...data, status: data.status || 'ACTIVE' } as CompanyUser);
                }
            });
            setUsers(companyUsers);

            // Fetch course requests for this company
            const reqSnapshot = await getDocs(collection(db, 'companies', company.id, 'requests'));
            const courseReqs: CourseRequest[] = [];
            reqSnapshot.forEach((doc) => {
                courseReqs.push({ id: doc.id, ...doc.data() } as CourseRequest);
            });
            setCourseRequests(courseReqs.filter(r => r.status === 'PENDING'));
        } catch (error) {
            console.error("Error fetching users or requests:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [company]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const roleColor = (role: string) => {
        switch (role) { case 'COMPANY_ADMIN': return { bg: '#eef2ff', color: '#4f46e5' }; case 'TRAINER': return { bg: '#fef3c7', color: '#d97706' }; default: return { bg: '#ecfdf5', color: '#10b981' }; }
    };

    const roleLabel = (role: string) => {
        switch (role) { case 'COMPANY_ADMIN': return 'Admin'; case 'TRAINER': return 'Trainer'; default: return 'Learner'; }
    };

    const handleEditUser = async () => {
        if (!editingUser) return;
        setSaving(true);
        try {
            await updateDoc(doc(db, 'users', editingUser.id), { role: editRole, name: editName });
            setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, role: editRole, name: editName } : u));
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
            setUsers(prev => prev.filter(u => u.id !== deletingUser.id));
            setDeletingUser(null);
        } catch (error) {
            console.error("Error deleting user:", error);
        } finally {
            setDeleting(false);
        }
    };

    const handleApproveUser = async () => {
        if (!approvingUser) return;
        setApproving(true);
        try {
            await updateDoc(doc(db, 'users', approvingUser.id), { role: approveRole, status: 'ACTIVE' });
            setUsers(prev => prev.map(u => u.id === approvingUser.id ? { ...u, role: approveRole, status: 'ACTIVE' } : u));
            setApprovingUser(null);
        } catch (error) {
            console.error("Error approving user:", error);
        } finally {
            setApproving(false);
        }
    };

    const handlePreApproveUser = async () => {
        if (!newEmail || !company) { setAddError('Email is required.'); return; }
        setAdding(true);
        setAddError('');
        try {
            const newId = `pre_${Date.now()}`;
            const userData = {
                name: 'Pending Invite',
                email: newEmail,
                role: newRole,
                companyId: company.id,
                status: 'PRE_APPROVED' as Status,
                createdAt: new Date().toISOString(),
            };
            await setDoc(doc(db, 'users', newId), userData);
            setUsers(prev => [...prev, { id: newId, ...userData }]);
            setShowAddModal(false);
            setNewEmail('');
            setNewRole('USER');
        } catch (error: any) {
            setAddError(error.message);
        } finally {
            setAdding(false);
        }
    };

    const handleApproveCourseRequest = async (request: CourseRequest) => {
        try {
            await updateDoc(doc(db, 'companies', company!.id, 'requests', request.id), { status: 'APPROVED' });
            await updateDoc(doc(db, 'users', request.userId, 'requests', request.courseId), { status: 'APPROVED' });

            await setDoc(doc(db, 'users', request.userId, 'assignments', request.courseId), {
                courseId: request.courseId,
                assignedAt: new Date().toISOString()
            });

            setCourseRequests(prev => prev.filter(r => r.id !== request.id));
        } catch (err) {
            console.error("Error approving course request", err);
        }
    };

    const handleRejectCourseRequest = async (request: CourseRequest) => {
        try {
            await deleteDoc(doc(db, 'companies', company!.id, 'requests', request.id));
            await deleteDoc(doc(db, 'users', request.userId, 'requests', request.courseId));
            setCourseRequests(prev => prev.filter(r => r.id !== request.id));
        } catch (err) {
            console.error("Error rejecting course request", err);
        }
    };

    const filtered = users.filter(u => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
    });

    const pendingUsers = filtered.filter(u => u.status === 'PENDING');
    const teamMembers = filtered.filter(u => u.status === 'ACTIVE' || u.status === 'PRE_APPROVED');

    if (!company) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Company not found</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Access Management</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Pre-approve emails and manage login requests for {company.name}</p>
                </div>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)` }} onClick={() => setShowAddModal(true)}>
                    <UserPlus size={16} /> Pre-Approve Email
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {[
                    { icon: Clock, label: 'Pending Requests', value: users.filter(u => u.status === 'PENDING').length, color: '#f59e0b' },
                    { icon: Shield, label: 'Admins', value: users.filter(u => u.role === 'COMPANY_ADMIN' && u.status === 'ACTIVE').length, color: '#4f46e5' },
                    { icon: BookOpen, label: 'Trainers', value: users.filter(u => u.role === 'TRAINER' && u.status === 'ACTIVE').length, color: themeColor },
                    { icon: GraduationCap, label: 'Learners', value: users.filter(u => u.role === 'USER' && u.status === 'ACTIVE').length, color: '#10b981' },
                ].map((s, i) => {
                    const Icon = s.icon; return (
                        <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: s.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={20} color={s.color} /></div>
                            <div><div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{loading ? '-' : s.value}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.label}</div></div>
                        </div>
                    );
                })}
            </div>

            {/* Portal Access Requests */}
            {pendingUsers.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={18} color="#f59e0b" /> Pending Portal Access Requests
                    </h2>
                    <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #fcd34d' }}>
                        {pendingUsers.map((user, i) => (
                            <div key={user.id} style={{ padding: '16px 24px', borderBottom: i < pendingUsers.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fffbeb' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>
                                        {user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : '?'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#92400e' }}>{user.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#b45309' }}>{user.email} • Requested portal access</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <button onClick={() => { setDeletingUser(user); }} style={{ padding: '8px 16px', borderRadius: '8px', background: '#fee2e2', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>Reject</button>
                                    <button onClick={() => { setApprovingUser(user); setApproveRole('USER') }} style={{ padding: '8px 16px', borderRadius: '8px', background: '#10b981', color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>Review & Approve</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Course Access Requests */}
            {courseRequests.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BookOpen size={18} color="#8b5cf6" /> Pending Course Access Requests
                    </h2>
                    <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #c4b5fd' }}>
                        {courseRequests.map((req, i) => (
                            <div key={req.id} style={{ padding: '16px 24px', borderBottom: i < courseRequests.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f5f3ff' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>
                                        <BookOpen size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#5b21b6' }}>{req.courseTitle}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#7c3aed' }}>{req.userName} requested access to this course</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <button onClick={() => handleRejectCourseRequest(req)} style={{ padding: '8px 16px', borderRadius: '8px', background: '#fee2e2', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>Reject</button>
                                    <button onClick={() => handleApproveCourseRequest(req)} style={{ padding: '8px 16px', borderRadius: '8px', background: '#8b5cf6', color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>Approve Access</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Search + Table */}
            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color={themeColor} /> Directory
            </h2>
            <div className="card" style={{ padding: 0, overflow: 'visible', paddingBottom: '8px' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search members..." style={{ width: '100%', padding: '10px 14px 10px 42px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }} />
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading directory...</div>
                ) : teamMembers.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        {searchQuery ? 'No members match your search.' : 'No active or pre-approved members yet.'}
                    </div>
                ) : teamMembers.map((user, i) => {
                    const rc = roleColor(user.role);
                    return (
                        <div key={user.id} style={{ padding: '14px 24px', borderBottom: i < teamMembers.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: user.status === 'PRE_APPROVED' ? '#cbd5e1' : (user.role === 'COMPANY_ADMIN' ? themeColor : user.role === 'TRAINER' ? '#f59e0b' : '#10b981'),
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 600
                                }}>
                                    {user.status === 'PRE_APPROVED' ? <Clock size={16} /> : (user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : '?')}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 500 }}>{user.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500, background: rc.bg, color: rc.color }}>{roleLabel(user.role)}</span>
                                {user.status === 'PRE_APPROVED' ? (
                                    <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500, background: '#f1f5f9', color: '#64748b' }}>Waiting to Join</span>
                                ) : (
                                    <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500, background: '#ecfdf5', color: '#10b981' }}>Active</span>
                                )}

                                {/* Action menu */}
                                <div ref={openMenuId === user.id ? menuRef : null} style={{ position: 'relative' }}>
                                    <button onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)} style={{ padding: '6px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
                                        <MoreVertical size={14} color="var(--text-muted)" />
                                    </button>
                                    {openMenuId === user.id && (
                                        <div style={{
                                            position: 'absolute', right: 0, top: '100%', marginTop: '4px',
                                            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px',
                                            boxShadow: '0 10px 40px rgba(0,0,0,0.12)', zIndex: 100, minWidth: '150px',
                                            overflow: 'hidden', animation: 'fadeInUp 0.15s ease'
                                        }}>
                                            <button
                                                onClick={() => { setEditingUser(user); setEditRole(user.role); setEditName(user.name); setOpenMenuId(null); }}
                                                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', width: '100%', fontSize: '0.85rem', color: 'var(--foreground)', textAlign: 'left' }}
                                            >
                                                <Edit3 size={14} color={themeColor} /> Edit Role
                                            </button>
                                            <div style={{ height: '1px', background: 'var(--border)' }} />
                                            <button
                                                onClick={() => { setDeletingUser(user); setOpenMenuId(null); }}
                                                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', width: '100%', fontSize: '0.85rem', color: '#ef4444', textAlign: 'left' }}
                                            >
                                                <Trash2 size={14} /> Remove
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ─── APPROVE MODAL ─── */}
            {approvingUser && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }} onClick={() => setApprovingUser(null)}>
                    <div className="animate-fade-in-up" onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '440px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.2rem' }}>Approve Access Request</h3>
                            <button onClick={() => setApprovingUser(null)} style={{ padding: '6px', borderRadius: '8px', border: '1px solid var(--border)' }}><X size={18} color="var(--text-muted)" /></button>
                        </div>

                        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', marginBottom: '20px' }}>
                            <div style={{ fontWeight: 600 }}>{approvingUser.name}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{approvingUser.email}</div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '8px', color: 'var(--text-muted)' }}>Assign Role</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {(['COMPANY_ADMIN', 'TRAINER', 'USER'] as Role[]).map(r => {
                                    const rc = roleColor(r);
                                    const selected = approveRole === r;
                                    return (
                                        <button key={r} onClick={() => setApproveRole(r)} style={{
                                            flex: 1, padding: '12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600,
                                            background: selected ? rc.color : 'var(--background)',
                                            color: selected ? 'white' : rc.color,
                                            border: `2px solid ${selected ? rc.color : 'var(--border)'}`,
                                            transition: 'all 0.2s ease'
                                        }}>{roleLabel(r)}</button>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setApprovingUser(null)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                            <button onClick={handleApproveUser} className="btn-primary" style={{ flex: 1, background: '#10b981' }} disabled={approving}>
                                {approving ? 'Approving...' : <><CheckCircle size={16} /> Grant Access</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── EDIT USER MODAL ─── */}
            {editingUser && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }} onClick={() => setEditingUser(null)}>
                    <div className="animate-fade-in-up" onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '440px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.2rem' }}>Edit Team Member</h3>
                            <button onClick={() => setEditingUser(null)} style={{ padding: '6px', borderRadius: '8px', border: '1px solid var(--border)' }}><X size={18} color="var(--text-muted)" /></button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px', background: 'var(--background)', marginBottom: '24px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>
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
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {(['COMPANY_ADMIN', 'TRAINER', 'USER'] as Role[]).map(r => {
                                    const rc = roleColor(r);
                                    const selected = editRole === r;
                                    return (
                                        <button key={r} onClick={() => setEditRole(r)} style={{
                                            flex: 1, padding: '12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600,
                                            background: selected ? rc.color : 'var(--background)',
                                            color: selected ? 'white' : rc.color,
                                            border: `2px solid ${selected ? rc.color : 'var(--border)'}`,
                                            transition: 'all 0.2s ease'
                                        }}>{roleLabel(r)}</button>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setEditingUser(null)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                            <button onClick={handleEditUser} className="btn-primary" style={{ flex: 1, background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)` }} disabled={saving}>
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
                        <h3 style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '8px' }}>{deletingUser.status === 'PENDING' ? 'Reject Request' : 'Remove Member'}</h3>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                            Are you sure you want to {deletingUser.status === 'PENDING' ? 'reject the access request from' : 'remove'} <strong>{deletingUser.email}</strong> from {company.name}?
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setDeletingUser(null)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                            <button onClick={handleDeleteUser} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#ef4444', color: 'white', fontWeight: 600, fontSize: '0.9rem' }} disabled={deleting}>
                                {deleting ? 'Removing...' : 'Remove'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── PRE-APPROVE MODAL ─── */}
            {showAddModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }} onClick={() => setShowAddModal(false)}>
                    <div className="animate-fade-in-up" onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '440px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.2rem' }}>Pre-Approve Access</h3>
                            <button onClick={() => setShowAddModal(false)} style={{ padding: '6px', borderRadius: '8px', border: '1px solid var(--border)' }}><X size={18} color="var(--text-muted)" /></button>
                        </div>

                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                            Enter an email address. When this user logs in via Google or email/password, they will be granted immediate access with the role you select.
                        </p>

                        {addError && (
                            <div style={{ padding: '10px 14px', background: '#fef2f2', color: '#ef4444', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '16px', border: '1px solid #fecaca' }}>
                                {addError}
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>Email Address</label>
                                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="input-modern" placeholder={`employee@${company.subdomain}.com`} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>Granted Role</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {(['COMPANY_ADMIN', 'TRAINER', 'USER'] as Role[]).map(r => {
                                        const rc = roleColor(r);
                                        const selected = newRole === r;
                                        return (
                                            <button key={r} onClick={() => setNewRole(r)} style={{
                                                flex: 1, padding: '10px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600,
                                                background: selected ? rc.color : 'var(--background)',
                                                color: selected ? 'white' : rc.color,
                                                border: `2px solid ${selected ? rc.color : 'var(--border)'}`,
                                                transition: 'all 0.2s ease'
                                            }}>{roleLabel(r)}</button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <button onClick={() => setShowAddModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                            <button onClick={handlePreApproveUser} className="btn-primary" style={{ flex: 1, background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)` }} disabled={adding}>
                                {adding ? 'Validating...' : <><UserPlus size={16} /> Save Pre-Approval</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
