"use client";
import { Clock, ArrowLeft, Mail, Bell, Info } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import '../login.css';

export default function PendingApprovalPage() {
    const { user } = useAuth();

    return (
        <div className="loginContainer">
            <div className="loginBgOverlay">
                <div className="loginBgCircle1" />
                <div className="loginBgCircle2" />
            </div>

            <div className="loginContentWrapper">
                <div className="glass-panel animate-fade-in-up loginCard" style={{ textAlign: 'center', padding: '60px 40px' }}>
                    
                    <div className="loginIconWrapper">
                        <div className="loginIconCircle" style={{ background: '#f59e0b20', color: '#f59e0b' }}>
                            <Clock size={32} />
                        </div>
                    </div>

                    <h1 className="loginTitle">Approval Pending</h1>
                    <p className="loginSubtitle" style={{ marginBottom: '32px' }}>
                        Your registration has been submitted and is awaiting review.
                    </p>

                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', marginBottom: '24px', fontSize: '0.9rem', color: '#64748b', border: '1px solid #e2e8f0', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                            <Info size={18} style={{ color: '#4f46e5', flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <strong style={{ color: '#1e293b' }}>What happens next?</strong>
                                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                                    <li>The Super Admin or Company Admin will review your request</li>
                                    <li>You'll receive access once approved</li>
                                    <li>Pre-approved users can access immediately</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {user && (
                        <div style={{ background: '#eef2ff', padding: '16px', borderRadius: '12px', marginBottom: '24px', textAlign: 'left' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 500, color: '#4f46e5' }}>
                                <Mail size={16} />
                                Your Registration
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                Email: <strong>{user.email}</strong>
                            </div>
                        </div>
                    )}

                    <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '12px', marginBottom: '32px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', color: '#92400e' }}>
                            <Bell size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>The admin has been notified of your request and will process it shortly.</span>
                        </div>
                    </div>

                    <Link href="/login" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '14px 28px', borderRadius: '12px' }}>
                        <ArrowLeft size={18} /> Back to Login
                    </Link>

                </div>
            </div>
        </div>
    );
}
