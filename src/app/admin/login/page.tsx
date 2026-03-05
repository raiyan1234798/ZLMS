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
        <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--background)' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                <div className="card animate-fade-in-up" style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '8px' }}>
                            <Shield size={28} />
                        </div>
                    </div>

                    <h1 style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '8px' }}>Super Admin Portal</h1>
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '32px' }}>
                        Platform control center. Authorized personnel only.
                    </p>

                    {errorMsg && (
                        <div style={{ padding: '12px', background: '#fef2f2', color: '#ef4444', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '24px', border: '1px solid #fecaca' }}>
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '8px' }}>Super Admin Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="admin@zlms.com"
                                    style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '8px' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit' }}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={isLoading}>
                            {isLoading ? 'Verifying...' : 'Access Portal'}
                        </button>
                    </form>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                    </div>

                    <button type="button" onClick={handleGoogleAuth} className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }} disabled={isLoading}>
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px', height: '18px' }} />
                        Log in with Google
                    </button>

                </div>
            </div>
        </div>
    );
}
