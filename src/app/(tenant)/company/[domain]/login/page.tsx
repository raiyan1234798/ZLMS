
"use client";
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MOCK_COMPANIES } from '@/data/mockDb';
import { Building2, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';

export default function TenantLoginPage() {
    const { domain } = useParams() as { domain: string };
    const company = MOCK_COMPANIES.find(c => c.subdomain === domain);
    const router = useRouter();
    const themeColor = company?.branding.themeColor || '#4f46e5';

    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [requested, setRequested] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    if (!company) {
        return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Company not found</div>;
    }

    const checkAndCreateUserDoc = async (user: any) => {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            await setDoc(docRef, {
                email: user.email,
                name: user.displayName || 'New User',
                role: 'USER',
                companyId: company.id,
                createdAt: new Date().toISOString()
            });
        }
    };

    const handleGoogleAuth = async () => {
        setIsLoading(true);
        setErrorMsg('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await checkAndCreateUserDoc(result.user);
            router.push(`/company/${domain}/dashboard/courses`);
        } catch (error: any) {
            if (error.code === 'auth/unauthorized-domain') {
                setErrorMsg('Configuration Required: Please add your domain (zlms.pages.dev) to the Firebase Console -> Authentication -> Settings -> Authorized Domains.');
            } else {
                setErrorMsg(error.message);
            }
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');
        try {
            if (isLogin) {
                const result = await signInWithEmailAndPassword(auth, email, password);
                await checkAndCreateUserDoc(result.user);
                router.push(`/company/${domain}/dashboard/courses`);
            } else {
                // If it's sign up (Request Access workflow), we create an account with a dummy password if they don't provide one, or just require a password. Let's require a password.
                const result = await createUserWithEmailAndPassword(auth, email, password);
                await checkAndCreateUserDoc(result.user);
                setRequested(true);
                setIsLoading(false);
            }
        } catch (error: any) {
            if (error.code === 'auth/unauthorized-domain') {
                setErrorMsg('Configuration Required: Please add your domain (zlms.pages.dev) to the Firebase Console -> Authentication -> Settings -> Authorized Domains.');
            } else {
                setErrorMsg(error.message);
            }
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden', background: 'var(--background)' }}>

            {/* Movable CSS Animated Background for Tenant */}
            <div className="tenant-bg-animation" style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', width: '800px', height: '800px', background: `radial-gradient(circle, ${themeColor}25 0%, transparent 60%)`, top: '-20%', left: '-10%', borderRadius: '50%', animation: 'floatTenant 18s infinite alternate ease-in-out' }} />
                <div style={{ position: 'absolute', width: '600px', height: '600px', background: `radial-gradient(circle, ${themeColor}15 0%, transparent 60%)`, bottom: '-10%', right: '-10%', borderRadius: '50%', animation: 'floatTenant 12s infinite alternate-reverse ease-in-out' }} />
                <div style={{ position: 'absolute', width: '900px', height: '900px', background: `radial-gradient(circle, ${themeColor}10 0%, transparent 50%)`, top: '30%', left: '40%', transform: 'translate(-50%, -50%)', borderRadius: '50%', animation: 'floatTenantSlow 25s infinite alternate ease-in-out' }} />
            </div>

            <div className="glass-panel animate-fade-in-up" style={{ width: '100%', maxWidth: '440px', padding: '40px', position: 'relative', zIndex: 10, backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.6)', boxShadow: `0 20px 40px -10px ${themeColor}30` }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: `0 8px 24px ${themeColor}40` }}>
                        <Building2 size={32} />
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>{company.name}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{isLogin ? 'Sign in to access your learning portal' : 'Request access to join our academy'}</p>
                </div>

                {errorMsg && (
                    <div style={{ padding: '12px', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center' }}>
                        {errorMsg}
                    </div>
                )}

                {requested ? (
                    <div className="animate-fade-in-up" style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#10b98120', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                                <CheckCircle2 size={32} />
                            </div>
                        </div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Request Sent & Account Created!</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                            Your request has been sent to the {company.name} admin. You can now log in, but your courses will remain locked until approved.
                        </p>
                        <button onClick={() => { setIsLogin(true); setRequested(false); }} className="btn-secondary" style={{ width: '100%' }}>
                            Return to Login
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="input-modern" style={{ paddingLeft: '44px' }} />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="input-modern" style={{ paddingLeft: '44px' }} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary hover-scale"
                            style={{
                                background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`,
                                marginTop: '8px',
                                boxShadow: `0 4px 14px 0 ${themeColor}40`,
                                opacity: isLoading ? 0.8 : 1
                            }}
                        >
                            {isLoading ? (
                                <div style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Sign Up & Request Access'}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0' }}>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                            <span style={{ padding: '0 12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>OR</span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleAuth}
                            disabled={isLoading}
                            className="btn-secondary hover-scale"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.78 15.72 17.56V20.33H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4" />
                                <path d="M12 23C14.97 23 17.46 22.02 19.28 20.33L15.72 17.56C14.74 18.22 13.48 18.63 12 18.63C9.13 18.63 6.69 16.69 5.8 14.07H2.15V16.9C3.96 20.5 7.69 23 12 23Z" fill="#34A853" />
                                <path d="M5.8 14.07C5.57 13.39 5.44 12.7 5.44 12C5.44 11.3 5.57 10.61 5.8 9.93H2.15C1.49 11.23 1.12 12.71 1.12 14.26C1.12 15.81 1.49 17.29 2.15 18.59L5.8 14.07Z" fill="#FBBC05" />
                                <path d="M12 5.38C13.62 5.38 15.06 5.93 16.2 7.02L19.38 3.84C17.46 2.05 14.97 1 12 1C7.69 1 3.96 3.5 2.15 7.1L5.8 9.93C6.69 7.31 9.13 5.38 12 5.38Z" fill="#EA4335" />
                            </svg>
                            Sign In with Google
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '8px' }}>
                            <button
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                style={{ fontSize: '0.85rem', color: themeColor, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                {isLogin ? "Don't have an account? Request access" : "Already have an account? Sign in"}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes floatTenant {
                    0% { transform: translate(0, 0) scale(1); }
                    100% { transform: translate(80px, 40px) scale(1.1); }
                }
                @keyframes floatTenantSlow {
                    0% { transform: translate(-50%, -50%) scale(1); }
                    100% { transform: translate(-45%, -55%) scale(1.15); }
                }
            `}} />
        </div>
    );
}
