"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Shield, ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import Link from 'next/link';

import './login.css';

interface Company {
    id: string;
    name: string;
    subdomain: string;
    themeColor: string;
    dashboardTitle?: string;
}

export default function CentralizedLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<string>('');
    const [showCompanySelect, setShowCompanySelect] = useState(false);
    const [pendingRequest, setPendingRequest] = useState(false);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const snap = await getDocs(collection(db, 'companies'));
                const cos: Company[] = [];
                snap.forEach(d => {
                    cos.push({ id: d.id, ...d.data() } as Company);
                });
                setCompanies(cos);
            } catch (err) {
                // If permissions denied (e.g. not logged in), just use empty list silently
                setCompanies([]);
            }
        };
        // Run once — no real-time listener needed on login page (avoids permission error for unauth users)
        fetchCompanies();
    }, []);

    const normalize = (v: any) => (v || '').toString().toUpperCase().trim();

    const SUPER_ADMIN_EMAILS = ['abubackerraiyan@gmail.com', 'admin@zlms.com'];

    const getUserDashboard = async (user: any): Promise<{ route: string; companyId?: string }> => {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        const isSuperAdminEmail = SUPER_ADMIN_EMAILS.includes((user.email || '').toLowerCase());

        const routeFromUserData = async (userData: any): Promise<{ route: string; companyId?: string }> => {
            const role = normalize(userData.role);
            const status = normalize(userData.status);
            const companyId = userData.companyId;

            if (status === 'SUSPENDED' || status === 'REJECTED') {
                throw new Error('Your account has been suspended or rejected. Contact your admin.');
            }

            if (role === 'SUPER_ADMIN' || isSuperAdminEmail) {
                return { route: '/admin' };
            }

            if (companyId && companyId !== 'platform') {
                let subdomain = companyId;
                
                // Use the loaded companies array from state to look up with case-insensitivity
                const match = companies.find(c => 
                    c.id.toLowerCase() === companyId.toLowerCase() || 
                    (c.subdomain && c.subdomain.toLowerCase() === companyId.toLowerCase())
                );
                
                if (match) {
                    subdomain = match.subdomain || match.id;
                }

                if (['ADMIN', 'COMPANY_ADMIN', 'TRAINER', 'RESOURCE_PERSON'].includes(role)) {
                    return { route: `/company/${subdomain}/admin`, companyId };
                }
                return { route: `/company/${subdomain}/dashboard`, companyId };
            }

            throw new Error('Your account is not assigned to any company yet.');
        };

        // 1. If super admin email — always route to admin regardless
        if (isSuperAdminEmail) {
            return { route: '/admin' };
        }

        // 2. If UID-based doc exists and has a companyId, use it directly
        if (docSnap.exists()) {
            const userData = docSnap.data();
            const status = normalize(userData.status);
            const role = normalize(userData.role);

            // If it's a super admin or has valid company, route directly
            if (role === 'SUPER_ADMIN' || (userData.companyId && userData.companyId !== 'platform')) {
                return await routeFromUserData(userData);
            }

            // If no companyId in this doc, fall through to email search
        }

        // 3. Search by email for pre-approved / manually added user records
        const userEmail = (user.email || '').toLowerCase().trim();
        const preCheckQuery = query(collection(db, 'users'), where('email', '==', userEmail));
        const preCheckSnap = await getDocs(preCheckQuery);

        let bestMatch: any = null;

        preCheckSnap.forEach(d => {
            const data = d.data();
            const s = normalize(data.status);
            const r = normalize(data.role);
            // Prefer records that have a companyId and are active/pre-approved
            if ((s === 'ACTIVE' || s === 'PRE_APPROVED') && data.companyId && data.companyId !== 'platform') {
                // Prefer non-SUPER_ADMIN matches (those are handled above)
                if (r !== 'SUPER_ADMIN') {
                    bestMatch = data;
                }
            }
        });

        if (bestMatch) {
            // Write UID-based doc so future logins are instant
            await setDoc(docRef, {
                email: user.email,
                name: user.displayName || bestMatch.name || user.email?.split('@')[0] || 'User',
                role: bestMatch.role,
                companyId: bestMatch.companyId,
                status: 'ACTIVE',
                createdAt: new Date().toISOString()
            }, { merge: true });

            return await routeFromUserData({ ...bestMatch, status: 'ACTIVE' });
        }

        // 4. If UID doc exists but had no company — error
        if (docSnap.exists()) {
            const userData = docSnap.data();
            const status = normalize(userData.status);
            if (status === 'SUSPENDED' || status === 'REJECTED') {
                throw new Error('Your account has been suspended or rejected. Contact your admin.');
            }
            throw new Error('Your account is not assigned to any company yet. Contact your admin.');
        }

        throw new Error('PENDING_APPROVAL');
    };


    const handleLoginSuccess = async (user: any) => {
        try {
            const { route } = await getUserDashboard(user);
            router.push(route);
        } catch (error: any) {
            if (error.message === 'PENDING_APPROVAL') {
                setPendingRequest(true);
                setSuccessMsg('Your account is pending approval. The admin will review your request.');
            } else {
                setErrorMsg(error.message);
                await signOut(auth);
            }
        }
        setIsLoading(false);
    };

    const handleGoogleAuth = async () => {
        setIsLoading(true);
        setErrorMsg('');
        setSuccessMsg('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await handleLoginSuccess(result.user);
        } catch (error: any) {
            if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
                setErrorMsg(error.message?.replace('Firebase: ', '') || 'Sign-in failed. Try again.');
            }
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');
        setSuccessMsg('');
        setPendingRequest(false);

        try {
            let result;
            try {
                result = await signInWithEmailAndPassword(auth, email, password);
            } catch (innerError: any) {
                if (innerError.code === 'auth/invalid-credential' || innerError.code === 'auth/user-not-found' || innerError.code === 'auth/wrong-password') {
                    try {
                        result = await createUserWithEmailAndPassword(auth, email, password);
                    } catch (createError: any) {
                        if (createError.code === 'auth/email-already-in-use') {
                            throw innerError;
                        } else {
                            throw createError;
                        }
                    }
                } else {
                    throw innerError;
                }
            }
            await handleLoginSuccess(result.user);
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                setErrorMsg('This email is already registered. Try signing in instead.');
            } else {
                setErrorMsg(error.message?.replace('Firebase: ', '') || 'Login failed. Check your credentials.');
            }
            setIsLoading(false);
        }
    };

    return (
        <div className="loginContainer">
            <div className="loginBgOverlay">
                <div className="loginBgCircle1" />
                <div className="loginBgCircle2" />
                <div className="loginBgCircle3" />
            </div>

            <div className="loginContentWrapper">
                <div className="glass-panel animate-fade-in-up loginCard">
                    <Link href="/" className="loginBackLink">
                        ← Back to home
                    </Link>

                    <div className="loginIconWrapper">
                        <div className="loginIconCircle">
                            <Shield size={32} />
                        </div>
                    </div>

                    <h1 className="loginTitle">Z LMS Portal</h1>
                    <p className="loginSubtitle">
                        Sign in to access your learning dashboard
                    </p>

                    {errorMsg && (
                        <div className="loginError">
                            <AlertCircle size={16} />
                            {errorMsg}
                        </div>
                    )}

                    {successMsg && (
                        <div className="loginSuccess">
                            <CheckCircle size={16} />
                            {successMsg}
                        </div>
                    )}

                    {pendingRequest ? (
                        <div className="pendingContainer">
                            <div className="pendingIcon">
                                <Loader2 size={32} className="spin" />
                            </div>
                            <h3>Account Pending Approval</h3>
                            <p>Your account is waiting for admin approval. You'll be notified once approved.</p>
                            <button
                                className="btn-secondary"
                                onClick={() => { setPendingRequest(false); setSuccessMsg(''); }}
                            >
                                Back to Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="loginForm">
                            <div>
                                <label className="loginLabel">Email Address</label>
                                <div className="loginInputGroup">
                                    <Mail size={18} color="#94a3b8" className="loginInputIcon" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="you@company.com"
                                        className="input-modern loginInput"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="loginLabel">Password</label>
                                <div className="loginInputGroup">
                                    <Lock size={18} color="#94a3b8" className="loginInputIcon" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="input-modern loginInput"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary loginSubmitBtn" disabled={isLoading}>
                                {isLoading ? (
                                    <><Loader2 size={18} className="spin" /> Verifying...</>
                                ) : (
                                    <>Sign In <ArrowRight size={18} /></>
                                )}
                            </button>
                        </form>
                    )}

                    <div className="loginDividerGroup">
                        <div className="loginDividerLine"></div>
                        <span className="loginDividerText">OR</span>
                        <div className="loginDividerLine"></div>
                    </div>

                    <button type="button" onClick={handleGoogleAuth} className="btn-secondary loginGoogleBtn" disabled={isLoading}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.78 15.72 17.56V20.33H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4" />
                            <path d="M12 23C14.97 23 17.46 22.02 19.28 20.33L15.72 17.56C14.74 18.22 13.48 18.63 12 18.63C9.13 18.63 6.69 16.69 5.8 14.07H2.15V16.9C3.96 20.5 7.69 23 12 23Z" fill="#34A853" />
                            <path d="M5.8 14.07C5.57 13.39 5.44 12.7 5.44 12C5.44 11.3 5.57 10.61 5.8 9.93H2.15C1.49 11.23 1.12 12.71 1.12 14.26C1.12 15.81 1.49 17.29 2.15 18.59L5.8 14.07Z" fill="#FBBC05" />
                            <path d="M12 5.38C13.62 5.38 15.06 5.93 16.2 7.02L19.38 3.84C17.46 2.05 14.97 1 12 1C7.69 1 3.96 3.5 2.15 7.1L5.8 9.93C6.69 7.31 9.13 5.38 12 5.38Z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

                    <div className="loginFooter">
                        <p>Don&apos;t have an account? <Link href="/login/pending">Request Access</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
