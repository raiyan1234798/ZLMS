"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Shield } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const checkSuperAdminAndRedirect = async (user: any) => {
        if (user.email !== 'abubackerraiyan@gmail.com') {
            setErrorMsg('Access denied. You are not an authorized super admin.');
            setIsLoading(false);
            return;
        }

        // Set super admin doc if not exists
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().role !== 'SUPER_ADMIN') {
            await setDoc(docRef, {
                email: user.email,
                name: user.displayName || 'Platform Owner',
                role: 'SUPER_ADMIN',
                companyId: 'platform',
                createdAt: new Date().toISOString()
            }, { merge: true });
        }

        router.push('/admin');
    };

    const handleGoogleAuth = async () => {
        setIsLoading(true);
        setErrorMsg('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await checkSuperAdminAndRedirect(result.user);
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
            const result = await signInWithEmailAndPassword(auth, email, password);
            await checkSuperAdminAndRedirect(result.user);
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
        <div style={{ minHeight: '100vh', display: 'flex', overflow: 'hidden', position: 'relative' }}>
            {/* Movable CSS Animated Background for Z LMS */}
            <div className="login-bg-animation" style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', background: '#0f172a' }}>
                <div style={{ position: 'absolute', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(79,70,229,0.4) 0%, transparent 60%)', top: '-10%', left: '-10%', borderRadius: '50%', animation: 'floatZlms 20s infinite alternate ease-in-out' }} />
                <div style={{ position: 'absolute', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 60%)', bottom: '-10%', right: '-10%', borderRadius: '50%', animation: 'floatZlms 15s infinite alternate-reverse ease-in-out' }} />
                <div style={{ position: 'absolute', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 60%)', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', borderRadius: '50%', animation: 'floatZlmsSlow 25s infinite alternate ease-in-out' }} />
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', zIndex: 1 }}>
                <div className="glass-panel animate-fade-in-up" style={{ width: '100%', maxWidth: '440px', padding: '40px', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '8px', boxShadow: '0 10px 25px -5px rgba(124,58,237, 0.4)' }}>
                            <Shield size={32} />
                        </div>
                    </div>

                    <h1 style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '8px', color: '#0f172a' }}>Super Admin Portal</h1>
                    <p style={{ color: '#475569', textAlign: 'center', marginBottom: '32px' }}>
                        Platform control center. Authorized personnel only.
                    </p>

                    {errorMsg && (
                        <div style={{ padding: '12px', background: '#fef2f2', color: '#ef4444', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '24px', border: '1px solid #fecaca' }}>
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', color: '#1e293b' }}>Super Admin Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="admin@zlms.com"
                                    style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit', background: '#f8fafc', color: '#0f172a' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', color: '#1e293b' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit', background: '#f8fafc', color: '#0f172a' }}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px', padding: '14px', borderRadius: '12px', fontSize: '1rem' }} disabled={isLoading}>
                            {isLoading ? 'Verifying...' : 'Access Portal'}
                        </button>
                    </form>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
                        <div style={{ flex: 1, height: '1px', background: '#cbd5e1' }}></div>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: '#cbd5e1' }}></div>
                    </div>

                    <button type="button" onClick={handleGoogleAuth} className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '14px', borderRadius: '12px', background: 'white', color: '#1e293b' }} disabled={isLoading}>
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
                        Log in with Google
                    </button>

                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes floatZlms {
                    0% { transform: translate(0, 0) scale(1); }
                    100% { transform: translate(100px, 50px) scale(1.1); }
                }
                @keyframes floatZlmsSlow {
                    0% { transform: translate(-50%, -50%) scale(1); }
                    100% { transform: translate(-40%, -60%) scale(1.2); }
                }
            `}} />
        </div>
    );
}
