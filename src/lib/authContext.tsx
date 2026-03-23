"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface UserData {
    id: string;
    email: string;
    name: string;
    role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'TRAINER' | 'USER' | '';
    companyId: string;
    status: 'ACTIVE' | 'PENDING_APPROVAL' | 'PRE_APPROVED' | 'SUSPENDED' | 'REJECTED' | '';
    avatarUrl?: string;
    createdAt?: string;
}

interface AuthContextType {
    user: FirebaseUser | null;
    userData: UserData | null;
    loading: boolean;
    refreshUserData: () => Promise<void>;
    isSuperAdmin: boolean;
    isCompanyAdmin: boolean;
    isLearner: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    loading: true,
    refreshUserData: async () => {},
    isSuperAdmin: false,
    isCompanyAdmin: false,
    isLearner: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

    const normalize = (v: any) => (v || '').toString().toUpperCase().trim();

    const logout = useCallback(async () => {
        const { signOut: firebaseSignOut } = await import('firebase/auth');
        await firebaseSignOut(auth);
        setUser(null);
        setUserData(null);
    }, []);

    const fetchUserData = useCallback(async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
            try {
                const docRef = doc(db, 'users', firebaseUser.uid);
                const unsubscribe = onSnapshot(docRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setUserData({
                            id: docSnap.id,
                            email: data.email || firebaseUser.email || '',
                            name: data.name || firebaseUser.displayName || 'User',
                            role: normalize(data.role) as UserData['role'] || '',
                            companyId: data.companyId || '',
                            status: normalize(data.status) as UserData['status'] || '',
                            avatarUrl: data.avatarUrl,
                            createdAt: data.createdAt,
                        });
                    } else {
                        setUserData(null);
                    }
                    setLoading(false);
                }, () => {
                    getDoc(docRef).then(docSnap => {
                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            setUserData({
                                id: docSnap.id,
                                email: data.email || firebaseUser.email || '',
                                name: data.name || firebaseUser.displayName || 'User',
                                role: normalize(data.role) as UserData['role'] || '',
                                companyId: data.companyId || '',
                                status: normalize(data.status) as UserData['status'] || '',
                                avatarUrl: data.avatarUrl,
                                createdAt: data.createdAt,
                            });
                        } else {
                            setUserData(null);
                        }
                        setLoading(false);
                    });
                });
                return unsubscribe;
            } catch (err) {
                console.warn("Could not fetch user profile from Firestore:", err);
                setUserData(null);
                setLoading(false);
                return () => {};
            }
        } else {
            setUserData(null);
            setLoading(false);
            return () => {};
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                await fetchUserData(firebaseUser);
            } else {
                setUserData(null);
                setLoading(false);
            }
            setInitialized(true);
        });

        return () => {
            unsubscribe();
        };
    }, [fetchUserData]);

    const refreshUserData = useCallback(async () => {
        if (user) {
            const docRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setUserData({
                    id: docSnap.id,
                    email: data.email || user.email || '',
                    name: data.name || user.displayName || 'User',
                    role: normalize(data.role) as UserData['role'] || '',
                    companyId: data.companyId || '',
                    status: normalize(data.status) as UserData['status'] || '',
                    avatarUrl: data.avatarUrl,
                    createdAt: data.createdAt,
                });
            }
        }
    }, [user]);

    const isSuperAdmin = userData?.role === 'SUPER_ADMIN' || (user?.email === 'abubackerraiyan@gmail.com' || user?.email === 'admin@zlms.com');
    const isCompanyAdmin = ['COMPANY_ADMIN', 'TRAINER', 'RESOURCE_PERSON'].includes(userData?.role || '');
    const isLearner = userData?.role === 'USER';

    return (
        <AuthContext.Provider value={{ user, userData, loading, refreshUserData, isSuperAdmin, isCompanyAdmin, isLearner }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
