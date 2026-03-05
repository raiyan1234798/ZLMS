"use client";
import { useParams } from 'next/navigation';
import { MOCK_COMPANIES } from '@/data/mockDb';
import { Bell, BookOpen, Award, CheckCircle, Info } from 'lucide-react';
import { useState } from 'react';

export default function LearnerNotificationsPage() {
    const { domain } = useParams() as { domain: string };
    const company = MOCK_COMPANIES.find(c => c.subdomain === domain);
    const themeColor = company?.branding.themeColor || '#4f46e5';

    const initialNotifs = [
        { id: 1, title: 'New Course Available', message: 'A new course has been added to your catalog. Check it out!', time: '2 hours ago', icon: BookOpen, color: '#4f46e5', read: false },
        { id: 2, title: 'Course Deadline Reminder', message: 'Your assigned course is due in 5 days. Keep up the good work!', time: '5 hours ago', icon: Info, color: '#f59e0b', read: false },
        { id: 3, title: 'Quiz Passed!', message: 'Congratulations! You scored 92% on the module quiz.', time: '1 day ago', icon: CheckCircle, color: '#10b981', read: true },
        { id: 4, title: 'Certificate Ready', message: 'Your completion certificate is ready for download.', time: '2 days ago', icon: Award, color: '#8b5cf6', read: true },
        { id: 5, title: 'Weekly Progress Report', message: 'You completed 4 lessons this week. Great progress!', time: '3 days ago', icon: Info, color: '#06b6d4', read: true },
    ];

    const [notifs, setNotifs] = useState(initialNotifs);
    const unread = notifs.filter(n => !n.read).length;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Notifications</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{unread} unread notification{unread !== 1 ? 's' : ''}</p>
                </div>
                {unread > 0 && <button className="btn-secondary" onClick={() => setNotifs(notifs.map(n => ({ ...n, read: true })))}>Mark all read</button>}
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {notifs.map((n, i) => {
                    const Icon = n.icon; return (
                        <div key={n.id} onClick={() => setNotifs(notifs.map(item => item.id === n.id ? { ...item, read: true } : item))} style={{ padding: '18px 24px', borderBottom: i < notifs.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'flex-start', gap: '14px', background: n.read ? 'transparent' : `${themeColor}06`, cursor: 'pointer' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: n.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}><Icon size={18} color={n.color} /></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: n.read ? 400 : 600, fontSize: '0.9rem' }}>{n.title}</span>
                                    {!n.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: themeColor }} />}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{n.message}</div>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>{n.time}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
