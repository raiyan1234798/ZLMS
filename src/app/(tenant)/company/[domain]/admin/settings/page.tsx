"use client";
import { useParams } from 'next/navigation';
import { MOCK_COMPANIES, getAdminForCompany } from '@/data/mockDb';
import { Settings, Shield, Bell, Globe, Users } from 'lucide-react';
import { useState } from 'react';

export default function CompanySettingsPage() {
    const { domain } = useParams() as { domain: string };
    const company = MOCK_COMPANIES.find(c => c.subdomain === domain);
    const admin = company ? getAdminForCompany(company.id) : null;

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Settings</h1>
                <p style={{ color: 'var(--text-muted)' }}>Configure settings for {company?.name}.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '32px' }}>
                <div className="card" style={{ padding: '12px', height: 'fit-content' }}>
                    {[
                        { icon: Globe, label: 'General' },
                        { icon: Shield, label: 'Security' },
                        { icon: Bell, label: 'Notifications' },
                        { icon: Users, label: 'Access' },
                    ].map((item, i) => {
                        const Icon = item.icon; return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', background: i === 0 ? (company?.branding.themeColor || '#4f46e5') + '10' : 'transparent', color: i === 0 ? company?.branding.themeColor || 'var(--primary)' : 'var(--text-muted)', fontWeight: i === 0 ? 600 : 400, fontSize: '0.9rem' }}>
                                <Icon size={18} /> {item.label}
                            </div>
                        );
                    })}
                </div>
                <div>
                    <div className="card" style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Globe size={18} /> General Settings</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>Company Name</label>
                                <input type="text" defaultValue={company?.name} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>Subdomain</label>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <input type="text" defaultValue={domain} style={{ flex: 1, padding: '10px 14px', borderRadius: '10px 0 0 10px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace' }} />
                                    <span style={{ padding: '10px 14px', background: 'var(--background)', border: '1px solid var(--border)', borderLeft: 'none', borderRadius: '0 10px 10px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>.zlms.com</span>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>Admin Email</label>
                                <input type="text" defaultValue={admin?.email || ''} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>Timezone</label>
                                <select style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }}>
                                    <option>UTC-5 (Eastern)</option><option>UTC-8 (Pacific)</option><option>UTC+0 (GMT)</option><option>UTC+5:30 (IST)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="card" style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={18} /> Security</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { label: 'Require Strong Passwords', desc: 'Min 8 chars, uppercase, lowercase, number', enabled: true },
                                { label: 'Auto-logout Inactive Sessions', desc: 'After 30 minutes of inactivity', enabled: false },
                                { label: 'Email Verification Required', desc: 'New users must verify email', enabled: true },
                            ].map((s, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                                    <div><div style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '2px' }}>{s.label}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.desc}</div></div>
                                    <div style={{ width: '44px', height: '24px', borderRadius: '999px', background: s.enabled ? (company?.branding.themeColor || '#4f46e5') : '#d1d5db', cursor: 'pointer', position: 'relative' }}>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: s.enabled ? '22px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button className="btn-secondary" style={{ padding: '10px 24px' }}>Reset</button>
                        <button className="btn-primary" style={{ padding: '10px 24px', background: company?.branding.themeColor }}>Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
