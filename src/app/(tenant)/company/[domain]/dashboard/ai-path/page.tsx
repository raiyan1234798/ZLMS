"use client";

import { useParams } from 'next/navigation';
import { useCompany } from '@/hooks/useCompany';
import { useAuth } from '@/lib/authContext';
import { Brain, Sparkles, Target, Compass, BookOpen, ChevronRight, Zap, Award } from 'lucide-react';
import Link from 'next/link';

export default function AILearningPathPage() {
    const params = useParams();
    const domain = params.domain as string;
    const { company } = useCompany(domain);
    const { userData } = useAuth();

    const themeColor = company?.branding?.themeColor || 'var(--primary)';

    const recommendations = [
        { id: '1', title: 'Advanced Communication Skills', match: 98, duration: '2 hours', reason: 'Fits your upcoming mid-level review criteria.' },
        { id: '2', title: 'Data Privacy Essentials', match: 92, duration: '45 mins', reason: 'Required module for your current role level.' },
        { id: '3', title: 'Leadership Foundations', match: 85, duration: '3 hours', reason: 'Based on your recent interest in management topics.' }
    ];

    return (
        <div className="animate-fade-in">
            <div style={{
                marginBottom: '32px', padding: '40px', borderRadius: 'var(--radius)',
                background: `linear-gradient(135deg, #1e1b4b, #312e81)`,
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 2, maxWidth: '600px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '24px', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <Sparkles size={16} color="#fbbf24" /> AI-Powered Recommendations
                    </div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', fontWeight: 800, lineHeight: 1.2 }}>
                        Your Personalized Learning Path
                    </h1>
                    <p style={{ opacity: 0.9, fontSize: '1.1rem', lineHeight: 1.6 }}>
                        Hi {userData?.name || 'there'}! We've analyzed your role, past performance, and company objectives to curate this specialized learning journey just for you.
                    </p>
                </div>
                <Brain size={240} style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1, transform: 'rotate(15deg)' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div className="card" style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${themeColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Target size={28} color={themeColor} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', fontWeight: 600 }}>Current Goal</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                            Master structural fundamentals to prepare for Senior placement.
                        </p>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `rgba(16, 185, 129, 0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Compass size={28} color="#10b981" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', fontWeight: 600 }}>Trajectory</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                            Currently aligned with the top 15% of learners in your cohort.
                        </p>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `rgba(245, 158, 11, 0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Zap size={28} color="#f59e0b" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', fontWeight: 600 }}>AI Velocity</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                            Completing modules 1.2x faster than the platform average.
                        </p>
                    </div>
                </div>
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                Recommended For You <span style={{ padding: '4px 10px', background: `${themeColor}22`, color: themeColor, fontSize: '0.75rem', borderRadius: '999px' }}>Updated today</span>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recommendations.map((rec, idx) => (
                    <div key={rec.id} className="card" style={{ padding: '0', display: 'flex', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid var(--border)' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ width: '8px', background: idx === 0 ? '#10b981' : themeColor }}></div>
                        <div style={{ padding: '24px', flex: 1, display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border)' }}>
                                <BookOpen size={28} color="var(--text-muted)" />
                            </div>
                            <div style={{ flex: 1, minWidth: '250px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{rec.title}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '6px' }}>
                                        <Sparkles size={12} /> {rec.match}% Match
                                    </div>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>{rec.reason}</p>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <span>Est. Time: {rec.duration}</span>
                                    <span>•</span>
                                    <span style={{ color: themeColor }}>Generated by Learning AI</span>
                                </div>
                            </div>
                            <Link href={`/company/${domain}/courses/${rec.id}`} className="btn-secondary" style={{ padding: '12px 24px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px' }}>
                                View Details <ChevronRight size={16} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
            
            <div style={{ marginTop: '40px', padding: '32px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', gap: '24px', alignItems: 'center' }}>
                <Award size={48} color={themeColor} />
                <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>Skill Verification Required</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Completing this AI path will automatically grant you the "Advanced Communicator" micro-credential, boosting your internal profile.</p>
                </div>
            </div>
        </div>
    );
}
