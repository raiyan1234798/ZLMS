"use client";

import { MOCK_COMPANIES, MOCK_COURSES } from '@/data/mockDb';
import Link from 'next/link';
import {
    Plus, Search, ArrowUpRight, CheckCircle, XCircle, Users, BookOpen
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CompaniesPage() {
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

    // Only show companies that actually have registered users in Firebase
    const activeCompanies = loading ? [] : MOCK_COMPANIES.filter(company =>
        platformUsers.some(u => u.companyId === company.id)
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Companies</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage active tenant companies on the platform.</p>
                </div>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={16} /> Add Company
                </button>
            </div>

            {/* Search */}
            <div style={{ marginBottom: '24px', position: 'relative', maxWidth: '400px' }}>
                <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                    type="text"
                    placeholder="Search companies..."
                    style={{
                        width: '100%', padding: '10px 14px 10px 42px', borderRadius: '10px',
                        border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit'
                    }}
                />
            </div>

            {/* Companies Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                {loading ? (
                    <div style={{ color: 'var(--text-muted)' }}>Loading real-time company data...</div>
                ) : activeCompanies.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)' }}>No active companies with registered users found. Try creating an account in a tenant login!</div>
                ) : activeCompanies.map((company) => {
                    const userCount = platformUsers.filter(u => u.companyId === company.id).length;
                    const courseCount = MOCK_COURSES.filter(c => c.companyId === company.id).length;
                    return (
                        <div key={company.id} className="card" style={{ overflow: 'hidden', padding: 0 }}>
                            {/* Header with gradient */}
                            <div style={{
                                background: `linear-gradient(135deg, ${company.branding.themeColor}22, ${company.branding.themeColor}44)`,
                                padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '12px',
                                        background: company.branding.themeColor, display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.2rem'
                                    }}>
                                        {company.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{company.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{company.subdomain}.zlms.com</div>
                                    </div>
                                </div>
                            </div>

                            {/* Body */}
                            <div style={{ padding: '20px' }}>
                                {/* Status + Features */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Status</div>
                                        <span style={{
                                            padding: '3px 10px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 500,
                                            background: company.status === 'ACTIVE' ? '#ecfdf5' : '#fef2f2',
                                            color: company.status === 'ACTIVE' ? '#10b981' : '#ef4444',
                                            display: 'inline-flex', alignItems: 'center', gap: '4px'
                                        }}>
                                            {company.status === 'ACTIVE' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                            {company.status}
                                        </span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Plan</div>
                                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{company.features.length >= 5 ? 'Enterprise' : company.features.length >= 4 ? 'Professional' : 'Basic'}</div>
                                    </div>
                                </div>

                                {/* User + Course counts */}
                                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        <Users size={14} /> {userCount} users
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        <BookOpen size={14} /> {courseCount} courses
                                    </div>
                                </div>

                                {/* Feature badges */}
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                    {company.features.slice(0, 4).map((f, i) => (
                                        <span key={i} style={{
                                            padding: '2px 8px', borderRadius: '6px', background: 'var(--background)',
                                            fontSize: '0.7rem', color: 'var(--text-muted)', border: '1px solid var(--border)'
                                        }}>
                                            {f}
                                        </span>
                                    ))}
                                    {company.features.length > 4 && (
                                        <span style={{
                                            padding: '2px 8px', borderRadius: '6px', background: 'var(--background)',
                                            fontSize: '0.7rem', color: 'var(--text-muted)'
                                        }}>
                                            +{company.features.length - 4} more
                                        </span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Link href={`/company/${company.subdomain}/admin`} className="btn-primary" style={{
                                        flex: 1, padding: '8px', fontSize: '0.85rem', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', gap: '6px'
                                    }}>
                                        Open Admin <ArrowUpRight size={14} />
                                    </Link>
                                    <Link href={`/company/${company.subdomain}/dashboard`} className="btn-secondary" style={{
                                        padding: '8px 14px', fontSize: '0.85rem'
                                    }}>
                                        Learner View
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Add Company Card */}
                {!loading && (
                    <div className="card" style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px',
                        border: '2px dashed var(--border)', background: 'transparent', cursor: 'pointer'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '12px', background: 'var(--background)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
                                border: '1px solid var(--border)'
                            }}>
                                <Plus size={24} color="var(--text-muted)" />
                            </div>
                            <div style={{ fontWeight: 500, marginBottom: '4px' }}>Add New Company</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Create a new tenant</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
