"use client";

import { MOCK_COMPANIES, getTotalStats } from '@/data/mockDb';
import { CreditCard, CheckCircle, AlertCircle, DollarSign, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function BillingPage() {
    const stats = getTotalStats();
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
    const activeCompanies = loading ? [] : MOCK_COMPANIES.filter(c => activeCompanyIds.includes(c.id));

    const plans = [
        { name: 'Basic', price: 49, companies: activeCompanies.filter(c => c.features.length < 4).length },
        { name: 'Professional', price: 149, companies: activeCompanies.filter(c => c.features.length >= 4 && c.features.length < 5).length },
        { name: 'Enterprise', price: 499, companies: activeCompanies.filter(c => c.features.length >= 5).length },
    ];
    const totalMRR = plans.reduce((sum, p) => sum + p.price * p.companies, 0);

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Billing & Subscriptions</h1>
                <p style={{ color: 'var(--text-muted)' }}>Manage active company subscriptions and view revenue metrics.</p>
            </div>

            {/* Revenue Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {[
                    { icon: DollarSign, label: 'Monthly Revenue', value: loading ? '-' : `$${totalMRR.toLocaleString()}`, sub: '+18% vs last month', color: '#10b981', bg: '#ecfdf5' },
                    { icon: CreditCard, label: 'Active Subscriptions', value: loading ? '-' : activeCompanies.length, sub: `${activeCompanies.length} total`, color: '#4f46e5', bg: '#eef2ff' },
                    { icon: TrendingUp, label: 'Annual Run Rate', value: loading ? '-' : `$${(totalMRR * 12).toLocaleString()}`, sub: 'Projected revenue', color: '#8b5cf6', bg: '#f5f3ff' },
                    { icon: AlertCircle, label: 'Accounts At Risk', value: 0, sub: 'No past due accounts', color: '#ef4444', bg: '#fef2f2' },
                ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <div key={i} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={22} color={s.color} />
                                </div>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '4px' }}>{s.value}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.label}</div>
                            <div style={{ fontSize: '0.75rem', color: s.color, marginTop: '4px' }}>{s.sub}</div>
                        </div>
                    );
                })}
            </div>

            {/* Subscriptions Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '1rem' }}>Active Settings Subscriptions</h3>
                </div>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading billing data...</div>
                ) : activeCompanies.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No active billing accounts found.</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--background)' }}>
                                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Company</th>
                                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Plan</th>
                                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Monthly</th>
                                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Status</th>
                                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Next Billing</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeCompanies.map((company, i) => {
                                const plan = company.features.length >= 5 ? 'Enterprise' : company.features.length >= 4 ? 'Professional' : 'Basic';
                                const price = plan === 'Enterprise' ? '$499' : plan === 'Professional' ? '$149' : '$49';
                                const isPaid = company.status === 'ACTIVE';
                                return (
                                    <tr key={company.id} style={{ borderTop: '1px solid var(--border)' }}>
                                        <td style={{ padding: '14px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: company.branding.themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>{company.name.charAt(0)}</div>
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{company.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{company.subdomain}.zlms.com</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 24px' }}>
                                            <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 500, background: plan === 'Enterprise' ? '#f5f3ff' : plan === 'Professional' ? '#eef2ff' : '#f1f5f9', color: plan === 'Enterprise' ? '#8b5cf6' : plan === 'Professional' ? '#4f46e5' : '#64748b' }}>{plan}</span>
                                        </td>
                                        <td style={{ padding: '14px 24px', fontWeight: 600 }}>{price}</td>
                                        <td style={{ padding: '14px 24px' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 500, background: isPaid ? '#ecfdf5' : '#fef2f2', color: isPaid ? '#10b981' : '#ef4444' }}>
                                                {isPaid ? <><CheckCircle size={12} /> Paid</> : <><AlertCircle size={12} /> Past Due</>}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            {isPaid ? `Apr ${5 + i}, 2026` : 'Overdue'}
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
