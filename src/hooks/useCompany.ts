import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export function useCompany(domain: string) {
    const [company, setCompany] = useState<any>(null);
    const [loadingCompany, setLoadingCompany] = useState(true);

    useEffect(() => {
        if (!domain) {
            setLoadingCompany(false);
            return;
        }

        // Try subdomain query first
        const qSub = query(collection(db, 'companies'), where('subdomain', '==', domain));
        
        const unsubSub = onSnapshot(qSub, (snapshot) => {
            if (!snapshot.empty) {
                const docSnap = snapshot.docs[0];
                setCompany({ id: docSnap.id, ...docSnap.data() });
                setLoadingCompany(false);
            } else {
                // Not found by subdomain, try ID?
                import('firebase/firestore').then(async ({ getDoc, doc }) => {
                    try {
                        const idDoc = await getDoc(doc(db, 'companies', domain));
                        if (idDoc.exists()) {
                            setCompany({ id: idDoc.id, ...idDoc.data() });
                            setLoadingCompany(false);
                        } else {
                            // Fallback to MOCK
                            const { MOCK_COMPANIES } = await import('@/data/mockDb');
                            const mock = MOCK_COMPANIES.find(c => c.subdomain === domain || c.id === domain);
                            setCompany(mock || null);
                            setLoadingCompany(false);
                        }
                    } catch (e) {
                        setLoadingCompany(false);
                    }
                });
            }
        });

        return () => unsubSub();
    }, [domain]);

    return { company, loadingCompany };
}
