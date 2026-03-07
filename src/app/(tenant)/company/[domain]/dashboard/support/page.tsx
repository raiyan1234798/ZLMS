"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { MessageCircle, Send, ShieldCheck, UserCircle } from "lucide-react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, setDoc, doc, Timestamp, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { MOCK_COMPANIES } from "@/data/mockDb";

type Msg = { id: string; text: string; sender: "user" | "admin"; time: string };

export default function UserSupportPage() {
    const params = useParams();
    const domain = params.domain as string;
    const company = MOCK_COMPANIES.find(c => c.subdomain === domain);
    const companyName = company ? company.name : domain;
    const themeColor = company?.branding?.themeColor || '#4f46e5';
    const bottomRef = useRef<HTMLDivElement>(null);

    const [me, setMe] = useState<{ uid: string; name: string; email: string } | null>(null);
    const [messages, setMessages] = useState<Msg[]>([]);
    const [text, setText] = useState("");
    const [chatId, setChatId] = useState("");

    // Auth
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            if (u) {
                // To display the name, fetch from firestore if missing, otherwise default
                const docSnap = await getDoc(doc(db, 'users', u.uid));
                const name = docSnap.exists() ? docSnap.data().name : (u.displayName || "User");
                setMe({ uid: u.uid, name, email: u.email || "" });
            }
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        if (!me) return;
        const generatedChatId = `${domain}_${me.uid}`;
        setChatId(generatedChatId);

        // Auto-create reference
        setDoc(doc(db, "company_messages", generatedChatId), {
            domain,
            userId: me.uid,
            userName: me.name,
            userEmail: me.email,
            lastMsg: "",
            updatedAt: serverTimestamp()
        }, { merge: true }).catch(console.error);

        const q = query(collection(db, "company_messages", generatedChatId, "thread"), orderBy("createdAt", "asc"));
        const unsub = onSnapshot(q, (snap) => {
            setMessages(snap.docs.map(d => ({
                id: d.id,
                text: d.data().text,
                sender: d.data().sender,
                time: d.data().createdAt ? fmtTime(d.data().createdAt) : "now"
            })));
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        });
        return () => unsub();
    }, [me, domain]);

    function fmtTime(ts: Timestamp): string {
        const d = ts.toDate();
        const h = d.getHours(); const m = d.getMinutes();
        return `${h % 12 || 12}:${m < 10 ? '0' + m : m} ${h >= 12 ? 'PM' : 'AM'}`;
    }

    const send = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || !chatId || !me) return;
        const msg = text.trim();
        setText("");
        try {
            await addDoc(collection(db, "company_messages", chatId, "thread"), {
                text: msg, sender: "user", createdAt: serverTimestamp()
            });
            await setDoc(doc(db, "company_messages", chatId), {
                lastMsg: msg, updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
            <header style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Support Center</h1>
                <p style={{ color: 'var(--text-muted)' }}>Get direct help from {companyName} administrators.</p>
            </header>

            <div className="card" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>
                {/* Header */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--background)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, ' + themeColor + ', ' + themeColor + '99)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{companyName} Support</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#10b981', fontWeight: 500 }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span> Online
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {messages.length === 0 && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            <MessageCircle size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                            <p>Send a message to start a conversation with your admin.</p>
                        </div>
                    )}
                    {messages.map(m => (
                        <div key={m.id} style={{ display: 'flex', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                            <div style={{
                                maxWidth: '75%', padding: '12px 16px',
                                borderRadius: m.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                background: m.sender === 'user' ? 'var(--tenant-primary, var(--primary))' : 'var(--background)',
                                color: m.sender === 'user' ? 'white' : 'inherit',
                                border: m.sender === 'user' ? 'none' : '1px solid var(--border)',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                            }}>
                                <p style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{m.text}</p>
                                <p style={{ fontSize: '0.7rem', marginTop: '6px', textAlign: 'right', opacity: m.sender === 'user' ? 0.7 : 0.5 }}>{m.time}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={send} style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--background)' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                            type="text" value={text} onChange={e => setText(e.target.value)}
                            placeholder="Type your message here..."
                            style={{ flex: 1, padding: '14px 20px', paddingRight: '60px', borderRadius: '999px', border: '1px solid var(--border)', outline: 'none', background: 'var(--surface)', fontSize: '0.95rem' }}
                        />
                        <button type="submit" disabled={!text.trim()} style={{ position: 'absolute', right: '8px', width: '40px', height: '40px', borderRadius: '50%', background: 'var(--tenant-primary, var(--primary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: text.trim() ? 'pointer' : 'not-allowed', opacity: text.trim() ? 1 : 0.5, transition: 'all 0.2s' }}>
                            <Send size={18} style={{ marginLeft: '2px' }} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
