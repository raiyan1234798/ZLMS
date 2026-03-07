"use client";
import { useParams } from 'next/navigation';
import { MOCK_COMPANIES, getAdminForCompany } from '@/data/mockDb';
import { Settings, Shield, Bell, Globe, Users, Palette, Mail } from 'lucide-react';
import { useState } from 'react';

type Tab = 'General' | 'Appearance' | 'Security' | 'Notifications';

export default function CompanySettingsPage() {
    const { domain } = useParams() as { domain: string };
    const company = MOCK_COMPANIES.find(c => c.subdomain === domain);
    const admin = company ? getAdminForCompany(company.id) : null;

    const [activeTab, setActiveTab] = useState<Tab>('General');

    // General States
    const [companyName, setCompanyName] = useState(company?.name || '');
    const [adminEmail, setAdminEmail] = useState(admin?.email || '');
    const [timezone, setTimezone] = useState('UTC-5 (Eastern)');

    // Appearance States
    const [primaryColor, setPrimaryColor] = useState(company?.branding.themeColor || '#4f46e5');
    const [darkMode, setDarkMode] = useState(false);

    // Security States
    const [requireStrongPasswords, setRequireStrongPasswords] = useState(true);
    const [autoLogout, setAutoLogout] = useState(false);
    const [emailVerification, setEmailVerification] = useState(true);

    // Notifications States
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(false);

    const handleSave = () => {
        alert('Settings have been saved for ' + companyName);
    };

    const generateToggle = (label: string, desc: string | null, enabled: boolean, onToggle: () => void) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
                <div style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '2px' }}>{label}</div>
                {desc && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{desc}</div>}
            </div>
            <div onClick={onToggle} style={{ width: '44px', height: '24px', borderRadius: '999px', background: enabled ? primaryColor : '#d1d5db', cursor: 'pointer', position: 'relative', transition: 'background 0.2s ease' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: enabled ? '22px' : '2px', transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
        </div>
    );

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Settings</h1>
                <p style={{ color: 'var(--text-muted)' }}>Configure local settings for {companyName}.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '32px' }}>
                <div className="card" style={{ padding: '12px', height: 'fit-content' }}>
                    {[
                        { icon: Globe, label: 'General', id: 'General' },
                        { icon: Palette, label: 'Appearance', id: 'Appearance' },
                        { icon: Shield, label: 'Security', id: 'Security' },
                        { icon: Bell, label: 'Notifications', id: 'Notifications' },
                    ].map((item, i) => {
                        const Icon = item.icon;
                        const isActive = item.id === activeTab;
                        return (
                            <div key={i} onClick={() => setActiveTab(item.id as Tab)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', background: isActive ? primaryColor + '15' : 'transparent', color: isActive ? primaryColor : 'var(--text-muted)', fontWeight: isActive ? 600 : 400, fontSize: '0.9rem', transition: 'all 0.2sease', marginBottom: '4px' }}>
                                <Icon size={18} /> {item.label}
                            </div>
                        );
                    })}
                </div>
                <div>
                    {activeTab === 'General' && (
                        <div className="card" style={{ marginBottom: '24px', animation: 'fadeIn 0.3s ease-out' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Globe size={18} /> General Settings</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>Company Name</label>
                                    <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>Subdomain</label>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <input type="text" disabled defaultValue={domain} style={{ flex: 1, padding: '10px 14px', borderRadius: '10px 0 0 10px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace', background: 'var(--background)' }} />
                                            <span style={{ padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: 'none', borderRadius: '0 10px 10px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>.zlms.com</span>
                                        </div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>Timezone</label>
                                        <select value={timezone} onChange={e => setTimezone(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }}>
                                            <option>UTC-5 (Eastern)</option><option>UTC-8 (Pacific)</option><option>UTC+0 (GMT)</option><option>UTC+5:30 (IST)</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>Admin Contact Email</label>
                                    <input type="text" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Appearance' && (
                        <div className="card" style={{ marginBottom: '24px', animation: 'fadeIn 0.3s ease-out' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Palette size={18} /> Appearance</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>Brand Primary Color</label>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} style={{ width: '60px', height: '40px', padding: '0', borderRadius: '8px', border: 'none', outline: 'none', cursor: 'pointer' }} />
                                        <input type="text" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} style={{ width: '120px', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace' }} />
                                    </div>
                                    <p style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>This color applies only to your users' portals.</p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {generateToggle('Enable Dark Mode for Users', null, darkMode, () => setDarkMode(!darkMode))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Security' && (
                        <div className="card" style={{ marginBottom: '24px', animation: 'fadeIn 0.3s ease-out' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={18} /> Security</h3>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {generateToggle('Require Strong Passwords', 'Min 8 chars, uppercase, lowercase, number', requireStrongPasswords, () => setRequireStrongPasswords(!requireStrongPasswords))}
                                {generateToggle('Auto-logout Inactive Sessions', 'After 30 minutes of inactivity', autoLogout, () => setAutoLogout(!autoLogout))}
                                {generateToggle('Email Verification Required', 'New users must verify email to join', emailVerification, () => setEmailVerification(!emailVerification))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'Notifications' && (
                        <div className="card" style={{ marginBottom: '24px', animation: 'fadeIn 0.3s ease-out' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Bell size={18} /> Notifications</h3>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {generateToggle('Email Notifications', 'Receive course completion emails', emailNotifs, () => setEmailNotifs(!emailNotifs))}
                                {generateToggle('Push Notifications', 'Real-time alerts in learner dashboard', pushNotifs, () => setPushNotifs(!pushNotifs))}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', animation: 'fadeIn 0.3s ease-out' }}>
                        <button className="btn-secondary" style={{ padding: '10px 24px' }}>Reset</button>
                        <button className="btn-primary" style={{ padding: '10px 24px', background: primaryColor }} onClick={handleSave}>Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
