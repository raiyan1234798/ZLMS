"use client";
import { useParams } from 'next/navigation';
import { MOCK_COMPANIES, getCoursesByCompany } from '@/data/mockDb';
import { Award, Download } from 'lucide-react';

export default function LearnerCertificatesPage() {
    const { domain } = useParams() as { domain: string };
    const company = MOCK_COMPANIES.find(c => c.subdomain === domain);
    const courses = company ? getCoursesByCompany(company.id).filter(c => c.status === 'ASSIGNED') : [];
    const themeColor = company?.branding.themeColor || '#4f46e5';

    const certs = courses.map((course, i) => ({
        id: `cert-${course.id}`,
        course: course.title,
        score: 75 + Math.floor(Math.random() * 25),
        date: `Feb ${15 + i}, 2026`,
        status: i === 0 ? 'earned' : 'in-progress',
    }));

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>My Certificates</h1>
                <p style={{ color: 'var(--text-muted)' }}>Track your achievements and download certificates.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Award size={22} color="#f59e0b" /></div>
                    <div><div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{certs.filter(c => c.status === 'earned').length}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Certificates Earned</div></div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Award size={22} color="#4f46e5" /></div>
                    <div><div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{certs.filter(c => c.status === 'in-progress').length}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>In Progress</div></div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                {certs.map(cert => (
                    <div key={cert.id} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: cert.status === 'earned' ? `${themeColor}10` : 'var(--background)', borderRadius: '0 0 0 80px', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '12px' }}>
                            <Award size={20} color={cert.status === 'earned' ? themeColor : 'var(--text-muted)'} />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>{cert.course}</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{company?.name}</p>
                        </div>
                        {cert.status === 'earned' ? (
                            <>
                                <div style={{ display: 'flex', gap: '24px', fontSize: '0.85rem', marginBottom: '16px' }}>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Score: </span><span style={{ fontWeight: 600, color: '#10b981' }}>{cert.score}%</span></div>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Issued: </span><span style={{ fontWeight: 500 }}>{cert.date}</span></div>
                                </div>
                                <button className="btn-primary" style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: themeColor }}><Download size={16} /> Download Certificate</button>
                            </>
                        ) : (
                            <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--background)', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Complete the course to earn this certificate</div>
                                <div style={{ height: '6px', borderRadius: '999px', background: 'var(--border)', marginTop: '8px' }}><div style={{ width: '40%', height: '100%', borderRadius: '999px', background: themeColor }} /></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
