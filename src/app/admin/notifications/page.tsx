"use client";

import { Bell, CheckCircle, AlertCircle, Info, MessageSquare } from 'lucide-react';
import { useState } from 'react';

const notifications = [
    { id: 1, title: 'New Company Registered', message: 'Skyline Real Estate has joined the platform and needs plan assignment.', time: '30 min ago', type: 'info', read: false },
    { id: 2, title: 'Payment Overdue', message: 'NovaTech Solutions has an overdue payment of $499. Account suspended.', time: '2 hours ago', type: 'alert', read: false },
    { id: 3, title: 'Milestone Reached', message: 'Global IT Academy has reached 100 course completions!', time: '5 hours ago', type: 'success', read: false },
    { id: 4, title: 'Feature Request', message: 'Acme Corp requested Discussion Forums feature to be enabled.', time: '1 day ago', type: 'message', read: true },
    { id: 5, title: 'Security Alert', message: 'Multiple failed login attempts detected for admin@novatech.com.', time: '1 day ago', type: 'alert', read: true },
    { id: 6, title: 'Bulk Enrollment', message: 'MedLearn Health enrolled 25 users in HIPAA Compliance Training.', time: '2 days ago', type: 'info', read: true },
    { id: 7, title: 'Certificate Generation', message: '47 certificates were generated across all tenants this week.', time: '3 days ago', type: 'success', read: true },
    { id: 8, title: 'Support Request', message: 'TravelPro Agency requested help with branding customization.', time: '3 days ago', type: 'message', read: true },
];

export default function NotificationsPage() {
    const [items, setItems] = useState(notifications);

    const markAllRead = () => setItems(items.map(n => ({ ...n, read: true })));
    const unreadCount = items.filter(n => !n.read).length;

    const typeIcon = (type: string) => {
        switch (type) {
            case 'alert': return <AlertCircle size={18} color="#ef4444" />;
            case 'success': return <CheckCircle size={18} color="#10b981" />;
            case 'message': return <MessageSquare size={18} color="#8b5cf6" />;
            default: return <Info size={18} color="#3b82f6" />;
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Notifications</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
                </div>
                {unreadCount > 0 && (
                    <button className="btn-secondary" onClick={markAllRead} style={{ fontSize: '0.85rem' }}>Mark all as read</button>
                )}
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {items.map((n, i) => (
                    <div key={n.id} style={{ padding: '18px 24px', borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'flex-start', gap: '14px', background: n.read ? 'transparent' : '#f8faff', cursor: 'pointer' }}
                        onClick={() => setItems(items.map(item => item.id === n.id ? { ...item, read: true } : item))}
                    >
                        <div style={{ marginTop: '2px', flexShrink: 0 }}>{typeIcon(n.type)}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ fontWeight: n.read ? 400 : 600, fontSize: '0.9rem' }}>{n.title}</span>
                                {!n.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4f46e5' }} />}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{n.message}</div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>{n.time}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
