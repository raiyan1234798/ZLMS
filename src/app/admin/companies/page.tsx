"use client";

import { MOCK_COMPANIES, MOCK_COURSES } from '@/data/mockDb';
import Link from 'next/link';
import {
    Plus, Search, ArrowUpRight, CheckCircle, XCircle, Users, BookOpen,
    X, Building2, Palette, Globe, Zap, Trash2, Edit3, MoreVertical, Sparkles
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const AVAILABLE_FEATURES = [
    'courses', 'video', 'quizzes', 'certificates', 'analytics',
    'notifications', 'teams', 'assignments', 'ai_builder', 'gamification'
];

const THEME_PRESETS = [
    '#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#06b6d4',
    '#f59e0b', '#ec4899', '#14b8a6', '#6366f1', '#84cc16',
];

interface FirebaseCompany {
    id: string;
    name: string;
    subdomain: string;
    themeColor: string;
    dashboardTitle: string;
    landingPageText: string;
    features: string[];
    status: 'ACTIVE' | 'SUSPENDED';
    createdAt: string;
}

export default function CompaniesPage() {
    const [platformUsers, setPlatformUsers] = useState<any[]>([]);
    const [firebaseCompanies, setFirebaseCompanies] = useState<FirebaseCompany[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Add Company Modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [companyName, setCompanyName] = useState('');
    const [subdomain, setSubdomain] = useState('');
    const [themeColor, setThemeColor] = useState('#4f46e5');
    const [dashboardTitle, setDashboardTitle] = useState('');
    const [landingPageText, setLandingPageText] = useState('');
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['courses', 'certificates']);
    const [addError, setAddError] = useState('');
    const [adding, setAdding] = useState(false);

    // Edit Company Modal
    const [editingCompany, setEditingCompany] = useState<any | null>(null);
    const [editName, setEditName] = useState('');
    const [editSubdomain, setEditSubdomain] = useState('');
    const [editThemeColor, setEditThemeColor] = useState('#4f46e5');
    const [editDashboardTitle, setEditDashboardTitle] = useState('');
    const [editLandingText, setEditLandingText] = useState('');
    const [editFeatures, setEditFeatures] = useState<string[]>([]);
    const [editStatus, setEditStatus] = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE');
    const [saving, setSaving] = useState(false);

    // Delete
    const [deletingCompany, setDeletingCompany] = useState<any | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Menu
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const fetchData = async () => {
        try {
            const [usersSnap, companiesSnap] = await Promise.all([
                getDocs(collection(db, 'users')),
                getDocs(collection(db, 'companies')),
            ]);
            const users: any[] = [];
            usersSnap.forEach(doc => users.push({ id: doc.id, ...doc.data() }));
            setPlatformUsers(users);

            const fbCompanies: FirebaseCompany[] = [];
            companiesSnap.forEach(doc => fbCompanies.push({ id: doc.id, ...doc.data() } as FirebaseCompany));
            setFirebaseCompanies(fbCompanies);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Merge mock companies (that have users) with Firebase companies
    const activeCompanyIds = loading ? [] : Array.from(new Set(platformUsers.filter(u => u.companyId && u.companyId !== 'platform').map(u => u.companyId)));
    const activeMockCompanies = loading ? [] : MOCK_COMPANIES.filter(c => activeCompanyIds.includes(c.id));

    // Convert both to a unified list  
    const allCompanies = [
        ...activeMockCompanies.map(c => ({
            id: c.id,
            name: c.name,
            subdomain: c.subdomain,
            themeColor: c.branding.themeColor,
            dashboardTitle: c.branding.dashboardTitle,
            landingPageText: c.branding.landingPageText || '',
            features: c.features,
            status: c.status,
            source: 'mock' as const,
        })),
        ...firebaseCompanies.map(c => ({
            ...c,
            source: 'firebase' as const,
        }))
    ].filter(c => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.subdomain.toLowerCase().includes(q);
    });

    const handleAddCompany = async () => {
        if (!companyName || !subdomain || !dashboardTitle) {
            setAddError('Company name, subdomain, and dashboard title are required.');
            return;
        }

        // Validate subdomain format
        const subdomainClean = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
        if (subdomainClean.length < 2) {
            setAddError('Subdomain must be at least 2 characters long (letters, numbers, hyphens only).');
            return;
        }

        // Check uniqueness
        const exists = allCompanies.some(c => c.subdomain === subdomainClean);
        if (exists) {
            setAddError('This subdomain is already taken. Choose a different one.');
            return;
        }

        setAdding(true);
        setAddError('');
        try {
            const companyId = `company_${Date.now()}`;
            const companyData: Omit<FirebaseCompany, 'id'> = {
                name: companyName,
                subdomain: subdomainClean,
                themeColor,
                dashboardTitle,
                landingPageText: landingPageText || `Welcome to ${companyName}. Start your learning journey today.`,
                features: selectedFeatures,
                status: 'ACTIVE',
                createdAt: new Date().toISOString(),
            };
            await setDoc(doc(db, 'companies', companyId), companyData);
            setFirebaseCompanies(prev => [...prev, { id: companyId, ...companyData }]);
            setShowAddModal(false);
            resetAddForm();
        } catch (error: any) {
            setAddError(error.message);
        } finally {
            setAdding(false);
        }
    };

    const resetAddForm = () => {
        setCompanyName('');
        setSubdomain('');
        setThemeColor('#4f46e5');
        setDashboardTitle('');
        setLandingPageText('');
        setSelectedFeatures(['courses', 'certificates']);
        setAddError('');
    };

    const openEditModal = (company: any) => {
        setEditingCompany(company);
        setEditName(company.name);
        setEditSubdomain(company.subdomain);
        setEditThemeColor(company.themeColor);
        setEditDashboardTitle(company.dashboardTitle);
        setEditLandingText(company.landingPageText || '');
        setEditFeatures([...company.features]);
        setEditStatus(company.status);
        setOpenMenuId(null);
    };

    const handleEditCompany = async () => {
        if (!editingCompany) return;
        setSaving(true);
        try {
            if (editingCompany.source === 'firebase') {
                await updateDoc(doc(db, 'companies', editingCompany.id), {
                    name: editName,
                    subdomain: editSubdomain,
                    themeColor: editThemeColor,
                    dashboardTitle: editDashboardTitle,
                    landingPageText: editLandingText,
                    features: editFeatures,
                    status: editStatus,
                });
                setFirebaseCompanies(prev => prev.map(c => c.id === editingCompany.id ? {
                    ...c, name: editName, subdomain: editSubdomain, themeColor: editThemeColor,
                    dashboardTitle: editDashboardTitle, landingPageText: editLandingText,
                    features: editFeatures, status: editStatus,
                } : c));
            }
            setEditingCompany(null);
        } catch (error) {
            console.error("Error updating company:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCompany = async () => {
        if (!deletingCompany) return;
        setDeleting(true);
        try {
            if (deletingCompany.source === 'firebase') {
                await deleteDoc(doc(db, 'companies', deletingCompany.id));
                setFirebaseCompanies(prev => prev.filter(c => c.id !== deletingCompany.id));
            }
            setDeletingCompany(null);
        } catch (error) {
            console.error("Error deleting company:", error);
        } finally {
            setDeleting(false);
        }
    };

    const toggleFeature = (feature: string, list: string[], setter: (v: string[]) => void) => {
        if (list.includes(feature)) {
            setter(list.filter(f => f !== feature));
        } else {
            setter([...list, feature]);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Companies</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage active tenant companies on the platform.</p>
                </div>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowAddModal(true)}>
                    <Plus size={16} /> Add Company
                </button>
            </div>

            {/* Search */}
            <div style={{ marginBottom: '24px', position: 'relative', maxWidth: '400px' }}>
                <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                    type="text"
                    placeholder="Search companies..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%', padding: '10px 14px 10px 42px', borderRadius: '10px',
                        border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit'
                    }}
                />
            </div>

            {/* Companies Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                {loading ? (
                    <div style={{ color: 'var(--text-muted)' }}>Loading companies...</div>
                ) : allCompanies.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)' }}>No companies found. Add one to get started!</div>
                ) : allCompanies.map((company) => {
                    const userCount = platformUsers.filter(u => u.companyId === company.id).length;
                    const courseCount = MOCK_COURSES.filter(c => c.companyId === company.id).length;
                    const themeColor = company.themeColor;
                    return (
                        <div key={company.id} className="card" style={{ overflow: 'hidden', padding: 0 }}>
                            {/* Header with gradient */}
                            <div style={{
                                background: `linear-gradient(135deg, ${themeColor}22, ${themeColor}44)`,
                                padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '12px',
                                        background: themeColor, display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.2rem',
                                        boxShadow: `0 4px 12px ${themeColor}40`
                                    }}>
                                        {company.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{company.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{company.subdomain}.zlms.com</div>
                                    </div>
                                </div>
                                {/* Actions menu */}
                                <div ref={openMenuId === company.id ? menuRef : null} style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => setOpenMenuId(openMenuId === company.id ? null : company.id)}
                                        style={{ padding: '6px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.8)' }}
                                    >
                                        <MoreVertical size={16} color="var(--text-muted)" />
                                    </button>
                                    {openMenuId === company.id && (
                                        <div style={{
                                            position: 'absolute', right: 0, top: '100%', marginTop: '4px',
                                            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px',
                                            boxShadow: '0 10px 40px rgba(0,0,0,0.12)', zIndex: 100, minWidth: '160px',
                                            overflow: 'hidden', animation: 'fadeInUp 0.15s ease'
                                        }}>
                                            <button onClick={() => openEditModal(company)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', width: '100%', fontSize: '0.85rem', color: 'var(--foreground)', textAlign: 'left' }}>
                                                <Edit3 size={14} color="#4f46e5" /> Edit Company
                                            </button>
                                            <div style={{ height: '1px', background: 'var(--border)' }} />
                                            <button onClick={() => { setDeletingCompany(company); setOpenMenuId(null); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', width: '100%', fontSize: '0.85rem', color: '#ef4444', textAlign: 'left' }}>
                                                <Trash2 size={14} /> Delete Company
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Body */}
                            <div style={{ padding: '20px' }}>
                                {/* Status + Plan */}
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

                                {/* Counts */}
                                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        <Users size={14} /> {userCount} users
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        <BookOpen size={14} /> {courseCount} courses
                                    </div>
                                    {company.source === 'firebase' && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#8b5cf6' }}>
                                            <Sparkles size={12} /> Custom
                                        </div>
                                    )}
                                </div>

                                {/* Features */}
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                    {company.features.slice(0, 4).map((f: string, i: number) => (
                                        <span key={i} style={{
                                            padding: '2px 8px', borderRadius: '6px', background: 'var(--background)',
                                            fontSize: '0.7rem', color: 'var(--text-muted)', border: '1px solid var(--border)'
                                        }}>{f}</span>
                                    ))}
                                    {company.features.length > 4 && (
                                        <span style={{
                                            padding: '2px 8px', borderRadius: '6px', background: 'var(--background)',
                                            fontSize: '0.7rem', color: 'var(--text-muted)'
                                        }}>+{company.features.length - 4} more</span>
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
                                    <Link href={`/company/${company.subdomain}/dashboard`} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                                        Learner View
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Add Company Card */}
                {!loading && (
                    <div onClick={() => setShowAddModal(true)} className="card" style={{
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

            {/* ─── ADD COMPANY MODAL ─── */}
            {showAddModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '20px' }} onClick={() => { setShowAddModal(false); resetAddForm(); }}>
                    <div className="animate-fade-in-up" onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Building2 size={22} color="white" />
                                </div>
                                <h3 style={{ fontSize: '1.3rem' }}>Create New Company</h3>
                            </div>
                            <button onClick={() => { setShowAddModal(false); resetAddForm(); }} style={{ padding: '6px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                <X size={18} color="var(--text-muted)" />
                            </button>
                        </div>

                        {addError && (
                            <div style={{ padding: '12px 14px', background: '#fef2f2', color: '#ef4444', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '20px', border: '1px solid #fecaca' }}>
                                {addError}
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Company Name */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                                    <Building2 size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '6px' }} />Company Name
                                </label>
                                <input type="text" value={companyName} onChange={e => { setCompanyName(e.target.value); if (!subdomain) setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')); }} className="input-modern" placeholder="Acme Corporation" />
                            </div>

                            {/* Subdomain */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                                    <Globe size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '6px' }} />Subdomain
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                                    <input type="text" value={subdomain} onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} className="input-modern" style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }} placeholder="acme" />
                                    <div style={{ padding: '14px 16px', background: 'var(--background)', border: '1px solid var(--border)', borderLeft: 'none', borderTopRightRadius: '12px', borderBottomRightRadius: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                        .zlms.com
                                    </div>
                                </div>
                            </div>

                            {/* Dashboard Title */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Dashboard Title</label>
                                <input type="text" value={dashboardTitle} onChange={e => setDashboardTitle(e.target.value)} className="input-modern" placeholder="Acme Learning Portal" />
                            </div>

                            {/* Landing Text */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Landing Page Text</label>
                                <textarea value={landingPageText} onChange={e => setLandingPageText(e.target.value)} className="input-modern" placeholder="Welcome to our learning platform..." rows={2} style={{ resize: 'vertical', minHeight: '60px' }} />
                            </div>

                            {/* Theme Color */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
                                    <Palette size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '6px' }} />Brand Color
                                </label>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                    {THEME_PRESETS.map(color => (
                                        <button key={color} onClick={() => setThemeColor(color)} style={{
                                            width: '36px', height: '36px', borderRadius: '10px', background: color,
                                            border: themeColor === color ? '3px solid var(--foreground)' : '2px solid transparent',
                                            cursor: 'pointer', transition: 'all 0.15s ease',
                                            boxShadow: themeColor === color ? `0 0 0 2px var(--surface), 0 0 0 4px ${color}` : 'none'
                                        }} />
                                    ))}
                                    <input type="color" value={themeColor} onChange={e => setThemeColor(e.target.value)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: '2px solid var(--border)', cursor: 'pointer', padding: 0 }} />
                                </div>
                            </div>

                            {/* Features */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
                                    <Zap size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '6px' }} />Platform Features
                                </label>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {AVAILABLE_FEATURES.map(f => {
                                        const selected = selectedFeatures.includes(f);
                                        return (
                                            <button key={f} onClick={() => toggleFeature(f, selectedFeatures, setSelectedFeatures)} style={{
                                                padding: '6px 14px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 500,
                                                background: selected ? `${themeColor}15` : 'var(--background)',
                                                color: selected ? themeColor : 'var(--text-muted)',
                                                border: `1.5px solid ${selected ? themeColor : 'var(--border)'}`,
                                                cursor: 'pointer', transition: 'all 0.15s ease'
                                            }}>
                                                {selected && <span style={{ marginRight: '4px' }}>✓</span>}
                                                {f}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Preview */}
                            <div style={{ padding: '16px', borderRadius: '14px', background: `linear-gradient(135deg, ${themeColor}10, ${themeColor}25)`, border: `1px solid ${themeColor}30` }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>PREVIEW</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                                        {companyName ? companyName.charAt(0).toUpperCase() : 'C'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{companyName || 'Company Name'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{subdomain || 'subdomain'}.zlms.com</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                            <button onClick={() => { setShowAddModal(false); resetAddForm(); }} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                            <button onClick={handleAddCompany} className="btn-primary" style={{ flex: 2 }} disabled={adding}>
                                {adding ? 'Creating Company...' : <><Plus size={16} /> Create Company</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── EDIT COMPANY MODAL ─── */}
            {editingCompany && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '20px' }} onClick={() => setEditingCompany(null)}>
                    <div className="animate-fade-in-up" onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.2rem' }}>Edit Company</h3>
                            <button onClick={() => setEditingCompany(null)} style={{ padding: '6px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                <X size={18} color="var(--text-muted)" />
                            </button>
                        </div>

                        {editingCompany.source === 'mock' ? (
                            <div style={{ padding: '20px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fef3c7', color: '#92400e', fontSize: '0.9rem' }}>
                                <strong>Note:</strong> This is a demo company from mock data. To edit, please add it as a custom company first. Only custom (Firebase) companies can be edited.
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Company Name</label>
                                        <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="input-modern" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Dashboard Title</label>
                                        <input type="text" value={editDashboardTitle} onChange={e => setEditDashboardTitle(e.target.value)} className="input-modern" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Brand Color</label>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                            {THEME_PRESETS.map(color => (
                                                <button key={color} onClick={() => setEditThemeColor(color)} style={{
                                                    width: '32px', height: '32px', borderRadius: '8px', background: color,
                                                    border: editThemeColor === color ? '3px solid var(--foreground)' : '2px solid transparent',
                                                    cursor: 'pointer'
                                                }} />
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Status</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {(['ACTIVE', 'SUSPENDED'] as const).map(s => (
                                                <button key={s} onClick={() => setEditStatus(s)} style={{
                                                    flex: 1, padding: '10px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600,
                                                    background: editStatus === s ? (s === 'ACTIVE' ? '#10b981' : '#ef4444') : 'var(--background)',
                                                    color: editStatus === s ? 'white' : 'var(--text-muted)',
                                                    border: `2px solid ${editStatus === s ? (s === 'ACTIVE' ? '#10b981' : '#ef4444') : 'var(--border)'}`,
                                                }}>
                                                    {s === 'ACTIVE' ? '✓ Active' : '✕ Suspended'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Features</label>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {AVAILABLE_FEATURES.map(f => {
                                                const selected = editFeatures.includes(f);
                                                return (
                                                    <button key={f} onClick={() => toggleFeature(f, editFeatures, setEditFeatures)} style={{
                                                        padding: '5px 12px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 500,
                                                        background: selected ? `${editThemeColor}15` : 'var(--background)',
                                                        color: selected ? editThemeColor : 'var(--text-muted)',
                                                        border: `1.5px solid ${selected ? editThemeColor : 'var(--border)'}`,
                                                        cursor: 'pointer'
                                                    }}>
                                                        {selected && '✓ '}{f}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                    <button onClick={() => setEditingCompany(null)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                    <button onClick={handleEditCompany} className="btn-primary" style={{ flex: 1 }} disabled={saving}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ─── DELETE CONFIRMATION MODAL ─── */}
            {deletingCompany && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }} onClick={() => setDeletingCompany(null)}>
                    <div className="animate-fade-in-up" onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Trash2 size={28} color="#ef4444" />
                            </div>
                        </div>
                        <h3 style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '8px' }}>Delete Company</h3>
                        {deletingCompany.source === 'mock' ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                                This is a demo company and cannot be deleted. Only custom companies can be removed.
                            </p>
                        ) : (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                                Are you sure you want to permanently delete <strong>{deletingCompany.name}</strong>? All associated data will be lost.
                            </p>
                        )}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setDeletingCompany(null)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                            {deletingCompany.source === 'firebase' && (
                                <button onClick={handleDeleteCompany} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#ef4444', color: 'white', fontWeight: 600, fontSize: '0.9rem' }} disabled={deleting}>
                                    {deleting ? 'Deleting...' : 'Delete Company'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
