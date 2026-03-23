"use client";

import { Settings, Globe, Shield, Mail, Database, Bell, Palette, Check, X } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { MOCK_COMPANIES } from '@/data/mockDb';

type Tab = 'General' | 'Appearance' | 'Security' | 'Email' | 'Storage' | 'Notifications';

export default function SettingsPage() {
    const { t, language, setLanguage } = useLanguage();

    // States - General
    const [activeTab, setActiveTab] = useState<Tab>('General');
    const [platformName, setPlatformName] = useState('Z LMS');
    const [platformUrl, setPlatformUrl] = useState('zlms.com');
    const [smtp, setSmtp] = useState('smtp.gmail.com');
    const [smtpPort, setSmtpPort] = useState('587');
    const [fromAddress, setFromAddress] = useState('noreply@zlms.com');

    // States - Appearance
    const [primaryColor, setPrimaryColor] = useState('#4f46e5');
    const [darkMode, setDarkMode] = useState(false);

    // States - Security
    const [twoFactorAuth, setTwoFactorAuth] = useState(true);
    const [passwordComplexity, setPasswordComplexity] = useState(true);
    const [sessionTimeout, setSessionTimeout] = useState(false);
    const [ipWhitelisting, setIpWhitelisting] = useState(false);

    // States - Notifications
    const [emailNotif, setEmailNotif] = useState(true);
    const [pushNotif, setPushNotif] = useState(true);
    const [smsNotif, setSmsNotif] = useState(false);

    // States - Storage
    const [storageProvider, setStorageProvider] = useState('AWS S3');
    const [maxUploadSize, setMaxUploadSize] = useState('1024');

    // Modal states
    const [showApplyModal, setShowApplyModal] = useState<'save' | 'reset' | null>(null);
    const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());

    const handleSelectAll = () => {
        if (selectedCompanies.size === MOCK_COMPANIES.length) {
            setSelectedCompanies(new Set());
        } else {
            setSelectedCompanies(new Set(MOCK_COMPANIES.map(c => c.id)));
        }
    };

    const toggleCompany = (id: string) => {
        const newSet = new Set(selectedCompanies);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedCompanies(newSet);
    };

    const handleConfirm = () => {
        if (selectedCompanies.size === 0) {
            alert('Please select at least one company to apply changes to.');
            return;
        }
        alert(`${showApplyModal === 'save' ? 'Settings Saved' : 'Settings Reset'} successfully for ${selectedCompanies.size} companies!`);
        setShowApplyModal(null);
    };

    const tabs: { icon: any, label: string, id: Tab }[] = [
        { icon: Globe, label: t('general'), id: 'General' },
        { icon: Palette, label: t('appearance'), id: 'Appearance' },
        { icon: Shield, label: t('security'), id: 'Security' },
        { icon: Mail, label: t('email'), id: 'Email' },
        { icon: Database, label: t('storage'), id: 'Storage' },
        { icon: Bell, label: t('notifications'), id: 'Notifications' },
    ];

    const generateToggle = (label: string, desc: string | null, enabled: boolean, onToggle: () => void) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
                <div style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '2px' }}>{label}</div>
                {desc && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{desc}</div>}
            </div>
            <div onClick={onToggle} style={{ width: '44px', height: '24px', borderRadius: '999px', background: enabled ? '#4f46e5' : '#d1d5db', cursor: 'pointer', position: 'relative', transition: 'background 0.2s ease' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: enabled ? '22px' : '2px', transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
        </div>
    );

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>{t('platformSettings')}</h1>
                <p style={{ color: 'var(--text-muted)' }}>{t('platformSettingsDesc')}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '32px' }}>
                {/* Settings Nav */}
                <div className="card" style={{ padding: '12px', height: 'fit-content' }}>
                    {tabs.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <div
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
                                    borderRadius: '8px', cursor: 'pointer',
                                    background: isActive ? '#eef2ff' : 'transparent',
                                    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                    fontWeight: isActive ? 600 : 400, fontSize: '0.9rem', marginBottom: '4px', transition: 'all 0.2s ease'
                                }}>
                                <Icon size={18} /> {item.label}
                            </div>
                        );
                    })}
                </div>

                {/* Settings Content */}
                <div>
                    {/* General */}
                    {activeTab === 'General' && (
                        <div className="card" style={{ marginBottom: '24px', animation: 'fadeIn 0.3s ease-out' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Globe size={18} /> {t('generalSettings')}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>{t('platformName')}</label>
                                    <input type="text" value={platformName} onChange={e => setPlatformName(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>{t('platformUrl')}</label>
                                    <input type="text" value={platformUrl} onChange={e => setPlatformUrl(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>{t('defaultLanguage')}</label>
                                    <select value={language} onChange={(e) => setLanguage(e.target.value as any)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }}>
                                        <option value="English">English</option>
                                        <option value="Spanish">Español</option>
                                        <option value="French">Français</option>
                                        <option value="German">Deutsch</option>
                                        <option value="Arabic">العربية</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Appearance */}
                    {activeTab === 'Appearance' && (
                        <div className="card" style={{ marginBottom: '24px', animation: 'fadeIn 0.3s ease-out' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Palette size={18} /> {t('appearance')}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>{t('primaryColor')}</label>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} style={{ width: '60px', height: '40px', padding: '0', borderRadius: '8px', border: 'none', outline: 'none', cursor: 'pointer' }} />
                                        <input type="text" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} style={{ width: '120px', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace' }} />
                                    </div>
                                </div>
                                {generateToggle(t('darkMode'), null, darkMode, () => setDarkMode(!darkMode))}
                            </div>
                        </div>
                    )}

                    {/* Security */}
                    {activeTab === 'Security' && (
                        <div className="card" style={{ marginBottom: '24px', animation: 'fadeIn 0.3s ease-out' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Shield size={18} /> {t('security')}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {generateToggle(t('twoFactorAuth'), t('twoFactorAuthDesc'), twoFactorAuth, () => setTwoFactorAuth(!twoFactorAuth))}
                                {generateToggle(t('passwordComplexity'), t('passwordComplexityDesc'), passwordComplexity, () => setPasswordComplexity(!passwordComplexity))}
                                {generateToggle(t('sessionTimeout'), t('sessionTimeoutDesc'), sessionTimeout, () => setSessionTimeout(!sessionTimeout))}
                                {generateToggle(t('ipWhitelisting'), t('ipWhitelistingDesc'), ipWhitelisting, () => setIpWhitelisting(!ipWhitelisting))}
                            </div>
                        </div>
                    )}

                    {/* Email */}
                    {activeTab === 'Email' && (
                        <div className="card" style={{ marginBottom: '24px', animation: 'fadeIn 0.3s ease-out' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Mail size={18} /> {t('emailConfig')}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>{t('smtpServer')}</label>
                                    <input type="text" value={smtp} onChange={e => setSmtp(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>{t('smtpPort')}</label>
                                        <input type="text" value={smtpPort} onChange={e => setSmtpPort(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>{t('fromAddress')}</label>
                                        <input type="text" value={fromAddress} onChange={e => setFromAddress(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Storage */}
                    {activeTab === 'Storage' && (
                        <div className="card" style={{ marginBottom: '24px', animation: 'fadeIn 0.3s ease-out' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Database size={18} /> {t('storage')}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>{t('storageProvider')}</label>
                                    <select value={storageProvider} onChange={e => setStorageProvider(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }}>
                                        <option>AWS S3</option>
                                        <option>Google Cloud Storage</option>
                                        <option>Azure Blob</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>{t('maxUploadSize')}</label>
                                    <input type="number" value={maxUploadSize} onChange={e => setMaxUploadSize(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications */}
                    {activeTab === 'Notifications' && (
                        <div className="card" style={{ marginBottom: '24px', animation: 'fadeIn 0.3s ease-out' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Bell size={18} /> {t('notifications')}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {generateToggle(t('enableEmailNotif'), null, emailNotif, () => setEmailNotif(!emailNotif))}
                                {generateToggle(t('enablePushNotif'), null, pushNotif, () => setPushNotif(!pushNotif))}
                                {generateToggle(t('enableSmsNotif'), null, smsNotif, () => setSmsNotif(!smsNotif))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', animation: 'fadeIn 0.3s ease-out', animationDelay: '0.1s', animationFillMode: 'both' }}>
                        <button className="btn-secondary" style={{ padding: '10px 24px' }} onClick={() => setShowApplyModal('reset')}>{t('reset')}</button>
                        <button className="btn-primary" style={{ padding: '10px 24px' }} onClick={() => setShowApplyModal('save')}>{t('saveChanges')}</button>
                    </div>
                </div>
            </div>

            {/* Apply to Companies Modal */}
            {showApplyModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', backgroundColor: 'var(--surface)', padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '90vh' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                                Apply {showApplyModal === 'save' ? 'Settings' : 'Reset'} to Sub-domains
                            </h3>
                            <button onClick={() => setShowApplyModal(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Select the companies/environments to push these configuration changes to:
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                            <input type="checkbox" checked={selectedCompanies.size === MOCK_COMPANIES.length && MOCK_COMPANIES.length > 0} onChange={handleSelectAll} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Select All</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
                            {MOCK_COMPANIES.map(company => (
                                <div key={company.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: selectedCompanies.has(company.id) ? 'var(--primary-light, #eef2ff)' : 'var(--background)', borderRadius: '8px', cursor: 'pointer', border: '1px solid', borderColor: selectedCompanies.has(company.id) ? 'var(--primary)' : 'transparent', transition: 'all 0.2s' }} onClick={() => toggleCompany(company.id)}>
                                    <input type="checkbox" checked={selectedCompanies.has(company.id)} readOnly style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 500, fontSize: '0.9rem', color: selectedCompanies.has(company.id) ? 'var(--primary)' : 'inherit' }}>{company.name}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{company.subdomain}.zlms.com</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowApplyModal(null)}>Cancel</button>
                            <button className={showApplyModal === 'save' ? "btn-primary" : "btn-secondary"} style={{ flex: 1, backgroundColor: showApplyModal === 'reset' ? '#ef4444' : undefined, color: showApplyModal === 'reset' ? '#fff' : undefined, border: showApplyModal === 'reset' ? 'none' : undefined }} onClick={handleConfirm}>
                                Confirm {showApplyModal === 'save' ? 'Apply' : 'Reset'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
