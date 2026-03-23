"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, Search, Building2, Settings } from "lucide-react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, setDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Msg = { id: string; text: string; sender: "admin" | "superadmin"; time: string };
type Chat = { id: string; domain: string; companyName: string; adminName: string; lastMsg: string; updatedAt?: Timestamp };

export default function SuperAdminSupportPage() {
    const bottomRef = useRef<HTMLDivElement>(null);

    const [tenantChats, setTenantChats] = useState<Chat[]>([]);
    const [activeDomain, setActiveDomain] = useState<string | null>(null);
    const [messages, setMessages] = useState<Msg[]>([]);
    const [search, setSearch] = useState("");
    const [text, setText] = useState("");

    // Load Tenant Chats
    useEffect(() => {
        const unsub = onSnapshot(collection(db, "super_admin_messages"), (snap) => {
            const data: Chat[] = snap.docs.map(d => ({
                id: d.id,
                domain: d.data().domain,
                companyName: d.data().companyName || d.data().domain,
                adminName: d.data().adminName || "Tenant Admin",
                lastMsg: d.data().lastMsg || "",
                updatedAt: d.data().updatedAt
            }));
            data.sort((a, b) => ((b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0)));
            setTenantChats(data);
        });
        return () => unsub();
    }, []);

    // Load Active Chat Thread
    useEffect(() => {
        if (!activeDomain) return;
        const q = query(collection(db, "super_admin_messages", activeDomain, "thread"), orderBy("createdAt", "asc"));
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
    }, [activeDomain]);

    function fmtTime(ts: Timestamp): string {
        const d = ts.toDate();
        const h = d.getHours(); const m = d.getMinutes();
        return `${h % 12 || 12}:${m < 10 ? '0' + m : m} ${h >= 12 ? 'PM' : 'AM'}`;
    }

    const sendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || !activeDomain) return;
        const msg = text.trim();
        setText("");
        try {
            await addDoc(collection(db, "super_admin_messages", activeDomain, "thread"), {
                text: msg, sender: "superadmin", createdAt: serverTimestamp()
            });
            await setDoc(doc(db, "super_admin_messages", activeDomain), {
                lastMsg: msg, updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (err) { console.error(err); }
    };

    const activeChat = tenantChats.find(c => c.domain === activeDomain);
    const filteredChats = tenantChats.filter(c =>
        (c.companyName || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.adminName || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Global Platform Support</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Respond to Z LMS tenant admins securely and resolve organization-wide issues.</p>
                </div>
            </div>

            <div className="card" style={{ flex: 1, padding: 0, display: 'flex', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>

                <div style={{ width: '300px', borderRight: '1px solid var(--border)', background: 'var(--background)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search organizations..." style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', background: 'var(--surface)', fontSize: '0.9rem' }} />
                        </div>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {filteredChats.length === 0 && <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No tenant inquiries found.</div>}
                        {filteredChats.map(c => (
                            <div key={c.id} onClick={() => setActiveDomain(c.domain)} style={{ padding: '16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: activeDomain === c.domain ? 'rgba(79, 70, 229, 0.08)' : 'transparent', borderLeft: activeDomain === c.domain ? '3px solid #7c3aed' : '3px solid transparent', transition: 'background 0.2s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e544, #7c3aed44)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Building2 size={18} color="#4f46e5" />
                                    </div>
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <h4 style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--foreground)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{c.companyName}</h4>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{c.lastMsg}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
                    {activeDomain && activeChat ? (
                        <>
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px', background: 'linear-gradient(135deg, #4f46e505, #7c3aed05)' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Building2 size={24} color="white" />
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{activeChat.companyName} Support</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Speaking to {activeChat.adminName} (@{activeChat.domain})</p>
                                </div>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {messages.map(m => (
                                    <div key={m.id} style={{ display: 'flex', justifyContent: m.sender === 'superadmin' ? 'flex-end' : 'flex-start' }}>
                                        <div style={{ maxWidth: '75%', padding: '12px 16px', borderRadius: m.sender === 'superadmin' ? '20px 20px 4px 20px' : '20px 20px 20px 4px', background: m.sender === 'superadmin' ? '#7c3aed' : 'var(--background)', color: m.sender === 'superadmin' ? 'white' : 'inherit', border: m.sender === 'superadmin' ? 'none' : '1px solid var(--border)', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                            <p style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{m.text}</p>
                                            <p style={{ fontSize: '0.7rem', marginTop: '6px', textAlign: 'right', opacity: m.sender === 'superadmin' ? 0.7 : 0.5 }}>{m.time}</p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={bottomRef} />
                            </div>
                            <form onSubmit={sendReply} style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--background)' }}>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder={`Type an official reply to ${activeChat.companyName}...`} style={{ flex: 1, padding: '14px 20px', paddingRight: '60px', borderRadius: '999px', border: '1px solid var(--border)', outline: 'none', background: 'var(--surface)', fontSize: '0.95rem' }} />
                                    <button type="submit" disabled={!text.trim()} style={{ position: 'absolute', right: '8px', width: '40px', height: '40px', borderRadius: '50%', background: '#7c3aed', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: text.trim() ? 'pointer' : 'not-allowed', opacity: text.trim() ? 1 : 0.5, transition: 'all 0.2s' }}>
                                        <Send size={18} style={{ marginLeft: '2px' }} />
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            <Settings size={64} style={{ opacity: 0.1, marginBottom: '24px' }} />
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--foreground)' }}>No tenant selected</h3>
                            <p style={{ marginTop: '8px' }}>Select an organization workspace to review their support issues.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
