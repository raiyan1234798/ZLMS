"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { MessageCircle, Send, Search, UserCircle, Settings } from "lucide-react";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, setDoc, doc, Timestamp, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

type Msg = { id: string; text: string; sender: "user" | "admin" | "superadmin"; time: string };
type Chat = { id: string; userId: string; userName: string; userEmail: string; lastMsg: string; updatedAt?: Timestamp };

export default function AdminSupportPage() {
    const params = useParams();
    const domain = params.domain as string;
    const bottomRef = useRef<HTMLDivElement>(null);

    const [me, setMe] = useState<{ uid: string; name: string; email: string } | null>(null);
    const [activeTab, setActiveTab] = useState<"USERS" | "PLATFORM">("USERS");

    // "USERS" TAB STATES
    const [userChats, setUserChats] = useState<Chat[]>([]);
    const [activeUserId, setActiveUserId] = useState<string | null>(null);
    const [userMessages, setUserMessages] = useState<Msg[]>([]);
    const [search, setSearch] = useState("");
    const [userText, setUserText] = useState("");

    // "PLATFORM" TAB STATES (Chatting with super admin)
    const [platformMessages, setPlatformMessages] = useState<Msg[]>([]);
    const [platformText, setPlatformText] = useState("");

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            if (u) {
                const docSnap = await getDoc(doc(db, 'users', u.uid));
                const name = docSnap.exists() ? docSnap.data().name : (u.displayName || "Admin");
                setMe({ uid: u.uid, name, email: u.email || "" });
            }
        });
        return () => unsub();
    }, []);

    // Load User Chats
    useEffect(() => {
        if (!me) return;
        const q = query(collection(db, "company_messages"), where("domain", "==", domain));
        const unsub = onSnapshot(q, (snap) => {
            const data: Chat[] = snap.docs.map(d => ({
                id: d.id,
                userId: d.data().userId,
                userName: d.data().userName || "Learner",
                userEmail: d.data().userEmail || "",
                lastMsg: d.data().lastMsg || "",
                updatedAt: d.data().updatedAt
            }));
            // Manual sort because index might be missing
            data.sort((a, b) => ((b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0)));
            setUserChats(data);
        });
        return () => unsub();
    }, [me, domain]);

    // Load Active User Chat Thread
    useEffect(() => {
        if (activeTab !== "USERS" || !activeUserId) return;
        const q = query(collection(db, "company_messages", activeUserId, "thread"), orderBy("createdAt", "asc"));
        const unsub = onSnapshot(q, (snap) => {
            setUserMessages(snap.docs.map(d => ({
                id: d.id,
                text: d.data().text,
                sender: d.data().sender,
                time: d.data().createdAt ? fmtTime(d.data().createdAt) : "now"
            })));
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        });
        return () => unsub();
    }, [activeUserId, activeTab]);

    // Ensure Platform Chat Doc Exists
    useEffect(() => {
        if (!me) return;
        setDoc(doc(db, "super_admin_messages", domain), {
            domain,
            companyName: domain.charAt(0).toUpperCase() + domain.slice(1),
            adminName: me.name,
            adminEmail: me.email,
            lastMsg: "",
            updatedAt: serverTimestamp()
        }, { merge: true }).catch(console.error);
    }, [domain, me]);

    // Load Platform Chat Thread (Admin vs Super Admin)
    useEffect(() => {
        if (activeTab !== "PLATFORM" || !me) return;
        const q = query(collection(db, "super_admin_messages", domain, "thread"), orderBy("createdAt", "asc"));
        const unsub = onSnapshot(q, (snap) => {
            setPlatformMessages(snap.docs.map(d => ({
                id: d.id,
                text: d.data().text,
                sender: d.data().sender, // "admin" or "superadmin"
                time: d.data().createdAt ? fmtTime(d.data().createdAt) : "now"
            })));
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        });
        return () => unsub();
    }, [activeTab, domain, me]);

    function fmtTime(ts: Timestamp): string {
        const d = ts.toDate();
        const h = d.getHours(); const m = d.getMinutes();
        return `${h % 12 || 12}:${m < 10 ? '0' + m : m} ${h >= 12 ? 'PM' : 'AM'}`;
    }

    const sendUserMsg = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userText.trim() || !activeUserId || !me) return;
        const msg = userText.trim();
        setUserText("");
        try {
            await addDoc(collection(db, "company_messages", activeUserId, "thread"), {
                text: msg, sender: "admin", createdAt: serverTimestamp()
            });
            await setDoc(doc(db, "company_messages", activeUserId), {
                lastMsg: msg, updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (err) { console.error(err); }
    };

    const sendPlatformMsg = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!platformText.trim() || !me) return;
        const msg = platformText.trim();
        setPlatformText("");
        try {
            await addDoc(collection(db, "super_admin_messages", domain, "thread"), {
                text: msg, sender: "admin", createdAt: serverTimestamp()
            });
            await setDoc(doc(db, "super_admin_messages", domain), {
                lastMsg: msg, updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (err) { console.error(err); }
    };

    const activeUserChat = userChats.find(c => c.id === activeUserId);
    const filteredChats = userChats.filter(c =>
        (c.userName || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.userEmail || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Support Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage user issues or get help from platform owners.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', background: 'var(--surface)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <button onClick={() => setActiveTab('USERS')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'USERS' ? 'var(--tenant-primary, var(--primary))' : 'transparent', color: activeTab === 'USERS' ? 'white' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                        Trainee Support
                    </button>
                    <button onClick={() => setActiveTab('PLATFORM')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'PLATFORM' ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'transparent', color: activeTab === 'PLATFORM' ? 'white' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                        Platform Support
                    </button>
                </div>
            </div>

            <div className="card" style={{ flex: 1, padding: 0, display: 'flex', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>

                {activeTab === 'USERS' && (
                    <>
                        {/* Users List Sidebar */}
                        <div style={{ width: '300px', borderRight: '1px solid var(--border)', background: 'var(--background)', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ position: 'relative' }}>
                                    <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search learners..." style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', background: 'var(--surface)', fontSize: '0.9rem' }} />
                                </div>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                {filteredChats.length === 0 && <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No conversations found.</div>}
                                {filteredChats.map(c => (
                                    <div key={c.id} onClick={() => setActiveUserId(c.id)} style={{ padding: '16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: activeUserId === c.id ? 'var(--tenant-primary, var(--primary))11' : 'transparent', borderLeft: activeUserId === c.id ? '3px solid var(--tenant-primary, var(--primary))' : '3px solid transparent', transition: 'background 0.2s' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <UserCircle size={20} color="var(--text-muted)" />
                                            </div>
                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                <h4 style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--foreground)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{c.userName}</h4>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{c.lastMsg || c.userEmail}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Active Chat Thread */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
                            {activeUserId && activeUserChat ? (
                                <>
                                    <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--background)' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--tenant-primary, var(--primary))15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <UserCircle size={24} color="var(--tenant-primary, var(--primary))" />
                                        </div>
                                        <div>
                                            <h3 style={{ fontWeight: 'bold', fontSize: '1rem' }}>{activeUserChat.userName}</h3>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{activeUserChat.userEmail}</p>
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {userMessages.map(m => (
                                            <div key={m.id} style={{ display: 'flex', justifyContent: m.sender === 'admin' ? 'flex-end' : 'flex-start' }}>
                                                <div style={{ maxWidth: '75%', padding: '12px 16px', borderRadius: m.sender === 'admin' ? '20px 20px 4px 20px' : '20px 20px 20px 4px', background: m.sender === 'admin' ? 'var(--tenant-primary, var(--primary))' : 'var(--background)', color: m.sender === 'admin' ? 'white' : 'inherit', border: m.sender === 'admin' ? 'none' : '1px solid var(--border)', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                                    <p style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{m.text}</p>
                                                    <p style={{ fontSize: '0.7rem', marginTop: '6px', textAlign: 'right', opacity: m.sender === 'admin' ? 0.7 : 0.5 }}>{m.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={bottomRef} />
                                    </div>
                                    <form onSubmit={sendUserMsg} style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--background)' }}>
                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                            <input type="text" value={userText} onChange={e => setUserText(e.target.value)} placeholder="Type a reply to trainee..." style={{ flex: 1, padding: '14px 20px', paddingRight: '60px', borderRadius: '999px', border: '1px solid var(--border)', outline: 'none', background: 'var(--surface)', fontSize: '0.95rem' }} />
                                            <button type="submit" disabled={!userText.trim()} style={{ position: 'absolute', right: '8px', width: '40px', height: '40px', borderRadius: '50%', background: 'var(--tenant-primary, var(--primary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: userText.trim() ? 'pointer' : 'not-allowed', opacity: userText.trim() ? 1 : 0.5, transition: 'all 0.2s' }}>
                                                <Send size={18} style={{ marginLeft: '2px' }} />
                                            </button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                    <MessageCircle size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                                    <p>Select a trainee conversation to reply.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'PLATFORM' && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px', background: 'linear-gradient(135deg, #4f46e505, #7c3aed05)' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>
                                Z
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Z LMS Global Support</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#10b981', fontWeight: 500 }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span> Priority Channel
                                </div>
                            </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {platformMessages.length === 0 && (
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                    <Settings size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                                    <p>Send a message directly to Z LMS Super Admins.</p>
                                </div>
                            )}
                            {platformMessages.map(m => (
                                <div key={m.id} style={{ display: 'flex', justifyContent: m.sender === 'admin' ? 'flex-end' : 'flex-start' }}>
                                    <div style={{ maxWidth: '75%', padding: '12px 16px', borderRadius: m.sender === 'admin' ? '20px 20px 4px 20px' : '20px 20px 20px 4px', background: m.sender === 'admin' ? '#7c3aed' : 'var(--background)', color: m.sender === 'admin' ? 'white' : 'inherit', border: m.sender === 'admin' ? 'none' : '1px solid var(--border)', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                        <p style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{m.text}</p>
                                        <p style={{ fontSize: '0.7rem', marginTop: '6px', textAlign: 'right', opacity: m.sender === 'admin' ? 0.7 : 0.5 }}>{m.time}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={bottomRef} />
                        </div>
                        <form onSubmit={sendPlatformMsg} style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--background)' }}>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <input type="text" value={platformText} onChange={e => setPlatformText(e.target.value)} placeholder="Type your issue to the platform owners..." style={{ flex: 1, padding: '14px 20px', paddingRight: '60px', borderRadius: '999px', border: '1px solid var(--border)', outline: 'none', background: 'var(--surface)', fontSize: '0.95rem' }} />
                                <button type="submit" disabled={!platformText.trim()} style={{ position: 'absolute', right: '8px', width: '40px', height: '40px', borderRadius: '50%', background: '#7c3aed', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: platformText.trim() ? 'pointer' : 'not-allowed', opacity: platformText.trim() ? 1 : 0.5, transition: 'all 0.2s' }}>
                                    <Send size={18} style={{ marginLeft: '2px' }} />
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
