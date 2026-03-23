'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CheckCircle, XCircle, Clock, User, Building2, Shield } from 'lucide-react';

export default function ApprovalsPage() {
    const [pending, setPending] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const snap = await getDocs(collection(db, 'users'));
            const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setPending(all.filter((u: any) => u.status === 'pending' || u.approvalStatus === 'pending'));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPending(); }, []);

    const handleApprove = async (userId: string, companyId: string) => {
        setProcessingId(userId);
        try {
            await updateDoc(doc(db, 'users', userId), {
                status: 'active',
                approvalStatus: 'approved',
                role: 'learner',
                companyId: companyId || 'unknown',
            });
            await fetchPending();
        } catch (err) {
            alert('Failed to approve user.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (userId: string) => {
        setProcessingId(userId);
        try {
            await updateDoc(doc(db, 'users', userId), {
                status: 'rejected',
                approvalStatus: 'rejected',
            });
            await fetchPending();
        } catch (err) {
            alert('Failed to reject user.');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>User Approvals</h1>
                <p style={{ color: 'var(--text-muted)' }}>Review and approve new user registrations.</p>
            </div>

            {loading ? (
                <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    Loading pending approvals...
                </div>
            ) : pending.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '64px' }}>
                    <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>All Clear!</h3>
                    <p style={{ color: 'var(--text-muted)' }}>No pending user approvals at this time.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {pending.map((u) => (
                        <div key={u.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, flexShrink: 0 }}>
                                {(u.displayName || u.email || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{u.displayName || 'Unknown User'}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <User size={13} /> {u.email}
                                    </span>
                                    {u.companyId && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Building2 size={13} /> {u.companyId}
                                        </span>
                                    )}
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b' }}>
                                        <Clock size={13} /> Pending
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                <button
                                    onClick={() => handleApprove(u.id, u.companyId)}
                                    disabled={processingId === u.id}
                                    className="btn-primary"
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: '#10b981', opacity: processingId === u.id ? 0.7 : 1 }}
                                >
                                    <CheckCircle size={16} /> Approve
                                </button>
                                <button
                                    onClick={() => handleReject(u.id)}
                                    disabled={processingId === u.id}
                                    className="btn-secondary"
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', color: '#ef4444', borderColor: '#ef4444', opacity: processingId === u.id ? 0.7 : 1 }}
                                >
                                    <XCircle size={16} /> Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
