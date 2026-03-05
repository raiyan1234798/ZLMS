"use client";

import { Settings, Globe, Shield, Mail, Database, Bell, Palette } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
    const [platformName, setPlatformName] = useState('Z LMS');
    const [platformUrl, setPlatformUrl] = useState('zlms.com');
    const [smtp, setSmtp] = useState('smtp.gmail.com');

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Platform Settings</h1>
                <p style={{ color: 'var(--text-muted)' }}>Configure global platform settings and preferences.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '32px' }}>
                {/* Settings Nav */}
                <div className="card" style={{ padding: '12px', height: 'fit-content' }}>
                    {[
                        { icon: Globe, label: 'General' },
                        { icon: Palette, label: 'Appearance' },
                        { icon: Shield, label: 'Security' },
                        { icon: Mail, label: 'Email' },
                        { icon: Database, label: 'Storage' },
                        { icon: Bell, label: 'Notifications' },
                    ].map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', background: i === 0 ? '#eef2ff' : 'transparent', color: i === 0 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: i === 0 ? 600 : 400, fontSize: '0.9rem' }}>
                                <Icon size={18} /> {item.label}
                            </div>
                        );
                    })}
                </div>

                {/* Settings Content */}
                <div>
                    {/* General */}
                    <div className="card" style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Globe size={18} /> General Settings</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>Platform Name</label>
                                <input type="text" value={platformName} onChange={e => setPlatformName(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>Platform URL</label>
                                <input type="text" value={platformUrl} onChange={e => setPlatformUrl(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>Default Language</label>
                                <select style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }}>
                                    <option>English (US)</option>
                                    <option>Spanish</option>
                                    <option>French</option>
                                    <option>German</option>
                                    <option>Arabic</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="card" style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={18} /> Security</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { label: 'Two-Factor Authentication', desc: 'Require 2FA for all admin accounts', enabled: true },
                                { label: 'Password Complexity', desc: 'Enforce strong password requirements', enabled: true },
                                { label: 'Session Timeout', desc: 'Auto-logout after 30 minutes of inactivity', enabled: false },
                                { label: 'IP Whitelisting', desc: 'Restrict access to specific IP ranges', enabled: false },
                            ].map((setting, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                                    <div>
                                        <div style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '2px' }}>{setting.label}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{setting.desc}</div>
                                    </div>
                                    <div style={{ width: '44px', height: '24px', borderRadius: '999px', background: setting.enabled ? '#4f46e5' : '#d1d5db', cursor: 'pointer', position: 'relative', transition: 'background 0.2s ease' }}>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: setting.enabled ? '22px' : '2px', transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Email */}
                    <div className="card" style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={18} /> Email Configuration</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>SMTP Server</label>
                                <input type="text" value={smtp} onChange={e => setSmtp(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>SMTP Port</label>
                                    <input type="text" defaultValue="587" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>From Address</label>
                                    <input type="text" defaultValue="noreply@zlms.com" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button className="btn-secondary" style={{ padding: '10px 24px' }}>Reset</button>
                        <button className="btn-primary" style={{ padding: '10px 24px' }}>Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
